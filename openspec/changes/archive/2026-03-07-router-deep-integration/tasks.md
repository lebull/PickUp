## 1. Project Context

- [x] 1.1 Create `src/ProjectContext.ts` — define `ProjectContextValue` interface and `ProjectContext` with `useProjectContext` hook; fields: `project`, `setProject`, `submissions`, `setSubmissions`, `rowCountMismatch`, `setRowCountMismatch`
- [x] 1.2 In `ProjectWorkspace` (`App.tsx`), wrap the `<Outlet>` render in `<ProjectContext.Provider>` with the loaded project data

## 2. Nested Routes

- [x] 2.1 In `App.tsx`, replace the single `/project/:id` route with a parent route that renders `<ProjectWorkspace>` and add child routes: `submissions`, `submissions/:djIndex`, `lineup`
- [x] 2.2 Add an index redirect from `/project/:id` → `/project/:id/submissions` using `<Navigate replace to="submissions" />`
- [x] 2.3 Replace the `<Outlet>` placement in `ProjectWorkspace` — remove `activeMode` state, remove the conditional render of `SubmissionsView`/`LineupView`, render `<Outlet>` in its place in `<main>`

## 3. Tab Bar

- [x] 3.1 Replace the `<button>` mode-tab elements in the `ProjectWorkspace` header with `<NavLink to="submissions">` and `<NavLink to="lineup">` using the `mode-tab` class
- [x] 3.2 Pass a `className` callback to `<NavLink>` so the `active` class is applied when the route matches (replacing the manual `activeMode === 'submissions'` check)
- [x] 3.3 Hide the tab bar when no submissions are loaded (keep existing `submissions !== null` guard, sourced from context)

## 4. Submissions View

- [x] 4.1 Extract the submissions tab content from `ProjectWorkspace` into a new component `src/components/SubmissionsView.tsx`; it consumes `ProjectContext` for `submissions`, `project`, and sort/filter state
- [x] 4.2 Move sort state (`sortField`, `sortDir`, `scoreMetric`, `activeDays`) into `SubmissionsView` as local state (it is view-local and doesn't need to survive tab switches)
- [x] 4.3 Update `SubmissionList`'s `onSelect` callback to call `navigate(String(index))` (relative navigation to `submissions/:djIndex`) instead of calling `setSelectedIndex`
- [x] 4.4 Create child route component `SubmissionDetailRoute` that reads `:djIndex` from `useParams`, derives the submission from the sorted list, and renders `<SubmissionDetail>`; `onBack` calls `navigate(-1)`
- [x] 4.5 Wire up the `submissions/:djIndex` child route in `App.tsx` to render `<SubmissionDetailRoute>`

## 5. Lineup View

- [x] 5.1 Extract the lineup tab content from `ProjectWorkspace` into a new component `src/components/LineupView.tsx`; it consumes `ProjectContext` for `project`, `setProject`, `submissions`
- [x] 5.2 Move `showStageConfig`, `showClearConfirm`, and `rowCountMismatch` banner into `LineupView` as local state
- [x] 5.3 Wire up the `lineup` child route in `App.tsx` to render `<LineupView>`

## 6. Cleanup

- [x] 6.1 Remove `activeMode` state and all related code from `ProjectWorkspace`
- [x] 6.2 Remove `selectedIndex` state from `ProjectWorkspace` (now managed by route param)
- [x] 6.3 Verify `npx tsc --noEmit` passes with no errors
