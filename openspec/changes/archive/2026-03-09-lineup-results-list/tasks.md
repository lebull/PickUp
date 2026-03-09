## 1. Route and Navigation

- [x] 1.1 Add a `results` route in `App.tsx` as a sibling of `submissions` and `lineup` under `/project/:id`
- [x] 1.2 Add a "Results" `NavLink` tab in the `ProjectWorkspace` header nav, visible under the same `submissions !== null` condition as the other tabs

## 2. ResultsList Component — Data Derivation

- [x] 2.1 Create `app/src/components/ResultsList.tsx` with `SplitPane` layout (left = results list, right = detail panel)
- [x] 2.2 Read `project.assignments`, `project.stages`, `project.discardedSubmissions`, and `submissions` from `ProjectContext`
- [x] 2.3 Build a `djNameGroups` map: `djName → Submission[]` grouping all submissions by `djName`
- [x] 2.4 Derive the set of assigned `submissionNumber`s from `project.assignments`
- [x] 2.5 Derive accepted submissions per stage: for each stage (in `project.stages` order), collect assigned submissions; sort by evening then `slotIndex`/`positionIndex`
- [x] 2.6 Derive the set of `djName`s whose group has at least one assigned submission (the "accepted name" set)
- [x] 2.7 Derive the rejection list: for each `djNameGroups` entry whose `djName` is NOT in the accepted name set, pick one representative submission (prefer non-discarded; fall back to first)
- [x] 2.8 Derive the duplicates alert list: collect all `djNameGroups` entries with more than one submission; extract `contactEmail` and `telegramDiscord` for the alert

## 3. ResultsList Component — Accepted Section UI

- [x] 3.1 Render a section per stage (only stages with at least one assignment), using stage name as heading
- [x] 3.2 Render each assigned DJ as a clickable row showing: DJ name, contact email, Telegram/Discord, genre, format/gear
- [x] 3.3 Render empty-state message when `project.assignments` is empty

## 4. ResultsList Component — Rejection Section UI

- [x] 4.1 Render a "Did Not Make the Cut" section below the accepted sections
- [x] 4.2 Render each rejection entry as a clickable row with the same fields as accepted rows
- [x] 4.3 Omit the rejection section entirely if the rejection list is empty

## 5. ResultsList Component — Duplicate-Submission Alert

- [x] 5.1 Render an informational alert banner when the duplicates list is non-empty
- [x] 5.2 List each affected DJ's contact email and Telegram/Discord (if present) in the alert
- [x] 5.3 Hide the alert when no duplicate-name groups exist

## 6. ResultsList Component — Detail Panel

- [x] 6.1 Track `selectedSubmission: Submission | null` in local state
- [x] 6.2 On DJ row click, set `selectedSubmission` to the corresponding `Submission`
- [x] 6.3 Render the existing `SubmissionDetail` component in the right pane of `SplitPane` when a submission is selected, passing an `onBack` callback that clears the selection
- [x] 6.4 Show the right pane only when a submission is selected (collapse to full-width list otherwise)
