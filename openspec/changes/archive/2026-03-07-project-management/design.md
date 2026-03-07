## Context

The app currently uses IndexedDB keyed by CSV filename (`lineupStorage.ts`) to persist lineup state. This one-to-one mapping is fragile — two events with the same filename share storage, and there's no way for users to switch between projects or export their work. The app's state is monolithic in `App.tsx` with no routing layer.

## Goals / Non-Goals

**Goals:**
- Introduce a `Project` entity as the top-level container for all event data (name, CSV blob, stage config, assignments)
- Replace filename-keyed storage with project-ID-keyed storage in IndexedDB
- Add a Project List view as the app entry point
- Add a Create Project view (name only, MVP)
- Allow CSV re-import to overwrite submission data within a project without disrupting lineup state (unless row count diverges)
- Add project export (full JSON) and import (restore from JSON)

**Non-Goals:**
- Cloud sync or multi-user collaboration
- Project rename or copy operations (post-MVP)
- Migrating existing filename-keyed lineup data to projects
- Authentication or access control

## Decisions

### Decision: Project as the primary storage unit
**Decision**: Each `Project` record holds all associated data: `{ id, name, csvText, stages, assignments, rowCount, createdAt, updatedAt }`. One IndexedDB object store (`projects`) replaces the existing `lineups` store.  
**Alternatives**:
- Separate stores for projects, lineups, and CSV blobs → more relational but unnecessary complexity for a single-user browser app.  
**Rationale**: Keeping everything in one record simplifies export (one `db.get` = full export), reduces store management, and aligns with the app's scope.

### Decision: Project ID is a UUID (crypto.randomUUID)
**Decision**: Use `crypto.randomUUID()` for project IDs.  
**Rationale**: No server, no coordination needed; UUIDs are collision-free and produce clean IndexedDB keys without encoding issues.

### Decision: Introduce react-router-dom for view routing
**Decision**: Add `react-router-dom` and use declarative routes for the three views: `/` (Project List), `/new` (Create Project), and `/project/:id` (Project Workspace).  
**Alternatives**:  
- App-level state enum (`'list' | 'create' | 'project'`) → no deep-link support, browser back/forward broken, harder to extend.  
**Rationale**: This is the natural point to establish a routing foundation — the app is gaining multiple distinct views for the first time. React Router enables browser history navigation, bookmarkable project URLs via `/project/:id`, and a clean extension point for any future views. The bundle cost is negligible given the app's existing dependencies.

### Decision: Export format is pretty-printed JSON
**Decision**: Project export serializes the entire project record as indented JSON and triggers a browser download named `<project-name>.pickup.json`.  
**Rationale**: Human-readable for debugging; easy to re-import; no dependency needed (no zip, no binary format).

### Decision: Import re-uses the Create Project flow with pre-filled data
**Decision**: "Import Project" is a file picker (`.pickup.json`) on the Project List view. Parsing inserts the project into IndexedDB and navigates to it directly.  
**Rationale**: Keeps the UX minimal and avoids a separate import view.

### Decision: Breaking change — no migration of old lineup data
**Decision**: Existing filename-keyed data in the `lineups` store is not migrated.  
**Rationale**: The app is in active development with no known production users. A one-time storage bump (`DB_VERSION` increment) with a note in the changelog is sufficient.

## Risks / Trade-offs

- **No migration for existing users** → Mitigation: Document in release notes; app gracefully starts fresh if old store is present.
- **Large CSV blobs stored in IndexedDB** → Mitigation: Acceptable for typical DJ submission sheets (< 1 MB); no chunking needed.
- **Export JSON could be large** → Mitigation: Same rationale; browser `Blob` + `createObjectURL` handles it fine.
- **UUID collisions** → Effectively zero probability with `crypto.randomUUID`.

## Migration Plan

1. Bump `DB_VERSION` in the new project store module (old `lineups` store is dropped during upgrade).
2. On first load after upgrade, IndexedDB upgrade callback creates the new `projects` store.
3. Ship as a minor version bump; no server-side steps needed.

## Open Questions

- Should projects display a "last modified" timestamp in the list? *(Included in data model; display is deferred to UX polish.)*
- Should deleting a project require a confirmation dialog? *(Yes — align with existing "Clear Lineup" confirm pattern.)*
