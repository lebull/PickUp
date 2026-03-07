## Why

React Router is now installed in the app, but its use is shallow — the submissions vs. lineup builder tab switch inside a project still relies on local `useState`, meaning the active view isn't reflected in the URL, the browser back button doesn't work within a project, and deep-linking to a specific view isn't possible. Now that the routing foundation is in place, we should extend it consistently throughout the workspace.

## What Changes

- Replace the `activeMode` state-driven tab switch (`'submissions' | 'lineup'`) with nested routes under `/project/:id/` — specifically `/project/:id/submissions` and `/project/:id/lineup`.
- The project workspace route `/project/:id` redirects to `/project/:id/submissions` by default.
- The mode-switching tabs in the project header become `<NavLink>` elements pointing to the nested routes.
- The `selectedIndex` submission detail state may optionally be promoted to a route: `/project/:id/submissions/:djIndex` — keeping this in-URL makes the detail panel deep-linkable and back-button-friendly.

## Capabilities

### New Capabilities

- `project-workspace-routing`: URL-driven view switching within the project workspace — submissions and lineup are nested routes; the active tab is reflected in and restored from the URL.

### Modified Capabilities

- `submission-list`: The "select a submission to view detail" interaction gains a URL representation. Selecting a row navigates to a sub-route rather than setting local index state.

## Impact

- `src/App.tsx` — `ProjectWorkspace` restructured to use nested `<Routes>` / `<Outlet>`; `activeMode` state removed; tabs become `<NavLink>`
- `src/components/SubmissionList.tsx` — `onSelect` callback may change signature or be replaced with navigation
- `src/components/SubmissionDetail.tsx` — rendered via route param instead of index prop, or receives submission passed from parent route loader context
