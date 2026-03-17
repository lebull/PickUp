## Why

When a simultaneous stage has multiple events on the same evening, clicking a DJ in the picker panel to assign them to the 2nd (or later) event does nothing. The `eventIndex` is never forwarded through the `DJSelectionPanel` simultaneous assignment prop chain, so every click-to-assign silently targets event 0 — and if event 0 is already full, the cap check blocks the assignment entirely.

## What Changes

- Add `eventIndex` parameter to the `onAddSimultaneous`, `onRemoveSimultaneous`, and `onAddBlankSimultaneous` props on `DJSelectionPanel`
- Forward `activeSlot.eventIndex` in `handleAssign` when calling `onAddSimultaneous`
- Forward `eventIndex` through the `SlotTray` `onAssignSimultaneous`, `onRemoveSimultaneous` prop callbacks
- Fix `onAddBlankSimultaneous` similarly (same missing-eventIndex pattern)

## Capabilities

### New Capabilities
<!-- none — this is a bug fix only -->

### Modified Capabilities
- `dj-selection-panel`: Click-to-assign for simultaneous stages now correctly uses the active slot's `eventIndex`

## Impact

- `app/src/components/DJSelectionPanel.tsx` — prop types and `handleAssign` / SlotTray callback wiring
- `app/src/components/LineupView.tsx` — no changes needed (already accepts `eventIndex` in all handlers with `= 0` default)
