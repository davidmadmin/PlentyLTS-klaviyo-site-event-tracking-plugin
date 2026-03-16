# ![Klaviyo On-site Event Tracking plugin logo](meta/images/Klaviyo-On-site-Event-Tracking-plugin-logo.png)

# Klaviyo Site Event Tracking Plugin (PlentyLTS)

> Enable Klaviyo on-site tracking in plentyShop LTS with a configurable, privacy-aware, and production-ready plugin integration.

**Status legend:** 🟢 Implemented | 🟡 In progress / scaffolded | 🔴 Not implemented

## Quick overview

This plugin is intended to implement **all commonly suggested Klaviyo on-site events** so storefront behavior can be tied to customer profiles and used for segmentation, flows, and analytics.

## Scope: Klaviyo on-site metrics/events

The table below is optimized for a quick implementation and product-status scan.

| Status | Event / Metric | Why it matters | Trigger (Plenty storefront) |
|---|---|---|---|
| 🟢 | **Identified Profile (Identify)** | Connect anonymous behavior to a known person | Logged-in session or post-login resolution identifies profile by email |
| 🟢 | **Active on Site** | Baseline site engagement and profile activity | Covered by the identify lifecycle because profile activity is established when identify resolves |
| 🟢 | **Viewed Product** | Product interest and browse intent | PDP runtime-state detection plus variant/route changes dispatch product metadata |
| 🟢 | **Added to Cart** | Purchase intent signal for abandoned-cart journeys | Add-intent capture (`afterBasketItemAdded`) plus basket-snapshot reconciliation (`afterBasketChanged`) |
| 🟢 | **Started Checkout** | Funnel entry and checkout abandonment flows | Checkout page detection (`window.App.templateType === "checkout"`) with shared basket-line snapshot payload resolution (includes runtime fallback when no Added-to-Cart intent is available) |
| 🟢 | **Viewed Homepage** | Baseline landing engagement and session context | Runtime page-type detection when Plenty `window.App.templateType === "home"` |
| 🟢 | **Viewed Category / Listing** | Discovery behavior and merchandising effectiveness | Runtime page-type detection when Plenty `window.App.templateType === "category"` |
| 🔴 | **Removed from Cart** | Cart friction insight and drop-off analysis | Remove-line-item action in cart/minicart |
| 🔴 | **Checkout Step Progression** | Diagnose checkout friction points | Movement between checkout steps (address, shipping, payment, review) |
| 🔴 | **Placed Order** | Conversion tracking and post-purchase automation | Successful order placement confirmation |
| 🔴 | **Refunded Order** | Revenue quality and customer lifecycle signals | Order status/payment reversal recognized by storefront/account event feed |
| 🔴 | **Submitted Search** | Demand and intent intelligence | On-site search submit with query + result count |
| 🔴 | **Viewed Content Page** | Non-product engagement context | CMS/content page view (guides, service pages, etc.) |
| 🔴 | **Clicked Promotion / Banner** | Campaign and merchandising interaction | Click on promo blocks, hero banners, teaser components |
| 🔴 | **Signed Up for Newsletter** | Lead acquisition and welcome-flow trigger | Newsletter subscription success event |
| 🔴 | **Logged In** | Lifecycle stage and re-engagement qualifier | Successful account login |
| 🔴 | **Created Account** | New-customer lifecycle start | Successful account registration |
| 🔴 | **Added to Wishlist** | High-intent product affinity signal | Wishlist add action |
| 🔴 | **Removed from Wishlist** | Intent change / product preference shifts | Wishlist remove action |
| 🔴 | **Viewed Cart** | Mid-funnel behavior context | Cart page or minicart expanded with line items present |
| 🔴 | **Applied Coupon** | Promotion sensitivity and conversion quality | Coupon code accepted in cart/checkout |
| 🔴 | **Failed Coupon Attempt** | Promotion friction and UX insight | Coupon code rejected/invalid |

## Current implementation state (repository)

At this time, the repository provides a **partial implementation** with bootstrap and identity support:

- 🟢 Klaviyo JavaScript bootstrap implemented for plugin and GTM modes
- 🟢 Frontend identify flow implemented (email-based profile identification for logged-in users)
- 🟢 Frontend Viewed Product tracking implemented with runtime-store + DOM fallback payload resolution and deduped variant transitions
- 🟢 Frontend Added to Cart tracking implemented with add-intent buffering, basket-snapshot payload resolution, and deduped dispatch
- 🟢 Frontend Started Checkout tracking implemented via Plenty runtime `templateType = checkout` detection with shared basket-line payload extraction (including no-intent runtime basket fallback), payload-readiness retry handling, and deduped dispatch
- 🟢 Frontend Viewed Homepage tracking implemented via Plenty runtime `templateType = home` detection and deduped dispatch
- 🟢 Frontend Viewed Category tracking implemented via Plenty runtime `templateType = category` detection and deduped dispatch
- 🟡 Configuration and debug logging controls are available and evolving
- 🔴 Most storefront business event mappings are still pending

## Planned rollout approach

1. **Bootstrap + identity layer**
   - Load and validate Klaviyo JS in plugin mode
   - Harden profile identify flow and consent-aware guards
2. **Core commerce events**
   - Viewed Product, Added to Cart, Started Checkout, Placed Order
3. **Funnel and UX enrichment**
   - Search, listing/category views, coupon outcomes, wishlist/cart behavior
4. **Hardening**
   - Error handling, deduplication, QA matrix, and documentation

## Setup notes

- The `KlaviyoSiteEventTracking\Containers\KlaviyoTrackingContainer` data provider defaults to `Ceres::Script.Loader` via `defaultLayoutContainer`.
- Without custom overrides, the Klaviyo site event tracking entrypoint is injected through that Ceres script loader container.

## Plenty templateType findings (for site-type event targeting)

The storefront runtime value `window.App.templateType` is the primary source used by this plugin for site-type detection. Verified mappings:

- Homepage: `home`
- Checkout: `checkout`
- Product detail page: `item`
- Category/listing page: `category`
- Legal pages (examples): `privacy-policy`, `cancellation-rights`, `legal-disclosure`

This means legal tracking should be implemented as an allow-list of template types instead of a single generic `legal` value.

## Configuration

Plugin config is split into dedicated tabs:

- **Setup tab**
  - `tracking.integrationMode`
    - `gtm`: Klaviyo JS handled externally (Google Tag Manager)
    - `plugin`: Klaviyo JS handled by this plugin
  - `tracking.publicApiKey`
    - Klaviyo site ID used when integration mode is `plugin`

- **Events tab**
  - `tracking.enableViewedProductEvent`
    - Enabled by default; activates/deactivates the `Viewed Product` tracking flow
  - `tracking.enableAddedToCartEvent`
    - Enabled by default; activates/deactivates the `Added to Cart` tracking flow
  - `tracking.enableViewedHomepageEvent`
    - Enabled by default; activates/deactivates the `Viewed Homepage` tracking flow
  - `tracking.enableViewedCategoryEvent`
    - Enabled by default; activates/deactivates the `Viewed Category` tracking flow
  - `tracking.enableStartedCheckoutEvent`
    - Enabled by default; activates/deactivates the `Started Checkout` tracking flow

- **Debugging tab**
  - `tracking.logPluginHeartbeat`
    - Enabled by default; writes bootstrap/lifecycle diagnostics for plugin heartbeat and script bootstrap handling
  - `tracking.logIdentifyEventDebug`
    - Emits identify-event diagnostics (`console.info`) for resolution attempts, trigger sources, successful identify calls, and deduped identify skips
  - `tracking.debugIdentifyEmailOverride`
    - Optional debug override email; when set to a valid email, runtime identity discovery is skipped and identify uses this configured address
  - `tracking.logViewedProductEventDebug`
    - Emits `Viewed Product` diagnostics (`console.info`) for page detection, payload resolution, dedupe handling, and track dispatch
  - `tracking.logAddedToCartEventDebug`
    - Emits `Added to Cart` diagnostics (`console.info`) for listener registration, intent/snapshot correlation, payload resolution, dedupe handling, and track dispatch
  - `tracking.logViewedHomepageEventDebug`
    - Emits `Viewed Homepage` diagnostics (`console.info`) for template-type detection, dedupe handling, and track dispatch
  - `tracking.logViewedCategoryEventDebug`
    - Emits `Viewed Category` diagnostics (`console.info`) for template-type detection, payload resolution, dedupe handling, and track dispatch
  - `tracking.logStartedCheckoutEventDebug`
    - Emits `Started Checkout` diagnostics (`console.info`) for checkout page detection, basket payload resolution (including no-intent runtime fallback), payload-readiness retry scheduling, dedupe handling, and track dispatch

## Troubleshooting

Use this section to validate current bootstrap behavior in browser dev tools.

### Console logging options and what they activate

| Option | Type | Current effect | Notes |
|---|---|---|---|
| `tracking.logPluginHeartbeat` | boolean | Enabled by default; emits startup/lifecycle `console.info` diagnostics like plugin heartbeat, bootstrap mode decisions, and script injection handling. | Disable in production if bootstrap noise is not needed. |
| `tracking.logIdentifyEventDebug` | boolean | Emits identify diagnostics (`console.info`) for no-email resolution, lifecycle/auth trigger attempts, successful identify calls, override activation, and duplicate-skip decisions. | Event-specific toggle for identify debugging. |
| `tracking.debugIdentifyEmailOverride` | string | Optional debug-only identify override email. When valid, runtime/DOM/endpoint email discovery is skipped and identify always uses this value. | Intended for staging/testing to avoid repeated login cycles across deployments. Leave empty in production. |
| `tracking.logViewedProductEventDebug` | boolean | Emits `Viewed Product` diagnostics (`console.info`) for trigger detection, payload resolution, config/required-field skips, dedupe skips, and successful `track` / `trackViewedItem` dispatches. | Event-specific toggle for `Viewed Product` debugging. |
| `tracking.logAddedToCartEventDebug` | boolean | Emits `Added to Cart` diagnostics (`console.info`) for listener registration, intent capture, basket snapshot resolution (including totals-only detail fallback), payload resolution, config/required-field skips, dedupe skips, and successful `track` dispatches. | Event-specific toggle for `Added to Cart` debugging. |
| `tracking.enableViewedProductEvent` | boolean | Enabled by default; toggles whether the `Viewed Product` tracking flow runs at all. | When disabled and `tracking.logViewedProductEventDebug = true`, logs a per-trigger skip diagnostic. |
| `tracking.enableAddedToCartEvent` | boolean | Enabled by default; toggles whether the `Added to Cart` tracking flow runs at all. | When disabled and `tracking.logAddedToCartEventDebug = true`, logs `Added to Cart skipped (disabled by configuration).` on basket changes. |
| `tracking.logViewedHomepageEventDebug` | boolean | Emits `Viewed Homepage` diagnostics (`console.info`) for template-type detection, config skips, dedupe skips, and successful `track` dispatches. | Event-specific toggle for `Viewed Homepage` debugging. |
| `tracking.logViewedCategoryEventDebug` | boolean | Emits `Viewed Category` diagnostics (`console.info`) for template-type detection, payload resolution, config/required-field skips, dedupe skips, and successful `track` dispatches. | Event-specific toggle for `Viewed Category` debugging. |
| `tracking.logStartedCheckoutEventDebug` | boolean | Emits `Started Checkout` diagnostics (`console.info`) for checkout template detection, shared basket-line payload resolution (including no-intent runtime basket fallback), payload-missing retry scheduling/exhaustion, config/required-field skips, dedupe skips, and successful `track` dispatches. | Event-specific toggle for `Started Checkout` debugging. |
| `tracking.enableViewedHomepageEvent` | boolean | Enabled by default; toggles whether the `Viewed Homepage` tracking flow runs at all. | When disabled and `tracking.logViewedHomepageEventDebug = true`, logs `Viewed Homepage skipped (disabled by configuration).`. |
| `tracking.enableViewedCategoryEvent` | boolean | Enabled by default; toggles whether the `Viewed Category` tracking flow runs at all. | When disabled and `tracking.logViewedCategoryEventDebug = true`, logs `Viewed Category skipped (disabled by configuration).`. |
| `tracking.enableStartedCheckoutEvent` | boolean | Enabled by default; toggles whether the `Started Checkout` tracking flow runs at all. | When disabled and `tracking.logStartedCheckoutEventDebug = true`, logs `Started Checkout skipped (disabled by configuration).`. |

### Expected console output by condition

All plugin messages are prefixed with:

```text
[KlaviyoSiteEventTracking]
```

#### 1) Heartbeat enabled (default), plugin mode, valid public API key

Recommended config:

- `tracking.integrationMode = plugin`
- `tracking.publicApiKey = <your-site-id>`
- `tracking.logPluginHeartbeat = true` (default)

Expected startup heartbeat log:

```text
[KlaviyoSiteEventTracking] Plugin heartbeat. { publicApiKeyDetected: true, publicApiKey: "<your-site-id>", integrationMode: "plugin" }
```

Expected bootstrap log (first load, script not yet present):

```text
[KlaviyoSiteEventTracking] Klaviyo onsite script bootstrap injected. { source: "https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=..." }
```

Expected log (if Klaviyo script already exists on page):

```text
[KlaviyoSiteEventTracking] Klaviyo onsite script is already present. Skipping injection. { hasManagedScript: true|false, hasKlaviyoScript: true|false }
```

If `tracking.logIdentifyEventDebug = true`, expected identify diagnostics include:

```text
[KlaviyoSiteEventTracking] No identifiable customer email resolved. { trigger: "poll_1" }
```

```text
[KlaviyoSiteEventTracking] Klaviyo identify executed. { email: "[email protected]", source: "runtime_state:login_success", usingKlaviyoObject: true|false }
```

When `tracking.debugIdentifyEmailOverride` is set to a valid email and `tracking.logIdentifyEventDebug = true`, expected identify diagnostics include:

```text
[KlaviyoSiteEventTracking] Debug identify email override active. Runtime email discovery is skipped. { source: "config", email: "[email protected]" }
```

If `tracking.logViewedProductEventDebug = true`, expected Viewed Product diagnostics include:

```text
[KlaviyoSiteEventTracking] Viewed Product page detection evaluated. { trigger: "bootstrap", isProductPage: true|false, detectionSource: "runtime_app_isItemView"|"runtime_app_templateType"|"path_regex"|"none", path: "/..." }
```

```text
[KlaviyoSiteEventTracking] Viewed Product payload resolved. { trigger: "bootstrap", sourceLabel: "...", productId: "...", productName: "..." }
```

If `tracking.logViewedHomepageEventDebug = true`, expected Viewed Homepage diagnostics include:

```text
[KlaviyoSiteEventTracking] Viewed Homepage page detection evaluated. { trigger: "bootstrap", isHomepage: true|false, detectionSource: "runtime_app_templateType"|"none", templateType: "home"|"...", path: "/..." }
```

If `tracking.logViewedCategoryEventDebug = true`, expected Viewed Category diagnostics include:

```text
[KlaviyoSiteEventTracking] Viewed Category payload resolved. { trigger: "bootstrap", categoryName: "...", path: "/..." }
```

If `tracking.logAddedToCartEventDebug = true`, expected Added to Cart diagnostics include:

```text
[KlaviyoSiteEventTracking] Added to Cart listener attached. { target: "document", event: "afterBasketItemAdded" }
```

```text
[KlaviyoSiteEventTracking] Added to Cart payload resolved. { trigger: "afterBasketChanged|intent_followup", sourceLabel: "...", correlationMode: "intent_matched", addedItemProductId: "...", addedItemProductName: "...", addedItemQuantity: 1 }
```

If `tracking.logStartedCheckoutEventDebug = true`, expected Started Checkout diagnostics include:

When checkout is detected and no Added-to-Cart intent context exists, Started Checkout still resolves basket lines from runtime basket candidates and can proceed to dispatch with the standard payload/dedupe flow. In those cases, `sourceLabel` in the payload log may be runtime-derived (for example `runtime_basket.window.ceresStore.state.basket` or a chained value such as `basket_candidate_0->runtime_basket.window.App.basket`).

If checkout is detected before basket lines are fully ready, Started Checkout schedules a short retry window before giving up. During that window, debug logs include retry scheduling and final retry success/exhaustion details.

```text
[KlaviyoSiteEventTracking] Started Checkout page detection evaluated. { trigger: "bootstrap", isCheckout: true|false, detectionSource: "runtime_app_templateType"|"none", templateType: "checkout"|"...", path: "/checkout" }
```

```text
[KlaviyoSiteEventTracking] Started Checkout payload resolved. { trigger: "bootstrap", sourceLabel: "...", itemCount: 2, eventId: "<basket-or-path>_<unix>", value: 29.98 }
```

```text
[KlaviyoSiteEventTracking] Started Checkout payload missing; scheduling retry. { trigger: "route_history_replaceState", retryAttempt: 1, maxRetryAttempts: 10, retryDelayMs: 300 }
```

```text
[KlaviyoSiteEventTracking] Started Checkout retry succeeded. { trigger: "route_history_replaceState|retry_1", retryAttempts: 1 }
```

#### 2) Heartbeat enabled, GTM mode

Recommended config:

- `tracking.integrationMode = gtm`
- `tracking.logPluginHeartbeat = true`

Expected startup log:

```text
[KlaviyoSiteEventTracking] Integration mode is GTM. Klaviyo script injection is disabled and expected to be handled externally (for example via Google Tag Manager).
```

Possible detection log (if `window.klaviyo` or `window._learnq` appears within retry window):

```text
[KlaviyoSiteEventTracking] Detected externally loaded Klaviyo object in GTM mode. { hasKlaviyoObject: true|false, hasLearnqQueue: true|false, attempts: <n> }
```

Possible timeout log (if object is not detected in retry window):

```text
[KlaviyoSiteEventTracking] No Klaviyo object detected during GTM-mode retry window.
```

#### 3) Plugin mode without `publicApiKey`

Any debug setting:

- `tracking.integrationMode = plugin`
- `tracking.publicApiKey = ""`

Expected heartbeat info log (if `tracking.logPluginHeartbeat = true`):

```text
[KlaviyoSiteEventTracking] Plugin heartbeat. { publicApiKeyDetected: false, publicApiKey: null, integrationMode: "plugin" }
```

Expected warning:

```text
[KlaviyoSiteEventTracking] Missing required setting 'tracking.publicApiKey' for plugin integration mode. Add your Klaviyo public API key in plugin configuration or switch to GTM mode if Klaviyo is loaded externally.
```

#### 4) Unsupported integration mode value

Example config:

- `tracking.integrationMode = custom-value`
- `tracking.publicApiKey = <your-site-id>`

Expected warning + fallback behavior:

```text
[KlaviyoSiteEventTracking] Unsupported integration mode 'custom-value'. Falling back to plugin bootstrap behavior.
```

Followed by normal plugin-mode script injection behavior.

#### 5) Duplicate bootstrap execution

If the snippet executes more than once during page lifecycle, Added-to-Cart listeners are still guaranteed and duplicate wiring is prevented by a dedicated one-time guard. Expected logs:

```text
[KlaviyoSiteEventTracking] Added to Cart listeners already registered. Skipping duplicate registration.
```

```text
[KlaviyoSiteEventTracking] Bootstrap already initialized. Skipping duplicate initialization.
```

The listener-duplicate log appears when `tracking.logAddedToCartEventDebug = true`. The bootstrap-duplicate log appears when `tracking.logPluginHeartbeat = true`.

### Practical logging combinations

- **Troubleshooting setup issues**
  - `logPluginHeartbeat = true`
  - Use when validating mode decisions and script injection order.
- **Event-specific troubleshoot for Viewed Product**
  - `logViewedProductEventDebug = true`
- **Event-specific troubleshoot for Added to Cart**
  - `logAddedToCartEventDebug = true`
- **Event-specific troubleshoot for Identify**
  - `logIdentifyEventDebug = true`


## Notes

- Event names and payload contracts should align with the latest Klaviyo JavaScript API guidance.
- PlentyLTS integration points should use the native plugin/container architecture and storefront lifecycle hooks.
