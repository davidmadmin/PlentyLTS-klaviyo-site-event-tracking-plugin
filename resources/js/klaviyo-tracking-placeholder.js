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

  const warn = function (message, payload) {
    if (typeof payload !== "undefined") {
      console.warn("[KlaviyoSiteEventTracking] " + message, payload);
      return;
    }

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

  if (logIdentifyCalls) {
    warn(
      "Identify status placeholder. identify logging is enabled, but user identified/not-identified resolution is not implemented yet.",
      {
        identifyEnabled: true,
        identifiedStatus: "unknown_placeholder",
      }
    );
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
