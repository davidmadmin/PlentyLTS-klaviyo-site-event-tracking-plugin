(function () {
  const settings = window.KlaviyoSiteEventTracking || {};
  const integrationMode = settings.integrationMode || "plugin";
  const publicApiKey = (settings.publicApiKey || "").trim();

  const debugEnabled = settings.enableDebugLogging === true;
  const logErrorsOnly = settings.logErrorsOnly === true;

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

  if (integrationMode === "gtm") {
    debugLog(
      "Integration mode is GTM. Expecting Klaviyo JavaScript to be loaded externally (for example via Google Tag Manager)."
    );
    return;
  }

  if (!publicApiKey) {
    warn(
      "Missing required setting 'tracking.publicApiKey' for plugin integration mode. Add your Klaviyo public API key in plugin configuration or switch to GTM mode if Klaviyo is loaded externally."
    );
    return;
  }

  debugLog("Plugin mode selected and public API key is configured.");

  // Placeholder only: full Klaviyo JS integration + event tracking will be implemented later.
})();
