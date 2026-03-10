(function () {
  const settings = window.KlaviyoSiteEventTracking || {};
  const integrationMode = settings.integrationMode || "plugin";
  const publicApiKey = (settings.publicApiKey || "").trim();
  const startupHealthMarker = {
    loadedAt: new Date().toISOString(),
    version: "0.1.1",
    integrationMode: integrationMode,
    hasSettingsObject: !!window.KlaviyoSiteEventTracking,
    hasPublicApiKey: !!publicApiKey,
    scriptTagPresent: !!document.querySelector('script[data-klaviyo-site-event-tracking="placeholder"]'),
  };

  window.__KlaviyoSiteEventTrackingHealth = startupHealthMarker;
  console.info("[KlaviyoSiteEventTracking] bootstrap loaded", startupHealthMarker);

  const debugEnabled = settings.enableDebugLogging === true;
  const logErrorsOnly = settings.logErrorsOnly === true;
  const logIdentifyCalls = settings.logIdentifyCalls === true;
  const logTrackCalls = settings.logTrackCalls === true;
  const statusDiagnosticsEnabled = debugEnabled && !logErrorsOnly;
  const identifyDiagnosticsEnabled = statusDiagnosticsEnabled && logIdentifyCalls;
  const apiNamespaceName = "KlaviyoSiteEventTrackingApi";
  const retryDelayMs = 250;
  const maxRetryAttempts = 8;

  const pendingCalls = [];
  const knownSubmissionProfiles = {
    login: null,
    registration: null,
    newsletter: null,
  };

  const commerceState = window.__KlaviyoSiteEventTrackingCommerceState || {
    viewedProductKeys: {},
    startedCheckoutTracked: false,
    placedOrderKeys: {},
  };

  window.__KlaviyoSiteEventTrackingCommerceState = commerceState;

  const klaviyoClientDiagnosticsState = window.__KlaviyoSiteEventTrackingDiagnosticsState || {
    profilesSucceeded: false,
    eventsSucceeded: false,
    lastProfilesStatus: 0,
    lastEventsStatus: 0,
    identifyAttempts: 0,
    trackAttempts: 0,
    lastIdentifyProfile: {},
    lastIdentifyContext: {},
    lastIdentifyTimestamp: "",
    lastTrackMetric: "",
    lastTrackProperties: {},
    lastTrackContext: {},
    lastTrackTimestamp: "",
  };

  window.__KlaviyoSiteEventTrackingDiagnosticsState = klaviyoClientDiagnosticsState;

  const warn = function (message) {
    console.warn("[KlaviyoSiteEventTracking] " + message);
  };

  const debugLog = function (message, payload) {
    if (!debugEnabled || logErrorsOnly) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const errorLog = function (message, payload) {
    if (typeof payload !== "undefined") {
      console.error("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.error("[KlaviyoSiteEventTracking] " + message);
  };

  const identifyStatusLog = function (message, payload) {
    if (!statusDiagnosticsEnabled) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const sanitizeForLog = function (value, depth) {
    if (depth > 3) {
      return "[MaxDepthExceeded]";
    }

    if (Array.isArray(value)) {
      return value.map(function (item) {
        return sanitizeForLog(item, depth + 1);
      });
    }

    if (!value || typeof value !== "object") {
      return value;
    }

    const sanitized = {};

    Object.keys(value).forEach(function (key) {
      const normalizedKey = String(key).toLowerCase();
      const rawValue = value[key];

      if (normalizedKey.indexOf("email") >= 0 && typeof rawValue === "string") {
        const parts = rawValue.split("@");
        if (parts.length === 2 && parts[0].length > 0) {
          sanitized[key] = parts[0].charAt(0) + "***@" + parts[1];
          return;
        }
      }

      sanitized[key] = sanitizeForLog(rawValue, depth + 1);
    });

    return sanitized;
  };

  const detectKlaviyoClientEndpoint = function (url) {
    const normalizedUrl = String(url || "").toLowerCase();

    if (normalizedUrl.indexOf("/client/events") >= 0) {
      return "/client/events";
    }

    if (normalizedUrl.indexOf("/client/profiles") >= 0) {
      return "/client/profiles";
    }

    return "";
  };

  const extractCompanyIdFromUrl = function (url) {
    try {
      const parsed = new URL(String(url || ""), window.location.origin);
      return (parsed.searchParams.get("company_id") || "").trim();
    } catch (error) {
      const match = String(url || "").match(/[?&]company_id=([^&]+)/i);
      return match && match[1] ? decodeURIComponent(match[1]) : "";
    }
  };

  const extractResponseExcerpt = function (bodyText) {
    if (typeof bodyText !== "string") {
      return "";
    }

    const compact = bodyText.trim();
    if (!compact) {
      return "";
    }

    return compact.length > 280 ? compact.slice(0, 280) + "…" : compact;
  };

  const observeKlaviyoClientResponse = function (requestUrl, status, responseBodyText) {
    if (!debugEnabled) {
      return;
    }

    const endpointPath = detectKlaviyoClientEndpoint(requestUrl);
    if (!endpointPath || typeof status !== "number") {
      return;
    }

    if (endpointPath === "/client/profiles" && status >= 200 && status < 300) {
      klaviyoClientDiagnosticsState.profilesSucceeded = true;
      klaviyoClientDiagnosticsState.lastProfilesStatus = status;
      identifyStatusLog("Klaviyo identity status update.", collectIdentityStatus("client-profiles-success"));
      return;
    }

    if (endpointPath === "/client/events" && status >= 200 && status < 300) {
      klaviyoClientDiagnosticsState.eventsSucceeded = true;
      klaviyoClientDiagnosticsState.lastEventsStatus = status;
      identifyStatusLog("Klaviyo identity status update.", collectIdentityStatus("client-events-success"));
      return;
    }

    if (endpointPath === "/client/profiles") {
      klaviyoClientDiagnosticsState.lastProfilesStatus = status;
    }

    if (endpointPath === "/client/events") {
      klaviyoClientDiagnosticsState.lastEventsStatus = status;
    }

    if (status < 400) {
      return;
    }

    errorLog("Klaviyo client request failed.", {
      httpStatus: status,
      endpointPath: endpointPath,
      errorPayloadExcerpt: extractResponseExcerpt(responseBodyText),
      company_id: extractCompanyIdFromUrl(requestUrl),
    });

    if (endpointPath === "/client/events" && klaviyoClientDiagnosticsState.profilesSucceeded) {
      errorLog(
        "Klaviyo hint: Check public key permissions for event tracking in Klaviyo key settings."
      );
    }
  };

  const isKlaviyoReady = function () {
    return !!window.klaviyo || !!window._learnq;
  };

  const collectIdentityStatus = function (trigger) {
    return {
      trigger: trigger,
      pageUrl: window.location.href,
      integrationMode: integrationMode,
      hasPublicApiKey: !!publicApiKey,
      hasKlaviyoObject: !!window.klaviyo,
      hasLearnqQueue: !!window._learnq,
      queueLength: pendingCalls.length,
      identifyAttempts: klaviyoClientDiagnosticsState.identifyAttempts,
      trackAttempts: klaviyoClientDiagnosticsState.trackAttempts,
      profileRequestSucceeded: klaviyoClientDiagnosticsState.profilesSucceeded,
      eventsRequestSucceeded: klaviyoClientDiagnosticsState.eventsSucceeded,
      lastProfilesStatus: klaviyoClientDiagnosticsState.lastProfilesStatus,
      lastEventsStatus: klaviyoClientDiagnosticsState.lastEventsStatus,
      lastIdentify: {
        at: klaviyoClientDiagnosticsState.lastIdentifyTimestamp,
        profile: sanitizeForLog(klaviyoClientDiagnosticsState.lastIdentifyProfile, 0),
        context: sanitizeForLog(klaviyoClientDiagnosticsState.lastIdentifyContext, 0),
      },
      lastTrack: {
        at: klaviyoClientDiagnosticsState.lastTrackTimestamp,
        metricName: klaviyoClientDiagnosticsState.lastTrackMetric,
        properties: sanitizeForLog(klaviyoClientDiagnosticsState.lastTrackProperties, 0),
        context: sanitizeForLog(klaviyoClientDiagnosticsState.lastTrackContext, 0),
      },
      note:
        "Profile existence can only be inferred when /client/profiles succeeds after identify. This log reflects plugin/Klaviyo client activity, not a direct profile lookup.",
    };
  };

  const invokeKlaviyo = function (call) {
    if (call.type === "identify") {
      if (window.klaviyo && typeof window.klaviyo.identify === "function") {
        window.klaviyo.identify(call.profile);
        return true;
      }

      if (window._learnq && typeof window._learnq.push === "function") {
        window._learnq.push(["identify", call.profile]);
        return true;
      }

      return false;
    }

    if (call.type === "track") {
      if (window.klaviyo && typeof window.klaviyo.track === "function") {
        window.klaviyo.track(call.metricName, call.properties);
        return true;
      }

      if (window._learnq && typeof window._learnq.push === "function") {
        window._learnq.push(["track", call.metricName, call.properties]);
        return true;
      }

      return false;
    }

    return false;
  };

  const processPendingCalls = function () {
    if (!isKlaviyoReady() || pendingCalls.length === 0) {
      return;
    }

    while (pendingCalls.length > 0) {
      const nextCall = pendingCalls.shift();
      if (!invokeKlaviyo(nextCall)) {
        errorLog("Failed to flush queued Klaviyo API call.", {
          type: nextCall.type,
        });
      }
    }
  };

  const queueOrInvoke = function (call) {
    if (isKlaviyoReady()) {
      return invokeKlaviyo(call);
    }

    pendingCalls.push(call);

    const attemptFlush = function (attempt) {
      if (isKlaviyoReady()) {
        processPendingCalls();
        return;
      }

      if (attempt >= maxRetryAttempts) {
        errorLog("Klaviyo API not ready after retry window.", {
          type: call.type,
          attempts: attempt,
        });
        return;
      }

      window.setTimeout(function () {
        attemptFlush(attempt + 1);
      }, retryDelayMs);
    };

    attemptFlush(1);
    return true;
  };

  const identifyUser = function (profile, context) {
    const payload = profile && typeof profile === "object" ? profile : {};
    const callContext = context || {};

    klaviyoClientDiagnosticsState.identifyAttempts += 1;
    klaviyoClientDiagnosticsState.lastIdentifyProfile = payload;
    klaviyoClientDiagnosticsState.lastIdentifyContext = callContext;
    klaviyoClientDiagnosticsState.lastIdentifyTimestamp = new Date().toISOString();

    if (identifyDiagnosticsEnabled) {
      debugLog("identifyUser called.", {
        profile: sanitizeForLog(payload, 0),
        context: sanitizeForLog(callContext, 0),
      });
    }

    identifyStatusLog("Klaviyo identity status update.", collectIdentityStatus("identify-call"));

    return queueOrInvoke({
      type: "identify",
      profile: payload,
      context: callContext,
    });
  };

  const trackEvent = function (metricName, properties, context) {
    const metric = typeof metricName === "string" ? metricName.trim() : "";
    const payload = properties && typeof properties === "object" ? properties : {};
    const callContext = context || {};

    klaviyoClientDiagnosticsState.trackAttempts += 1;
    klaviyoClientDiagnosticsState.lastTrackMetric = metric;
    klaviyoClientDiagnosticsState.lastTrackProperties = payload;
    klaviyoClientDiagnosticsState.lastTrackContext = callContext;
    klaviyoClientDiagnosticsState.lastTrackTimestamp = new Date().toISOString();

    if (!metric) {
      errorLog("trackEvent called without a valid metric name.", {
        context: sanitizeForLog(callContext, 0),
      });
      return false;
    }

    if (debugEnabled && !logErrorsOnly && logTrackCalls) {
      debugLog("trackEvent called.", {
        metricName: metric,
        properties: sanitizeForLog(payload, 0),
        context: sanitizeForLog(callContext, 0),
      });
    }

    identifyStatusLog("Klaviyo identity status update.", collectIdentityStatus("track-call"));

    return queueOrInvoke({
      type: "track",
      metricName: metric,
      properties: payload,
      context: callContext,
    });
  };

  window[apiNamespaceName] = window[apiNamespaceName] || {};
  window[apiNamespaceName].identifyUser = identifyUser;
  window[apiNamespaceName].trackEvent = trackEvent;

  const normalizeText = function (value) {
    if (typeof value !== "string") {
      return "";
    }

    return value.trim();
  };

  const pickFirstValue = function (obj, keys) {
    if (!obj || typeof obj !== "object") {
      return "";
    }

    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];
      const value = obj[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
      }
    }

    return "";
  };

  const extractProfile = function (rawValue) {
    if (!rawValue || typeof rawValue !== "object") {
      return {};
    }

    const nestedCustomer =
      rawValue.customer || rawValue.user || rawValue.contact || rawValue.data || rawValue.profile || null;

    const email = normalizeText(
      pickFirstValue(rawValue, ["email", "emailAddress", "mail"]) ||
        pickFirstValue(nestedCustomer, ["email", "emailAddress", "mail"])
    );

    const externalId = normalizeText(
      pickFirstValue(rawValue, ["external_id", "externalId", "customerId", "contactId", "id"]) ||
        pickFirstValue(nestedCustomer, ["external_id", "externalId", "customerId", "contactId", "id"])
    );

    const firstName = normalizeText(
      pickFirstValue(rawValue, ["first_name", "firstName", "name1"]) ||
        pickFirstValue(nestedCustomer, ["first_name", "firstName", "name1"])
    );

    const lastName = normalizeText(
      pickFirstValue(rawValue, ["last_name", "lastName", "name2"]) ||
        pickFirstValue(nestedCustomer, ["last_name", "lastName", "name2"])
    );

    const profile = {};

    if (email) {
      profile.email = email;
    }

    if (externalId) {
      profile.external_id = externalId;
    }

    if (firstName) {
      profile.first_name = firstName;
    }

    if (lastName) {
      profile.last_name = lastName;
    }

    return profile;
  };

  const mergeProfiles = function (baseProfile, fallbackProfile) {
    return Object.assign({}, fallbackProfile || {}, baseProfile || {});
  };

  const identifyFromSource = function (source, profileData, fallbackProfile) {
    const api =
      window[apiNamespaceName] &&
      typeof window[apiNamespaceName].identifyUser === "function"
        ? window[apiNamespaceName]
        : null;

    if (!api) {
      return false;
    }

    const profile = mergeProfiles(extractProfile(profileData), extractProfile(fallbackProfile));

    if (!profile.email && !profile.external_id) {
      return false;
    }

    api.identifyUser(profile, {
      source: source,
    });

    return true;
  };

  const stashSubmissionProfile = function (source, formElement) {
    if (!formElement || typeof formElement.querySelector !== "function") {
      return;
    }

    const getInputValue = function (selectors) {
      for (let index = 0; index < selectors.length; index += 1) {
        const input = formElement.querySelector(selectors[index]);
        if (input && typeof input.value === "string" && input.value.trim()) {
          return input.value.trim();
        }
      }

      return "";
    };

    const payload = {
      email: getInputValue([
        "input[type='email']",
        "input[name='email']",
        "input[name='username']",
        "input[name='login']",
      ]),
      first_name: getInputValue(["input[name='firstName']", "input[name='first_name']"]),
      last_name: getInputValue(["input[name='lastName']", "input[name='last_name']"]),
    };

    knownSubmissionProfiles[source] = payload;
  };

  const detectSourceFromUrl = function (url) {
    const normalizedUrl = (url || "").toLowerCase();

    const newsletterKeywords = [
      "newsletter",
      "subscribe",
      "subscription",
      "abonnieren",
      "anmeldung-newsletter",
      "boletin",
      "suscribir",
    ];
    const registrationKeywords = [
      "register",
      "registration",
      "signup",
      "sign-up",
      "create-account",
      "konto-erstellen",
      "registrieren",
      "anmeldung",
      "inscription",
    ];
    const loginKeywords = [
      "login",
      "authenticate",
      "auth",
      "signin",
      "sign-in",
      "account/login",
      "anmelden",
      "connexion",
      "iniciar-sesion",
    ];

    const containsAnyKeyword = function (keywords) {
      return keywords.some(function (keyword) {
        return normalizedUrl.indexOf(keyword) >= 0;
      });
    };

    if (containsAnyKeyword(newsletterKeywords)) {
      return "newsletter";
    }

    if (containsAnyKeyword(registrationKeywords)) {
      return "registration";
    }

    if (containsAnyKeyword(loginKeywords)) {
      return "login";
    }

    if (normalizedUrl.indexOf("checkout") >= 0 && normalizedUrl.indexOf("contact") >= 0) {
      return "newsletter";
    }

    return "";
  };

  const detectSourceFromForm = function (formElement) {
    if (!formElement) {
      return "";
    }

    const action = (formElement.getAttribute("action") || "").toLowerCase();
    const className = (formElement.className || "").toLowerCase();
    const dataRoute = (formElement.getAttribute("data-route") || "").toLowerCase();
    const formId = (formElement.getAttribute("id") || "").toLowerCase();
    const combined = action + " " + className + " " + dataRoute + " " + formId;

    const containsAnyKeyword = function (keywords) {
      return keywords.some(function (keyword) {
        return combined.indexOf(keyword) >= 0;
      });
    };

    const newsletterKeywords = ["newsletter", "subscribe", "abonnieren", "suscribir", "boletin"];
    const registrationKeywords = [
      "register",
      "registration",
      "signup",
      "create-account",
      "registrieren",
      "konto-erstellen",
      "inscription",
    ];
    const loginKeywords = [
      "login",
      "signin",
      "sign-in",
      "authenticate",
      "auth",
      "anmelden",
      "connexion",
      "iniciar-sesion",
    ];

    if (containsAnyKeyword(newsletterKeywords)) {
      return "newsletter";
    }

    if (containsAnyKeyword(registrationKeywords)) {
      return "registration";
    }

    if (containsAnyKeyword(loginKeywords)) {
      return "login";
    }

    return "";
  };

  const registerDomSubmissionHooks = function () {
    document.addEventListener(
      "submit",
      function (event) {
        const source = detectSourceFromForm(event.target);
        if (!source) {
          return;
        }

        stashSubmissionProfile(source, event.target);
      },
      true
    );
  };

  const registerCustomEventHooks = function () {
    const customEventToSourceMap = {
      "ceres:login:success": "login",
      "ceres:auth:login:success": "login",
      "ceres:auth:signin:success": "login",
      "ceres:user:login:success": "login",
      "vue:auth:login:success": "login",
      "vue:user:login:success": "login",
      "ceres:registration:success": "registration",
      "ceres:register:success": "registration",
      "ceres:auth:register:success": "registration",
      "ceres:user:register:success": "registration",
      "vue:registration:success": "registration",
      "ceres:newsletter:success": "newsletter",
      "ceres:newsletter:subscribe:success": "newsletter",
      "ceres:newsletter:registration:success": "newsletter",
      "vue:newsletter:success": "newsletter",
      "newsletter:success": "newsletter",
    };

    Object.keys(customEventToSourceMap).forEach(function (eventName) {
      window.addEventListener(eventName, function (event) {
        const source = customEventToSourceMap[eventName];
        const eventPayload = event && event.detail ? event.detail : {};
        const extractedProfile = mergeProfiles(
          extractProfile(eventPayload),
          extractProfile(knownSubmissionProfiles[source])
        );

        identifyStatusLog("Observed candidate auth/newsletter lifecycle event.", {
          eventName: eventName,
          source: source,
          profileExtracted: !!(extractedProfile.email || extractedProfile.external_id),
          payload: sanitizeForLog(eventPayload, 0),
          fallbackProfile: sanitizeForLog(knownSubmissionProfiles[source], 0),
        });

        identifyFromSource(source, eventPayload, knownSubmissionProfiles[source]);
      });
    });
  };

  const asNumber = function (value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.replace(/,/g, ".").replace(/[^0-9.-]/g, "");
      if (!normalized) {
        return null;
      }

      const parsed = Number(normalized);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
  };

  const firstDefined = function (obj, keys) {
    if (!obj || typeof obj !== "object") {
      return null;
    }

    for (let index = 0; index < keys.length; index += 1) {
      const value = obj[keys[index]];
      if (typeof value !== "undefined" && value !== null && value !== "") {
        return value;
      }
    }

    return null;
  };

  const extractCurrency = function (payload) {
    const value = firstDefined(payload, ["currency", "currencyCode", "currency_code"]);
    return normalizeText(String(value || "")).toUpperCase();
  };

  const mapProductPayload = function (payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const price = asNumber(firstDefined(source, ["price", "unitPrice", "unit_price", "salesPrice", "value"]));
    const quantity = asNumber(firstDefined(source, ["quantity", "qty", "amount"])) || 1;
    const currency = extractCurrency(source);

    const mapped = {
      ProductID: normalizeText(String(firstDefined(source, ["productId", "itemId", "id", "variationId"]) || "")),
      SKU: normalizeText(String(firstDefined(source, ["sku", "itemNo", "variationNumber", "number"]) || "")),
      ProductName: normalizeText(String(firstDefined(source, ["name", "itemName", "productName", "title"]) || "")),
      Quantity: quantity,
    };

    if (price !== null) {
      mapped.Price = price;
      mapped.Value = price * quantity;
    }

    if (currency) {
      mapped.Currency = currency;
    }

    return mapped;
  };

  const mapCartPayload = function (payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const mapped = {
      CartID: normalizeText(String(firstDefined(source, ["basketId", "cartId", "id"]) || "")),
      ProductID: normalizeText(String(firstDefined(source, ["productId", "itemId", "id", "variationId"]) || "")),
      SKU: normalizeText(String(firstDefined(source, ["sku", "itemNo", "variationNumber", "number"]) || "")),
    };

    const quantity = asNumber(firstDefined(source, ["quantity", "qty", "amount"]));
    const unitPrice = asNumber(firstDefined(source, ["price", "unitPrice", "unit_price", "salesPrice"]));
    const total = asNumber(firstDefined(source, ["value", "total", "totalAmount"]));
    const currency = extractCurrency(source);

    if (quantity !== null) {
      mapped.Quantity = quantity;
    }

    if (unitPrice !== null) {
      mapped.Price = unitPrice;
    }

    if (total !== null) {
      mapped.Value = total;
    } else if (unitPrice !== null && quantity !== null) {
      mapped.Value = unitPrice * quantity;
    }

    if (currency) {
      mapped.Currency = currency;
    }

    return mapped;
  };

  const mapOrderPayload = function (payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const mapped = {
      OrderID: normalizeText(String(firstDefined(source, ["orderId", "id", "number", "orderNumber"]) || "")),
      CartID: normalizeText(String(firstDefined(source, ["basketId", "cartId"]) || "")),
      Currency: extractCurrency(source),
    };

    const value = asNumber(firstDefined(source, ["value", "total", "amount", "orderTotal", "totalAmount"]));
    if (value !== null) {
      mapped.Value = value;
    }

    const items = Array.isArray(source.items) ? source.items : [];
    if (items.length > 0) {
      mapped.Items = items.map(function (item) {
        return {
          ProductID: normalizeText(String(firstDefined(item, ["productId", "itemId", "id", "variationId"]) || "")),
          SKU: normalizeText(String(firstDefined(item, ["sku", "itemNo", "variationNumber", "number"]) || "")),
          Quantity: asNumber(firstDefined(item, ["quantity", "qty", "amount"])) || 1,
          Price: asNumber(firstDefined(item, ["price", "unitPrice", "unit_price", "salesPrice"])),
        };
      });
    }

    return mapped;
  };

  const callTrackEvent = function (metricName, properties, context) {
    const api =
      window[apiNamespaceName] &&
      typeof window[apiNamespaceName].trackEvent === "function"
        ? window[apiNamespaceName]
        : null;

    if (!api) {
      return false;
    }

    return api.trackEvent(metricName, properties, context);
  };

  const getProductViewKey = function (productProperties, source) {
    return [source || "dom", productProperties.ProductID || "", productProperties.SKU || "", window.location.pathname || ""]
      .join("::")
      .toLowerCase();
  };

  const trackViewedProduct = function (payload, source) {
    const properties = mapProductPayload(payload);
    if (!properties.ProductID && !properties.SKU) {
      return;
    }

    const dedupeKey = getProductViewKey(properties, source);
    if (commerceState.viewedProductKeys[dedupeKey]) {
      return;
    }

    commerceState.viewedProductKeys[dedupeKey] = true;
    callTrackEvent("Viewed Product", properties, {
      source: source || "product-view",
    });
  };

  const trackAddedToCart = function (payload, source) {
    const properties = mapCartPayload(payload);
    if (!properties.ProductID && !properties.SKU) {
      return;
    }

    callTrackEvent("Added to Cart", properties, {
      source: source || "add-to-cart",
    });
  };

  const trackStartedCheckout = function (payload, source) {
    if (commerceState.startedCheckoutTracked) {
      return;
    }

    commerceState.startedCheckoutTracked = true;
    callTrackEvent("Started Checkout", mapCartPayload(payload), {
      source: source || "checkout",
    });
  };

  const trackPlacedOrder = function (payload, source) {
    const properties = mapOrderPayload(payload);
    const dedupeKey = normalizeText(String(properties.OrderID || window.location.pathname || ""));

    if (!dedupeKey) {
      return;
    }

    if (commerceState.placedOrderKeys[dedupeKey]) {
      return;
    }

    commerceState.placedOrderKeys[dedupeKey] = true;
    callTrackEvent("Placed Order", properties, {
      source: source || "order-success",
    });
  };

  const registerCommerceEventHooks = function () {
    window.addEventListener("ceres:product:loaded", function (event) {
      trackViewedProduct(event.detail || {}, "ceres:product:loaded");
    });

    window.addEventListener("ceres:item:added-to-cart", function (event) {
      trackAddedToCart(event.detail || {}, "ceres:item:added-to-cart");
    });

    window.addEventListener("ceres:checkout:started", function (event) {
      trackStartedCheckout(event.detail || {}, "ceres:checkout:started");
    });

    window.addEventListener("ceres:checkout:order-placed", function (event) {
      trackPlacedOrder(event.detail || {}, "ceres:checkout:order-placed");
    });

    const locationPath = (window.location.pathname || "").toLowerCase();
    const productElement = document.querySelector("[data-product-id],[data-item-id],[data-variation-id]");

    if (productElement && (locationPath.indexOf("item") >= 0 || locationPath.indexOf("product") >= 0)) {
      trackViewedProduct(
        {
          productId:
            productElement.getAttribute("data-product-id") ||
            productElement.getAttribute("data-item-id") ||
            productElement.getAttribute("data-variation-id") ||
            "",
          sku: productElement.getAttribute("data-sku") || "",
          price: productElement.getAttribute("data-price") || "",
          currency: productElement.getAttribute("data-currency") || "",
        },
        "dom:product-element"
      );
    }
  };

  const registerNetworkHooks = function () {
    if (typeof window.fetch === "function") {
      const originalFetch = window.fetch;

      window.fetch = function () {
        const requestUrl =
          typeof arguments[0] === "string"
            ? arguments[0]
            : arguments[0] && arguments[0].url
            ? arguments[0].url
            : "";

        return originalFetch
          .apply(this, arguments)
          .then(function (response) {
            if (response && typeof response.status === "number") {
              if (response.status >= 400 && detectKlaviyoClientEndpoint(requestUrl)) {
                response
                  .clone()
                  .text()
                  .then(function (responseBodyText) {
                    observeKlaviyoClientResponse(requestUrl, response.status, responseBodyText);
                  })
                  .catch(function () {
                    observeKlaviyoClientResponse(requestUrl, response.status, "");
                  });
              } else {
                observeKlaviyoClientResponse(requestUrl, response.status, "");
              }
            }

            const source = detectSourceFromUrl(requestUrl);

            if (!source || !response || response.ok !== true) {
              if (
                response &&
                response.ok === true &&
                requestUrl.toLowerCase().indexOf("checkout") >= 0 &&
                requestUrl.toLowerCase().indexOf("order") < 0
              ) {
                trackStartedCheckout({}, "network:fetch-checkout");
              }
              return response;
            }

            const contentType = response.headers ? response.headers.get("content-type") || "" : "";
            if (contentType.indexOf("application/json") < 0) {
              identifyFromSource(source, {}, knownSubmissionProfiles[source]);
              return response;
            }

            response
              .clone()
              .json()
              .then(function (payload) {
                identifyFromSource(source, payload, knownSubmissionProfiles[source]);

                const normalizedUrl = requestUrl.toLowerCase();
                if (normalizedUrl.indexOf("basket") >= 0 && normalizedUrl.indexOf("items") >= 0) {
                  trackAddedToCart(payload, "network:fetch-basket-items");
                }

                if (normalizedUrl.indexOf("checkout") >= 0 && normalizedUrl.indexOf("order") < 0) {
                  trackStartedCheckout(payload, "network:fetch-checkout");
                }

                if (normalizedUrl.indexOf("order") >= 0 && normalizedUrl.indexOf("success") >= 0) {
                  trackPlacedOrder(payload, "network:fetch-order-success");
                }
              })
              .catch(function () {
                identifyFromSource(source, {}, knownSubmissionProfiles[source]);

                const normalizedUrl = requestUrl.toLowerCase();
                if (normalizedUrl.indexOf("checkout") >= 0 && normalizedUrl.indexOf("order") < 0) {
                  trackStartedCheckout({}, "network:fetch-checkout");
                }
              });

            return response;
          })
          .catch(function (error) {
            throw error;
          });
      };
    }

    if (typeof window.XMLHttpRequest === "function") {
      const originalOpen = window.XMLHttpRequest.prototype.open;
      const originalSend = window.XMLHttpRequest.prototype.send;

      window.XMLHttpRequest.prototype.open = function (method, url) {
        this.__klaviyoTrackingUrl = url;
        return originalOpen.apply(this, arguments);
      };

      window.XMLHttpRequest.prototype.send = function () {
        this.addEventListener("load", function () {
          observeKlaviyoClientResponse(
            this.__klaviyoTrackingUrl || "",
            Number(this.status || 0),
            typeof this.responseText === "string" ? this.responseText : ""
          );

          const source = detectSourceFromUrl(this.__klaviyoTrackingUrl || "");

          if (!source || this.status < 200 || this.status >= 300) {
            return;
          }

          let payload = {};

          if (typeof this.responseText === "string" && this.responseText) {
            try {
              payload = JSON.parse(this.responseText);
            } catch (error) {
              payload = {};
            }
          }

          identifyFromSource(source, payload, knownSubmissionProfiles[source]);

          const normalizedUrl = (this.__klaviyoTrackingUrl || "").toLowerCase();
          if (normalizedUrl.indexOf("basket") >= 0 && normalizedUrl.indexOf("items") >= 0) {
            trackAddedToCart(payload, "network:xhr-basket-items");
          }

          if (normalizedUrl.indexOf("checkout") >= 0 && normalizedUrl.indexOf("order") < 0) {
            trackStartedCheckout(payload, "network:xhr-checkout");
          }

          if (normalizedUrl.indexOf("order") >= 0 && normalizedUrl.indexOf("success") >= 0) {
            trackPlacedOrder(payload, "network:xhr-order-success");
          }
        });

        return originalSend.apply(this, arguments);
      };
    }
  };

  if (window.__KlaviyoSiteEventTrackingIdentityHooksInitialized !== true) {
    window.__KlaviyoSiteEventTrackingIdentityHooksInitialized = true;
    registerDomSubmissionHooks();
    registerCustomEventHooks();
    registerCommerceEventHooks();
    registerNetworkHooks();
  }

  if (window.__KlaviyoSiteEventTrackingInitialized === true) {
    debugLog("Bootstrap already initialized. Skipping duplicate initialization.");
    return;
  }

  if (integrationMode === "gtm") {
    window.__KlaviyoSiteEventTrackingInitialized = true;

    debugLog(
      "Integration mode is GTM. Klaviyo script injection is disabled and expected to be handled externally (for example via Google Tag Manager)."
    );

    const maxAttempts = 8;
    const intervalMs = 250;
    let attempts = 0;

    const detector = window.setInterval(function () {
      attempts += 1;

      if (window.klaviyo || window._learnq) {
        debugLog("Detected externally loaded Klaviyo object in GTM mode.", {
          hasKlaviyoObject: !!window.klaviyo,
          hasLearnqQueue: !!window._learnq,
          attempts: attempts,
        });
        window.clearInterval(detector);
        identifyStatusLog("Klaviyo identity status update.", collectIdentityStatus("gtm-klaviyo-detected"));
        return;
      }

      if (attempts >= maxAttempts) {
        debugLog(
          "No Klaviyo object detected during GTM-mode retry window."
        );
        identifyStatusLog(
          "Klaviyo identity status update.",
          collectIdentityStatus("gtm-klaviyo-not-detected")
        );
        window.clearInterval(detector);
      }
    }, intervalMs);

    identifyStatusLog("Klaviyo identity status update.", collectIdentityStatus("page-bootstrap"));

    return;
  }

  if (!publicApiKey) {
    warn(
      "Missing required setting 'tracking.publicApiKey' for plugin integration mode. Add your Klaviyo public API key in plugin configuration or switch to GTM mode if Klaviyo is loaded externally."
    );
    return;
  }

  if (integrationMode !== "plugin") {
    warn(
      "Unsupported integration mode '" +
        integrationMode +
        "'. Falling back to plugin bootstrap behavior."
    );
  }

  window.__KlaviyoSiteEventTrackingInitialized = true;
  window._learnq = window._learnq || [];

  const scriptSource =
    "https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=" +
    encodeURIComponent(publicApiKey);

  const existingManagedScript = document.querySelector(
    "script[data-klaviyo-site-event-tracking='true']"
  );

  const existingKlaviyoScript = document.querySelector(
    "script[src*='static.klaviyo.com/onsite/js/klaviyo.js']"
  );

  if (existingManagedScript || existingKlaviyoScript) {
    debugLog("Klaviyo onsite script is already present. Skipping injection.", {
      hasManagedScript: !!existingManagedScript,
      hasKlaviyoScript: !!existingKlaviyoScript,
    });
    identifyStatusLog("Klaviyo identity status update.", collectIdentityStatus("script-already-present"));
    return;
  }

  const klaviyoScript = document.createElement("script");
  klaviyoScript.async = true;
  klaviyoScript.src = scriptSource;
  klaviyoScript.setAttribute("data-klaviyo-site-event-tracking", "true");

  const firstScriptTag = document.getElementsByTagName("script")[0];

  if (firstScriptTag && firstScriptTag.parentNode) {
    firstScriptTag.parentNode.insertBefore(klaviyoScript, firstScriptTag);
  } else {
    (document.head || document.body || document.documentElement).appendChild(
      klaviyoScript
    );
  }

  debugLog("Klaviyo onsite script bootstrap injected.", {
    source: scriptSource,
  });

  identifyStatusLog("Klaviyo identity status update.", collectIdentityStatus("page-bootstrap"));
})();
