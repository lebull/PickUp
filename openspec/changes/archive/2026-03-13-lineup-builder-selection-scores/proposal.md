## Why

The lineup builder has several UX rough edges discovered through real usage: the right pane is blank and unhelpful when no slot is selected, switching days leaves a stale slot selection, the active event can jump to a different stage unexpectedly, the DJ picker always shows both score columns even when only one is used for ranking, and there is no way to inspect per-judge score breakdowns while making assignment decisions.

## What Changes

- The right pane SHALL display a guidance message ("Drag and drop a DJ to a slot, or click a slot to get started") when no event or slot is selected, replacing the current blank state
- Selecting a new day of the week SHALL clear the active slot and event selection, returning the view to the empty-state guidance
- The active event (stage + evening context) SHALL only change when the user explicitly clicks a different event cell or slot — no automatic event re-selection or drift
- The DJ picker SHALL display only the score column relevant to the current sort context (main score when in standard mode, moonlight score when in moonlight context), hiding the unused column
- Hovering over a score value in the DJ picker SHALL reveal a popover/tooltip showing the per-judge score breakdown and any judges' notes for that submission

## Capabilities

### New Capabilities
- `dj-score-peek`: Per-judge score breakdown popover shown when hovering over a score in the DJ picker — displays individual judge scores and notes

### Modified Capabilities
- `dj-selection-panel`: Score column display is context-sensitive (hide the unused score column); empty/no-slot-selected state shows guidance messaging
- `lineup-grid`: Day selection clears active slot/event; active event selection is stable and only changes on explicit user interaction

## Impact

- `LineupView` component: orchestrates the new no-selection state and day-change reset behavior
- `DJSelectionPanel` component: score column visibility logic, score hover popover
- `LineupGrid` component: event selection stability (no auto-drift)
- No breaking changes to data model or APIs; all changes are UI behavior only
