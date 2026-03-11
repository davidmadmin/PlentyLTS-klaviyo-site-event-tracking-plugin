# AGENTS.md

## Project goal
The goal of this plugin set is to create a plugin for PlentyLTS that enables Klaviyo on-site tracking via their JavaScript API. It should be configurable as necessary.

Based on certain frontend conditions, the plugin should send events to the Klaviyo JavaScript API so they can be attached to profiles.

## Documentation and source of truth
All relevant Plenty plugin development documentation and Klaviyo development documentation are included in the `Documentation` folder.

These are first-party documentations from the respective companies about their software products and should be treated as the first source of truth when handling anything regarding PlentyLTS and Klaviyo.

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
