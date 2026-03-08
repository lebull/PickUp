## 1. Remove fixed panel width

- [x] 1.1 In `App.css`, remove `width: 380px;` and `flex-shrink: 0;` from `.dj-selection-panel` so it fills its `SplitPane` container

## 2. Replace stage filter with focus-stage selector in DJSelectionPanel

- [x] 2.1 Replace `selectedStages: Set<string>` state with `focusStage: string | null` state; initialise to `null`
- [x] 2.2 Reset `focusStage` to `null` whenever `activeSlot` changes (add `useEffect` dependency on `activeSlot`)
- [x] 2.3 Remove the `selectedStages` filter predicate from the `available` `useMemo`; available list is now unfiltered by stage
- [x] 2.4 Remove `toggleStage` helper function and replace with `setFocusStage` toggle (click focused stage → clear; click other → set)
- [x] 2.5 Replace the multi-toggle filter `<div className="dj-panel-filters">` with a focus-stage selector row using the same `day-btn` button style (one button per stage; active when it matches `focusStage`)

## 3. Implement grouping logic

- [x] 3.1 Define the five rank buckets as an ordered array: `['1st Choice', '2nd Choice', '3rd Choice', '4th / 5th Choice', 'No Preference']`
- [x] 3.2 Write a `getPreferenceRank(s: Submission, stage: string): number` helper that returns 0–4 corresponding to bucket index (0 = 1st choice, 4 = no preference), filtering falsy entries before indexing
- [x] 3.3 Add a `grouped` `useMemo` that, when `focusStage` is set, partitions `sorted` into the five buckets in order; when `focusStage` is null returns `null` (flat list used instead)

## 4. Update render

- [x] 4.1 When `grouped` is null, render the existing flat `sorted.map(...)` list inside `.dj-panel-list`
- [x] 4.2 When `grouped` is set, render each non-empty bucket as a `<div className="dj-panel-group">` containing a `<div className="dj-panel-group-heading">` label followed by the same DJ card rows
- [x] 4.3 Add CSS for `.dj-panel-group` and `.dj-panel-group-heading` to `App.css`

## 5. Verification

- [x] 5.1 Run `npx tsc --noEmit` and confirm zero type errors
- [x] 5.2 Manually verify: panel fills available width when split pane is resized
- [x] 5.3 Manually verify: clicking a stage button groups DJs; clicking again returns flat list
- [x] 5.4 Manually verify: within each group DJs are ordered by score descending
- [x] 5.5 Manually verify: empty groups are not rendered; "No Preference" group only appears when some DJs don't list the stage
