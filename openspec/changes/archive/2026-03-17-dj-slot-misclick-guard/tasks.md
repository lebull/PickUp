## 1. Guard click-to-assign in DJSelectionPanel

- [x] 1.1 In `handleAssign`, add an early return when `currentAssignment` is a real DJ assignment (`!isBlankAssignment(currentAssignment)`)

## 2. Tests

- [x] 2.1 Add a unit/integration test asserting that clicking a DJ card when `currentAssignment` is a real DJ does NOT invoke `onAssign`
- [x] 2.2 Add a test asserting that clicking a DJ card when the slot is empty DOES invoke `onAssign`
- [x] 2.3 Add a test asserting that clicking a DJ card when `currentAssignment` is a blank/blocked slot DOES invoke `onAssign` (blank guard passes through)
