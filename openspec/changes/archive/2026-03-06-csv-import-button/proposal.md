## Why

Currently, the app loads submission data from a CSV baked into the codebase (`public/submissions.csv`). This exposes confidential scoring data in the repository. Users need a way to supply their own copy of the scoresheet at runtime without any data being committed to the repo.

## What Changes

- Add a CSV import button in the top-right corner of the app header
- Remove the static bundled `public/submissions.csv` from the codebase
- App starts with an empty/prompt state until the user imports a file
- On file selection, parse the CSV in-browser and load submissions into app state
- If the file is invalid or missing required columns, show a clear error message

## Capabilities

### New Capabilities
- `csv-import`: File input button (top-right) that lets the user select a local CSV scoresheet, parses it in-browser, and populates the submission list. Handles invalid file gracefully with an error message.

### Modified Capabilities
- `submission-list`: The list now renders an empty/prompt state when no data has been loaded yet, instead of always having data available on mount.

## Impact

- `src/App.tsx`: Add import button component; manage loaded-data state; conditionally render prompt vs. list
- `src/loadSubmissions.ts`: Refactor to accept CSV text input instead of fetching from a static path
- `src/components/CsvImport.tsx` (new): Button + file input + parse logic
- `public/submissions.csv`: Remove from repo (no longer bundled)
- Users must import their copy of the scoresheet each session
