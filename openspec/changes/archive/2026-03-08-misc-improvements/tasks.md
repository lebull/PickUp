## 1. Persist App Preferences in localStorage

- [x] 1.1 In `AppPreferencesContext.ts`, replace `useState` with localStorage-backed state in `useAppPreferencesState`: read `pickup_prefs_v1` on init, write on every setter call
- [x] 1.2 Parse stored JSON safely (try/catch), falling back to defaults (`appContext: 'standard'`, `hiddenNames: false`) on parse error or missing key
- [x] 1.3 Update both `setAppContext` and `setHiddenNames` wrappers to persist the full preferences object to localStorage on each call

## 2. Submission List — Default Sort by Submission Number

- [x] 2.1 In `SubmissionList.tsx`, add `'number'` to the `SortField` union type
- [x] 2.2 Update the sort comparator to handle `sortField === 'number'`: parse `submissionNumber` as integer for comparison, fall back to string compare if non-numeric
- [x] 2.3 Add the submission number column header as a clickable sortable header (with arrow indicator) in the table render
- [x] 2.4 In `SubmissionsView.tsx`, change the initial `sortField` state from score-based to `'number'` and `sortDir` to `'asc'`
- [x] 2.5 Update the `useEffect` that resets sort on `appContext` change to reset to `sortField: 'number'`, `sortDir: 'asc'` instead of the score field

## 3. Hidden Names in Lineup Grid

- [x] 3.1 In `LineupGrid.tsx`, import and call `useAppPreferences()` to access `hiddenNames` and `submissions` (already a prop)
- [x] 3.2 Create a helper `getDisplayName(submissionNumber: string): string` inside `LineupGrid` that returns `DJ #N` when `hiddenNames` is true, or the real `djName` otherwise (using `submissions.findIndex`)
- [x] 3.3 Replace all occurrences in `LineupGrid` where `djName` or `a.submissionNumber` is used for display in slot cells with calls to `getDisplayName`
- [x] 3.4 Update `resolveSimultaneousDJs` to use `getDisplayName` instead of reading `djName` directly

## 4. Format/Gear Column in DJ Selection Panel

- [x] 4.1 In `DJSelectionPanel.tsx`, add `formatGear` to the columns rendered for each DJ row, displaying `s.formatGear || '—'` with a `title` attribute for the full text
- [x] 4.2 Update the CSS grid column template for the DJ row (in the panel's CSS or inline style) to include the new Format/Gear column using `minmax(0, 1fr)` so it shares space fluidly
- [x] 4.3 Add a column header label "Format / Gear" in the panel header row, aligned to the new column
- [x] 4.4 Ensure the Format/Gear cell truncates long text with `text-overflow: ellipsis; overflow: hidden; white-space: nowrap`
- [x] 4.5 Verify at minimum panel width that all columns (Score, DJ Name, Genre, Format/Gear, Stage Prefs, Vibefit) remain visible without horizontal scroll

## 5. Verification

- [x] 5.1 Reload the app and verify `appContext` and `hiddenNames` are restored from localStorage
- [x] 5.2 Open the submission list and verify it defaults to submission-number ascending order
- [x] 5.3 Enable Hidden Names, build a lineup, and verify slot cells in the grid show `DJ #N` instead of real names
- [x] 5.4 Open the DJ selection panel and verify the Format/Gear column is present and truncates long values
- [x] 5.5 Run existing tests (`npm test`) and confirm no regressions
