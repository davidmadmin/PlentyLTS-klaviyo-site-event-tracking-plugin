(function () {
  const settings = window.KlaviyoSiteEventTracking || {};
  const integrationMode = settings.integrationMode || "plugin";
  const publicApiKey = (settings.publicApiKey || "").trim();

  const isEnabled = function (value, defaultValue) {
    if (value === true || value === 1 || value === "1") {
      return true;
    }

    if (value === false || value === 0 || value === "0") {
      return false;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim().toLowerCase();

      if (["true", "yes", "on", "enabled"].indexOf(normalizedValue) !== -1) {
        return true;
      }

      if (["false", "no", "off", "disabled", ""].indexOf(normalizedValue) !== -1) {
        return false;
      }
    }

    return defaultValue;
  };

  const debugEnabled = isEnabled(settings.enableDebugLogging, false);
  const logErrorsOnly = isEnabled(settings.logErrorsOnly, false);
  const logPluginHeartbeat = isEnabled(settings.logPluginHeartbeat, true);
  const logIdentifyCalls = isEnabled(settings.logIdentifyCalls, false);
  const logTrackCalls = isEnabled(settings.logTrackCalls, true);
  const enableViewedProductEvent = isEnabled(settings.enableViewedProductEvent, true);
  const enableAddedToCartEvent = isEnabled(settings.enableAddedToCartEvent, true);
  const identifyPollAttempts = 8;
  const identifyPollIntervalMs = 1500;

  const warn = function (message, payload) {
    if (typeof payload !== "undefined") {
      console.warn("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.warn("[KlaviyoSiteEventTracking] " + message);
  };

  const identifyLog = function (message, payload) {
    if (!logIdentifyCalls || logErrorsOnly) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
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

  const heartbeatLog = function (message, payload) {
    if (!logPluginHeartbeat || logErrorsOnly) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const trackLog = function (message, payload) {
    if (!logTrackCalls || logErrorsOnly) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  heartbeatLog("Plugin heartbeat.", {
    publicApiKeyDetected: !!publicApiKey,
    publicApiKey: publicApiKey || null,
    integrationMode: integrationMode,
  });

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
        return;
      }

      if (attempts >= maxAttempts) {
        debugLog(
          "No Klaviyo object detected during GTM-mode retry window."
        );
        window.clearInterval(detector);
      }
    }, intervalMs);

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

  const normalizedEmail = function (value) {
    if (!value || typeof value !== "string") {
      return "";
    }

    const trimmedValue = value.trim().toLowerCase();

    if (!trimmedValue || trimmedValue.indexOf("@") === -1) {
      return "";
    }

    return trimmedValue;
  };

  const getNestedValue = function (source, path) {
    try {
      let cursor = source;

      for (let i = 0; i < path.length; i += 1) {
        if (!cursor || typeof cursor !== "object") {
          return null;
        }

        cursor = cursor[path[i]];
      }

      return cursor;
    } catch (error) {
      return null;
    }
  };

  const extractEmailFromObject = function (candidate) {
    if (!candidate || typeof candidate !== "object") {
      return "";
    }

    const emailPaths = [
      ["email"],
      ["emailAddress"],
      ["email_address"],
      ["contact", "email"],
      ["contact", "emailAddress"],
      ["data", "email"],
      ["data", "contact", "email"],
      ["user", "email"],
      ["currentUser", "email"],
    ];

    for (let i = 0; i < emailPaths.length; i += 1) {
      const value = getNestedValue(candidate, emailPaths[i]);
      const normalizedValue = normalizedEmail(value);

      if (normalizedValue) {
        return normalizedValue;
      }
    }

    return "";
  };

  const getEmailFromDom = function () {
    const selectors = [
      "[data-kse-email]",
      "[data-contact-email]",
    ];

    for (let i = 0; i < selectors.length; i += 1) {
      const field = document.querySelector(selectors[i]);

      if (!field) {
        continue;
      }

      const rawValue =
        field.getAttribute("data-kse-email") ||
        field.getAttribute("data-contact-email") ||
        field.value ||
        "";
      const normalizedValue = normalizedEmail(rawValue);

      if (normalizedValue) {
        return normalizedValue;
      }
    }

    return "";
  };

  const identifyWithEmail = function (email, source) {
    const candidateEmail = normalizedEmail(email);

    if (!candidateEmail) {
      return false;
    }

    if (window.__KlaviyoSiteEventTrackingLastIdentifiedEmail === candidateEmail) {
      identifyLog("Identify skipped (already identified for this browser session).", {
        email: candidateEmail,
        source: source,
      });
      return false;
    }

    try {
      if (window.klaviyo && typeof window.klaviyo.identify === "function") {
        window.klaviyo.identify({ email: candidateEmail });
      } else {
        window._learnq.push(["identify", { $email: candidateEmail }]);
      }

      window.__KlaviyoSiteEventTrackingLastIdentifiedEmail = candidateEmail;
      identifyLog("Klaviyo identify executed.", {
        email: candidateEmail,
        source: source,
        usingKlaviyoObject:
          !!(window.klaviyo && typeof window.klaviyo.identify === "function"),
      });
      return true;
    } catch (error) {
      warn("Failed to execute Klaviyo identify call.", {
        source: source,
        message: error && error.message ? error.message : "unknown_error",
      });
      return false;
    }
  };

  const getIdentityProbeEndpoints = function () {
    if (Array.isArray(settings.identityProbeEndpoints)) {
      return settings.identityProbeEndpoints;
    }

    return ["/rest/io/customer", "/rest/io/customer/"];
  };

  const probeIdentityEndpoint = function (url) {
    return fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    })
      .then(function (response) {
        if (!response || !response.ok) {
          return null;
        }

        return response.json().catch(function () {
          return null;
        });
      })
      .then(function (payload) {
        return extractEmailFromObject(payload);
      })
      .catch(function () {
        return "";
      });
  };

  const resolveCustomerEmail = function () {
    const inMemorySources = [
      window.KlaviyoSiteEventTracking,
      window.ceresStore && window.ceresStore.state,
      window.App,
      window.CeresApp,
    ];

    for (let i = 0; i < inMemorySources.length; i += 1) {
      const email = extractEmailFromObject(inMemorySources[i]);

      if (email) {
        return Promise.resolve({ email: email, source: "runtime_state" });
      }
    }

    const emailFromDom = getEmailFromDom();
    if (emailFromDom) {
      return Promise.resolve({ email: emailFromDom, source: "dom" });
    }

    const endpoints = getIdentityProbeEndpoints();
    let chain = Promise.resolve("");

    endpoints.forEach(function (endpoint) {
      chain = chain.then(function (foundEmail) {
        if (foundEmail) {
          return foundEmail;
        }

        return probeIdentityEndpoint(endpoint);
      });
    });

    return chain.then(function (email) {
      return {
        email: email,
        source: email ? "identity_endpoint" : "none",
      };
    });
  };

  const runIdentifyFlow = function (trigger) {
    return resolveCustomerEmail().then(function (result) {
      if (!result || !result.email) {
        identifyLog("No identifiable customer email resolved.", {
          trigger: trigger,
        });
        return false;
      }

      return identifyWithEmail(result.email, result.source + ":" + trigger);
    });
  };

  const startIdentifyPolling = function () {
    let attempts = 0;

    const poll = function () {
      attempts += 1;

      runIdentifyFlow("poll_" + attempts).then(function (identified) {
        if (identified || attempts >= identifyPollAttempts) {
          return;
        }

        window.setTimeout(poll, identifyPollIntervalMs);
      });
    };

    poll();
  };

  const scheduleIdentifyFlow = function (trigger, delayMs) {
    const waitMs = typeof delayMs === "number" ? delayMs : 0;

    window.setTimeout(function () {
      runIdentifyFlow(trigger);
    }, waitMs);
  };

  const runAuthTransitionIdentifyFlow = function (trigger) {
    scheduleIdentifyFlow(trigger);
    scheduleIdentifyFlow(trigger + "_delayed", 900);
  };

  const normalizedString = function (value) {
    if (typeof value === "string") {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    return "";
  };

  const normalizedNumber = function (value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(",", "."));

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
  };

  const normalizedArray = function (value) {
    if (Array.isArray(value)) {
      return value
        .map(function (entry) {
          return normalizedString(entry);
        })
        .filter(function (entry) {
          return !!entry;
        });
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return [];
      }

      if (trimmed.indexOf("[") === 0) {
        try {
          const parsed = JSON.parse(trimmed);
          return normalizedArray(parsed);
        } catch (error) {
          return [trimmed];
        }
      }

      return trimmed
        .split(",")
        .map(function (entry) {
          return entry.trim();
        })
        .filter(function (entry) {
          return !!entry;
        });
    }

    return [];
  };

  const normalizedAbsoluteUrl = function (value, fallbackToCurrentPage) {
    const candidate = normalizedString(value);

    if (!candidate) {
      return fallbackToCurrentPage && window.location ? window.location.href : "";
    }

    try {
      return new URL(candidate, window.location ? window.location.origin : undefined).href;
    } catch (error) {
      return candidate;
    }
  };

  const firstDefinedNumber = function (values) {
    if (!Array.isArray(values)) {
      return null;
    }

    for (let i = 0; i < values.length; i += 1) {
      if (values[i] !== null) {
        return values[i];
      }
    }

    return null;
  };

  const extractNumberFromPriceCandidate = function (candidate) {
    if (candidate === null || candidate === undefined) {
      return null;
    }

    const directNumber = normalizedNumber(candidate);

    if (directNumber !== null) {
      return directNumber;
    }

    if (!candidate || typeof candidate !== "object") {
      return null;
    }

    return firstDefinedNumber([
      normalizedNumber(candidate.value),
      normalizedNumber(candidate.gross),
      normalizedNumber(candidate.price),
      normalizedNumber(candidate.net),
      normalizedNumber(candidate.salesPrice),
      normalizedNumber(candidate.formattedValue),
      normalizedNumber(candidate.formatted),
    ]);
  };

  const extractCategories = function (candidate) {
    if (!candidate || typeof candidate !== "object") {
      return [];
    }

    const extractCategoriesFromBreadcrumbDom = function () {
      if (!window.document || typeof window.document.querySelectorAll !== "function") {
        return [];
      }

      const breadcrumbSelectors = [
        ".breadcrumb a",
        ".breadcrumbs a",
        "[data-testing='breadcrumb'] a",
        "nav[aria-label*='breadcrumb' i] a",
      ];
      const ignoredLabels = {
        home: true,
        startseite: true,
        "zur startseite gehen": true,
      };
      const categoryTrail = [];
      const seenLabels = {};

      for (let i = 0; i < breadcrumbSelectors.length; i += 1) {
        const selector = breadcrumbSelectors[i];
        const nodes = window.document.querySelectorAll(selector);

        for (let j = 0; j < nodes.length; j += 1) {
          const node = nodes[j];

          if (!node || typeof node.textContent !== "string") {
            continue;
          }

          const label = node.textContent.trim();
          const normalizedLabel = label.toLowerCase();

          if (!label || ignoredLabels[normalizedLabel] || seenLabels[normalizedLabel]) {
            continue;
          }

          seenLabels[normalizedLabel] = true;
          categoryTrail.push(label);
        }
      }

      return categoryTrail;
    };

    const categoryPaths = [
      ["defaultCategories"],
      ["categories"],
      ["categoryNames"],
      ["item", "defaultCategories"],
      ["item", "categories"],
      ["variation", "categories"],
      ["data", "categories"],
    ];

    for (let i = 0; i < categoryPaths.length; i += 1) {
      const value = getNestedValue(candidate, categoryPaths[i]);

      if (Array.isArray(value) && value.length > 0) {
        const normalized = value
          .map(function (entry) {
            if (typeof entry === "string") {
              return entry.trim();
            }

            if (entry && typeof entry === "object") {
              return normalizedString(
                entry.name ||
                  entry.details && entry.details[0] && entry.details[0].name ||
                  entry.path ||
                  entry.url ||
                  entry.id && "category:" + entry.id ||
                  entry.label ||
                  entry.value
              );
            }

            return "";
          })
          .filter(function (entry) {
            return !!entry;
          });

        if (normalized.length > 0) {
          const hasOnlyCategoryIdFallbacks = normalized.every(function (entry) {
            return /^category:/i.test(entry);
          });

          if (hasOnlyCategoryIdFallbacks) {
            const breadcrumbCategories = extractCategoriesFromBreadcrumbDom();

            if (breadcrumbCategories.length > 0) {
              return breadcrumbCategories;
            }
          }

          return normalized;
        }
      }
    }

    const breadcrumbCategories = extractCategoriesFromBreadcrumbDom();

    if (breadcrumbCategories.length > 0) {
      return breadcrumbCategories;
    }

    return [];
  };

  const extractCategoryHierarchy = function (candidate) {
    const categories = extractCategories(candidate);

    if (!Array.isArray(categories) || categories.length === 0) {
      return {
        categories: [],
        topCategory: null,
      };
    }

    return {
      categories: categories,
      topCategory: categories[0] || null,
    };
  };

  const getNamespacedCurrentItemVariationCandidates = function () {
    const getters = window.ceresStore && window.ceresStore.getters;

    if (!getters || typeof getters !== "object") {
      return [];
    }

    const keys = Object.keys(getters);
    const uniqueCandidates = [];
    const seenReferences = [];

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];

      if (!/\/currentItemVariation$/i.test(key)) {
        continue;
      }

      const value = getters[key];

      if (!value || typeof value !== "object") {
        continue;
      }

      if (seenReferences.indexOf(value) !== -1) {
        continue;
      }

      seenReferences.push(value);
      uniqueCandidates.push({
        sourceLabel: "ceresStore.getters." + key,
        candidate: value,
      });
    }

    return uniqueCandidates;
  };

  const getProductCandidateSources = function () {
    const sources = [];
    const directGetterCandidate =
      window.ceresStore &&
      window.ceresStore.getters &&
      window.ceresStore.getters.currentItemVariation;

    if (directGetterCandidate && typeof directGetterCandidate === "object") {
      sources.push({
        sourceLabel: "ceresStore.getters.currentItemVariation",
        candidate: directGetterCandidate,
      });
    }

    const namespacedGetterCandidates = getNamespacedCurrentItemVariationCandidates();

    for (let i = 0; i < namespacedGetterCandidates.length; i += 1) {
      sources.push(namespacedGetterCandidates[i]);
    }

    sources.push(
      {
        sourceLabel: "window.KlaviyoSiteEventTracking",
        candidate: window.KlaviyoSiteEventTracking,
      },
      {
        sourceLabel: "window.ceresStore.state",
        candidate: window.ceresStore && window.ceresStore.state,
      },
      {
        sourceLabel: "window.ceresStore.getters",
        candidate: window.ceresStore && window.ceresStore.getters,
      },
      {
        sourceLabel: "window.App",
        candidate: window.App,
      },
      {
        sourceLabel: "window.CeresApp",
        candidate: window.CeresApp,
      },
      {
        sourceLabel: "window.ceresApp",
        candidate: window.ceresApp,
      }
    );

    return sources;
  };

  const extractViewedProductCandidate = function (candidate) {
    if (!candidate || typeof candidate !== "object") {
      return null;
    }

    const variationId =
      normalizedString(getNestedValue(candidate, ["variation", "id"])) ||
      normalizedString(getNestedValue(candidate, ["variationId"])) ||
      normalizedString(getNestedValue(candidate, ["currentVariation", "id"])) ||
      normalizedString(getNestedValue(candidate, ["item", "variationId"]));
    const parentProductId =
      normalizedString(getNestedValue(candidate, ["variation", "itemId"])) ||
      normalizedString(getNestedValue(candidate, ["item", "id"])) ||
      normalizedString(getNestedValue(candidate, ["itemId"])) ||
      normalizedString(getNestedValue(candidate, ["currentVariation", "itemId"])) ||
      normalizedString(getNestedValue(candidate, ["currentItem", "id"]));
    const productId = variationId || parentProductId;
    const sku =
      normalizedString(getNestedValue(candidate, ["variation", "number"])) ||
      normalizedString(getNestedValue(candidate, ["variation", "model"])) ||
      normalizedString(getNestedValue(candidate, ["variation", "externalId"])) ||
      normalizedString(getNestedValue(candidate, ["sku"]));
    const productName =
      normalizedString(getNestedValue(candidate, ["variation", "name"])) ||
      normalizedString(getNestedValue(candidate, ["item", "texts", "name1"])) ||
      normalizedString(getNestedValue(candidate, ["texts", "name1"])) ||
      normalizedString(getNestedValue(candidate, ["name"]));
    const brand =
      normalizedString(getNestedValue(candidate, ["item", "manufacturer", "name"])) ||
      normalizedString(getNestedValue(candidate, ["manufacturer", "name"])) ||
      normalizedString(getNestedValue(candidate, ["brand"]));

    const imageUrl =
      normalizedString(getNestedValue(candidate, ["images", 0, "url"])) ||
      normalizedString(getNestedValue(candidate, ["images", 0, "urlMiddle"])) ||
      normalizedString(getNestedValue(candidate, ["images", "variation", 0, "url"])) ||
      normalizedString(getNestedValue(candidate, ["images", "variation", 0, "urlMiddle"])) ||
      normalizedString(getNestedValue(candidate, ["images", "all", 0, "url"])) ||
      normalizedString(getNestedValue(candidate, ["images", "all", 0, "urlMiddle"])) ||
      normalizedString(getNestedValue(candidate, ["item", "images", 0, "url"])) ||
      normalizedString(getNestedValue(candidate, ["variation", "images", 0, "url"])) ||
      normalizedString(getNestedValue(candidate, ["imageUrl"]));

    const price = firstDefinedNumber([
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["variation", "prices", "default", "price"])),
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["prices", "default", "price"])),
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["prices", "default", "lowestPrice"])),
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["variation", "prices", "default", "lowestPrice"])),
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["prices", "default", "unitPrice"])),
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["variation", "prices", "default", "unitPrice"])),
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["variation", "salesPrices", 0, "price"])),
      normalizedNumber(getNestedValue(candidate, ["price"])),
    ]);
    const compareAtPrice = firstDefinedNumber([
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["variation", "prices", "default", "rrp", "price"])),
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["variation", "prices", "rrp", "price"])),
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["prices", "default", "rrp"])),
      extractNumberFromPriceCandidate(getNestedValue(candidate, ["prices", "rrp", "price"])),
      normalizedNumber(getNestedValue(candidate, ["compareAtPrice"])),
    ]);

    if (!productId && !variationId && !productName) {
      return null;
    }

    const categoryHierarchy = extractCategoryHierarchy(candidate);

    return {
      ProductName: productName,
      ProductID: productId,
      SKU: sku,
      Categories: categoryHierarchy.categories,
      TopCategory: categoryHierarchy.topCategory,
      CategoryPath: categoryHierarchy.categories.join(" > "),
      ImageURL: normalizedAbsoluteUrl(imageUrl, false),
      URL: normalizedAbsoluteUrl(window.location ? window.location.href : "", true),
      Brand: brand,
      Price: price,
      CompareAtPrice: compareAtPrice,
      ParentProductID: parentProductId,
      VariationID: variationId,
      IsVariant: !!variationId,
    };
  };

  const getViewedProductFromDom = function () {
    const root = document.querySelector("[data-kse-product-id], [data-kse-product-name], [data-kse-variation-id]");

    if (!root) {
      return null;
    }

    const productId = normalizedString(root.getAttribute("data-kse-product-id"));
    const variationId = normalizedString(root.getAttribute("data-kse-variation-id"));
    const parentProductId = normalizedString(root.getAttribute("data-kse-parent-product-id"));
    const productName = normalizedString(root.getAttribute("data-kse-product-name"));

    if (!productId && !variationId && !productName) {
      return null;
    }

    const categories = normalizedArray(root.getAttribute("data-kse-categories"));

    return {
      ProductName: productName,
      ProductID: productId,
      SKU: normalizedString(root.getAttribute("data-kse-sku")),
      Categories: categories,
      TopCategory: categories[0] || null,
      CategoryPath: categories.join(" > "),
      ImageURL: normalizedAbsoluteUrl(root.getAttribute("data-kse-image-url"), false),
      URL: normalizedAbsoluteUrl(root.getAttribute("data-kse-url") || window.location.href, true),
      Brand: normalizedString(root.getAttribute("data-kse-brand")),
      Price: normalizedNumber(root.getAttribute("data-kse-price")),
      CompareAtPrice: normalizedNumber(root.getAttribute("data-kse-compare-at-price")),
      ParentProductID: parentProductId,
      VariationID: variationId,
      IsVariant: !!variationId,
    };
  };

  const isProductPagePath = function () {
    const appState = window.App && typeof window.App === "object" ? window.App : null;

    if (appState && appState.isItemView === true) {
      return {
        isProductPage: true,
        detectionSource: "runtime_app_isItemView",
      };
    }

    const templateType = normalizedString(appState && appState.templateType).toLowerCase();

    if (templateType === "item") {
      return {
        isProductPage: true,
        detectionSource: "runtime_app_templateType",
      };
    }

    if (!window.location || typeof window.location.pathname !== "string") {
      return {
        isProductPage: false,
        detectionSource: "none",
      };
    }

    const path = window.location.pathname.toLowerCase();

    const isPathMatch = /\/p\//.test(path) || /\/item\//.test(path) || /\/_\d+_\d+\/?$/.test(path);

    return {
      isProductPage: isPathMatch,
      detectionSource: isPathMatch ? "path_regex" : "none",
    };
  };

  const resolveViewedProductPayload = function () {
    const sources = getProductCandidateSources();

    for (let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const sourcePayload = extractViewedProductCandidate(source.candidate);

      if (sourcePayload && sourcePayload.ProductID && sourcePayload.ProductName) {
        return {
          payload: sourcePayload,
          sourceLabel: source.sourceLabel,
        };
      }
    }

    const domPayload = getViewedProductFromDom();
    if (domPayload && domPayload.ProductID && domPayload.ProductName) {
      return {
        payload: domPayload,
        sourceLabel: "dom_data_attributes",
      };
    }

    return null;
  };

  const buildViewedProductDedupKey = function (payload) {
    const productId = normalizedString(payload && payload.ParentProductID);
    const variationId = normalizedString(payload && payload.VariationID);
    const effectiveProductId = normalizedString(payload && payload.ProductID);
    const path = window.location && window.location.pathname ? window.location.pathname.toLowerCase() : "";

    return [productId || effectiveProductId, variationId || effectiveProductId, path].join("|");
  };

  const trackEvent = function (metricName, payload, context) {
    try {
      if (window.klaviyo && typeof window.klaviyo.track === "function") {
        window.klaviyo.track(metricName, payload);
      } else {
        window._learnq.push(["track", metricName, payload]);
      }

      trackLog("Klaviyo track executed.", {
        metric: metricName,
        trigger: context,
        payload: payload,
      });

      return true;
    } catch (error) {
      warn("Failed to execute Klaviyo track call.", {
        metric: metricName,
        trigger: context,
        message: error && error.message ? error.message : "unknown_error",
      });
      return false;
    }
  };

  const trackViewedItem = function (payload, context) {
    if (!(window.klaviyo && typeof window.klaviyo.trackViewedItem === "function")) {
      return;
    }

    try {
      window.klaviyo.trackViewedItem({
        Title: payload.ProductName,
        ItemId: payload.ProductID,
        Categories: payload.Categories || [],
        ImageUrl: payload.ImageURL,
        Url: payload.URL,
        Metadata: {
          Brand: payload.Brand || "",
          Price: payload.Price,
          CompareAtPrice: payload.CompareAtPrice,
          ParentProductID: payload.ParentProductID || "",
          VariationID: payload.VariationID || "",
        },
      });

      trackLog("Klaviyo trackViewedItem executed.", {
        trigger: context,
        itemId: payload.ProductID,
      });
    } catch (error) {
      warn("Failed to execute Klaviyo trackViewedItem call.", {
        trigger: context,
        message: error && error.message ? error.message : "unknown_error",
      });
    }
  };

  const trackViewedProduct = function (trigger) {
    if (!enableViewedProductEvent) {
      trackLog("Viewed Product tracking disabled by configuration.", {
        trigger: trigger,
      });
      return;
    }

    const pageDetection = isProductPagePath();
    const isDetectedProductPage = !!(pageDetection && pageDetection.isProductPage);

    trackLog("Viewed Product page detection evaluated.", {
      trigger: trigger,
      isProductPage: isDetectedProductPage,
      detectionSource: pageDetection && pageDetection.detectionSource ? pageDetection.detectionSource : "none",
      path: window.location ? window.location.pathname : "",
    });

    if (!isDetectedProductPage) {
      trackLog("Viewed Product skipped (not a detected product page path).", {
        trigger: trigger,
        path: window.location ? window.location.pathname : "",
      });
      return;
    }

    const payloadResolution = resolveViewedProductPayload();
    const payload = payloadResolution && payloadResolution.payload;

    if (!payload || !payload.ProductID || !payload.ProductName || !payload.URL) {
      trackLog("Viewed Product skipped (required payload fields missing).", {
        trigger: trigger,
      });
      return;
    }

    trackLog("Viewed Product payload resolved.", {
      trigger: trigger,
      sourceLabel: payloadResolution && payloadResolution.sourceLabel ? payloadResolution.sourceLabel : "unknown",
      productId: payload.ProductID,
      productName: payload.ProductName,
    });

    const dedupKey = buildViewedProductDedupKey(payload);

    if (window.__KlaviyoSiteEventTrackingLastViewedProductKey === dedupKey) {
      trackLog("Viewed Product skipped (deduped).", {
        trigger: trigger,
        dedupKey: dedupKey,
      });
      return;
    }

    const didTrack = trackEvent("Viewed Product", payload, trigger + "|" + dedupKey);

    if (!didTrack) {
      trackLog("Viewed Product dedupe key not updated because track dispatch failed.", {
        trigger: trigger,
        dedupKey: dedupKey,
      });
      return;
    }

    window.__KlaviyoSiteEventTrackingLastViewedProductKey = dedupKey;
    trackViewedItem(payload, trigger + "|" + dedupKey);
  };

  const getBasketItemCandidates = function (candidate) {
    if (!candidate || typeof candidate !== "object") {
      return [];
    }

    const possiblePaths = [
      ["basketItems"],
      ["basket", "basketItems"],
      ["basket", "items"],
      ["items"],
      ["detail", "basketItems"],
      ["data", "basketItems"],
      ["payload", "basketItems"],
      ["state", "basket", "basketItems"],
      ["state", "basket", "items"],
      ["basket", "itemList"],
    ];

    for (let i = 0; i < possiblePaths.length; i += 1) {
      const items = getNestedValue(candidate, possiblePaths[i]);

      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }

    return Array.isArray(candidate) ? candidate : [];
  };

  const resolveBasketLineVariationId = function (lineItem) {
    return (
      normalizedString(lineItem && lineItem.variationId) ||
      normalizedString(lineItem && lineItem.variation && lineItem.variation.id) ||
      normalizedString(lineItem && lineItem.id) ||
      normalizedString(lineItem && lineItem.itemId) ||
      normalizedString(lineItem && lineItem.variation && lineItem.variation.variationId)
    );
  };

  const resolveBasketLineItemId = function (lineItem) {
    return (
      normalizedString(lineItem && lineItem.itemId) ||
      normalizedString(lineItem && lineItem.item && lineItem.item.id) ||
      normalizedString(lineItem && lineItem.variation && lineItem.variation.itemId)
    );
  };

  const resolveBasketLinePrice = function (lineItem) {
    return firstDefinedNumber([
      extractNumberFromPriceCandidate(lineItem && lineItem.price),
      extractNumberFromPriceCandidate(lineItem && lineItem.amounts && lineItem.amounts.priceOriginalGross),
      extractNumberFromPriceCandidate(lineItem && lineItem.amounts && lineItem.amounts.priceGross),
      extractNumberFromPriceCandidate(lineItem && lineItem.amounts && lineItem.amounts.price),
      extractNumberFromPriceCandidate(lineItem && lineItem.variation && lineItem.variation.prices && lineItem.variation.prices.default && lineItem.variation.prices.default.price),
      normalizedNumber(lineItem && lineItem.unitPrice),
    ]);
  };

  const resolveBasketLineRowTotal = function (lineItem, quantity, itemPrice) {
    const directRowTotal = firstDefinedNumber([
      extractNumberFromPriceCandidate(lineItem && lineItem.rowTotal),
      extractNumberFromPriceCandidate(lineItem && lineItem.amounts && lineItem.amounts.totalGross),
      extractNumberFromPriceCandidate(lineItem && lineItem.amounts && lineItem.amounts.total),
      normalizedNumber(lineItem && lineItem.priceSum),
    ]);

    if (directRowTotal !== null) {
      return directRowTotal;
    }

    if (itemPrice !== null && quantity !== null) {
      return Number((itemPrice * quantity).toFixed(2));
    }

    return null;
  };

  const buildAddedToCartItems = function (basketItems) {
    if (!Array.isArray(basketItems) || basketItems.length === 0) {
      return [];
    }

    return basketItems
      .map(function (lineItem) {
        const variationId = resolveBasketLineVariationId(lineItem);
        const parentProductId = resolveBasketLineItemId(lineItem);
        const productId = variationId || parentProductId;
        const productName =
          normalizedString(lineItem && lineItem.variation && lineItem.variation.name) ||
          normalizedString(lineItem && lineItem.itemName) ||
          normalizedString(lineItem && lineItem.item && lineItem.item.texts && lineItem.item.texts.name1) ||
          normalizedString(lineItem && lineItem.item && lineItem.item.name) ||
          normalizedString(lineItem && lineItem.name);
        const quantity = firstDefinedNumber([
          normalizedNumber(lineItem && lineItem.quantity),
          normalizedNumber(lineItem && lineItem.orderQuantity),
          normalizedNumber(lineItem && lineItem.count),
        ]);
        const itemPrice = resolveBasketLinePrice(lineItem);
        const rowTotal = resolveBasketLineRowTotal(lineItem, quantity, itemPrice);
        const imageUrl =
          normalizedString(lineItem && lineItem.imageUrl) ||
          normalizedString(lineItem && lineItem.variation && lineItem.variation.imagePath) ||
          normalizedString(lineItem && lineItem.variation && lineItem.variation.images && lineItem.variation.images[0] && lineItem.variation.images[0].url);
        const productUrl =
          normalizedString(lineItem && lineItem.url) ||
          normalizedString(lineItem && lineItem.variation && lineItem.variation.urlPath) ||
          normalizedString(lineItem && lineItem.item && lineItem.item.urlPath) ||
          normalizedString(lineItem && lineItem.item && lineItem.item.url);
        const sku =
          normalizedString(lineItem && lineItem.variation && lineItem.variation.number) ||
          normalizedString(lineItem && lineItem.variation && lineItem.variation.model) ||
          normalizedString(lineItem && lineItem.variation && lineItem.variation.externalId) ||
          normalizedString(lineItem && lineItem.variationNumber);
        const productCategories = extractCategories(lineItem);

        return {
          ProductID: productId,
          SKU: sku,
          ProductName: productName,
          Quantity: quantity,
          ItemPrice: itemPrice,
          RowTotal: rowTotal,
          ProductURL: normalizedAbsoluteUrl(productUrl, true),
          ImageURL: normalizedAbsoluteUrl(imageUrl, false),
          ProductCategories: productCategories,
          _lineMeta: {
            variationId: variationId,
            itemId: parentProductId,
          },
        };
      })
      .filter(function (lineItem) {
        return !!(lineItem && lineItem.ProductID && lineItem.ProductName);
      });
  };

  const resolveAddedLineItem = function (latestIntent, basketItems) {
    if (!latestIntent || !Array.isArray(basketItems) || basketItems.length === 0) {
      return null;
    }

    const normalizedIntentVariationId = normalizedString(latestIntent.variationId);
    const normalizedIntentQuantity = normalizedNumber(latestIntent.quantity);
    const normalizedIntentTimestamp = normalizedNumber(latestIntent.timestamp);

    const exactMatches = basketItems.filter(function (lineItem) {
      if (!lineItem || !lineItem._lineMeta) {
        return false;
      }

      const sameVariation = lineItem._lineMeta.variationId === normalizedIntentVariationId;
      const sameQuantity =
        normalizedIntentQuantity === null ||
        lineItem.Quantity === normalizedIntentQuantity;

      return sameVariation && sameQuantity;
    });

    if (exactMatches.length > 0) {
      return exactMatches[exactMatches.length - 1];
    }

    const variationMatches = basketItems.filter(function (lineItem) {
      return !!(lineItem && lineItem._lineMeta && lineItem._lineMeta.variationId === normalizedIntentVariationId);
    });

    if (variationMatches.length > 0) {
      return variationMatches[variationMatches.length - 1];
    }

    if (normalizedIntentTimestamp === null) {
      return basketItems[basketItems.length - 1] || null;
    }

    const recencyMatches = basketItems
      .map(function (lineItem) {
        const lineTimestamp = firstDefinedNumber([
          normalizedNumber(getNestedValue(lineItem, ["_lineMeta", "lastUpdateTimestamp"])),
          normalizedNumber(getNestedValue(lineItem, ["_lineMeta", "createdAtTimestamp"])),
        ]);

        return {
          lineItem: lineItem,
          lineTimestamp: lineTimestamp,
        };
      })
      .filter(function (entry) {
        return entry.lineTimestamp !== null;
      })
      .sort(function (a, b) {
        return Math.abs(a.lineTimestamp - normalizedIntentTimestamp) - Math.abs(b.lineTimestamp - normalizedIntentTimestamp);
      });

    if (recencyMatches.length > 0) {
      return recencyMatches[0].lineItem;
    }

    return basketItems[basketItems.length - 1] || null;
  };

  const buildAddedToCartPayload = function (addedLineItem, items) {
    if (!addedLineItem || !Array.isArray(items) || items.length === 0) {
      return null;
    }

    const value = firstDefinedNumber([
      normalizedNumber(addedLineItem.RowTotal),
      normalizedNumber(addedLineItem.ItemPrice) !== null && normalizedNumber(addedLineItem.Quantity) !== null
        ? Number((normalizedNumber(addedLineItem.ItemPrice) * normalizedNumber(addedLineItem.Quantity)).toFixed(2))
        : null,
    ]);

    return {
      $value: value,
      AddedItemProductID: addedLineItem.ProductID,
      AddedItemSKU: addedLineItem.SKU || "",
      AddedItemProductName: addedLineItem.ProductName,
      AddedItemQuantity: addedLineItem.Quantity,
      AddedItemPrice: addedLineItem.ItemPrice,
      AddedItemRowTotal: addedLineItem.RowTotal,
      AddedItemProductURL: addedLineItem.ProductURL,
      AddedItemImageURL: addedLineItem.ImageURL,
      AddedItemCategories: addedLineItem.ProductCategories || [],
      ItemNames: items
        .map(function (entry) {
          return entry.ProductName;
        })
        .filter(function (entry) {
          return !!entry;
        }),
      CheckoutURL: normalizedAbsoluteUrl("/checkout", false),
      Items: items.map(function (entry) {
        return {
          ProductID: entry.ProductID,
          SKU: entry.SKU,
          ProductName: entry.ProductName,
          Quantity: entry.Quantity,
          ItemPrice: entry.ItemPrice,
          RowTotal: entry.RowTotal,
          ProductURL: entry.ProductURL,
          ImageURL: entry.ImageURL,
          ProductCategories: entry.ProductCategories,
        };
      }),
    };
  };

  const buildAddedToCartDedupKey = function (latestIntent) {
    const variationId = normalizedString(latestIntent && latestIntent.variationId);
    const quantity = normalizedNumber(latestIntent && latestIntent.quantity);
    const path = window.location && window.location.pathname ? window.location.pathname.toLowerCase() : "";
    const timestampBucket = Math.floor(((latestIntent && latestIntent.timestamp) || Date.now()) / 1200);

    return [variationId, quantity === null ? "" : quantity, path, timestampBucket].join("|");
  };

  const trackAddedToCart = function (trigger, basketEventPayload) {
    if (!enableAddedToCartEvent) {
      trackLog("Added to Cart skipped (disabled by configuration).", {
        trigger: trigger,
      });
      return;
    }

    const latestIntent = window.__KlaviyoSiteEventTrackingLatestAddedToCartIntent;

    if (!latestIntent || !latestIntent.variationId) {
      trackLog("Added to Cart skipped (missing required fields).", {
        trigger: trigger,
        reason: "missing_latest_intent",
      });
      return;
    }

    const basketItems = getBasketItemCandidates(basketEventPayload);

    if (!basketItems || basketItems.length === 0) {
      trackLog("Added to Cart skipped (no basket items).", {
        trigger: trigger,
      });
      return;
    }

    const normalizedItems = buildAddedToCartItems(basketItems);

    if (normalizedItems.length === 0) {
      trackLog("Added to Cart skipped (no basket items).", {
        trigger: trigger,
        basketItemCount: basketItems.length,
      });
      return;
    }

    const addedLineItem = resolveAddedLineItem(latestIntent, normalizedItems);

    if (!addedLineItem) {
      trackLog("Added to Cart skipped (no added line match).", {
        trigger: trigger,
        variationId: latestIntent.variationId,
      });
      return;
    }

    const dedupKey = buildAddedToCartDedupKey(latestIntent);

    if (window.__KlaviyoSiteEventTrackingLastAddedToCartKey === dedupKey) {
      trackLog("Added to Cart skipped (deduped).", {
        trigger: trigger,
        dedupKey: dedupKey,
      });
      return;
    }

    const payload = buildAddedToCartPayload(addedLineItem, normalizedItems);

    if (!payload || !payload.AddedItemProductID || !payload.AddedItemProductName) {
      trackLog("Added to Cart skipped (missing required fields).", {
        trigger: trigger,
        reason: "payload_incomplete",
      });
      return;
    }

    trackLog("Added to Cart payload resolved.", {
      trigger: trigger,
      sourceTrigger: latestIntent.sourceTrigger || "unknown",
      variationId: latestIntent.variationId,
      quantity: latestIntent.quantity,
      itemCount: normalizedItems.length,
      addedItemProductId: payload.AddedItemProductID,
    });

    const didTrack = trackEvent("Added to Cart", payload, trigger + "|" + dedupKey);

    if (!didTrack) {
      trackLog("Added to Cart skipped (failed track call).", {
        trigger: trigger,
        dedupKey: dedupKey,
      });
      return;
    }

    window.__KlaviyoSiteEventTrackingLastAddedToCartKey = dedupKey;
    window.__KlaviyoSiteEventTrackingLatestAddedToCartIntent = null;
  };

  const captureAddedToCartIntent = function (event) {
    const detail = event && event.detail && typeof event.detail === "object" ? event.detail : {};
    const variationId =
      normalizedString(detail.variationId) ||
      normalizedString(detail.id) ||
      normalizedString(detail.item && detail.item.variationId) ||
      normalizedString(detail.basketItem && detail.basketItem.variationId);
    const quantity = firstDefinedNumber([
      normalizedNumber(detail.quantity),
      normalizedNumber(detail.orderQuantity),
      normalizedNumber(detail.basketItem && detail.basketItem.quantity),
      1,
    ]);

    trackLog("Added to Cart tracking triggered.", {
      trigger: "afterBasketItemAdded",
      variationId: variationId,
      quantity: quantity,
    });

    if (!variationId) {
      trackLog("Added to Cart skipped (missing required fields).", {
        trigger: "afterBasketItemAdded",
        reason: "missing_variation_id",
      });
      return;
    }

    window.__KlaviyoSiteEventTrackingLatestAddedToCartIntent = {
      variationId: variationId,
      quantity: quantity,
      sourceTrigger: "afterBasketItemAdded",
      timestamp: Date.now(),
    };
  };

  const bindAddedToCartListeners = function () {
    document.addEventListener("afterBasketItemAdded", captureAddedToCartIntent);

    ["AfterBasketItemAdd", "afterBasketItemAdd", "AfterBasketChanged", "afterBasketChanged"].forEach(function (eventName) {
      document.addEventListener(eventName, function (event) {
        const detail = event && event.detail ? event.detail : null;
        trackLog("Added to Cart tracking triggered.", {
          trigger: eventName,
          hasBasketPayload: !!detail,
        });
        trackAddedToCart(eventName, detail);
      });
      window.addEventListener(eventName, function (event) {
        const detail = event && event.detail ? event.detail : null;
        trackLog("Added to Cart tracking triggered.", {
          trigger: "window_" + eventName,
          hasBasketPayload: !!detail,
        });
        trackAddedToCart("window_" + eventName, detail);
      });
    });
  };

  let viewedProductTrackTimeoutId = null;
  const scheduleViewedProductTrack = function (trigger, delayMs) {
    const waitMs = typeof delayMs === "number" ? delayMs : 200;

    if (viewedProductTrackTimeoutId) {
      window.clearTimeout(viewedProductTrackTimeoutId);
    }

    viewedProductTrackTimeoutId = window.setTimeout(function () {
      viewedProductTrackTimeoutId = null;
      trackViewedProduct(trigger);
    }, waitMs);
  };

  const addLifecycleEventListener = function (target, eventName, trigger) {
    if (!target || typeof target.addEventListener !== "function") {
      return;
    }

    target.addEventListener(eventName, function () {
      scheduleIdentifyFlow(trigger);
      scheduleViewedProductTrack(trigger);
    });
  };

  const registerHistoryRouteHooks = function () {
    if (window.__KlaviyoSiteEventTrackingHistoryHooksRegistered === true) {
      return;
    }

    window.__KlaviyoSiteEventTrackingHistoryHooksRegistered = true;

    const wrapHistoryMethod = function (methodName) {
      if (!window.history || typeof window.history[methodName] !== "function") {
        return;
      }

      const originalMethod = window.history[methodName];

      window.history[methodName] = function () {
        const returnValue = originalMethod.apply(window.history, arguments);
        scheduleIdentifyFlow("route_history_" + methodName);
        scheduleViewedProductTrack("route_history_" + methodName);

        if (window.location && /\/((my-)?account)(\/|$)/i.test(window.location.pathname || "")) {
          scheduleIdentifyFlow("account_route_history_" + methodName);
        }

        return returnValue;
      };
    };

    wrapHistoryMethod("pushState");
    wrapHistoryMethod("replaceState");
  };

  const registerIdentifyListeners = function () {
    document.addEventListener("submit", function () {
      scheduleIdentifyFlow("form_submit", 700);
    });

    document.addEventListener("change", function (event) {
      const target = event && event.target;

      if (!target || !target.closest) {
        return;
      }

      if (target.closest("[data-variation-id], [data-variation-select], [class*='variation'], [name*='variation']")) {
        scheduleViewedProductTrack("variation_change", 250);
      }
    });

    document.addEventListener("click", function (event) {
      const target = event && event.target;

      if (!target || !target.closest) {
        return;
      }

      if (target.closest("[data-variation-id], [data-variation-select], [class*='variation'], [data-js='variation-select']")) {
        scheduleViewedProductTrack("variation_click", 250);
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        scheduleIdentifyFlow("visibility_visible");
      }
    });

    addLifecycleEventListener(window, "popstate", "route_popstate");
    addLifecycleEventListener(window, "hashchange", "route_hashchange");

    addLifecycleEventListener(document, "ceres:route-changed", "route_ceres");
    addLifecycleEventListener(document, "vue:route-changed", "route_vue");
    addLifecycleEventListener(document, "afterRouteChanged", "route_after_changed");

    addLifecycleEventListener(document, "account:view-changed", "account_route");
    addLifecycleEventListener(document, "account:overview-loaded", "account_overview");

    [
      ["login:success", "login_success"],
      ["user:login:success", "login_success_user"],
      ["auth:success", "auth_success"],
      ["registration:success", "registration_success"],
    ].forEach(function (eventConfig) {
      document.addEventListener(eventConfig[0], function () {
        runAuthTransitionIdentifyFlow(eventConfig[1]);
        scheduleViewedProductTrack("auth_" + eventConfig[1], 350);
      });
    });

    registerHistoryRouteHooks();
    bindAddedToCartListeners();
  };

  const scriptSource =
    "https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=" +
    encodeURIComponent(publicApiKey);

  const existingManagedScript = document.querySelector(
    "script[data-klaviyo-site-event-tracking='true']"
  );

  const existingKlaviyoScript = document.querySelector(
    "script[src*='static.klaviyo.com/onsite/js/klaviyo.js']"
  );

  registerIdentifyListeners();
  scheduleViewedProductTrack("bootstrap");

  if (existingManagedScript || existingKlaviyoScript) {
    debugLog("Klaviyo onsite script is already present. Skipping injection.", {
      hasManagedScript: !!existingManagedScript,
      hasKlaviyoScript: !!existingKlaviyoScript,
    });
    startIdentifyPolling();
    scheduleViewedProductTrack("existing_script");
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

  startIdentifyPolling();
  scheduleViewedProductTrack("script_injected", 350);
})();
