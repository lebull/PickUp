## 1. Refactor CSV Parsing

- [x] 1.1 Export a `parseSubmissions(csvText: string): Submission[]` function from `loadSubmissions.ts` containing the existing parsing logic
- [x] 1.2 Remove (or deprecate) the `loadSubmissions()` async fetch wrapper — it is no longer needed
- [x] 1.3 Remove `public/submissions.csv` from the repo if not already done

## 2. Create CsvImport Component

- [x] 2.1 Create `src/components/CsvImport.tsx` with a hidden `<input type="file" accept=".csv">` and a visible "Import CSV" button that triggers it
- [x] 2.2 On file selection, read the file using `file.text()` and call `parseSubmissions()` with the result
- [x] 2.3 Call the `onImport(submissions)` callback prop with the parsed data on success
- [x] 2.4 On parse error (thrown by `validateHeaders` or empty result), store the error message in local state and display it inline near the button
- [x] 2.5 Clear the error message on a subsequent successful import

## 3. Drag-and-Drop on Empty State

- [x] 3.1 Add `onDragOver` / `onDrop` handlers to the prompt/empty-state area in `App.tsx` (or a dedicated `DropZone` wrapper)
- [x] 3.2 In the drop handler, extract the first `File` from `event.dataTransfer.files`, read it with `file.text()`, and call `parseSubmissions()`
- [x] 3.3 Apply a CSS highlight class to the prompt area while a drag is active (`onDragEnter` / `onDragLeave` to toggle)
- [x] 3.4 Reuse the same error-state logic as the button import to surface parse errors
- [x] 3.5 Ensure drag handlers are only attached when `submissions` is `null` (no active drop zone after data loads)

## 4. Update App State and Layout

- [x] 4.1 Replace the startup `loadSubmissions()` call in `App.tsx` with `submissions: Submission[] | null` state initialized to `null`, and add `importedFileName: string | null` state
- [x] 4.2 Add `<CsvImport onImport={...}>` to the app header, aligned to the right (e.g., `margin-left: auto`)
- [x] 4.3 When `submissions` is `null`, render the prompt/drop-zone area instead of the submission list/detail
- [x] 4.4 When `submissions` is set, render the existing `SubmissionList` / `SubmissionDetail` flow as before
- [x] 4.5 Replace the static "FWA 2026 DJ Submissions" heading with `importedFileName` when set, falling back to the default title when `null`
- [x] 4.6 Pass `File.name` to the `onImport` callback from both the button and drag-and-drop paths

## 5. Verification

- [x] 5.1 Confirm app starts with the prompt state and no table is shown
- [x] 5.2 Confirm importing the real scoresheet CSV via button populates the list correctly
- [x] 5.3 Confirm importing a bad CSV shows an inline error and does not populate the list
- [x] 5.4 Confirm the Import CSV button is visible in the top-right corner in all states
- [x] 5.5 Confirm dragging a valid CSV onto the empty state loads data correctly
- [x] 5.6 Confirm drop zone highlights during drag and that drag-and-drop is inactive once data is loaded
- [x] 5.7 Confirm page heading shows the imported filename after a successful import
- [x] 5.8 Confirm page heading shows the default title before any import
