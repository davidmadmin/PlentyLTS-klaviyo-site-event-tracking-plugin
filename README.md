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
| 🔴 | **Active on Site** | Baseline site engagement and profile activity | Any meaningful page interaction/session heartbeat |
| 🔴 | **Viewed Product** | Product interest and browse intent | PDP view with product identifiers and metadata |
| 🔴 | **Added to Cart** | Purchase intent signal for abandoned-cart journeys | Add-to-cart action from PDP/listing/quick-buy |
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
- Without custom overrides, the tracking placeholder snippet is injected through that Ceres script loader container.

## Configuration

Plugin config is now split into dedicated tabs:

- **Setup tab**
  - `tracking.integrationMode`
    - `gtm`: Klaviyo JS handled externally (Google Tag Manager)
    - `plugin`: Klaviyo JS handled by this plugin
  - `tracking.publicApiKey`
    - Klaviyo site ID used when integration mode is `plugin`

- **Debugging tab**
  - `tracking.enableDebugLogging`
    - Enables informational console diagnostics from this plugin
  - `tracking.logPluginHeartbeat`
    - Enabled by default; writes a bootstrap heartbeat info log that reports whether `publicApiKey` was detected and includes the key value when available
  - `tracking.logIdentifyCalls`
    - Emits identify diagnostics (`console.info`) for resolution attempts, successful identify calls, and deduped identify skips
  - `tracking.logTrackCalls`
    - Reserved for future track payload logging; currently no track events are emitted yet
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
| `tracking.logIdentifyCalls` | boolean | Emits identify diagnostics (`console.info`) for no-email resolution, successful identify calls, and duplicate-skip decisions. | Suppressed when `tracking.logErrorsOnly = true`. Also accepts common truthy/falsey string values (`"true"`, `"false"`, `"yes"`, `"no"`, etc.) for safer config parsing. |
| `tracking.logTrackCalls` | boolean | No runtime effect yet in current scaffold. | Will be used once event `track` dispatch is implemented. |

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
[KlaviyoSiteEventTracking] Klaviyo identify executed. { email: "[email protected]", source: "identity_endpoint:poll_2", usingKlaviyoObject: true|false }
```

```text
[KlaviyoSiteEventTracking] Identify skipped (already identified for this browser session). { email: "[email protected]", source: "runtime_state:visibility_visible" }
```

If identify execution throws at runtime, expected warning:

```text
[KlaviyoSiteEventTracking] Failed to execute Klaviyo identify call. { source: "...", message: "..." }
```

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
