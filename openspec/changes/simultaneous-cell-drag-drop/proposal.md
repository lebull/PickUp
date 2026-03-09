## Why

Sequential slot cells in the Lineup Grid support drag-and-drop assignment from the DJ pool, but simultaneous stage cells do not — despite the `lineup-event-cell` shared interaction contract requiring both cell types to behave identically unless an explicit exception exists. This gap means DJs can only be added to simultaneous cells via the DJ Selection Panel, creating an inconsistent and slower workflow.

## What Changes

- Simultaneous stage cells accept drag-and-drop: dragging a DJ card from the unscheduled pool and dropping it onto a simultaneous cell assigns that DJ to the next available position.
- Dropping onto a full simultaneous cell (all 3 positions occupied) is a no-op; the drop cursor indicates an invalid target.
- The `onAddSimultaneous` callback — already present on `LineupGrid`'s Props but currently unused in the rendering path — is wired through to `SimultaneousCell`.

## Capabilities

### New Capabilities

_(none — this change closes a gap against the existing `lineup-event-cell` shared contract, not a new capability)_

### Modified Capabilities

- `lineup-event-cell`: Add explicit requirement that drag-and-drop onto a full simultaneous cell is a no-op with invalid-target drop cursor feedback (clarifies the existing drop scenario for simultaneous cells).
- `lineup-grid-simultaneous`: Add requirement that simultaneous cells accept DJ card drops from the unscheduled pool, assigning to the next empty position; drops onto full cells are rejected with a visual indicator.

## Impact

- `LineupGrid.tsx` — `SimultaneousCellProps` gains an `onDrop` callback; both `SimultaneousCell` call sites wire `_onAddSimultaneous` through as the drop handler.
- `SimultaneousCell` — outer `div` gains `onDragOver` and `onDrop` handlers; drop is blocked when `nextPosition` is `null`.
- No data model, routing, or API changes required.
