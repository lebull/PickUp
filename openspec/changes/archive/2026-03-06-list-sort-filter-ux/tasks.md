## 1. Update Sort State Model

- [x] 1.1 In `SubmissionList.tsx`, replace the `SortMode` type with three new exported types: `SortField` (`'main' | 'ml' | null`), `SortDir` (`'asc' | 'desc'`), and `ScoreMetric` (`'avg' | 'sum'`)
- [x] 1.2 Update the `Props` interface to replace `sortMode: SortMode` / `onSortChange` with `sortField`, `sortDir`, `scoreMetric`, `onHeaderClick: (field: SortField) => void`, and `onMetricChange: (metric: ScoreMetric) => void`
- [x] 1.3 Update `getScore()` helper to accept `SortField` and `ScoreMetric` as separate arguments instead of a combined `SortMode`
- [x] 1.4 Update the sort `useMemo` to use `sortField`, `sortDir`, and `scoreMetric`

## 2. Update Day Filter State Model

- [x] 2.1 Replace `DayFilter` string type and `onDayChange` prop with `activeDays: Set<string>` and `onDayToggle: (day: string) => void`
- [x] 2.2 Update the filter `useMemo` to show all submissions when `activeDays` is empty, otherwise show submissions matching any active day (union)

## 3. Column Header Sort Interaction

- [x] 3.1 Make the "Main Score" and "ML Score" `<th>` elements clickable — call `onHeaderClick('main')` and `onHeaderClick('ml')` respectively
- [x] 3.2 Render a sort arrow indicator in each sortable header: show ▼ when that column is sorted descending, ▲ when ascending, and a hidden placeholder span otherwise (to prevent layout shift)
- [x] 3.3 Apply a CSS class (e.g., `th-sortable`) to sortable headers and `th-active` to the currently sorted one

## 4. Controls Bar Updates

- [x] 4.1 Remove the sort dropdown from the controls bar
- [x] 4.2 Add a "Score metric" dropdown with options "Average" and "Sum" that calls `onMetricChange`
- [x] 4.3 Replace the day filter `<select>` with a row of toggle `<button>` elements for Thursday, Friday, Saturday, Sunday; each calls `onDayToggle(day)`
- [x] 4.4 Apply an `active` CSS class to day buttons when their day is in `activeDays`

## 5. Update App.tsx State

- [x] 5.1 Replace `sortMode: SortMode` state with `sortField: SortField`, `sortDir: SortDir`, and `scoreMetric: ScoreMetric` state variables (defaults: `null`, `'desc'`, `'avg'`)
- [x] 5.2 Implement `handleHeaderClick(field: SortField)`: if `field === sortField` toggle `sortDir`, otherwise set `sortField = field` and `sortDir = 'desc'`
- [x] 5.3 Replace `dayFilter: DayFilter` state with `activeDays: Set<string>` (default: empty set)
- [x] 5.4 Implement `handleDayToggle(day: string)`: toggle the day in/out of `activeDays` using a new Set
- [x] 5.5 Update `SubmissionList` JSX props to pass the new state and handlers; remove old `SortMode`/`DayFilter` imports

## 6. Styles

- [x] 6.1 Add styles for `.th-sortable` (cursor pointer, user-select none) and `.th-active` (e.g., slightly brighter text)
- [x] 6.2 Add styles for the sort arrow span (inline, fixed width, so header text doesn't shift)
- [x] 6.3 Add styles for the day toggle buttons: default (outline/ghost) and `.active` (filled background, contrasting text)
- [x] 6.4 Verify no horizontal scrollbar on the list table at typical laptop widths after header changes
