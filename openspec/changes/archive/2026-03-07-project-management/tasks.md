## 1. Data Model & Storage

- [x] 1.1 Add `Project` type to `src/types.ts` with fields: `id`, `name`, `csvText`, `stages`, `assignments`, `rowCount`, `createdAt`, `updatedAt`
- [x] 1.2 Create `src/projectStore.ts` — replace `lineupStorage.ts` with project-scoped CRUD: `createProject`, `getProject`, `listProjects`, `saveProject`, `deleteProject`
- [x] 1.3 Bump IndexedDB `DB_VERSION`, create `projects` store in upgrade callback, drop old `lineups` store if present
- [x] 1.4 Implement `exportProject(project)` — serializes project to a `Blob` and triggers browser download as `<name>.pickup.json`
- [x] 1.5 Implement `importProjectFromFile(file)` — parses JSON, validates schema, assigns a new UUID, saves to IndexedDB, returns the new project

## 2. App Routing

- [x] 2.1 Install `react-router-dom` (`npm i react-router-dom`)
- [x] 2.2 Wrap the app in `<BrowserRouter>` in `src/main.tsx`
- [x] 2.3 Define routes in `App.tsx`: `/` → `ProjectList`, `/new` → `ProjectCreate`, `/project/:id` → project workspace
- [x] 2.4 Replace all view-state navigation calls with `useNavigate` / `<Link>` / `navigate('/project/:id')`

## 3. Project List View

- [x] 3.1 Create `src/components/ProjectList.tsx` — renders list of projects sorted by `updatedAt` desc with Open, Export, Delete actions
- [x] 3.2 Implement empty-state UI in `ProjectList` with a "New Project" CTA
- [x] 3.3 Wire Delete action with an inline confirmation prompt (align with existing clear-lineup confirm pattern)
- [x] 3.4 Wire Export action to `exportProject`
- [x] 3.5 Add "Import Project" button to project list header with a file picker for `.json` files; wire to `importProjectFromFile`
- [x] 3.6 Add "New Project" button that calls `navigate('/new')`

## 4. Create Project View

- [x] 4.1 Create `src/components/ProjectCreate.tsx` — form with a name field, Create button, and Cancel button
- [x] 4.2 Validate that name is non-empty on submit; show inline error if blank
- [x] 4.3 On submit: call `createProject`, then `navigate('/project/:id')` with the new project's ID
- [x] 4.4 On cancel: call `navigate('/')` without creating a project

## 5. Project Workspace Integration

- [x] 5.1 Refactor `App.tsx` project workspace section to read/write submissions and lineup from/to the active `Project` record instead of using filename-keyed `lineupStorage`
- [x] 5.2 Update `handleImport` so importing a CSV saves raw `csvText` and submissions to the active project, replacing prior data
- [x] 5.3 Update auto-save debounce to call `saveProject` (not the old `saveLineup`)
- [x] 5.4 On project open, parse `csvText` back into submissions if `csvText` is non-empty; restore stages and assignments from project record
- [x] 5.5 Display active project name in the workspace header; add a `<Link to="/">← Projects</Link>` back-navigation control

## 6. Cleanup

- [x] 6.1 Remove `src/lineupStorage.ts` (replaced by `src/projectStore.ts`)
- [x] 6.2 Remove all imports of `lineupStorage` from `App.tsx` and any other files
- [x] 6.3 Verify no remaining references to the old filename-keyed storage pattern
