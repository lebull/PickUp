## Why

The submission list has several usability bugs and missing features that reduce reviewer efficiency: a broken navigation bug makes DJ detail routes unreachable when navigated from certain contexts, an important column is hidden due to fixed-width overflow, and there is no keyboard navigation, no quick-glance summary on the detail view, and no visual indication of which DJs are already slotted in the lineup.

## What Changes

- **Bug fix**: DJ detail route is appended to the previous route instead of being an absolute path, causing broken navigation when accessed from nested routes
- **Bug fix**: The "Preferred Stages" (last) column is hidden in overflow due to fixed column widths; layout should use flexible/fluid widths instead
- **New feature**: Arrow key navigation in the submission list (Up/Down to move between rows)
- **New feature**: Summary bar at the top of the submission detail view showing Final Score, Final Moonlight Score, and Genre at a glance
- **New feature**: Lineup presence indicator on submission list rows — DJs already assigned to the lineup get a visual badge/row style distinguishing them

## Capabilities

### New Capabilities

- `submission-list-keyboard-nav`: Arrow key navigation through the submission list rows
- `submission-detail-summary`: Summary section at the top of the detail view with final score, ML score, and genre
- `submission-list-lineup-indicator`: Visual indicator and row styling for DJs present in the current project lineup

### Modified Capabilities

- `submission-list`: Row navigation now uses absolute routes (not relative); column layout switches from fixed widths to fluid/flexible widths
- `submission-detail`: A summary section is prepended to the detail view

## Impact

- `src/components/SubmissionsView.tsx`: Fix `navigate(String(index))` to use an absolute path pattern
- `src/components/SubmissionList.tsx`: Remove fixed column widths; add keyboard event handling; accept and render lineup presence data
- `src/components/SubmissionDetail.tsx`: Add summary section component at top of detail view
- `src/App.css` or component-level styles: Update table layout to use `table-layout: auto` or flex-based columns; add lineup indicator styles
- `src/ProjectContext.ts` / `src/types.ts`: No structural changes needed; lineup assignments already available via project context
