## Context

The submission list is a core review tool used by the FWA DJ selection committee. Currently it has two confirmed bugs (broken detail navigation route and hidden last column) and three missing UX features (keyboard navigation, detail summary header, lineup presence indicator). The app uses React Router v6, and the submission list/detail view is rendered inside a nested route structure under `/project/:id/submissions`. The lineup state lives in the `Project` object (via `assignments: SlotAssignment[]`) accessible through `ProjectContext`.

## Goals / Non-Goals

**Goals:**
- Fix the relative-vs-absolute route bug so clicking a DJ row always navigates correctly regardless of current URL depth
- Fix the table column overflow so all columns are always visible and the layout is fluid
- Add Up/Down arrow key navigation to move through the submission list without a mouse
- Add a top-level summary section to the submission detail view (final score, ML score, genre)
- Show a visual badge and distinct row style on submission list rows for DJs already in the lineup

**Non-Goals:**
- Changing the lineup editing workflow or stage config panel
- Persisting keyboard selection state across page reloads
- Adding search/text filtering to the submission list (separate concern)
- Changing the score calculation logic

## Decisions

### 1. Fix detail route with absolute path construction

**Decision**: In `SubmissionsView.handleSelect`, replace `navigate(String(index))` with an absolute path using the current `projectId` from `useParams`: `navigate(\`/project/${projectId}/submissions/${index}\`)`.

**Rationale**: The relative `navigate(String(index))` call appends the index to whatever the current URL is. When the user is already viewing a detail (e.g. `/project/abc/submissions/3`) and clicks another row, the new index gets appended: `/project/abc/submissions/3/5`. Using an absolute path avoids this entirely.

**Alternative considered**: Using `navigate('../' + index)` — but this is fragile and depends on route nesting depth.

### 2. Fluid table column layout

**Decision**: Remove any fixed `width` or `min-width` CSS on individual `<th>` / `<td>` elements. Set `table-layout: auto` (browser default) and ensure the table container has `overflow-x: auto` with `width: 100%` so the table can scroll horizontally on narrow viewports rather than silently clipping.

**Rationale**: Fixed column widths cause the rightmost columns to overflow invisibly. Auto layout distributes space proportionally to content. An `overflow-x: auto` wrapper ensures narrow viewports still work without clipping.

**Alternative considered**: CSS Grid-based layout — adds unnecessary complexity for a simple data table.

### 3. Keyboard navigation via `onKeyDown` on the list container

**Decision**: Attach a `keydown` event listener to the `<div className="split-list">` container (or the table itself with `tabIndex={0}`). On `ArrowDown`/`ArrowUp`, move the "keyboard cursor" index and call `navigate` with the new index. Track the cursor as local state in `SubmissionsView`. Highlight the cursor row with a CSS class.

**Rationale**: The table container is a natural focus target. Using a React `onKeyDown` prop keeps this within the component model. The cursor state is transient UI state, appropriate for `useState`.

**Alternative considered**: Making each `<tr>` focusable with `tabIndex` — creates many focusable elements and complicates the UX; a single container with arrow key handling is the standard pattern for list widgets.

### 4. Detail summary bar as a new sub-component

**Decision**: Add a `<SubmissionSummary>` component inside `SubmissionDetail.tsx` that renders a compact summary row/card at the top of the detail view, before any `<Section>`. It displays: DJ Name (already shown as `<h1>`), Genre, Final Main Score (avg), and Final ML Score (avg or `—` if not applicable).

**Rationale**: This gives reviewers an immediate at-a-glance view of the most important fields without scrolling. Implementing it as a local sub-component keeps the detail file self-contained.

### 5. Lineup indicator via derived Set passed as prop

**Decision**: Add `submissionNumber: string` to the `Submission` type and parse it from the `"Submission #"` CSV column in `loadSubmissions.ts`. In `SubmissionsView`, derive a `Set<string>` of submission numbers currently in the lineup. Since `SlotAssignment` stores `djName`, build this by collecting assigned DJ names from `project.assignments`, then mapping them to `submissionNumber` via `submissions.find(s => s.djName === name)?.submissionNumber`. Pass the resulting set as `lineupSubmissionNumbers` prop to `SubmissionList`. In the table row render, check `lineupSubmissionNumbers.has(s.submissionNumber)` to apply a CSS class (e.g. `in-lineup`) and render a small badge (e.g. `✓ In Lineup`).

**Rationale**: `submissionNumber` is a stable, externally assigned identifier from the source CSV, making it a better key than a derived array index. It avoids both DJ name collision issues and fragility from re-ordering. It also aligns with how the committee already identifies submissions in their workflow.

**Alternative considered**: Keying by DJ name — simpler but fragile if two submissions share the same name. Rejected in favor of `submissionNumber`.

## Risks / Trade-offs

- **DJ name collision in assignment lookup**: `SlotAssignment` stores `djName`, so the derivation step still maps name → `submissionNumber` via a `find`. If two submissions share the same DJ name, the wrong submission number could be resolved. → Acceptable risk; DJ names are expected to be unique. A future improvement would be to store `submissionNumber` directly on `SlotAssignment`.
- **Keyboard focus management**: If the user clicks a row and then tries arrow keys, the container must have focus. → Mitigate by calling `containerRef.current?.focus()` after a row click, or instructing users the container must be focused first.
- **Table overflow on mobile**: `overflow-x: auto` on the wrapper enables horizontal scroll, but the UX on narrow mobile screens may not be polished. → Acceptable for a committee tool not primarily used on mobile.
