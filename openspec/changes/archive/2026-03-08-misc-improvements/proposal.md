## Why

Several small but impactful UX gaps have been identified during active use of the lineup builder: submission sorting is counter-intuitive, preferences reset on every session, DJ names leak through the hidden-names guard in the scheduler, and equipment format data is absent from the DJ picker where conflicts matter most. These fixes reduce friction and improve data integrity for committee members building lineups.

## What Changes

- **Submission list default sort**: Change the default sort order from score-descending to submission-number-ascending, so reviewers can orient themselves to the original submission order before applying score filters.
- **App preferences persistence**: Persist `appContext` (standard/moonlight) and `hiddenNames` to `localStorage` so they survive page reloads and are consistent across sessions for a single browser/device. Because multiple users share the same project file, preferences must NOT be stored in the project.
- **Hidden names in lineup grid**: When `hiddenNames` is active, replace real DJ names with anonymous identifiers (`DJ #N`) in the `LineupGrid` scheduler view (slot cells and simultaneous DJ lists), which currently displays real names regardless of the preference.
- **Format/gear column in DJ picker**: Add a `Format / Gear` column to the `DJSelectionPanel` so committee members can see each DJ's equipment format when making assignment decisions. Column widths in the panel must be revisited to accommodate this new column without breaking layout.

## Capabilities

### New Capabilities
<!-- none: all changes are modifications to existing capabilities -->

### Modified Capabilities
- `submission-list`: Default sort requirement changes from score-descending to submission-number-ascending.
- `hidden-names`: Extend hidden-names coverage to include the lineup grid scheduler (slot cells and simultaneous DJ name lists).
- `app-context`: Preferences (`appContext`, `hiddenNames`) must persist via `localStorage` rather than being ephemeral React state.
- `dj-selection-panel`: Add `Format / Gear` column; revisit column-width layout to support the additional column.

## Impact

- `app/src/AppPreferencesContext.ts`: Replace `useState` with `localStorage`-backed state in `useAppPreferencesState`.
- `app/src/components/SubmissionsView.tsx`: Change initial `sortField` / `sortDir` state to sort by submission number ascending.
- `app/src/components/SubmissionList.tsx`: Add `null` sort option (or `'number'` field) for submission-number sort; update sort logic.
- `app/src/components/LineupGrid.tsx`: Accept `hiddenNames` prop (or read from context); replace `djName` display with anonymous ID where names are shown.
- `app/src/components/DJSelectionPanel.tsx`: Add `formatGear` column to the DJ row; adjust column widths / grid template.
- Existing specs modified: `submission-list`, `hidden-names`, `app-context`, `dj-selection-panel`.
