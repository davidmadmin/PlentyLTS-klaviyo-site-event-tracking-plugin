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
