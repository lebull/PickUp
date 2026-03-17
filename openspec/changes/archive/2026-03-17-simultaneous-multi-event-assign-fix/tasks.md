## 1. Fix DJSelectionPanel prop signatures

- [x] 1.1 Add `eventIndex: number` to the `onAddSimultaneous` prop type in `DJSelectionPanel`'s `Props` interface
- [x] 1.2 Add `eventIndex: number` to the `onRemoveSimultaneous` prop type in `DJSelectionPanel`'s `Props` interface
- [x] 1.3 Add `eventIndex: number` to the `onAddBlankSimultaneous` prop type in `DJSelectionPanel`'s `Props` interface

## 2. Fix SlotTray internal prop signatures

- [x] 2.1 Add `eventIndex: number` to `SlotTrayProps.onAssignSimultaneous`
- [x] 2.2 Add `eventIndex: number` to `SlotTrayProps.onRemoveSimultaneous`
- [x] 2.3 Forward `activeSlot.eventIndex ?? 0` from the SlotTray call site callbacks into `onAddSimultaneous` and `onRemoveSimultaneous`

## 3. Fix handleAssign and SlotTray callbacks

- [x] 3.1 In `handleAssign`, pass `activeSlot.eventIndex ?? 0` when calling `onAddSimultaneous`
- [x] 3.2 Update the `onRemoveSimultaneous` call in `SlotTray`'s simultaneous tray rows to pass `eventIndex`
- [x] 3.3 Update the `onAddBlankSimultaneous` call site (Block Slot for simultaneous) to pass `eventIndex`

## 4. Tests

- [x] 4.1 Add a test: clicking a DJ card when the active slot is a simultaneous position with `eventIndex: 1` calls `onAddSimultaneous` with `eventIndex: 1` (not 0)
- [x] 4.2 Verify all 68 existing tests still pass
