## Why

Two usability gaps in the lineup builder interrupt the DJ assignment workflow: the DJ table is hidden until a slot is clicked, making it impossible to browse or sort the DJ pool proactively; and there is no way to see a single stage's full schedule across all event days without switching back and forth. These are both quick wins that make the builder feel more powerful with minimal scaffolding.

## What Changes

- When no slot or event is selected in the lineup builder, the DJ selection panel SHALL display the full DJ table (both standard and moonlight score columns visible) instead of a guidance-only message, so organizers can browse and sort the pool at any time.
- The lineup builder SHALL provide a "Stage View" toggle that pivots the grid to show one stage at a time with all active days as columns, so organizers can plan a stage's full week at a glance without switching days manually.

## Capabilities

### New Capabilities
- `lineup-stage-view`: A stage-oriented view mode for the lineup grid where the user selects a stage and sees all active event days as columns, providing a day-spanning view of that stage's schedule.

### Modified Capabilities
- `dj-selection-panel`: The no-slot-selected state currently shows guidance text only. It will be extended to also render the full DJ table with both score columns (standard and moonlight) visible simultaneously, allowing sorting and browsing without selecting a slot first.

## Impact

- `LineupView.tsx` — adds view-mode state (day view / stage view) and renders the appropriate grid variant
- `LineupGrid.tsx` — the stage-view grid variant (days as columns, time slots as rows for a given stage)
- `DJSelectionPanel.tsx` — renders DJ table in the no-slot-selected state; shows both score columns when no context is active
- `dj-selection-panel` spec — updated requirements for no-slot behavior
- New `lineup-stage-view` spec — describes the stage-view grid requirements
