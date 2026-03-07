## 1. Bug Fix — Absolute Navigation Route

- [x] 1.1 In `SubmissionsView.tsx`, update `handleSelect` to use `navigate(\`/project/${projectId}/submissions/${index}\`)` with the `projectId` from `useParams` instead of `navigate(String(index))`
- [x] 1.2 Verify that clicking a row when already on a detail URL navigates to the correct new URL without appending path segments

## 2. Bug Fix — Fluid Table Column Layout

- [x] 2.1 In `App.css` (or the relevant style file), remove any fixed `width` / `min-width` rules on `.submission-table th` and `.submission-table td`
- [x] 2.2 Add `table-layout: auto` to `.submission-table` and wrap the table in a container with `overflow-x: auto; width: 100%` so it scrolls horizontally on narrow viewports
- [x] 2.3 Confirm all columns — including "Preferred Stages" and "Days Available" — are visible at typical desktop viewport widths

## 3. Keyboard Navigation

- [x] 3.1 Add a `cursorIndex` state (number | null) to `SubmissionsView`
- [x] 3.2 Add `tabIndex={0}` and `onKeyDown` handler to the `.split-list` container div; handle `ArrowDown`, `ArrowUp`, `Enter`, and `Space`
- [x] 3.3 Pass `cursorIndex` and a `onCursorChange` callback (or derive it inside `SubmissionList`) to `SubmissionList`
- [x] 3.4 In `SubmissionList`, apply a CSS class (e.g. `row-cursor`) to the row matching `cursorIndex`
- [x] 3.5 On row click, call `onCursorChange` with the clicked row's displayed index so the cursor follows mouse selection
- [x] 3.6 Add CSS for `.row-cursor` — distinct from hover/selected styles
- [x] 3.7 Ensure the container regains focus after a row click (call `containerRef.current?.focus()` after navigation)

## 4. Submission Detail Summary Section

- [x] 4.1 In `SubmissionDetail.tsx`, add a `SubmissionSummary` sub-component that accepts a `Submission` and renders Final Main Score (avg), Final ML Score (avg or "—"), and Genre
- [x] 4.2 Render `<SubmissionSummary>` immediately after the `<h1>` heading and before the first `<Section>` in the detail view
- [x] 4.3 Add CSS for `.detail-summary` — use a card or banner visual treatment distinct from `.detail-section`

## 5. Lineup Presence Indicator

- [x] 5.1 In `SubmissionsView.tsx`, derive a `Set<string>` of submission numbers from `project.assignments` (available via `ProjectContext`)
- [x] 5.2 Add a `lineupSubmissionNumbers` prop of type `Set<string>` to `SubmissionList`
- [x] 5.3 In the table row render in `SubmissionList`, check `lineupSubmissionNumbers.has(s.submissionNumber)` and apply class `in-lineup` to the row when true
- [x] 5.4 Inside the row, conditionally render a badge element (e.g. `<span className="lineup-badge">✓ In Lineup</span>`) in the DJ Name cell when the DJ is in the lineup
- [x] 5.5 Add CSS for `.in-lineup` row style (e.g. tinted background or left border accent) and `.lineup-badge` (small, distinct pill style)
