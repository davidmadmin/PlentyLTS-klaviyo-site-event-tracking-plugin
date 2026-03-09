# ![Klaviyo On-site Event Tracking Plugin Logo](meta/images/Klaviyo-On-site-Event-Tracking-plugin-logo.png)

# Klaviyo Site Event Tracking Plugin (PlentyLTS)

> Quick-overview README for implementation status and target tracking scope.

## Current purpose

This plugin is intended to provide a **configurable Klaviyo on-site event tracking integration** for PlentyLTS storefronts, with support for either:

- **Plugin-managed integration** (plugin injects and controls Klaviyo JS behavior), or
- **GTM-managed integration** (Google Tag Manager owns Klaviyo JS behavior).

At the moment, this repository contains a **foundation scaffold** (plugin definition, config entry, container output, and placeholder JS entrypoint), but not a production-ready tracking implementation yet.

---

## Status legend

- 🟢 **Implemented** — Production-ready implementation exists in this repository.
- 🟡 **Partially implemented / scaffolded** — Some structure exists, but the full event behavior is not complete.
- 🔴 **Not implemented** — No functional implementation yet.

---

## Quick implementation snapshot

| Area | Status | Notes |
|---|---|---|
| Plugin package/registration scaffold | 🟢 | `plugin.json` and namespace/provider wiring exist. |
| Plugin configuration (`tracking.integrationMode`) | 🟢 | Config option exists with `plugin` and `gtm`. |
| Storefront container output hook | 🟡 | Data provider + Twig render exist, but behavior is still placeholder. |
| Klaviyo JS bootstrap/injection logic | 🟡 | Placeholder script and mode gate exist, no real Klaviyo bootstrap yet. |
| Event tracking dispatches (`_learnq` / Klaviyo JS API) | 🔴 | No functional event dispatches implemented. |
| Consent-aware tracking controls | 🔴 | Not implemented yet. |
| Error handling/observability for tracking | 🔴 | Not implemented yet. |

---

## Target event scope (Klaviyo on-site events)

The goal is to cover the commonly suggested Klaviyo on-site storefront interactions (via JS API and storefront event mapping). The table below is optimized for quick execution tracking.

| Metric / Event | Typical trigger | Status |
|---|---|---|
| **Active on Site** | Any page activity/session heartbeat | 🔴 |
| **Viewed Product** | PDP view | 🔴 |
| **Viewed Category / Collection** | Category or collection listing view | 🔴 |
| **Searched Site / Submitted Search** | Search request submitted | 🔴 |
| **Viewed Cart** | Cart page or mini-cart open | 🔴 |
| **Added to Cart** | Add-to-cart action succeeds | 🔴 |
| **Removed from Cart** | Remove-item action in cart | 🔴 |
| **Updated Cart Quantity** | Quantity update in cart | 🔴 |
| **Started Checkout** | Checkout funnel initiated | 🔴 |
| **Entered Checkout Contact Data** | Customer provides email/contact in checkout | 🔴 |
| **Added Shipping Info** | Shipping method/address confirmed | 🔴 |
| **Added Payment Info** | Payment selection/entry step | 🔴 |
| **Placed Order** | Order successfully created | 🔴 |
| **Viewed Home Page** | Homepage loaded | 🔴 |
| **Viewed CMS / Landing Page** | Marketing/content page view | 🔴 |
| **Signed Up to Newsletter** | Newsletter subscription success | 🔴 |
| **Created Account** | Registration success | 🔴 |
| **Logged In** | Customer login success | 🔴 |
| **Added to Wishlist** | Wishlist add action | 🔴 |
| **Removed from Wishlist** | Wishlist remove action | 🔴 |
| **Clicked Promotion/Banner** | Hero/banner/promo click | 🔴 |

> Note: Event naming can be aligned either to canonical Klaviyo naming conventions or to a project-specific taxonomy, as long as mapping remains consistent and documented.

---

## Integration mode intent

- **`plugin` mode**: plugin should load/configure Klaviyo JavaScript and trigger mapped events.
- **`gtm` mode**: plugin should avoid duplicate bootstrap/dispatch and defer tracking ownership to GTM.

---

## Recommended next milestones (high level)

1. Implement safe Klaviyo bootstrap in `plugin` mode.
2. Map storefront interactions to the event scope above with payload schemas.
3. Add consent gating before any tracking call.
4. Add deduplication and retry/error instrumentation.
5. Add QA matrix (by page type, auth state, and locale) to validate event coverage.

