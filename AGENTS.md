# AGENTS.md

## Project goal
The goal of this plugin set is to create a plugin for PlentyLTS that enables Klaviyo on-site tracking via their JavaScript API. It should be configurable as necessary.

Based on certain frontend conditions, the plugin should send events to the Klaviyo JavaScript API so they can be attached to profiles.

## Documentation and source of truth
All relevant Plenty plugin development documentation and Klaviyo development documentation are included in the `Documentation` folder.

These are first-party documentations from the respective companies about their software products and should be treated as the first source of truth when handling anything regarding PlentyLTS and Klaviyo.

## PlentyLTS/Ceres + IO baseline context
This project targets two live shops that run on PlentyLTS, also known as **Ceres**.

Both of the following Plenty plugins are foundational and required for the storefront runtime:
- Ceres (PlentyLTS): https://github.com/plentymarkets/plugin-ceres
- IO (routing/plugin infrastructure): https://github.com/plentymarkets/plugin-io

Current baseline version for both in our environment: **5.0.78**.

The Klaviyo tracking plugin in this repository is built to run in parallel with both Ceres and IO; both are required for normal shop operation.

When deeper technical behavior or integration details are needed, consult those upstream repositories as primary implementation references for storefront/plugin behavior.

## README tracking-status table maintenance
Whenever any change is made in this repository, always review the event status table in `README.md` under `Scope: Klaviyo on-site metrics/events`.

If implementation status changed for one or more events, update the table in the same change so README reflects the current repository state.

Ordering rule for that table is mandatory:
1. List all 🟢 Implemented events first.
2. Then list all 🟡 In progress / scaffolded events.
3. Then list all 🔴 Not implemented events.

Within each status group, keep a stable, readable order (e.g., current order unless a better logical grouping is needed). If an event changes status, move it to the matching section automatically.

## README troubleshooting/debug logging sync maintenance
Whenever any change is made to runtime console logging/debugging behavior (especially in `resources/js/klaviyo-tracking-placeholder.js`), you must update `README.md` in the same change to keep the troubleshooting/debug logging documentation accurate.

This includes (but is not limited to):
- Added/removed/renamed log messages.
- Changed log levels (`info`, `warn`, `error`, etc.).
- Changed conditions under which a log appears.
- Added/removed/renamed debug-related config keys.
- Any behavioral changes that alter expected console output examples.

Treat README troubleshooting/debug logging docs as a required source of truth that must stay in lockstep with actual code behavior.

## Known storefront `window.App.templateType` mappings
For this project and environment, page-type checks should primarily use `window.App.templateType`. Current verified values:
- `home` (homepage)
- `checkout` (checkout)
- `item` (product detail page; typically also `window.App.isItemView === true`)
- `category` (category/listing)
- `privacy-policy`, `cancellation-rights`, `legal-disclosure` (legal pages)

For legal-page tracking, use an allow-list of templateType values rather than a single generic legal type.
