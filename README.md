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
| 🔴 | **Removed from Cart** | Cart friction insight and drop-off analysis | Remove-line-item action in cart/minicart |
| 🔴 | **Started Checkout** | Funnel entry and checkout abandonment flows | First transition from cart to checkout |
| 🔴 | **Checkout Step Progression** | Diagnose checkout friction points | Movement between checkout steps (address, shipping, payment, review) |
| 🔴 | **Placed Order** | Conversion tracking and post-purchase automation | Successful order placement confirmation |
| 🔴 | **Refunded Order** | Revenue quality and customer lifecycle signals | Order status/payment reversal recognized by storefront/account event feed |
| 🔴 | **Viewed Category / Listing** | Discovery behavior and merchandising effectiveness | Category/listing page view with category context |
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

## Configuration

Plugin config is now split into dedicated tabs:

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

- **Debugging tab**
  - `tracking.enableDebugLogging`
    - Enables informational console diagnostics from this plugin
  - `tracking.logPluginHeartbeat`
    - Enabled by default; writes a bootstrap heartbeat info log that reports whether `publicApiKey` was detected and includes the key value when available
  - `tracking.logIdentifyCalls`
    - Emits identify diagnostics (`console.info`) for resolution attempts, lifecycle/auth triggers, successful identify calls, and deduped identify skips
  - `tracking.logTrackCalls`
    - Enabled by default; emits track diagnostics (`console.info`) for Viewed Product detection/payload/dispatch diagnostics and Added to Cart intent-capture, basket-snapshot, payload, skip, and dedupe diagnostics
  - `tracking.logErrorsOnly`
    - When `true`, suppresses info/debug logs and keeps warnings/errors visible

## Troubleshooting

Use this section to validate current bootstrap behavior in browser dev tools.

### Console logging options and what they activate

| Option | Type | Current effect | Notes |
|---|---|---|---|
| `tracking.enableDebugLogging` | boolean | Enables plugin `console.info` logs that confirm init path and script handling decisions. | Base switch for debug output. |
| `tracking.logPluginHeartbeat` | boolean | Enabled by default; emits a startup `console.info` heartbeat with API-key detection status and the detected key value (if present). | Independent from `enableDebugLogging`; can be disabled if too noisy. |
| `tracking.logErrorsOnly` | boolean | Suppresses plugin `console.info` logs (including heartbeat) even if other logging toggles are enabled. | `console.warn` messages still appear. |
| `tracking.logIdentifyCalls` | boolean | Emits identify diagnostics (`console.info`) for no-email resolution, lifecycle/auth trigger attempts, successful identify calls, and duplicate-skip decisions. | Suppressed when `tracking.logErrorsOnly = true`. Also accepts common truthy/falsey string values (`"true"`, `"false"`, `"yes"`, `"no"`, etc.) for safer config parsing. |
| `tracking.logTrackCalls` | boolean | Enabled by default; emits track diagnostics (`console.info`) for Viewed Product trigger diagnostics plus Added to Cart intent capture, basket snapshot resolution, payload resolution, config/required-field skips, dedupe skips, and successful `track` / `trackViewedItem` dispatches. | Suppressed when `tracking.logErrorsOnly = true`. |
| `tracking.enableViewedProductEvent` | boolean | Enabled by default; toggles whether the `Viewed Product` tracking flow runs at all. | When disabled and `tracking.logTrackCalls = true`, logs a per-trigger skip diagnostic. |
| `tracking.enableAddedToCartEvent` | boolean | Enabled by default; toggles whether the `Added to Cart` tracking flow runs at all. | When disabled and `tracking.logTrackCalls = true`, logs `Added to Cart skipped (disabled by configuration).` on basket changes. |

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
- `tracking.logErrorsOnly = false`

Expected startup heartbeat log:

```text
[KlaviyoSiteEventTracking] Plugin heartbeat. { publicApiKeyDetected: true, publicApiKey: "<your-site-id>", integrationMode: "plugin" }
```

If `tracking.enableDebugLogging = true`, expected additional log (first load, script not yet present):

```text
[KlaviyoSiteEventTracking] Klaviyo onsite script bootstrap injected. { source: "https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=..." }
```

Expected log (if Klaviyo script already exists on page):

```text
[KlaviyoSiteEventTracking] Klaviyo onsite script is already present. Skipping injection. { hasManagedScript: true|false, hasKlaviyoScript: true|false }
```

If `tracking.logIdentifyCalls = true` and `tracking.logErrorsOnly = false`, expected identify diagnostics include:

```text
[KlaviyoSiteEventTracking] No identifiable customer email resolved. { trigger: "poll_1" }
```


```text
[KlaviyoSiteEventTracking] No identifiable customer email resolved. { trigger: "account_route" }
```

```text
[KlaviyoSiteEventTracking] No identifiable customer email resolved. { trigger: "login_success_delayed" }
```

```text
[KlaviyoSiteEventTracking] Klaviyo identify executed. { email: "[email protected]", source: "runtime_state:login_success", usingKlaviyoObject: true|false }
```

```text
[KlaviyoSiteEventTracking] Identify skipped (already identified for this browser session). { email: "[email protected]", source: "runtime_state:visibility_visible" }
```

If identify execution throws at runtime, expected warning:

```text
[KlaviyoSiteEventTracking] Failed to execute Klaviyo identify call. { source: "...", message: "..." }
```

If `tracking.logTrackCalls = true` and `tracking.logErrorsOnly = false`, expected Viewed Product diagnostics include:

```text
[KlaviyoSiteEventTracking] Viewed Product tracking disabled by configuration. { trigger: "bootstrap" }
```

```text
[KlaviyoSiteEventTracking] Viewed Product page detection evaluated. { trigger: "bootstrap", isProductPage: true|false, detectionSource: "runtime_app_isItemView"|"runtime_app_templateType"|"path_regex"|"none", path: "/..." }
```

```text
[KlaviyoSiteEventTracking] Viewed Product skipped (required payload fields missing). { trigger: "bootstrap" }
```
```text
[KlaviyoSiteEventTracking] Viewed Product payload resolved. { trigger: "bootstrap", sourceLabel: "ceresStore.getters.currentItemVariation"|"ceresStore.getters.<namespace>/currentItemVariation"|"window.KlaviyoSiteEventTracking"|"window.ceresStore.state"|"window.ceresStore.getters"|"window.App"|"window.CeresApp"|"window.ceresApp"|"dom_data_attributes", productId: "...", productName: "..." }
```


```text
[KlaviyoSiteEventTracking] Klaviyo track executed. { metric: "Viewed Product", trigger: "route_history_pushState|<dedup-key>", payload: { ProductName: "...", ProductID: "...", ... } }
```

```text
[KlaviyoSiteEventTracking] Viewed Product skipped (deduped). { trigger: "variation_change", dedupKey: "<product|variation|path>" }
```

```text
[KlaviyoSiteEventTracking] Viewed Product dedupe key not updated because track dispatch failed. { trigger: "variation_click", dedupKey: "<product|variation|path>" }
```

```text
[KlaviyoSiteEventTracking] Added to Cart trigger captured. { variationId: "...", productId: "...", requestedQuantity: 1, triggerSource: "afterBasketItemAdded" }
```

```text
[KlaviyoSiteEventTracking] Added to Cart basket snapshot resolved. { trigger: "afterBasketChanged", sourceLabel: "afterBasketChanged.detail", itemCount: 2 }
```

```text
[KlaviyoSiteEventTracking] Added to Cart payload resolved. { trigger: "afterBasketChanged", sourceLabel: "afterBasketChanged.detail", addedItemProductId: "...", addedItemProductName: "...", addedItemQuantity: 1 }
```

```text
[KlaviyoSiteEventTracking] Added to Cart skipped (disabled by configuration). { trigger: "afterBasketChanged" }
```

```text
[KlaviyoSiteEventTracking] Added to Cart skipped (required payload fields missing). { trigger: "afterBasketChanged", reason: "basket_snapshot_missing" }
```

```text
[KlaviyoSiteEventTracking] Added to Cart skipped (deduped). { trigger: "afterBasketChanged", dedupKey: "<product|qty|basket|bucket>" }
```

Added to Cart dispatch uses metric name `"Added to Cart"` and keeps filterable top-level properties (`$value`, `AddedItem*`, `ItemNames`, `CheckoutURL`, `Items`) as top-level keys for Klaviyo segment usability.

Viewed Product tracking now first checks Plenty runtime item-view flags (`window.App.isItemView === true` or `window.App.templateType === "item"`, case-insensitive) and only then falls back to PDP URL heuristics.

Fallback URL detection still supports common PDP routes (`/p/`, `/item/`) and SEO item suffixes like `..._1514_10645` with or without a trailing slash.

Once PDP detection passes, tracking dispatch proceeds when either:

- getter-first runtime payload resolution finds valid product data (`ProductID`, `ProductName`, `URL`) from `window.ceresStore.getters.currentItemVariation` first, then namespaced getter keys ending in `/currentItemVariation`, then existing fallback runtime objects, or
- optional DOM fallback attributes (`data-kse-product-id`, `data-kse-variation-id`, `data-kse-product-name`, etc.) are present.

When getter candidates are present and `tracking.logTrackCalls = true`, the payload-resolution diagnostic includes `sourceLabel` to show exactly which runtime source won.

For category payload quality on `Viewed Product`, category extraction now follows this order:

1. Use runtime category labels (for example `name`, `details[0].name`, `path`, `url`, `label`, `value`) when available.
2. If runtime categories only resolve to ID fallbacks (for example `category:534`) or no categories are present, use breadcrumb labels from the PDP DOM (`.breadcrumb a`, `.breadcrumbs a`, `[data-testing='breadcrumb'] a`, `nav[aria-label*='breadcrumb' i] a`) while filtering obvious home entries.
3. If no breadcrumb labels can be resolved, retain ID fallback behavior.

`Viewed Product` includes normalized category hierarchy fields:

- `TopCategory`
- `CategoryPath` (joined as `Level1 > Level2 > ...`)

Variant transitions are handled through route/history hooks and delegated variant-control interactions (`change`/`click`); duplicate transitions are suppressed with a browser-session dedupe key.

#### 2) Debug enabled, GTM mode

Recommended config:

- `tracking.integrationMode = gtm`
- `tracking.enableDebugLogging = true`
- `tracking.logErrorsOnly = false`

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

Expected heartbeat info log (if `tracking.logPluginHeartbeat = true` and `tracking.logErrorsOnly = false`):

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

If the snippet executes more than once during page lifecycle, expected debug log:

```text
[KlaviyoSiteEventTracking] Bootstrap already initialized. Skipping duplicate initialization.
```

This appears only when debug logging is enabled and `logErrorsOnly` is disabled.

### Practical logging combinations

- **Troubleshooting setup issues**
  - `enableDebugLogging = true`, `logErrorsOnly = false`
  - Use when validating mode decisions and script injection order.
- **Production with minimal noise**
  - `enableDebugLogging = false`, `logPluginHeartbeat = false`
  - Keeps console free of informational diagnostics from plugin internals.
- **Error-focused diagnostics**
  - `enableDebugLogging = true`, `logErrorsOnly = true`
  - Shows warnings, hides info logs.

## Notes

- Event names and payload contracts should align with the latest Klaviyo JavaScript API guidance.
- PlentyLTS integration points should use the native plugin/container architecture and storefront lifecycle hooks.
