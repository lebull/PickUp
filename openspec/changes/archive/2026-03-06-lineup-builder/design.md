## Context

The app today is a read-only scoring browser for DJ submissions. Organizers have been building lineups manually outside the tool. This design adds a Lineup Builder mode where organizers configure stages, define time slots, and place DJs into a schedule grid — all within the same browser session, with state persisted locally so work survives page reloads.

The app is a single-page React + Vite app with no backend. Submission data arrives via CSV import and lives in React state. No external APIs exist.

## Goals / Non-Goals

**Goals:**
- Organizers can define stages (name, active days, start time, end time, slot duration)
- A grid view renders one evening at a time: columns = stages active that evening, rows = time slots
- DJs can be placed into slots by clicking (select from pool) or drag-and-drop
- The complete lineup (stage config + slot assignments) persists to IndexedDB, keyed by CSV filename
- On re-importing the same CSV filename, saved lineup is automatically restored
- Moonlight is just another stage in this system — no special-casing

**Non-Goals:**
- Collaborative or multi-user editing (no backend)
- Exporting the lineup to a printable/shareable format (future change)
- Conflict detection or constraint enforcement (e.g., DJ cannot play two stages at once) — warn, don't block
- Time zone handling
- Undo/redo

## Decisions

### D1: Persistence — IndexedDB via `idb` library

**Decision:** Use the `idb` library (a thin promise wrapper around IndexedDB) rather than `localStorage` or raw `indexedDB`.

**Rationale:** Lineup data (stages + slot assignments across multiple evenings) will easily exceed localStorage's 5 MB limit once the app is used for multiple years. `idb` is tiny (~1 KB), well-maintained, and makes async IndexedDB calls ergonomic. Raw `indexedDB` API is verbose and error-prone.

**Alternatives considered:**
- `localStorage`: Too small, synchronous, stores only strings
- Raw `indexedDB`: Works but unnecessarily complex given `idb` exists
- `sessionStorage`: Doesn't survive page reload — disqualified

**Storage key:** `lineup-<csvFileName>` (e.g., `lineup-FWA 2026 DJ Submissions.csv`). This scopes saved lineups to their source spreadsheet so different years/events don't collide.

---

### D2: Grid rendering — CSS Grid with fixed slot heights

**Decision:** Render the schedule grid using CSS Grid. Each time slot row has a fixed height. Stages are columns.

**Rationale:** CSS Grid is the natural fit for a 2D schedule. Fixed slot heights keep the layout predictable and avoid the complexity of variable-height row calculations. The number of stages and slots is small enough (typically 3–5 stages, 6–16 slots per evening) that a full grid render is trivial.

**Alternatives considered:**
- Table element: Harder to style for drag-and-drop targets, sticky headers are tricky
- Virtualized grid: Unnecessary at this data scale

---

### D3: DJ assignment interaction — click-to-assign with optional drag

**Decision:** Primary interaction is click-based: clicking an empty slot opens a dropdown/modal to pick a DJ from the unscheduled pool. Drag-and-drop from the pool sidebar is a secondary (nice-to-have) enhancement.

**Rationale:** Click-to-assign is accessible, works equally well on touch/trackpad, and is simpler to implement correctly. Drag-and-drop can layer on top of the same data model without requiring a rewrite.

---

### D4: Stage configuration — in-app modal, not a config file

**Decision:** Stage config (stages, their active days, event times, slot duration) is edited via an in-app modal and persisted alongside the lineup in IndexedDB.

**Rationale:** The tool's audience is non-technical organizers. A JSON config file they'd have to find and edit in a text editor is a bad UX. The config is per-event anyway so it belongs with the lineup data, not in source control.

---

### D5: App mode — tab toggle, not a separate route

**Decision:** Add a "Lineup Builder" tab alongside the existing "Submissions" view rather than introducing a router.

**Rationale:** The app currently has no routing. Adding a full router for two modes would be over-engineering. A simple `activeMode: 'submissions' | 'lineup'` state value is sufficient.

---

### D6: Evening navigation — a single "evening" selector

**Decision:** When viewing the grid, show one evening at a time. A row of day buttons (matching the active days from stage config) switches the displayed evening.

**Rationale:** Showing all evenings simultaneously would make the grid too wide. Per-evening is how organizers mentally model the schedule anyway.

## Risks / Trade-offs

- **IndexedDB key collision by filename** → If two different events happen to use the same CSV filename, they'd share a lineup. Mitigation: document the key scheme; consider adding a "clear lineup" action so organizers can start fresh.
- **Stage config change invalidates existing assignments** → If a user deletes a stage or changes slot times after placing DJs, orphaned assignments result. Mitigation: on config save, validate assignments and surface a warning listing any slots that no longer exist; don't silently delete.
- **Drag-and-drop complexity** → HTML5 drag-and-drop has known edge cases (especially ghost images, drop outside targets). Mitigation: implement click-to-assign as the complete/reliable primary path; add drag-and-drop as progressive enhancement behind a feature flag or as a stretch goal.
- **CSV filename as the only identity key** → There's no hash or content fingerprint, so re-importing a *different* CSV with the same filename would silently restore a mismatched lineup. Mitigation: store the row count alongside the key; warn if it doesn't match on restore.

## Open Questions

- Should slot duration be global (one value for all stages) or per-stage? The proposal favors per-stage config, but per-stage adds significant UI surface. Starting with a global slot duration and per-stage overrides as a future enhancement seems safest.
- What are the actual stage names at FWA 2026? (They appear in the `stagePreferences` CSV data — should auto-populate stage config as a starting point.)
