## Why

Building a lineup for an event is tedious because the DJ picker only shows one slot at a time, the selected evening resets unexpectedly, and the moonlight context doesn't filter the DJ pool to moonlight-opted-in submissions. These friction points slow down the most common workflows judges perform when constructing a full evening's lineup.

## What Changes

- When a slot is selected, the DJ picker panel now displays **all slots for that evening** alongside the DJ pool, so judges can see the full evening context while assigning.
- After a DJ is assigned to a slot, the selection automatically advances to the **next empty slot** on that evening (or stays on the current slot if no empty slot follows), rather than closing the panel.
- After a slot is **emptied** (DJ removed), that slot remains selected so a new DJ can immediately be chosen.
- **Bug fix**: The selected evening no longer resets to "Thursday" when actions like opening the panel, assigning a DJ, or refreshing filters are performed.
- In **moonlight context**, only submissions where `moonlightInterest === true` are shown in the DJ picker.

## Capabilities

### New Capabilities
- `lineup-slot-advance`: After assigning a DJ, the active slot auto-advances to the next empty slot in the evening; after clearing a slot, that slot stays selected.
- `lineup-evening-persistence`: The selected evening is lifted to the parent (`LineupView`) so it persists across panel open/close cycles and slot changes.
- `lineup-moonlight-filter`: In moonlight app context, DJs who have not opted into moonlight are hidden from the DJ picker.

### Modified Capabilities
- `dj-selection-panel`: Panel no longer auto-closes after assign; advances slot or stays on current slot.
- `lineup-grid`: Evening selection state is lifted out of `LineupGrid` and controlled by the parent.

## Impact

- `app/src/components/LineupView.tsx` — owns evening selection state (lifted from `LineupGrid`), handles slot-advance logic after assign/remove.
- `app/src/components/LineupGrid.tsx` — receives `selectedEvening` + `onSelectEvening` as props instead of managing them internally.
- `app/src/components/DJSelectionPanel.tsx` — `handleAssign` no longer calls `onClose`; calls new `onSlotAdvance` callback; moonlight filter applied to `available` pool.
- `app/src/types.ts` — no type changes required.
