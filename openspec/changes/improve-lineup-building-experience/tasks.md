## 1. Lift Evening Selection State to LineupView

- [x] 1.1 Add `selectedEvening` and `onSelectEvening` props to `LineupGrid`'s `Props` interface
- [x] 1.2 Remove `selectedEvening` / `setSelectedEvening` local state from `LineupGrid`; use the incoming props instead
- [x] 1.3 Add `selectedEvening` state to `LineupView`, initialised to the first active evening derived from `project.stages`
- [x] 1.4 Pass `selectedEvening` and `setSelectedEvening` (as `onSelectEvening`) to both `LineupGrid` render sites in `LineupView`

## 2. Keep Active Slot Selected After Remove

- [x] 2.1 In `DJSelectionPanel`, remove the `onClose()` call from the Remove button's `onClick` handler
- [x] 2.2 In `LineupView.handleRemove`, ensure `activeSlot` is not cleared after a removal (no `setActiveSlot(null)` called)

## 3. Auto-Advance Slot After Assignment

- [x] 3.1 Add helper `findNextEmptySlot(stages, assignments, evening, currentSlot)` in `lineupUtils.ts` (or inline in `LineupView`) that returns the next empty `ActiveSlot | null` scanning sequential slots in stage/slot order
- [x] 3.2 In `DJSelectionPanel.handleAssign`, remove the `onClose()` call (panel no longer auto-closes on assign)
- [x] 3.3 In `LineupView.handleAssign`, after updating assignments, call `findNextEmptySlot` and call `setActiveSlot` with the result if a next empty slot exists; otherwise leave `activeSlot` unchanged

## 4. Moonlight Filter in DJ Picker

- [x] 4.1 In `DJSelectionPanel`, inside the `available` `useMemo`, add a filter: `if (appContext === 'moonlight' && !s.moonlightInterest) return false`

## 5. Verification

- [x] 5.1 Manually test: select Friday, open a slot → assign DJ → panel stays open, active slot advances to next empty Friday slot
- [x] 5.2 Manually test: remove a DJ from a slot → panel stays open on same slot
- [x] 5.3 Manually test: switch evening → persists across panel open/close; set a focus filter → assign DJ → focus filter stays active; switch evening → focus filter resets
- [x] 5.4 Manually test: switch to moonlight context → non-moonlight DJs hidden from picker; switch to standard → all appear
- [x] 5.5 Run existing tests and fix any regressions caused by the `LineupGrid` prop interface change
