## Context

React Router is installed and used for top-level navigation (`/`, `/new`, `/project/:id`). Inside `ProjectWorkspace`, however, view switching between Submissions and Lineup Builder is still driven by a `useState` enum (`activeMode`). The selected submission detail is also local state (`selectedIndex`). This means the URL never reflects which view or submission is active within a project.

## Goals / Non-Goals

**Goals:**
- Replace `activeMode` state with nested routes under `/project/:id/`
- Make the submissions tab (`/project/:id/submissions`) and lineup tab (`/project/:id/lineup`) independently navigable and bookmarkable
- Promote `selectedIndex` to a URL param: `/project/:id/submissions/:djIndex` so the detail panel is addressable
- Use `<NavLink>` for the tab bar so active styling is automatic
- Default `/project/:id` to redirect to `/project/:id/submissions`

**Non-Goals:**
- Persisting sort/filter/metric state in the URL (separate concern)
- Animating route transitions
- Moving `StageConfigPanel` into its own route (it is a modal overlay, not a page)

## Decisions

### Decision: Nested routes via `<Outlet>` in ProjectWorkspace
**Decision**: `ProjectWorkspace` renders an `<Outlet>` where the tab content goes. Two child routes — `submissions` and `lineup` — are defined under `/project/:id/` in `App.tsx`. An index redirect sends `/project/:id` → `/project/:id/submissions`.  
**Alternatives**:
- Keep `activeMode` state, add `useEffect` to sync with URL → two sources of truth, fragile.  
**Rationale**: `<Outlet>` is the idiomatic React Router pattern; it eliminates the dual-state problem entirely.

### Decision: Submission detail as a child route `/project/:id/submissions/:djIndex`
**Decision**: Clicking a row navigates to `/project/:id/submissions/:djIndex` (0-based integer index into the sorted/filtered list). The `SubmissionDetail` panel is rendered by this route, receiving the submission via the parent's loaded data passed through context or re-derived from the index param.  
**Alternatives**:
- Keep `selectedIndex` as local state inside the submissions child route → loses deep-link and back-button support for detail.  
- Use DJ name or a stable ID in the URL → DJ names aren't unique; no stable submission ID exists currently.  
**Rationale**: Integer index is already how the current UI works; it's simple and sufficient. A future change can introduce stable IDs if needed.

### Decision: Pass loaded project data down via React Context, not prop drilling
**Decision**: `ProjectWorkspace` loads the project and places `{ project, setProject, submissions, setSubmissions, ... }` into a `ProjectContext`. Child routes (`SubmissionsView`, `LineupView`) consume the context rather than receiving props through router.  
**Alternatives**:
- Prop drill through `<Outlet context={...}>` (React Router's outlet context) → works but less idiomatic for deeply nested consumers.  
**Rationale**: Context is the standard React pattern for shared data; it keeps child route components clean and testable.

## Risks / Trade-offs

- **Integer index in URL is fragile to sort/filter changes** → Mitigation: The index refers to the *rendered* (sorted/filtered) list position, so navigating back reconstructs the same view state. If sort changes while on the detail view, back-navigation may land on a different row — acceptable for now.
- **Context adds indirection** → Mitigation: The context is scoped tightly to `ProjectWorkspace` and its children; it doesn't bleed into the global app.
