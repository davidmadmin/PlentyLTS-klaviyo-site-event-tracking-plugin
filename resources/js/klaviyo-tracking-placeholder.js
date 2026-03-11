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

  const registerIdentifyListeners = function () {
    document.addEventListener("submit", function () {
      window.setTimeout(function () {
        runIdentifyFlow("form_submit");
      }, 700);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        runIdentifyFlow("visibility_visible");
      }
    });
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

  if (existingManagedScript || existingKlaviyoScript) {
    debugLog("Klaviyo onsite script is already present. Skipping injection.", {
      hasManagedScript: !!existingManagedScript,
      hasKlaviyoScript: !!existingKlaviyoScript,
    });
    startIdentifyPolling();
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
})();
