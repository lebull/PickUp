## Why

The current sort and day-filter controls are dropdowns that require multiple interactions to compare submissions across days or switch sort dimensions — clicking a column header to sort is the standard table interaction pattern, and multi-select day filtering lets judges narrow to specific combinations (e.g., Friday + Saturday) without losing other selections.

## What Changes

- **BREAKING** Sort control removed from the controls bar; sorting is now triggered by clicking a column header in the submission table
- Average vs. Sum toggle remains a dropdown in the controls bar, applying globally to all score columns
- Day filter changes from a single-select dropdown to a set of toggle buttons; multiple days can be active simultaneously; "All Days" becomes "clear all" behavior when all are active
- Active sort column is indicated by a sort arrow (▲/▼) in the header
- Active day filters are visually indicated (highlighted/active state on buttons)

## Capabilities

### New Capabilities

### Modified Capabilities

- `submission-list`: Sort interaction changes from dropdown selection to column header click; day filter changes from single-select to multi-select toggle buttons; avg/sum mode remains a dropdown

## Impact

- `app/src/components/SubmissionList.tsx` — sort state model changes (`sortField` + `sortDir` replaces `sortMode` string enum); day filter state changes from `DayFilter` string to `Set<string>` or string array; exported types change
- `app/src/App.tsx` — state types updated to match new `SubmissionList` props
- `app/src/App.css` — new styles for clickable column headers and day toggle buttons
