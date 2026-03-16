(function () {
  const settings = window.KlaviyoSiteEventTracking || {};
  const integrationMode = settings.integrationMode || "plugin";
  const publicApiKey = (settings.publicApiKey || "").trim();
  const configuredIdentifyEmailOverride = (settings.debugIdentifyEmailOverride || "").trim();

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

  const logPluginHeartbeat = isEnabled(settings.logPluginHeartbeat, true);
  const logIdentifyEventDebug = isEnabled(settings.logIdentifyEventDebug, false);
  const logViewedProductEventDebug = isEnabled(settings.logViewedProductEventDebug, false);
  const logAddedToCartEventDebug = isEnabled(settings.logAddedToCartEventDebug, false);
  const logViewedHomepageEventDebug = isEnabled(settings.logViewedHomepageEventDebug, false);
  const logViewedCategoryEventDebug = isEnabled(settings.logViewedCategoryEventDebug, false);
  const logStartedCheckoutEventDebug = isEnabled(settings.logStartedCheckoutEventDebug, false);
  const enableViewedProductEvent = isEnabled(settings.enableViewedProductEvent, true);
  const enableAddedToCartEvent = isEnabled(settings.enableAddedToCartEvent, true);
  const enableViewedHomepageEvent = isEnabled(settings.enableViewedHomepageEvent, true);
  const enableViewedCategoryEvent = isEnabled(settings.enableViewedCategoryEvent, true);
  const enableStartedCheckoutEvent = isEnabled(settings.enableStartedCheckoutEvent, true);
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
    if (!logIdentifyEventDebug) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const debugLog = function (message, payload) {
    if (!logPluginHeartbeat) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const heartbeatLog = function (message, payload) {
    if (!logPluginHeartbeat) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const viewedProductLog = function (message, payload) {
    if (!logViewedProductEventDebug) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const addedToCartLog = function (message, payload) {
    if (!logAddedToCartEventDebug) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const viewedHomepageLog = function (message, payload) {
    if (!logViewedHomepageEventDebug) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const viewedCategoryLog = function (message, payload) {
    if (!logViewedCategoryEventDebug) {
      return;
    }

    if (typeof payload !== "undefined") {
      console.info("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

    console.info("[KlaviyoSiteEventTracking] " + message);
  };

  const startedCheckoutLog = function (message, payload) {
    if (!logStartedCheckoutEventDebug) {
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
    hasDebugIdentifyEmailOverride: !!configuredIdentifyEmailOverride,
  });

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
    const overrideEmail = normalizedEmail(configuredIdentifyEmailOverride);

    if (overrideEmail) {
      return Promise.resolve({ email: overrideEmail, source: "config_override" });
    }

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

  const hasIdentifyEmailOverride = function () {
    return !!normalizedEmail(configuredIdentifyEmailOverride);
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

  const uniqueStringArray = function (entries) {
    if (!Array.isArray(entries)) {
      return [];
    }

    const seen = {};
    const uniqueEntries = [];

    for (let i = 0; i < entries.length; i += 1) {
      const value = normalizedString(entries[i]);

      if (!value) {
        continue;
      }

      const normalizedKey = value.toLowerCase();

      if (seen[normalizedKey]) {
        continue;
      }

      seen[normalizedKey] = true;
      uniqueEntries.push(value);
    }

    return uniqueEntries;
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

  const isTemplatePageType = function (expectedTemplateType) {
    const appState = window.App && typeof window.App === "object" ? window.App : null;
    const templateType = normalizedString(appState && appState.templateType).toLowerCase();

    if (!templateType) {
      return {
        isMatch: false,
        detectionSource: "none",
        templateType: "",
      };
    }

    return {
      isMatch: templateType === expectedTemplateType,
      detectionSource: "runtime_app_templateType",
      templateType: templateType,
    };
  };

  const resolveViewedHomepagePayload = function () {
    const pageTitle = normalizedString(document && document.title);
    return {
      URL: normalizedAbsoluteUrl(window.location ? window.location.href : "", true),
      Path: normalizedString(window.location && window.location.pathname),
      TemplateType: "home",
      PageTitle: pageTitle || "Homepage",
    };
  };

  const resolveViewedCategoryPayload = function () {
    const categoryFromState = normalizedString(getNestedValue(window, ["App", "activeCategory", "details", "name"]));
    const breadcrumbNodes = document.querySelectorAll(".breadcrumb a, .breadcrumbs a, [data-testing='breadcrumb'] a");
    let breadcrumbCategory = "";

    if (breadcrumbNodes && breadcrumbNodes.length) {
      const lastNode = breadcrumbNodes[breadcrumbNodes.length - 1];
      breadcrumbCategory = normalizedString(lastNode && lastNode.textContent);
    }

    const categoryName = categoryFromState || breadcrumbCategory || normalizedString(document && document.title);

    return {
      URL: normalizedAbsoluteUrl(window.location ? window.location.href : "", true),
      Path: normalizedString(window.location && window.location.pathname),
      TemplateType: "category",
      CategoryName: categoryName || "Category",
      PageTitle: normalizedString(document && document.title),
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


  const normalizedInteger = function (value, fallbackValue) {
    const numericValue = normalizedNumber(value);

    if (numericValue === null) {
      return typeof fallbackValue === "number" ? fallbackValue : 0;
    }

    const rounded = Math.round(numericValue);
    return Number.isFinite(rounded) ? rounded : (typeof fallbackValue === "number" ? fallbackValue : 0);
  };

  const normalizeBasketItems = function (basket) {
    if (!basket || typeof basket !== "object") {
      return [];
    }

    const itemCollections = [
      basket.items,
      basket.basketItems,
      basket.itemList,
      basket.lines,
      basket.data && basket.data.items,
      basket.basket && basket.basket.items,
      basket.basket && basket.basket.basketItems,
    ];

    for (let i = 0; i < itemCollections.length; i += 1) {
      if (Array.isArray(itemCollections[i])) {
        return itemCollections[i];
      }
    }

    return [];
  };

  const extractBasketTotal = function (basket) {
    return firstDefinedNumber([
      normalizedNumber(getNestedValue(basket, ["data", "basketAmount"])),
      normalizedNumber(getNestedValue(basket, ["data", "basketAmountNet"])),
      normalizedNumber(getNestedValue(basket, ["data", "totals", "basketTotalGross"])),
      normalizedNumber(getNestedValue(basket, ["data", "totals", "total"])),
      normalizedNumber(getNestedValue(basket, ["data", "totals", "amount"])),
      extractNumberFromPriceCandidate(getNestedValue(basket, ["data", "totals", "basketTotal"])),
      normalizedNumber(getNestedValue(basket, ["totals", "basketTotalGross"])),
      normalizedNumber(getNestedValue(basket, ["totals", "total"])),
      normalizedNumber(getNestedValue(basket, ["basketAmount"])),
      normalizedNumber(getNestedValue(basket, ["basketAmountNet"])),
      normalizedNumber(getNestedValue(basket, ["totalSum"])),
      normalizedNumber(getNestedValue(basket, ["totals", "amount"])),
      extractNumberFromPriceCandidate(getNestedValue(basket, ["totals", "basketTotal"])),
    ]);
  };

  const sumBasketLineRowTotals = function (basketLines) {
    if (!Array.isArray(basketLines) || basketLines.length === 0) {
      return null;
    }

    let hasNumericRowTotal = false;
    let runningTotal = 0;

    for (let i = 0; i < basketLines.length; i += 1) {
      const line = basketLines[i];
      const rowTotal = firstDefinedNumber([
        normalizedNumber(getNestedValue(line, ["RowTotal"])),
        normalizedNumber(getNestedValue(line, ["rowTotal"])),
        normalizedNumber(getNestedValue(line, ["total"])),
        normalizedNumber(getNestedValue(line, ["totalGross"])),
        extractNumberFromPriceCandidate(getNestedValue(line, ["basketItemOrderParams", "rowTotal"])),
        extractNumberFromPriceCandidate(getNestedValue(line, ["basketItemOrderParams", "total"])),
      ]);

      if (rowTotal === null) {
        continue;
      }

      hasNumericRowTotal = true;
      runningTotal += rowTotal;
    }

    if (!hasNumericRowTotal) {
      return null;
    }

    return Number(runningTotal.toFixed(4));
  };

  const extractBasketLine = function (item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const variationId =
      normalizedString(getNestedValue(item, ["variationId"])) ||
      normalizedString(getNestedValue(item, ["variation", "id"])) ||
      normalizedString(getNestedValue(item, ["id"]));
    const productId =
      normalizedString(getNestedValue(item, ["itemId"])) ||
      normalizedString(getNestedValue(item, ["item", "id"])) ||
      normalizedString(getNestedValue(item, ["variation", "itemId"])) ||
      variationId;
    const quantity = normalizedInteger(
      firstDefinedNumber([
        normalizedNumber(getNestedValue(item, ["quantity"])),
        normalizedNumber(getNestedValue(item, ["amount"])),
      ]),
      1
    );
    const price = firstDefinedNumber([
      extractNumberFromPriceCandidate(getNestedValue(item, ["price"])),
      extractNumberFromPriceCandidate(getNestedValue(item, ["basketItemOrderParams", "price"])),
      extractNumberFromPriceCandidate(getNestedValue(item, ["variation", "prices", "default", "price", "value"])),
      normalizedNumber(getNestedValue(item, ["priceGross"])),
    ]);
    const explicitRowTotal = firstDefinedNumber([
      normalizedNumber(getNestedValue(item, ["RowTotal"])),
      normalizedNumber(getNestedValue(item, ["rowTotal"])),
      normalizedNumber(getNestedValue(item, ["total"])),
      normalizedNumber(getNestedValue(item, ["totalGross"])),
      extractNumberFromPriceCandidate(getNestedValue(item, ["basketItemOrderParams", "rowTotal"])),
      extractNumberFromPriceCandidate(getNestedValue(item, ["basketItemOrderParams", "total"])),
    ]);

    const categories = uniqueStringArray(
      (extractCategories(item) || [])
        .concat(extractCategories(getNestedValue(item, ["variation", "data"])) || [])
        .concat(extractCategories(getNestedValue(item, ["variation", "data", "item"])) || [])
    );

    const itemName =
      normalizedString(getNestedValue(item, ["itemName"])) ||
      normalizedString(getNestedValue(item, ["variation", "name"])) ||
      normalizedString(getNestedValue(item, ["variation", "data", "texts", "name1"])) ||
      normalizedString(getNestedValue(item, ["item", "data", "texts", "name1"])) ||
      normalizedString(getNestedValue(item, ["variation", "texts", "name1"])) ||
      normalizedString(getNestedValue(item, ["item", "texts", "name1"])) ||
      normalizedString(getNestedValue(item, ["data", "texts", "name1"])) ||
      normalizedString(getNestedValue(item, ["name"]));
    const productUrl = normalizedAbsoluteUrl(
      normalizedString(getNestedValue(item, ["url"])) ||
        normalizedString(getNestedValue(item, ["item", "url"])) ||
        normalizedString(getNestedValue(item, ["variation", "url"])) ||
        normalizedString(getNestedValue(item, ["variation", "data", "texts", "urlPath"])) ||
        normalizedString(getNestedValue(item, ["variation", "data", "texts", "url"])) ||
        normalizedString(getNestedValue(item, ["variation", "data", "url"])),
      false
    );

    return {
      ItemName: itemName,
      ProductName: itemName,
      ProductID: productId,
      VariationID: variationId,
      SKU:
        normalizedString(getNestedValue(item, ["variationNumber"])) ||
        normalizedString(getNestedValue(item, ["variation", "number"])) ||
        normalizedString(getNestedValue(item, ["sku"])) ||
        normalizedString(getNestedValue(item, ["variation", "data", "variation", "number"])) ||
        normalizedString(getNestedValue(item, ["variation", "data", "variation", "model"])) ||
        normalizedString(getNestedValue(item, ["variation", "data", "variation", "externalId"])),
      Quantity: quantity,
      ItemPrice: price,
      RowTotal: explicitRowTotal !== null ? explicitRowTotal : (price !== null ? Number((price * quantity).toFixed(4)) : null),
      ImageURL: normalizedAbsoluteUrl(
        normalizedString(getNestedValue(item, ["image"])) ||
          normalizedString(getNestedValue(item, ["imageUrl"])) ||
          normalizedString(getNestedValue(item, ["variation", "images", 0, "url"])) ||
          normalizedString(getNestedValue(item, ["variation", "images", 0, "urlMiddle"])) ||
          normalizedString(getNestedValue(item, ["variation", "data", "images", "all", 0, "url"])) ||
          normalizedString(getNestedValue(item, ["variation", "data", "images", "all", 0, "urlMiddle"])) ||
          normalizedString(getNestedValue(item, ["variation", "data", "images", 0, "url"])) ||
          normalizedString(getNestedValue(item, ["variation", "data", "images", 0, "urlMiddle"])),
        false
      ),
      URL: productUrl,
      ProductURL: productUrl,
      Categories: categories,
      ProductCategories: categories,
    };
  };

  const hasBasketTotalsOnlyShape = function (candidate) {
    if (!candidate || typeof candidate !== 'object') {
      return false;
    }

    const hasTotals =
      normalizedNumber(getNestedValue(candidate, ['basketAmount'])) !== null ||
      normalizedNumber(getNestedValue(candidate, ['itemQuantity'])) !== null ||
      normalizedString(getNestedValue(candidate, ['currency']));

    return !!hasTotals && normalizeBasketItems(candidate).length === 0;
  };

  const getRuntimeBasketCandidates = function () {
    return [
      {
        sourceLabel: 'runtime_basket.window.ceresStore.state.basket',
        basket: window.ceresStore && window.ceresStore.state && window.ceresStore.state.basket,
      },
      {
        sourceLabel: 'runtime_basket.window.ceresStore.getters.basket',
        basket: window.ceresStore && window.ceresStore.getters && window.ceresStore.getters.basket,
      },
      {
        sourceLabel: 'runtime_basket.window.App.basket',
        basket: window.App && window.App.basket,
      },
      {
        sourceLabel: 'runtime_basket.window.CeresApp.basket',
        basket: window.CeresApp && window.CeresApp.basket,
      },
      {
        sourceLabel: 'runtime_basket.window.ceresApp.basket',
        basket: window.ceresApp && window.ceresApp.basket,
      },
    ];
  };

  const resolveRuntimeBasketLines = function (intent) {
    const runtimeCandidates = getRuntimeBasketCandidates();

    for (let i = 0; i < runtimeCandidates.length; i += 1) {
      const runtimeCandidate = runtimeCandidates[i];
      const items = normalizeBasketItems(runtimeCandidate.basket);

      if (!items.length) {
        continue;
      }

      const basketLines = items
        .map(function (item) {
          return extractBasketLine(item);
        })
        .filter(function (line) {
          return !!line && !!line.ProductID;
        });

      if (!basketLines.length) {
        continue;
      }

      let addedLine = null;

      if (intent && intent.variationId) {
        for (let j = 0; j < basketLines.length; j += 1) {
          if (basketLines[j].VariationID === intent.variationId) {
            addedLine = basketLines[j];
            break;
          }
        }
      }

      if (!addedLine && intent && intent.productId) {
        for (let j = 0; j < basketLines.length; j += 1) {
          if (basketLines[j].ProductID === intent.productId) {
            addedLine = basketLines[j];
            break;
          }
        }
      }

      if (!intent) {
        addedLine = basketLines[basketLines.length - 1] || null;

        return {
          sourceLabel: runtimeCandidate.sourceLabel,
          basket: runtimeCandidate.basket,
          items: items,
          basketLines: basketLines,
          addedLine: addedLine,
        };
      }

      if (!addedLine) {
        continue;
      }

      return {
        sourceLabel: runtimeCandidate.sourceLabel,
        basket: runtimeCandidate.basket,
        items: items,
        basketLines: basketLines,
        addedLine: addedLine,
      };
    }

    return null;
  };

  const resolveBasketSnapshot = function (event) {
    const detail = event && event.detail && typeof event.detail === "object" ? event.detail : null;
    let totalsOnlySnapshot = null;
    const candidates = [
      detail,
      detail && detail.basket,
      detail && detail.data,
      detail && detail.payload,
      window.ceresStore && window.ceresStore.state && window.ceresStore.state.basket,
      window.ceresStore && window.ceresStore.getters && window.ceresStore.getters.basket,
      window.App && window.App.basket,
    ];

    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      const items = normalizeBasketItems(candidate);

      if (items.length > 0) {
        return {
          sourceLabel: i === 0 ? "afterBasketChanged.detail" : "basket_candidate_" + i,
          basket: candidate,
          items: items,
        };
      }

      if (i === 0 && hasBasketTotalsOnlyShape(candidate)) {
        totalsOnlySnapshot = {
          sourceLabel: 'afterBasketChanged.detail.totals_only',
          basket: candidate,
          items: [],
          totalsOnly: true,
        };
      }
    }

    return totalsOnlySnapshot;
  };

  const resolveBasketLinesSnapshot = function (basketResolution, intent, options) {
    const allowRuntimeLookup = !(options && options.allowRuntimeLookup === false);
    let basket = basketResolution && basketResolution.basket;
    const items = basketResolution && basketResolution.items ? basketResolution.items : [];
    let basketLines = items
      .map(function (item) {
        return extractBasketLine(item);
      })
      .filter(function (line) {
        return !!line && !!line.ProductID;
      });
    let resolvedSourceLabel = basketResolution && basketResolution.sourceLabel ? basketResolution.sourceLabel : 'unknown';
    let addedLine = null;

    if (basketLines.length === 0 && allowRuntimeLookup) {
      const runtimeResolution = resolveRuntimeBasketLines(intent || null);

      if (runtimeResolution) {
        basket = runtimeResolution.basket || basket;
        basketLines = runtimeResolution.basketLines;
        addedLine = runtimeResolution.addedLine;
        resolvedSourceLabel = basketResolution && basketResolution.sourceLabel
          ? basketResolution.sourceLabel + '->' + runtimeResolution.sourceLabel
          : runtimeResolution.sourceLabel;
      }
    }

    return {
      basket: basket,
      basketLines: basketLines,
      addedLine: addedLine,
      sourceLabel: resolvedSourceLabel,
      totalsOnly: !!(basketResolution && basketResolution.totalsOnly),
    };
  };

  const resolveAddedToCartPayload = function (intent, basketResolution, options) {
    const allowWithoutIntent = !!(options && options.allowWithoutIntent);
    const basketLinesResolution = resolveBasketLinesSnapshot(basketResolution, intent, options);
    let basket = basketLinesResolution.basket;
    let basketLines = basketLinesResolution.basketLines;

    const effectiveIntent = intent || null;

    if (!effectiveIntent && !allowWithoutIntent) {
      return null;
    }

    let addedLine = basketLinesResolution.addedLine;
    let resolvedSourceLabel = basketLinesResolution.sourceLabel;

    if (basketLines.length === 0) {
      return null;
    }

    if (!addedLine && effectiveIntent) {
      for (let i = 0; i < basketLines.length; i += 1) {
        const line = basketLines[i];
        if (
          (effectiveIntent.variationId && line.VariationID === effectiveIntent.variationId) ||
          (effectiveIntent.productId && line.ProductID === effectiveIntent.productId)
        ) {
          addedLine = line;
          break;
        }
      }
    }

    if (!addedLine) {
      addedLine = basketLines[basketLines.length - 1];
    }

    if (!addedLine) {
      return null;
    }

    if (effectiveIntent && !effectiveIntent.productId && addedLine.ProductID) {
      effectiveIntent.productId = addedLine.ProductID;
    }

    const checkoutUrl = normalizedAbsoluteUrl('/checkout', true);
    const basketValue = firstDefinedNumber([
      extractBasketTotal(basket),
      sumBasketLineRowTotals(basketLines),
      (addedLine && addedLine.ItemPrice !== null)
        ? Number((addedLine.ItemPrice * (effectiveIntent && effectiveIntent.requestedQuantity ? effectiveIntent.requestedQuantity : addedLine.Quantity)).toFixed(4))
        : null,
    ]);

    return {
      payload: {
        $value: basketValue,
        AddedItemProductName: addedLine.ItemName,
        AddedItemProductID: addedLine.ProductID,
        AddedItemSKU: addedLine.SKU,
        AddedItemCategories: addedLine.Categories,
        AddedItemImageURL: addedLine.ImageURL,
        AddedItemURL: addedLine.URL,
        AddedItemPrice: addedLine.ItemPrice,
        AddedItemQuantity: effectiveIntent && effectiveIntent.requestedQuantity ? effectiveIntent.requestedQuantity : addedLine.Quantity,
        ItemNames: basketLines.map(function (line) { return line.ItemName; }).filter(function (v) { return !!v; }),
        CheckoutURL: checkoutUrl,
        Items: basketLines,
      },
      addedLine: addedLine,
      sourceLabel: resolvedSourceLabel,
      correlationMode: effectiveIntent ? 'intent_matched' : 'basket_fallback_no_intent',
    };
  };

  const getCheckoutSessionIdentifier = function () {
    const runtimeCandidates = [
      normalizedString(getNestedValue(window, ['App', 'basket', 'id'])),
      normalizedString(getNestedValue(window, ['ceresStore', 'state', 'basket', 'id'])),
      normalizedString(getNestedValue(window, ['ceresStore', 'state', 'basket', 'data', 'id'])),
      normalizedString(getNestedValue(window, ['ceresStore', 'getters', 'basket', 'id'])),
      normalizedString(getNestedValue(window, ['CeresApp', 'basket', 'id'])),
      normalizedString(getNestedValue(window, ['ceresApp', 'basket', 'id'])),
    ];

    for (let i = 0; i < runtimeCandidates.length; i += 1) {
      if (runtimeCandidates[i]) {
        return runtimeCandidates[i];
      }
    }

    const existingAnonymousSessionIdentifier = normalizedString(window.__KlaviyoSiteEventTrackingAnonymousCheckoutSessionId);
    if (existingAnonymousSessionIdentifier) {
      return existingAnonymousSessionIdentifier;
    }

    const anonymousSessionIdentifier = ['anon_checkout', String(Date.now()), String(Math.floor(Math.random() * 1000000000))].join('_');
    window.__KlaviyoSiteEventTrackingAnonymousCheckoutSessionId = anonymousSessionIdentifier;
    return anonymousSessionIdentifier;
  };

  const resolveStartedCheckoutPayload = function () {
    const basketResolution = resolveBasketSnapshot();
    const basketLinesResolution = resolveBasketLinesSnapshot(basketResolution, null, { allowRuntimeLookup: true });
    const basketLines = basketLinesResolution.basketLines;

    if (!basketLines || basketLines.length === 0) {
      return null;
    }

    const checkoutUrl = normalizedAbsoluteUrl('/checkout', true);
    const categories = uniqueStringArray(
      basketLines.reduce(function (allCategories, line) {
        const lineCategories = Array.isArray(line && line.ProductCategories)
          ? line.ProductCategories
          : (Array.isArray(line && line.Categories) ? line.Categories : []);
        return allCategories.concat(lineCategories);
      }, [])
    );
    const itemNames = uniqueStringArray(
      basketLines.map(function (line) {
        return line && (line.ProductName || line.ItemName);
      })
    );
    const checkoutSessionIdentifier = getCheckoutSessionIdentifier();
    const eventId = checkoutSessionIdentifier + '_started_checkout';

    return {
      payload: {
        $event_id: eventId,
        $value: firstDefinedNumber([
          extractBasketTotal(basketLinesResolution.basket),
          sumBasketLineRowTotals(basketLines),
        ]),
        ItemNames: itemNames,
        CheckoutURL: checkoutUrl,
        Categories: categories,
        Items: basketLines.map(function (line) {
          return {
            ProductID: line.ProductID,
            SKU: line.SKU,
            ProductName: line.ProductName || line.ItemName,
            Quantity: line.Quantity,
            ItemPrice: line.ItemPrice,
            RowTotal: line.RowTotal,
            ProductURL: line.ProductURL || line.URL,
            ImageURL: line.ImageURL,
            ProductCategories: Array.isArray(line.ProductCategories)
              ? line.ProductCategories
              : (Array.isArray(line.Categories) ? line.Categories : []),
          };
        }),
      },
      sourceLabel: basketLinesResolution.sourceLabel,
    };
  };

  const trackStartedCheckout = function (trigger) {
    const isRetryAttempt = /\|retry_\d+$/.test(trigger || '');

    if (!enableStartedCheckoutEvent) {
      startedCheckoutLog('Started Checkout skipped (disabled by configuration).', { trigger: trigger });
      return;
    }

    const pageDetection = isTemplatePageType('checkout');
    startedCheckoutLog('Started Checkout page detection evaluated.', {
      trigger: trigger,
      isCheckout: pageDetection.isMatch,
      detectionSource: pageDetection.detectionSource,
      templateType: pageDetection.templateType,
      path: window.location ? window.location.pathname : '',
    });

    if (!pageDetection.isMatch) {
      if (window.__KlaviyoSiteEventTrackingStartedCheckoutRetryTimeoutId) {
        window.clearTimeout(window.__KlaviyoSiteEventTrackingStartedCheckoutRetryTimeoutId);
        window.__KlaviyoSiteEventTrackingStartedCheckoutRetryTimeoutId = null;
      }

      if (window.__KlaviyoSiteEventTrackingStartedCheckoutRetryCount) {
        startedCheckoutLog('Started Checkout retry canceled (left checkout page).', {
          trigger: trigger,
          retryAttempts: window.__KlaviyoSiteEventTrackingStartedCheckoutRetryCount,
        });
      }

      window.__KlaviyoSiteEventTrackingStartedCheckoutRetryCount = 0;
      window.__KlaviyoSiteEventTrackingAnonymousCheckoutSessionId = null;
      window.__KlaviyoSiteEventTrackingLastStartedCheckoutKey = null;
      return;
    }

    const payloadResolution = resolveStartedCheckoutPayload();
    const payload = payloadResolution && payloadResolution.payload;

    if (!payload || !payload.CheckoutURL || !Array.isArray(payload.Items) || payload.Items.length === 0) {
      const maxStartedCheckoutRetryAttempts = 10;
      const startedCheckoutRetryDelayMs = 300;
      const currentRetryCount = Number.isFinite(window.__KlaviyoSiteEventTrackingStartedCheckoutRetryCount)
        ? window.__KlaviyoSiteEventTrackingStartedCheckoutRetryCount
        : 0;

      if (currentRetryCount >= maxStartedCheckoutRetryAttempts) {
        startedCheckoutLog('Started Checkout skipped (required payload fields missing; retry exhausted).', {
          trigger: trigger,
          retryAttempts: currentRetryCount,
          maxRetryAttempts: maxStartedCheckoutRetryAttempts,
        });
        return;
      }

      if (window.__KlaviyoSiteEventTrackingStartedCheckoutRetryTimeoutId) {
        startedCheckoutLog('Started Checkout payload missing; retry already scheduled.', {
          trigger: trigger,
          retryAttempts: currentRetryCount,
          maxRetryAttempts: maxStartedCheckoutRetryAttempts,
        });
        return;
      }

      const retryAttempt = currentRetryCount + 1;
      window.__KlaviyoSiteEventTrackingStartedCheckoutRetryCount = retryAttempt;

      startedCheckoutLog('Started Checkout payload missing; scheduling retry.', {
        trigger: trigger,
        retryAttempt: retryAttempt,
        maxRetryAttempts: maxStartedCheckoutRetryAttempts,
        retryDelayMs: startedCheckoutRetryDelayMs,
      });

      window.__KlaviyoSiteEventTrackingStartedCheckoutRetryTimeoutId = window.setTimeout(function () {
        window.__KlaviyoSiteEventTrackingStartedCheckoutRetryTimeoutId = null;
        trackStartedCheckout((trigger || 'started_checkout') + '|retry_' + retryAttempt);
      }, startedCheckoutRetryDelayMs);

      startedCheckoutLog('Started Checkout skipped (required payload fields missing).', { trigger: trigger });
      return;
    }

    if (window.__KlaviyoSiteEventTrackingStartedCheckoutRetryTimeoutId) {
      window.clearTimeout(window.__KlaviyoSiteEventTrackingStartedCheckoutRetryTimeoutId);
      window.__KlaviyoSiteEventTrackingStartedCheckoutRetryTimeoutId = null;
    }

    if (isRetryAttempt || window.__KlaviyoSiteEventTrackingStartedCheckoutRetryCount) {
      startedCheckoutLog('Started Checkout retry succeeded.', {
        trigger: trigger,
        retryAttempts: window.__KlaviyoSiteEventTrackingStartedCheckoutRetryCount || 0,
      });
    }

    window.__KlaviyoSiteEventTrackingStartedCheckoutRetryCount = 0;

    startedCheckoutLog('Started Checkout payload resolved.', {
      trigger: trigger,
      sourceLabel: payloadResolution.sourceLabel,
      itemCount: payload.Items.length,
      eventId: payload.$event_id,
      value: payload.$value,
    });

    const dedupKey = [payload.CheckoutURL, getCheckoutSessionIdentifier()].join('|');

    if (window.__KlaviyoSiteEventTrackingLastStartedCheckoutKey === dedupKey) {
      startedCheckoutLog('Started Checkout skipped (deduped).', { trigger: trigger, dedupKey: dedupKey });
      return;
    }

    const didTrack = trackEvent('Started Checkout', payload, trigger + '|' + dedupKey);

    if (!didTrack) {
      startedCheckoutLog('Started Checkout dedupe key not updated because track dispatch failed.', { trigger: trigger, dedupKey: dedupKey });
      return;
    }

    window.__KlaviyoSiteEventTrackingLastStartedCheckoutKey = dedupKey;
  };

  const buildAddedToCartDedupKey = function (payload, bucketTimestamp) {
    const productId = normalizedString(payload && payload.AddedItemProductID);
    const qty = normalizedString(payload && payload.AddedItemQuantity);
    const basketHash = normalizedString(payload && payload.ItemNames ? payload.ItemNames.join('|') : '');
    return [productId, qty, basketHash, String(bucketTimestamp)].join('|');
  };

  const maxAddedToCartIntentAgeMs = 15000;
  const maxPendingAddedToCartBasketAgeMs = 2500;

  let lastAddedToCartIntent = null;
  let pendingAddedToCartBasketResolution = null;

  const readFreshAddedToCartIntent = function () {
    if (!lastAddedToCartIntent) {
      return null;
    }

    if (Date.now() - lastAddedToCartIntent.timestamp > maxAddedToCartIntentAgeMs) {
      addedToCartLog('Added to Cart intent expired before basket correlation.', {
        triggerSource: lastAddedToCartIntent.triggerSource,
      });
      lastAddedToCartIntent = null;
      return null;
    }

    return lastAddedToCartIntent;
  };

  const readFreshPendingAddedToCartBasketResolution = function () {
    if (!pendingAddedToCartBasketResolution) {
      return null;
    }

    if (Date.now() - pendingAddedToCartBasketResolution.timestamp > maxPendingAddedToCartBasketAgeMs) {
      addedToCartLog('Added to Cart basket snapshot expired before intent correlation.', {
        trigger: pendingAddedToCartBasketResolution.trigger,
      });
      pendingAddedToCartBasketResolution = null;
      return null;
    }

    return pendingAddedToCartBasketResolution;
  };

  const attemptAddedToCartDispatch = function (trigger, basketResolution, options) {
    const payloadResolution = resolveAddedToCartPayload(readFreshAddedToCartIntent(), basketResolution, options);
    const payload = payloadResolution && payloadResolution.payload;

    if (!payload || !payload.AddedItemProductName || !payload.AddedItemProductID || payload.AddedItemPrice === null || !payload.AddedItemQuantity) {
      addedToCartLog('Added to Cart skipped (required payload fields missing).', {
        trigger: trigger,
        hasPayload: !!payload,
      });
      return false;
    }

    addedToCartLog('Added to Cart payload resolved.', {
      trigger: trigger,
      sourceLabel: payloadResolution.sourceLabel,
      correlationMode: payloadResolution.correlationMode,
      addedItemProductId: payload.AddedItemProductID,
      addedItemProductName: payload.AddedItemProductName,
      addedItemQuantity: payload.AddedItemQuantity,
    });

    const dedupeBucket = Math.floor(Date.now() / 5000);
    const dedupKey = buildAddedToCartDedupKey(payload, dedupeBucket);

    if (window.__KlaviyoSiteEventTrackingLastAddedToCartKey === dedupKey) {
      addedToCartLog('Added to Cart skipped (deduped).', {
        trigger: trigger,
        dedupKey: dedupKey,
      });
      lastAddedToCartIntent = null;
      pendingAddedToCartBasketResolution = null;
      return true;
    }

    const didTrack = trackEvent('Added to Cart', payload, trigger + '|' + dedupKey);

    if (!didTrack) {
      addedToCartLog('Added to Cart dedupe key not updated because track dispatch failed.', {
        trigger: trigger,
        dedupKey: dedupKey,
      });
      return false;
    }

    if (trigger.indexOf('|intent_followup') !== -1) {
      addedToCartLog('Added to Cart using inverted event-order fallback.', {
        trigger: trigger,
      });
    } else {
      addedToCartLog('Added to Cart using normal event order.', {
        trigger: trigger,
      });
    }

    window.__KlaviyoSiteEventTrackingLastAddedToCartKey = dedupKey;
    lastAddedToCartIntent = null;
    pendingAddedToCartBasketResolution = null;
    return true;
  };

  const captureAddedToCartIntent = function (event) {
    const detail = event && event.detail && typeof event.detail === 'object' ? event.detail : {};
    const variationId =
      normalizedString(detail.variationId) ||
      normalizedString(getNestedValue(detail, ['variation', 'id'])) ||
      normalizedString(getNestedValue(detail, ['basketItem', 'variationId']));
    const productId =
      normalizedString(detail.itemId) ||
      normalizedString(getNestedValue(detail, ['item', 'id'])) ||
      normalizedString(getNestedValue(detail, ['variation', 'itemId']));

    lastAddedToCartIntent = {
      variationId: variationId,
      productId: productId,
      requestedQuantity: normalizedInteger(firstDefinedNumber([
        normalizedNumber(detail.quantity),
        normalizedNumber(getNestedValue(detail, ['basketItem', 'quantity'])),
      ]), 1),
      timestamp: Date.now(),
      triggerSource: normalizedString(detail.source) || 'afterBasketItemAdded',
    };

    addedToCartLog('Added to Cart trigger captured.', {
      variationId: lastAddedToCartIntent.variationId,
      productId: lastAddedToCartIntent.productId,
      requestedQuantity: lastAddedToCartIntent.requestedQuantity,
      triggerSource: lastAddedToCartIntent.triggerSource,
    });

    const pendingBasket = readFreshPendingAddedToCartBasketResolution();

    if (!pendingBasket) {
      return;
    }

    addedToCartLog('Added to Cart intent correlated with buffered basket snapshot.', {
      trigger: pendingBasket.trigger,
      sourceLabel: pendingBasket.basketResolution.sourceLabel,
    });

    const didDispatch = attemptAddedToCartDispatch(
      pendingBasket.trigger + '|intent_followup',
      pendingBasket.basketResolution,
      { allowWithoutIntent: false }
    );

    if (!didDispatch) {
      addedToCartLog('Added to Cart skipped (intent and snapshot could not be correlated).', {
        trigger: pendingBasket.trigger,
      });
    }
  };

  const trackAddedToCart = function (event, trigger) {
    if (!enableAddedToCartEvent) {
      addedToCartLog('Added to Cart skipped (disabled by configuration).', {
        trigger: trigger,
      });
      return;
    }

    const basketResolution = resolveBasketSnapshot(event);

    if (!basketResolution) {
      addedToCartLog('Added to Cart skipped (required payload fields missing).', {
        trigger: trigger,
        reason: 'basket_snapshot_missing',
      });
      return;
    }

    addedToCartLog('Added to Cart basket snapshot resolved.', {
      trigger: trigger,
      sourceLabel: basketResolution.sourceLabel,
      itemCount: basketResolution.items.length,
    });

    pendingAddedToCartBasketResolution = {
      basketResolution: basketResolution,
      timestamp: Date.now(),
      trigger: trigger,
    };

    addedToCartLog('Added to Cart basket snapshot buffered awaiting intent correlation.', {
      trigger: trigger,
      sourceLabel: basketResolution.sourceLabel,
    });

    const freshIntent = readFreshAddedToCartIntent();

    if (!freshIntent) {
      addedToCartLog('Added to Cart skipped (intent and snapshot could not be correlated).', {
        trigger: trigger,
        reason: 'intent_missing_or_expired',
      });
      return;
    }

    attemptAddedToCartDispatch(trigger, basketResolution, { allowWithoutIntent: false });
  };

  const trackEvent = function (metricName, payload, context) {
    try {
      if (window.klaviyo && typeof window.klaviyo.track === "function") {
        window.klaviyo.track(metricName, payload);
      } else {
        window._learnq.push(["track", metricName, payload]);
      }

      if (metricName === "Viewed Product") {
        viewedProductLog("Klaviyo track executed.", {
          metric: metricName,
          trigger: context,
          payload: payload,
        });
      }

      if (metricName === "Added to Cart") {
        addedToCartLog("Klaviyo track executed.", {
          metric: metricName,
          trigger: context,
          payload: payload,
        });
      }

      if (metricName === "Viewed Homepage") {
        viewedHomepageLog("Klaviyo track executed.", {
          metric: metricName,
          trigger: context,
          payload: payload,
        });
      }

      if (metricName === "Viewed Category") {
        viewedCategoryLog("Klaviyo track executed.", {
          metric: metricName,
          trigger: context,
          payload: payload,
        });
      }

      if (metricName === "Started Checkout") {
        startedCheckoutLog("Klaviyo track executed.", {
          metric: metricName,
          trigger: context,
          payload: payload,
        });
      }

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

      viewedProductLog("Klaviyo trackViewedItem executed.", {
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
      viewedProductLog("Viewed Product tracking disabled by configuration.", {
        trigger: trigger,
      });
      return;
    }

    const pageDetection = isProductPagePath();
    const isDetectedProductPage = !!(pageDetection && pageDetection.isProductPage);

    viewedProductLog("Viewed Product page detection evaluated.", {
      trigger: trigger,
      isProductPage: isDetectedProductPage,
      detectionSource: pageDetection && pageDetection.detectionSource ? pageDetection.detectionSource : "none",
      path: window.location ? window.location.pathname : "",
    });

    if (!isDetectedProductPage) {
      viewedProductLog("Viewed Product skipped (not a detected product page path).", {
        trigger: trigger,
        path: window.location ? window.location.pathname : "",
      });
      return;
    }

    const payloadResolution = resolveViewedProductPayload();
    const payload = payloadResolution && payloadResolution.payload;

    if (!payload || !payload.ProductID || !payload.ProductName || !payload.URL) {
      viewedProductLog("Viewed Product skipped (required payload fields missing).", {
        trigger: trigger,
      });
      return;
    }

    viewedProductLog("Viewed Product payload resolved.", {
      trigger: trigger,
      sourceLabel: payloadResolution && payloadResolution.sourceLabel ? payloadResolution.sourceLabel : "unknown",
      productId: payload.ProductID,
      productName: payload.ProductName,
    });

    const dedupKey = buildViewedProductDedupKey(payload);

    if (window.__KlaviyoSiteEventTrackingLastViewedProductKey === dedupKey) {
      viewedProductLog("Viewed Product skipped (deduped).", {
        trigger: trigger,
        dedupKey: dedupKey,
      });
      return;
    }

    const didTrack = trackEvent("Viewed Product", payload, trigger + "|" + dedupKey);

    if (!didTrack) {
      viewedProductLog("Viewed Product dedupe key not updated because track dispatch failed.", {
        trigger: trigger,
        dedupKey: dedupKey,
      });
      return;
    }

    window.__KlaviyoSiteEventTrackingLastViewedProductKey = dedupKey;
    trackViewedItem(payload, trigger + "|" + dedupKey);
  };

  const trackViewedHomepage = function (trigger) {
    if (!enableViewedHomepageEvent) {
      viewedHomepageLog("Viewed Homepage skipped (disabled by configuration).", { trigger: trigger });
      return;
    }

    const pageDetection = isTemplatePageType("home");
    viewedHomepageLog("Viewed Homepage page detection evaluated.", {
      trigger: trigger,
      isHomepage: pageDetection.isMatch,
      detectionSource: pageDetection.detectionSource,
      templateType: pageDetection.templateType,
      path: window.location ? window.location.pathname : "",
    });

    if (!pageDetection.isMatch) {
      return;
    }

    const payload = resolveViewedHomepagePayload();
    const dedupKey = [payload.TemplateType, payload.Path].join("|");

    if (window.__KlaviyoSiteEventTrackingLastViewedHomepageKey === dedupKey) {
      viewedHomepageLog("Viewed Homepage skipped (deduped).", { trigger: trigger, dedupKey: dedupKey });
      return;
    }

    const didTrack = trackEvent("Viewed Homepage", payload, trigger + "|" + dedupKey);

    if (!didTrack) {
      viewedHomepageLog("Viewed Homepage dedupe key not updated because track dispatch failed.", { trigger: trigger, dedupKey: dedupKey });
      return;
    }

    window.__KlaviyoSiteEventTrackingLastViewedHomepageKey = dedupKey;
  };

  const trackViewedCategory = function (trigger) {
    if (!enableViewedCategoryEvent) {
      viewedCategoryLog("Viewed Category skipped (disabled by configuration).", { trigger: trigger });
      return;
    }

    const pageDetection = isTemplatePageType("category");
    viewedCategoryLog("Viewed Category page detection evaluated.", {
      trigger: trigger,
      isCategory: pageDetection.isMatch,
      detectionSource: pageDetection.detectionSource,
      templateType: pageDetection.templateType,
      path: window.location ? window.location.pathname : "",
    });

    if (!pageDetection.isMatch) {
      return;
    }

    const payload = resolveViewedCategoryPayload();

    if (!payload.URL || !payload.CategoryName) {
      viewedCategoryLog("Viewed Category skipped (required payload fields missing).", { trigger: trigger });
      return;
    }

    viewedCategoryLog("Viewed Category payload resolved.", {
      trigger: trigger,
      categoryName: payload.CategoryName,
      path: payload.Path,
    });

    const dedupKey = [payload.TemplateType, payload.Path].join("|");

    if (window.__KlaviyoSiteEventTrackingLastViewedCategoryKey === dedupKey) {
      viewedCategoryLog("Viewed Category skipped (deduped).", { trigger: trigger, dedupKey: dedupKey });
      return;
    }

    const didTrack = trackEvent("Viewed Category", payload, trigger + "|" + dedupKey);

    if (!didTrack) {
      viewedCategoryLog("Viewed Category dedupe key not updated because track dispatch failed.", { trigger: trigger, dedupKey: dedupKey });
      return;
    }

    window.__KlaviyoSiteEventTrackingLastViewedCategoryKey = dedupKey;
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
      trackViewedHomepage(trigger);
      trackViewedCategory(trigger);
      trackStartedCheckout(trigger);
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
  };

  const registerAddedToCartListeners = function () {
    if (window.__KlaviyoSiteEventTrackingAddedToCartListenersRegistered === true) {
      addedToCartLog("Added to Cart listeners already registered. Skipping duplicate registration.");
      return;
    }

    document.addEventListener("afterBasketItemAdded", function (event) {
      captureAddedToCartIntent(event);
    });
    addedToCartLog("Added to Cart listener attached.", {
      target: "document",
      event: "afterBasketItemAdded",
    });

    document.addEventListener("afterBasketChanged", function (event) {
      trackAddedToCart(event, "afterBasketChanged");
    });
    addedToCartLog("Added to Cart listener attached.", {
      target: "document",
      event: "afterBasketChanged",
    });

    window.__KlaviyoSiteEventTrackingAddedToCartListenersRegistered = true;
  };

  registerAddedToCartListeners();

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

  if (hasIdentifyEmailOverride()) {
    identifyLog("Debug identify email override active. Runtime email discovery is skipped.", {
      source: "config",
      email: normalizedEmail(configuredIdentifyEmailOverride),
    });
    runIdentifyFlow("override_bootstrap");
  }

  if (existingManagedScript || existingKlaviyoScript) {
    debugLog("Klaviyo onsite script is already present. Skipping injection.", {
      hasManagedScript: !!existingManagedScript,
      hasKlaviyoScript: !!existingKlaviyoScript,
    });
    if (!hasIdentifyEmailOverride()) {
      startIdentifyPolling();
    }
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

  if (!hasIdentifyEmailOverride()) {
    startIdentifyPolling();
  }
  scheduleViewedProductTrack("script_injected", 350);
})();
