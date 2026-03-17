## 1. Remove Day Filter

- [x] 1.1 Remove `activeDays` state, `onDayToggle` handler, and day-toggle button rendering from `SubmissionsView.tsx`
- [x] 1.2 Remove `activeDays` prop and the `activeDays`-based filtering `useMemo` from `SubmissionList.tsx`
- [x] 1.3 Remove `onDayToggle` from the `SubmissionList` Props interface
- [x] 1.4 Update the submission count label to no longer reference day-filter state

## 2. Add Fuzzy Name Search

- [x] 2.1 Add `nameSearch` state (string, default `""`) to `SubmissionsView.tsx`
- [x] 2.2 Pass `nameSearch` and `onNameSearchChange` as props to `SubmissionList`
- [x] 2.3 Add the search bar input element to the controls row in `SubmissionList.tsx` (label: "Search DJ name")
- [x] 2.4 Add a `useMemo` that filters `submissions` by case-insensitive substring match on `djName` (or anonymized label when `hiddenNames` is true), applied after the name search and before sort
- [x] 2.5 Clear `nameSearch` when `appContext` changes (add `useEffect` in `SubmissionsView`)
- [x] 2.6 Update the submission count label to show `filtered / total` when search reduces the count

## 3. Stage Assignment Column and Toggle

- [x] 3.1 Add `showStageAssignments` state (boolean, default `false`) to `SubmissionsView.tsx`
- [x] 3.2 Add a "View stage assignments" toggle (checkbox or button) to the controls area in `SubmissionsView` (or pass down to `SubmissionList` controls)
- [x] 3.3 Pass `showStageAssignments` as a prop to `SubmissionList`
- [x] 3.4 Add the Stage Assignment `<th>` column header in `SubmissionList.tsx`, rendered only when `showStageAssignments` is true
- [x] 3.5 Add the Stage Assignment `<td>` cell per row: when `showStageAssignments` is true and `rowState === 'in-lineup'`, render the "✓ In Lineup" badge (with stage color tint if applicable); otherwise render an empty cell
- [x] 3.6 Remove the "✓ In Lineup" badge from the DJ Name column `<td>` (it now lives in the Stage Assignment column)
- [x] 3.7 Gate row color tinting (`style` with `--stage-color`) behind `showStageAssignments` — only apply tint when toggle is on and DJ is in lineup with a colored stage

## 4. Keyboard Navigation — Immediate Navigate and Scroll Into View

- [x] 4.1 In the `ArrowDown`/`ArrowUp` keyboard handler in `SubmissionList.tsx`, call `onSelect(origIndex, newCursorIndex)` immediately after computing the new cursor position (before/alongside calling `onCursorChange`)
- [x] 4.2 After updating cursor, find the row element (e.g., via `data-displayed-index` attribute or a row ref map) and call `el.scrollIntoView({ block: 'nearest' })` to ensure cursor row is visible
- [x] 4.3 Add `data-displayed-index` attributes to each `<tr>` in the rendered list to support the scroll-into-view lookup

## 5. Verification

- [ ] 5.1 Manually verify: day toggle buttons are gone; search bar filters by DJ name; count label updates correctly
- [ ] 5.2 Manually verify: "View stage assignments" toggle off → no Stage Assignment column, no row tinting; toggle on → column and tinting appear
- [ ] 5.3 Manually verify: "✓ In Lineup" badge no longer appears in DJ Name column; "✕ Discarded" and "⚠ Duplicate Name" badges remain in DJ Name column
- [ ] 5.4 Manually verify: pressing arrow keys immediately updates the detail panel and scroll keeps cursor row in view
- [x] 5.5 Run existing tests and fix any failures caused by removed props or changed component interface
