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
| 🟢 | **Identified Profile (Identify)** | Connect anonymous behavior to a known person | Login/registration/newsletter-or-checkout email capture updates profile identifiers |
| 🟢 | **Logged In** | Lifecycle stage and re-engagement qualifier | Successful account login |
| 🟢 | **Created Account** | New-customer lifecycle start | Successful account registration |
| 🟢 | **Signed Up for Newsletter** | Lead acquisition and welcome-flow trigger | Newsletter subscription success (with checkout email-capture fallback) |
| 🟢 | **Viewed Product** | Product interest and browse intent | PDP view with product identifiers and metadata |
| 🟢 | **Added to Cart** | Purchase intent signal for abandoned-cart journeys | Add-to-cart action from PDP/listing/quick-buy |
| 🟢 | **Started Checkout** | Funnel entry and checkout abandonment flows | First transition from cart to checkout |
| 🟢 | **Placed Order** | Conversion tracking and post-purchase automation | Successful order placement confirmation |
| 🔴 | **Active on Site** | Baseline site engagement and profile activity | Any meaningful page interaction/session heartbeat |
| 🔴 | **Removed from Cart** | Cart friction insight and drop-off analysis | Remove-line-item action in cart/minicart |
| 🔴 | **Checkout Step Progression** | Diagnose checkout friction points | Movement between checkout steps (address, shipping, payment, review) |
| 🔴 | **Refunded Order** | Revenue quality and customer lifecycle signals | Order status/payment reversal recognized by storefront/account event feed |
| 🔴 | **Viewed Category / Listing** | Discovery behavior and merchandising effectiveness | Category/listing page view with category context |
| 🔴 | **Submitted Search** | Demand and intent intelligence | On-site search submit with query + result count |
| 🔴 | **Viewed Content Page** | Non-product engagement context | CMS/content page view (guides, service pages, etc.) |
| 🔴 | **Clicked Promotion / Banner** | Campaign and merchandising interaction | Click on promo blocks, hero banners, teaser components |
| 🔴 | **Added to Wishlist** | High-intent product affinity signal | Wishlist add action |
| 🔴 | **Removed from Wishlist** | Intent change / product preference shifts | Wishlist remove action |
| 🔴 | **Viewed Cart** | Mid-funnel behavior context | Cart page or minicart expanded with line items present |
| 🔴 | **Applied Coupon** | Promotion sensitivity and conversion quality | Coupon code accepted in cart/checkout |
| 🔴 | **Failed Coupon Attempt** | Promotion friction and UX insight | Coupon code rejected/invalid |

## Current implementation state (repository)

At this time, the repository provides a **foundation scaffold**, not a finished tracking implementation:

- 🟡 Plugin skeleton and metadata (`plugin.json`)
- 🟡 Configuration for integration mode (`config.json`)
- 🟡 Container/template/script entrypoint with Klaviyo bootstrap wiring
- 🟡 Production Klaviyo JavaScript bootstrap and reusable identify/track API wrappers implemented
- 🟢 Frontend identity hooks implemented for login, registration, and newsletter/checkout email-capture flows (with source context + API namespace guards)
- 🟡 Broader storefront event mapping/business logic remains partially pending (non-core events still open)

## Planned rollout approach

1. **Bootstrap + identity layer**
   - Load and validate Klaviyo JS in plugin mode
   - Implement profile identify flow and consent-aware guards
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

Current config key:

- `tracking.integrationMode`
  - `gtm`: Klaviyo JS handled externally (Google Tag Manager)
  - `plugin`: Klaviyo JS handled by this plugin

## 403 troubleshooting

If profile identify calls appear to work but event tracking fails (for example `403` responses on Klaviyo `/client/events`), use the plugin debug diagnostics:

1. Enable `tracking.enableDebugLogging`.
2. Optionally keep `tracking.logErrorsOnly` enabled to focus only on failures.
3. Reproduce one identify flow and one event flow in the storefront.
4. Inspect browser console output for structured diagnostics from `KlaviyoSiteEventTracking` that include:
   - HTTP status
   - endpoint path (`/client/events` or `/client/profiles`)
   - response payload excerpt (when readable)
   - request `company_id`
5. If you see profiles succeeding but events failing, follow the targeted hint:
   - **"Check public key permissions for event tracking in Klaviyo key settings."**

This usually indicates that the public key can resolve profiles but does not have the required permission scope for event ingestion.

## Notes

- Event names and payload contracts should align with the latest Klaviyo JavaScript API guidance.
- PlentyLTS integration points should use the native plugin/container architecture and storefront lifecycle hooks.
