## 1. Wire `onAddSimultaneous` into `SimultaneousCell`

- [x] 1.1 In `LineupGrid.tsx`, add an `onDrop: (submissionNumber: string) => void` prop to `SimultaneousCellProps`
- [x] 1.2 In `SimultaneousCell`, add `onDragOver` to the outer `div`: call `e.preventDefault()` and set `e.dataTransfer.dropEffect = nextPosition === null ? 'none' : 'move'`
- [x] 1.3 In `SimultaneousCell`, add `onDrop` to the outer `div`: call `e.preventDefault()`; if `nextPosition === null` return early; read `e.dataTransfer.getData('application/dj-submission-number')` and call `onDrop(submissionNumber)` if non-empty
- [x] 1.4 In `LineupGrid.tsx`, rename `_onAddSimultaneous` to `onAddSimultaneous` at the destructure site (removes the unused-variable suppression prefix)
- [x] 1.5 Update both `SimultaneousCell` call sites in `LineupGrid.tsx` to pass the `onDrop` prop, wiring it to `(subNum) => onAddSimultaneous(stage.id, evening, nextSimultaneousPosition(stage.id)!, subNum)`

## 2. Verification

- [ ] 2.1 Verify in the browser: drag a DJ card from the pool and drop it onto an empty simultaneous cell — the DJ is assigned and disappears from the pool
- [ ] 2.2 Verify: drag a DJ card over a full simultaneous cell (3 DJs assigned) — the cursor shows "no drop"; releasing does not change the cell
- [ ] 2.3 Verify: drag and drop still works correctly for sequential slot cells (no regression)
- [ ] 2.4 Verify: clicking "Add DJ" button inside a simultaneous cell still works and does not conflict with the new drop handler
