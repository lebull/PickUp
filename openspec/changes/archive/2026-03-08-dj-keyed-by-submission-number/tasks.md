## 1. Data Model

- [x] 1.1 In `app/src/types.ts`, replace `djName: string` with `submissionNumber: string` on `SlotAssignment`

## 2. Load & Parse

- [x] 2.1 In `app/src/loadSubmissions.ts`, remove the `djName` deduplication workaround (the `Map`-based dedup added as a workaround)

## 3. Assignment Write Paths

- [x] 3.1 In `app/src/components/LineupView.tsx`, update `handleAssign` to accept and pass `submissionNumber` instead of `djName`
- [x] 3.2 In `app/src/components/LineupView.tsx`, update `handleAddSimultaneous` to accept and pass `submissionNumber` instead of `djName`
- [x] 3.3 In `app/src/components/LineupGrid.tsx`, update `onAssign` and `onAddSimultaneous` prop signatures to use `submissionNumber`
- [x] 3.4 In `app/src/components/LineupGrid.tsx`, update the drag-drop `onDrop` handler to read `application/dj-submission-number` instead of `application/dj-name`

## 4. Assignment Read / Display Paths

- [x] 4.1 In `app/src/components/LineupGrid.tsx`, update filled slot cell display: look up `submissions.find(s => s.submissionNumber === a.submissionNumber)?.djName` for display; fall back to `a.submissionNumber` if not found
- [x] 4.2 In `app/src/components/LineupGrid.tsx`, update simultaneous stage DJ name display with the same lookup
- [x] 4.3 In `app/src/components/SubmissionsView.tsx`, simplify `lineupSubmissionNumbers` derivation to `new Set(project.assignments.map(a => a.submissionNumber))` (remove the indirect `djName` lookup)

## 5. DJ Selection Panel

- [x] 5.1 In `app/src/components/DJSelectionPanel.tsx`, rename `assignedDjNames` to `assignedNumbers` and key it on `submissionNumber`
- [x] 5.2 In `app/src/components/DJSelectionPanel.tsx`, update `available` filter to exclude by `s.submissionNumber` instead of `s.djName`
- [x] 5.3 In `app/src/components/DJSelectionPanel.tsx`, update `handleAssign` to call `onAssign`/`onAddSimultaneous` with `s.submissionNumber` instead of `s.djName`
- [x] 5.4 In `app/src/components/DJSelectionPanel.tsx`, update `renderCard`: `key` prop and drag `setData` to use `s.submissionNumber` and `application/dj-submission-number`
- [x] 5.5 In `app/src/components/DJSelectionPanel.tsx`, update `onAssign`/`onAddSimultaneous`/`onRemove` prop signatures to accept `submissionNumber` instead of `djName`

## 6. Migration

- [x] 6.1 In `app/src/App.tsx`, after loading project and parsing CSV, run a migration pass: for each assignment with no `submissionNumber` but with a legacy `djName`, resolve to `submissionNumber` via the submissions array; drop unresolvable assignments with a `console.warn`

## 7. Verification

- [x] 7.1 Run `npx tsc --noEmit` in `app/` — confirm zero errors
- [x] 7.2 Import the FWA 2026 CSV and confirm both `rena` submissions appear as separate entries in the DJ selection panel
- [x] 7.3 Assign one `rena` submission to a slot — confirm only that submission is excluded, not both
- [x] 7.4 Confirm lineup grid displays DJ name (not submission number) in filled slot cells
- [x] 7.5 Confirm drag-and-drop assignment from the panel still works correctly
