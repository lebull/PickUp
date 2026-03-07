## 1. Data Model

- [x] 1.1 Add `stageType: "sequential" | "simultaneous"` field to the `Stage` interface in `app/src/types.ts`
- [x] 1.2 Make `slotIndex` optional on `SlotAssignment` and add optional `positionIndex: 1 | 2 | 3` field to `SlotAssignment` in `app/src/types.ts`

## 2. Lineup Utilities

- [x] 2.1 Add early-return guard in `getSlotLabels` (`app/src/lineupUtils.ts`) to return `[]` when `stage.stageType === "simultaneous"`
- [x] 2.2 Verify `getEveningTimeAxis` correctly handles simultaneous stages contributing no slot labels (no change expected, add a comment)

## 3. Project Store & Persistence

- [x] 3.1 Update the project store / IndexedDB read path in `app/src/projectStore.ts` to default `stageType` to `"sequential"` when loading a stage with no `stageType` field (backward compatibility)
- [x] 3.2 Add a store action `addSimultaneousAssignment(stageId, evening, positionIndex, djName)` that enforces the max-3 cap and adds a `SlotAssignment` with `positionIndex`
- [x] 3.3 Add a store action `removeSimultaneousAssignment(stageId, evening, positionIndex)` that deletes the matching `SlotAssignment`

## 4. Stage Config Panel

- [x] 4.1 Add a stage-type selector control (radio or select) to `StageConfigPanel.tsx` showing "Sequential" and "Simultaneous" options
- [x] 4.2 Wire the selector to read/write `stage.stageType` (default `"sequential"`)
- [x] 4.3 Conditionally hide slot-duration and per-day start/end time fields when `stageType === "simultaneous"`
- [x] 4.4 Display a brief note ("Up to 3 DJs play simultaneously") when simultaneous is selected

## 5. Lineup Grid Rendering

- [x] 5.1 In `LineupGrid.tsx`, detect when a stage column is simultaneous (`stage.stageType === "simultaneous"`) and branch to a single-cell rendering path
- [x] 5.2 Implement the simultaneous stage cell component: renders assigned DJ name badges (one per `positionIndex`) stacked vertically
- [x] 5.3 Show "Add DJ" button in the simultaneous cell when fewer than 3 DJs are assigned; hide it when cap is reached
- [x] 5.4 Implement remove-DJ control (×/dismiss) on each DJ badge within the simultaneous cell, calling `removeSimultaneousAssignment`
- [x] 5.5 Connect "Add DJ" button in simultaneous cell to the existing DJ picker (SlotPicker or equivalent), calling `addSimultaneousAssignment` on selection

## 6. DJ Pool Exclusion

- [x] 6.1 Verify the pool exclusion query in `DJPool.tsx` (or wherever `assignments.some(...)` is evaluated) includes simultaneous assignments — no code change expected, add a comment confirming coverage

## 7. Validation & Edge Cases

- [x] 7.1 Add a guard in the `addSimultaneousAssignment` store action to reject (no-op) if 3 assignments already exist for that stage + evening combination
- [x] 7.2 Confirm `getEveningTimeAxis` still returns a non-empty axis when the only active stages on an evening are simultaneous (time axis may be empty — handle the empty-axis edge case in `LineupGrid` to still render simultaneous columns)

## 8. Testing & Verification

- [ ] 8.1 Manually verify: create a new simultaneous stage, assign up to 3 DJs, confirm pool updates correctly
- [ ] 8.2 Manually verify: attempt to assign a 4th DJ — confirm it is rejected
- [ ] 8.3 Manually verify: save project, reload, confirm simultaneous assignments are restored
- [ ] 8.4 Manually verify: open a project with legacy stage data (no `stageType`) — confirm it renders as sequential without errors
- [ ] 8.5 Manually verify: mix of sequential and simultaneous stages on the same evening renders correctly
