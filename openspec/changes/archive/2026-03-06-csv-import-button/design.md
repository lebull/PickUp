## Context

The app currently fetches `public/submissions.csv` at startup via `loadSubmissions()`, which calls `fetch('/submissions.csv')`. This bundles confidential judge scores into the repository. The fix is to remove the static file and instead let users import their local copy at runtime through a file input in the browser.

The existing parsing pipeline (`loadSubmissions.ts` via PapaParse + `csvColumns.ts` + `scoreCalculation.ts`) is solid and reusable — only the data-ingestion entry point needs to change.

## Goals / Non-Goals

**Goals:**
- Add a "Import CSV" button in the top-right corner of the app UI
- Parse the uploaded file entirely in-browser using the existing PapaParse pipeline
- Show an empty/prompt state before any file is loaded
- Provide a clear error message for invalid or malformed files
- Remove `public/submissions.csv` from the repo

**Non-Goals:**
- Persisting the imported data across sessions (each visit requires a fresh import)
- Supporting other file formats (JSON, XLSX, etc.)
- Server-side file handling or uploads
- Drag-and-drop file import anywhere on the page when data is already loaded (only supported on the empty/prompt state)

## Decisions

**Refactor `loadSubmissions` to accept CSV text instead of fetching**

Current: `loadSubmissions()` does `fetch('/submissions.csv')` internally.
New: Extract a `parseSubmissions(csvText: string): Submission[]` function (sync) and keep `loadSubmissions()` as a thin async wrapper that reads `fetch` (or delete it entirely if no longer needed). The new `CsvImport` component calls `parseSubmissions` directly after reading the `File` via `FileReader` or `file.text()`.

Rationale: Keeps parsing logic centralized in `loadSubmissions.ts`; the component stays thin.

**State management stays in `App.tsx`**

`App.tsx` holds `submissions: Submission[] | null` state (null = not yet imported) and `importedFileName: string | null`. The `CsvImport` component receives an `onImport(submissions: Submission[], fileName: string) => void` callback. The filename is sourced from `File.name` at import time and displayed in the page heading in place of the static title. This avoids adding a state management library for what is a single piece of app-level state.

**Error handling: inline error below/near the button**

Import errors (bad format, wrong columns) surface as a short error string in the `CsvImport` component's local state, displayed inline. No toast library needed.

**Button placement: flex child in the app header, top-right**

The existing layout has an `App.css`-driven header. The import button will be added to the header element as a flex child pushed to the right — no absolute positioning needed, just `margin-left: auto` on the button wrapper.

**Drag-and-drop on the empty/prompt state**

When no CSV has been imported yet, the prompt area (the full-page empty state) SHALL act as a drop zone. The same `parseSubmissions` function handles the dropped file. Drag-and-drop is NOT active once data is loaded — the button is the only re-import path after initial load. This keeps the interaction model simple: drag-to-start, button-to-replace.

## Risks / Trade-offs

- **User must re-import each session** → Trade-off accepted; storing scores in localStorage would create a different confidentiality risk.
- **File validation only checks headers** (existing behavior) → If columns are present but data is malformed, the app may show blank fields rather than erroring; acceptable for now since the source sheet is controlled.
- **Removing `public/submissions.csv` is a breaking change in dev** → Developers without a local copy of the sheet will see the prompt state instead of data; this is the intended behavior and should be documented in the README.

## Migration Plan

1. Remove `public/submissions.csv` from the repo (already done via `git rm`).
2. Refactor `loadSubmissions.ts`: export `parseSubmissions(csvText: string): Submission[]`.
3. Create `src/components/CsvImport.tsx`.
4. Update `App.tsx`: replace startup `loadSubmissions()` call with empty-state + import handler.
5. Update README to instruct users to import their scoresheet on load.
