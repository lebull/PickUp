## Why

When building a lineup, organizers sometimes need to see all DJs—not just those available on the current day—so they can make informed trade-off decisions. The current behavior hard-filters unavailable DJs out of the selection panel entirely, making it impossible to review or intentionally book a DJ outside their stated availability. At the same time, when an unavailable DJ is selected or already assigned, there is no inline warning in the picker itself (only on the grid cell), leaving the organizer without the context they need.

## What Changes

- The DJ selection panel no longer hard-filters by `daysAvailable`. Instead, all non-discarded, non-assigned DJs are visible by default.
- A toggleable **"Available only"** filter control is added to the DJ selection panel so users can still narrow the list to day-available DJs when desired.
- Any DJ row in the selection panel whose `daysAvailable` does not include the effective evening is rendered in an **alert/unavailable state** (visual indicator + tooltip), regardless of whether the "Available only" filter is on or off.
- This alert state applies in both the slot-selected and browsing (no-slot) states of the panel.

## Capabilities

### New Capabilities
- `dj-availability-alert`: A DJ row in the selection panel displays an unavailability alert when the DJ is not available on the current evening, regardless of filter state.
- `dj-availability-filter`: A toggleable "Available only" filter in the DJ selection panel that, when active, hides DJs not available on the current evening.

### Modified Capabilities
- `dj-selection-panel`: The existing hard-filter-by-evening behavior is replaced by the opt-in availability filter. The browsing-state filtering rule (only available DJs shown when an evening is active) is updated to match the new behavior.

## Impact

- `app/src/components/DJSelectionPanel.tsx` — replace hard `daysAvailable` filter with opt-in toggle + alert rendering per row
- `app/src/components/DJPool.tsx` — if it independently filters by availability, update similarly
- `openspec/specs/dj-selection-panel/spec.md` — requirement update (browsing-state filtering)
- CSS — new modifier classes for unavailability alert state on DJ rows in the panel
