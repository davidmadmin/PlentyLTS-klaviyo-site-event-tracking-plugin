(function () {
  const settings = window.KlaviyoSiteEventTracking || {};
  const integrationMode = settings.integrationMode || "plugin";
  const publicApiKey = (settings.publicApiKey || "").trim();

  const debugEnabled = settings.enableDebugLogging === true;
  const logErrorsOnly = settings.logErrorsOnly === true;
  const logIdentifyCalls = settings.logIdentifyCalls === true;
  const logTrackCalls = settings.logTrackCalls === true;
  const apiNamespaceName = "KlaviyoSiteEventTrackingApi";
  const retryDelayMs = 250;
  const maxRetryAttempts = 8;

  const pendingCalls = [];
  const knownSubmissionProfiles = {
    login: null,
    registration: null,
    newsletter: null,
  };

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

  const isKlaviyoReady = function () {
    return !!window.klaviyo || !!window._learnq;
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

    if (debugEnabled && !logErrorsOnly && logIdentifyCalls) {
      debugLog("identifyUser called.", {
        profile: sanitizeForLog(payload, 0),
        context: sanitizeForLog(context || {}, 0),
      });
    }

    return queueOrInvoke({
      type: "identify",
      profile: payload,
      context: context || {},
    });
  };

  const trackEvent = function (metricName, properties, context) {
    const metric = typeof metricName === "string" ? metricName.trim() : "";
    const payload = properties && typeof properties === "object" ? properties : {};

    if (!metric) {
      errorLog("trackEvent called without a valid metric name.", {
        context: sanitizeForLog(context || {}, 0),
      });
      return false;
    }

    if (debugEnabled && !logErrorsOnly && logTrackCalls) {
      debugLog("trackEvent called.", {
        metricName: metric,
        properties: sanitizeForLog(payload, 0),
        context: sanitizeForLog(context || {}, 0),
      });
    }

    return queueOrInvoke({
      type: "track",
      metricName: metric,
      properties: payload,
      context: context || {},
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

    if (normalizedUrl.indexOf("newsletter") >= 0 || normalizedUrl.indexOf("subscribe") >= 0) {
      return "newsletter";
    }

    if (normalizedUrl.indexOf("register") >= 0 || normalizedUrl.indexOf("registration") >= 0) {
      return "registration";
    }

    if (normalizedUrl.indexOf("login") >= 0 || normalizedUrl.indexOf("authenticate") >= 0) {
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
    const combined = action + " " + className;

    if (combined.indexOf("newsletter") >= 0 || combined.indexOf("subscribe") >= 0) {
      return "newsletter";
    }

    if (combined.indexOf("register") >= 0 || combined.indexOf("registration") >= 0) {
      return "registration";
    }

    if (combined.indexOf("login") >= 0 || combined.indexOf("signin") >= 0) {
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
      "ceres:registration:success": "registration",
      "ceres:newsletter:success": "newsletter",
    };

    Object.keys(customEventToSourceMap).forEach(function (eventName) {
      window.addEventListener(eventName, function (event) {
        const source = customEventToSourceMap[eventName];
        identifyFromSource(source, event.detail || {}, knownSubmissionProfiles[source]);
      });
    });
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
            const source = detectSourceFromUrl(requestUrl);

            if (!source || !response || response.ok !== true) {
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
              })
              .catch(function () {
                identifyFromSource(source, {}, knownSubmissionProfiles[source]);
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
        });

        return originalSend.apply(this, arguments);
      };
    }
  };

  if (window.__KlaviyoSiteEventTrackingIdentityHooksInitialized !== true) {
    window.__KlaviyoSiteEventTrackingIdentityHooksInitialized = true;
    registerDomSubmissionHooks();
    registerCustomEventHooks();
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
})();
