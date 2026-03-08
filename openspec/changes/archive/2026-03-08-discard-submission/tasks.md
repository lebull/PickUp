## 1. Data Model & Persistence

- [x] 1.1 Add `discardedSubmissions: string[]` field to the `Project` interface in `types.ts`
- [x] 1.2 Update `normalizeProject` in `projectStore.ts` to default `discardedSubmissions` to `[]` for legacy projects
- [x] 1.3 Update `createProject` in `projectStore.ts` to initialize `discardedSubmissions: []`

## 2. Project Context — Discard Action

- [x] 2.1 Add `toggleDiscardSubmission(submissionNumber: string) => void` action to `ProjectContext`
- [x] 2.2 Implement the action: toggle `submissionNumber` in/out of `project.discardedSubmissions`, then call `saveProject`

## 3. Submission List — Row State Indicators

- [x] 3.1 Update row-state derivation logic in `SubmissionList.tsx` to compute a `Set<string>` from `project.discardedSubmissions` for O(1) lookup
- [x] 3.2 Compute duplicate-name groups: build a map of `djName → submissionNumber[]` across non-discarded submissions, flag those with count > 1
- [x] 3.3 Apply priority-ordered state per row: `discarded` > `in-lineup` > `duplicate-name` > `none`
- [x] 3.4 Add visual styles for the `discarded` row state (e.g. muted/dimmed appearance, strikethrough or distinct color)
- [x] 3.5 Add `discarded` badge element (e.g. "✕ Discarded") to the row indicator area
- [x] 3.6 Add `duplicate-name` warning badge element (e.g. "⚠ Duplicate Name") to the row indicator area

## 4. Submission List — Discard Action Button

- [x] 4.1 Add a discard icon button to each submission row in `SubmissionList.tsx`
- [x] 4.2 Wire the button to call `toggleDiscardSubmission` from `ProjectContext`
- [x] 4.3 Ensure the button visually reflects the current discarded state (active/inactive toggle appearance)

## 5. DJ Selection Panel — Filter Discarded

- [x] 5.1 Update the DJ pool filtering logic in `DJPool.tsx` or `DJSelectionPanel.tsx` to exclude submissions whose `submissionNumber` is in `project.discardedSubmissions`

## 6. Verification

- [x] 6.1 Verify discard toggles persist across page reload (check IndexedDB via DevTools)
- [x] 6.2 Verify discarded submissions do not appear in the DJ selection panel
- [x] 6.3 Verify duplicate-name warning appears when two non-discarded submissions share a `djName`
- [x] 6.4 Verify duplicate-name warning disappears when all but one are discarded
- [x] 6.5 Verify discard state is preserved in project export/import JSON
