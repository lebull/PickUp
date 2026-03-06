## Why

Judges have evaluated DJ submissions — now organizers need to turn those evaluations into an actual convention schedule. Currently there is no tooling to place DJs into time slots, and all lineup work lives in people's heads or ad-hoc spreadsheets. This feature closes the loop from scoring to scheduling.

## What Changes

- Organizers can configure stages (name, days active, time slots, slot duration)
- A schedule grid shows stages as columns and time slots as rows, per evening
- DJs can be dragged (or assigned) from a sidebar pool into grid slots
- Lineup work is auto-saved to IndexedDB, keyed by the imported CSV filename
- On re-import of the same CSV, the saved lineup is automatically restored
- Moonlight is treated as a standard configurable stage, not a special case

## Capabilities

### New Capabilities

- `lineup-grid`: Schedule grid UI — stages as columns, time slots as rows, per evening; DJs placed into slots
- `stage-config`: User-defined stages with name, active days, start/end times, and slot duration
- `lineup-persistence`: Save and restore lineup state to IndexedDB, scoped to the imported CSV filename

### Modified Capabilities

- `submission-list`: Needs to expose a "pool" view alongside the schedule grid so organizers can drag/select unscheduled DJs

## Impact

- New top-level view/mode in `App.tsx` (toggle between Submission Browser and Lineup Builder)
- New components: `LineupGrid`, `StageConfigPanel`, `DJPool`
- `IndexedDB` via the browser-native `indexedDB` API (no new dependencies needed) or a thin wrapper like `idb`
- No changes to CSV parsing, score calculation, or submission data model
- No backend; all state is local to the browser session and persisted client-side
