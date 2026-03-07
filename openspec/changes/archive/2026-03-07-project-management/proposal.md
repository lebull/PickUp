## Why

The current persistence model keys lineup state off of the imported CSV filename, which means users cannot manage multiple events, cannot distinguish between projects with the same filename, and have no way to package up all event data (submissions + lineup) for sharing or backup. As FWA grows, organizers need to manage multiple events or run-throughs without losing prior work.

## What Changes

- Introduce a **Project** entity that groups a CSV import, stage configuration, and slot assignments under a user-defined name.
- Replace the CSV-filename-keyed storage model with project-keyed storage. **BREAKING**: existing per-filename lineup saves will not automatically migrate to projects.
- Add a **Project List** view as the new app entry point, showing all saved projects.
- Add a **Create Project** view where users provide a project name to initialize a new project.
- Within a project, the CSV import replaces the existing submission data for that project (re-importable).
- Add **Project Export** — serialize a project (name, stage config, assignments, raw CSV data) to a JSON file for backup or transfer.
- Add **Project Import** — load a previously exported JSON file to restore a project.

## Capabilities

### New Capabilities

- `project-store`: Core data model and IndexedDB persistence for projects — CRUD operations keyed by project ID, including CSV blob storage and lineup state within each project record.
- `project-list`: View that displays all saved projects with actions to open, delete, export, or create a new project.
- `project-create`: View/flow for creating a new named project.
- `project-export-import`: Serialization of a full project to a downloadable JSON file and corresponding import flow to restore from file.

### Modified Capabilities

- `lineup-persistence`: **BREAKING** — storage key changes from CSV filename to project ID. The requirement for restoring lineup on re-import and the row-count-mismatch warning still apply, but scoped to the project rather than the filename.
- `csv-import`: CSV import now operates within the context of an active project, replacing the project's stored submission data rather than acting as global state.

## Impact

- `src/lineupStorage.ts` — replaced by new project store module
- `src/types.ts` — new `Project` type added; `LineupState` embedded in project
- `src/App.tsx` — routing/view logic updated to support project list, create, and active-project views
- `src/loadSubmissions.ts` — CSV loading scoped to active project context
- `idb` dependency already present; no new dependencies expected
