## Context

`DJSelectionPanel` exposes `onAddSimultaneous`, `onRemoveSimultaneous`, and `onAddBlankSimultaneous` props that are called when the user clicks to assign/remove a DJ in simultaneous-stage positions. These callbacks were typed without an `eventIndex` parameter — a parameter that distinguishes multiple events on the same evening for the same stage. The `LineupView` handlers already accept `eventIndex` (defaulting to `0`), so event 0 always worked. When `activeSlot.eventIndex` is 1 or higher, assignments land on event 0 instead and are silently rejected if event 0 is already full.

## Goals / Non-Goals

**Goals:**
- Click-to-assign correctly targets the `eventIndex` stored in the active slot for simultaneous stages
- Remove and block-slot actions also respect `eventIndex` so they affect the right event
- No changes to `LineupView` internals — all existing handler signatures already support `eventIndex`

**Non-Goals:**
- Changing the drag-and-drop assignment path (it already passes `eventIndex` directly through `LineupGrid`)
- Any UI or behavioral changes beyond the missing parameter

## Decisions

**Pass `eventIndex` through the three simultaneous props**

The cleanest fix is to add `eventIndex: number` as the last parameter of `onAddSimultaneous`, `onRemoveSimultaneous`, and `onAddBlankSimultaneous` on `DJSelectionPanel`'s props interface. The SlotTray sub-component propagates these callbacks to its own internal `onAssignSimultaneous` / `onRemoveSimultaneous` props, so those must be updated in parallel.

Alternatives considered:
- Threading `eventIndex` through the `SlotTray` props as a separate field and having `SlotTray` curry it — less explicit, would hide the parameter from call sites without simplifying anything.
- Lifting event selection entirely out of `DJSelectionPanel` — correct long-term direction but far larger scope than this bug fix.

**Derive `eventIndex` from `activeSlot` in `handleAssign`**

`activeSlot.eventIndex` is already set correctly by `LineupView` when the user clicks a simultaneous slot. `handleAssign` just needs to read it and forward it.

## Risks / Trade-offs

- `onAddBlankSimultaneous` in `LineupView` already defaults `eventIndex = 0`; adding it to the prop type is a non-breaking addition in practice, but any external callers (tests) must be updated → covered by the test task.
- The tray's `onRemoveSimultaneous` callback in the SlotTray call site currently omits `eventIndex`; fixing it is required or the remove action will keep hitting the wrong event on event ≥ 1.
