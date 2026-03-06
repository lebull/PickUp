## Context

The submission list currently has three controls in a bar above the table: a sort dropdown (Main Avg / Main Sum / ML Avg / ML Sum), a day filter dropdown (single-select). The sort dropdown conflates two orthogonal concerns — *which column* to sort by and *which score metric* (avg vs sum) to use. The day filter only allows one day at a time, which is limiting when a judge wants to see all DJs available on, say, Friday or Saturday.

The existing `SubmissionList` component is self-contained; state for `sortMode` and `dayFilter` lives in `App.tsx` and is passed as props.

## Goals / Non-Goals

**Goals:**
- Column headers trigger sort (click to sort asc, click again to sort desc)
- Avg/Sum toggle remains a single dropdown — applies globally across all score columns
- Day filter becomes multi-select toggle buttons; multiple days can be active simultaneously
- Visual feedback: sort arrow on active column header, highlighted state on active day buttons

**Non-Goals:**
- No secondary sort (multi-column sort)
- No persistence of sort/filter state across page reloads
- No animation on sort/filter changes

## Decisions

### 1. Sort state: `sortField` + `sortDir` + `scoreMetric` replaces `sortMode`

**Decision**: Replace the single `SortMode` string enum (`'main-avg' | 'main-sum' | 'ml-avg' | 'ml-sum'`) with three separate state pieces:
- `sortField: 'main' | 'ml' | null` — which score column is the sort key
- `sortDir: 'desc' | 'asc'` — direction, toggled on repeated click of same header
- `scoreMetric: 'avg' | 'sum'` — the dropdown, used when computing the sort value

**Rationale**: Clicking a header naturally maps to setting `sortField`. The direction toggle is a separate concern from which field. `scoreMetric` is a global display preference that affects both columns equally and belongs in a control, not embedded in the sort field name.

**Alternatives considered**:
- *Keep `SortMode` and derive from header clicks* — requires mapping clicks to `'main-avg'` etc., and loses the ability to keep the user's current metric when switching columns.

### 2. Day filter state: `activeDays: Set<string>` (empty = all)

**Decision**: Replace the single `DayFilter` string with a `Set<string>` where an empty set means "show all". Toggle a day in/out of the set on button click.

**Rationale**: A `Set` gives O(1) membership checks and cleanly models multi-select toggle semantics. Empty = no filter applied keeps the "All Days" concept without a special sentinel string.

**Alternatives considered**:
- *`string[]` array* — equivalent but `Set` has more appropriate semantics for an unordered collection of active filters.
- *Special `'all'` value* — adds a sentinel case that has to be checked everywhere the filter is applied.

### 3. Props interface changes are breaking for App.tsx

**Decision**: Update `App.tsx` state to match the new props, removing `SortMode`/`DayFilter` type imports and replacing with the new state shape. The change is isolated to two files.

## Risks / Trade-offs

- **Column width shift on sort arrow appearance** → Use a fixed-width placeholder `span` for the arrow glyph so the header doesn't reflow when the arrow appears/disappears. Mitigation: always render the arrow span, hide it with `visibility: hidden` when not active.
- **Type export churn** → `SortMode` and `DayFilter` are currently exported from `SubmissionList.tsx` and imported in `App.tsx`. These will be removed/replaced — both files need updating together.
