## Context

The PickUp lineup builder is a React + TypeScript SPA backed by a shared project file (stored/exported as JSON). Multiple committee members use the same project file, each loading it in their own browser. App-wide preferences (Standard vs Moonlight context, Hidden Names mode) are currently held in ephemeral React state, so they reset on every reload. The submission list defaults to score-descending sort, which is disorienting for reviewers who want to browse in submission order. The hidden-names guard is incomplete: the `LineupGrid` scheduler renders real DJ names without consulting `hiddenNames`. The `DJSelectionPanel` omits the submission's `formatGear` field, making it impossible to detect equipment conflicts while building a lineup.

All four fixes are isolated, low-risk UI changes to existing components. No new dependencies or data model changes are required—`formatGear` is already a field on the `Submission` type.

## Goals / Non-Goals

**Goals:**
- Default the submission list sort to submission-number ascending.
- Persist `appContext` and `hiddenNames` in `localStorage` so they survive page reloads.
- Ensure `LineupGrid` respects `hiddenNames` by showing `DJ #N` anonymous IDs in slot cells.
- Add a `Format / Gear` column to `DJSelectionPanel` rows and adjust column-width layout to fit.

**Non-Goals:**
- Syncing preferences across multiple browsers / users in real-time (each user's device is independent).
- Storing preferences in the project file.
- Changing the sort behavior after the user has interacted with sort controls (the change only affects the initial default).
- Adding filtering or grouping by `formatGear` in the DJ panel.

## Decisions

### 1. localStorage for preferences (not project file, not URL params)
Multiple users share the project file, so storing preferences there would cause conflicts when one user saves over another's context choice. URL params would pollute sharing URLs and complicate routing. `localStorage` is per-device/per-browser and persists across reloads without any coordination overhead.

**Key**: Use a stable key such as `pickup_prefs_v1` storing `{ appContext, hiddenNames }` as JSON. Read on mount in `useAppPreferencesState`; write on every setter call.

**Alternative considered**: `sessionStorage` — rejected because it resets on tab close, which is only marginally better than the current in-memory state.

### 2. Submission-number sort as a new `SortField` value (`'number'`)
Rather than special-casing `null` or overloading existing fields, add `'number'` to the `SortField` union. The sort comparator compares `submissionNumber` strings lexicographically (they are zero-padded or consistently formatted from the CSV). The initial `sortField` state in `SubmissionsView` changes from `'main'`/`'ml'` to `'number'`, and `sortDir` defaults to `'asc'`.

**Alternative considered**: Keep `sortField: null` for submission-number sort — rejected because it conflates "no sort" with "sort by number", and the existing `null` handling in `getScore` would need more surgery.

### 3. `hiddenNames` via context in `LineupGrid` (no new prop)
`LineupGrid` is already rendered inside the `AppPreferencesContext` provider tree. Reading `useAppPreferences()` directly inside `LineupGrid` (and the helper functions that display names) avoids adding a prop that would need to thread through `LineupView` → `LineupGrid`. The anonymous ID is computed the same way as elsewhere: `DJ #${submissions.findIndex(s => s.submissionNumber === submissionNumber) + 1}`.

**Alternative considered**: Pass `hiddenNames` as a prop — viable but adds prop-drilling through `LineupView` which already has many props.

### 4. `formatGear` column: fixed-width or truncate-with-tooltip
The DJ panel currently uses a CSS grid column template. Adding a `Format / Gear` column means re-evaluating column widths. The new column will use a compact max-width (e.g. `minmax(0, 1fr)` shared with other text columns) and will truncate with ellipsis. A `title` attribute provides full text on hover (no extra tooltip library needed).

**Column order**: Score → Genre → Format/Gear → Stage Prefs → (Vibefit if moonlight). Score and stage-prefs remain the anchors; format/gear slots between genre and stage prefs.

## Risks / Trade-offs

- **localStorage key collision**: If a user has multiple PickUp instances running for different events, they share the same preference key. → Mitigation: Prefix key with a stable app identifier (`pickup_prefs_v1`); accept that this is a known limitation given single-event deployment model.
- **Submission number sort is lexicographic**: If submission numbers are not zero-padded, numbers like "2" would sort after "10". → Mitigation: Parse as integers for comparison; fall back to string compare if non-numeric.
- **LineupGrid anonymous IDs require submissions array**: `LineupGrid` already receives the full `submissions` prop, so `findIndex` is available without new data fetching.
- **Column layout regression in DJSelectionPanel**: Adding a column may cause horizontal overflow on narrow split-pane widths. → Mitigation: Use `minmax(0, …)` grid columns and test at minimum panel width; truncate long format strings.
