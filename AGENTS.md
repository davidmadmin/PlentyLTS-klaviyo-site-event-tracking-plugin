# AGENTS.md

## Project goal
The goal of this plugin set is to create a plugin for PlentyLTS that enables Klaviyo on-site tracking via their JavaScript API. It should be configurable as necessary.

Based on certain frontend conditions, the plugin should send events to the Klaviyo JavaScript API so they can be attached to profiles.

## Documentation and source of truth
All relevant Plenty plugin development documentation and Klaviyo development documentation are included in the `Documentation` folder.

These are first-party documentations from the respective companies about their software products and should be treated as the first source of truth when handling anything regarding PlentyLTS and Klaviyo.

## README status-table maintenance (mandatory)
Whenever any change is made in this repository, the agent/implementer must review the tracking-status table in `README.md` under **"Scope: Klaviyo on-site metrics/events"**.

### Update rule
- If a change affects event tracking completeness, integration readiness, or implementation state, the table **must** be updated in the same change set.
- Status values must use this legend only:
  - `🟢` Implemented
  - `🟡` In progress/scaffolded
  - `🔴` Not implemented

### Sorting rule (always enforce)
- The table must always be sorted by status priority:
  1. `🟢` first
  2. `🟡` second
  3. `🔴` last
- If an event’s status changes (for example from `🔴` to `🟡` or `🟢`), move that row into the correct section immediately.

### Consistency rule
- Keep event names stable unless there is a strong product reason to rename.
- Ensure the one-line status indicator near the top of `README.md` remains present and aligned with the legend.
- Do not leave README statuses stale relative to the implemented code state.
