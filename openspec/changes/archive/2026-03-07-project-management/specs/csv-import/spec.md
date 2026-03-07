## MODIFIED Requirements

### Requirement: Import CSV button
The application SHALL provide a visible "Import CSV" button within an active project's workspace that opens a native file picker restricted to `.csv` files.

#### Scenario: Button is visible within a project
- **WHEN** the organizer has an active project open
- **THEN** the "Import CSV" button SHALL be visible in the project workspace header

#### Scenario: Clicking button opens file picker
- **WHEN** user clicks the "Import CSV" button
- **THEN** a native OS file picker opens, filtered to accept only `.csv` files

### Requirement: Parse and load imported CSV into project
Upon file selection, the application SHALL parse the chosen CSV file entirely in-browser using the existing parsing pipeline and store the raw CSV text and parsed submissions within the active project.

#### Scenario: Valid CSV is loaded into project
- **WHEN** user selects a valid scoresheet CSV file within an active project
- **THEN** the file is parsed using the existing column mapping and score calculation logic
- **THEN** the submission list for the active project is populated with all parsed submissions
- **THEN** any previously loaded CSV data for this project is replaced
- **THEN** the raw CSV text is saved to the project's `csvText` field in IndexedDB

#### Scenario: File reading is synchronous in-browser
- **WHEN** user selects a file
- **THEN** the file SHALL be read using the browser's `File.text()` API without any server round-trip

### Requirement: CSV import error handling
The application SHALL display an inline error message near the import button when the selected file cannot be parsed successfully.

#### Scenario: File has wrong or missing columns
- **WHEN** user selects a CSV file that does not contain the expected header columns
- **THEN** the project's submission data SHALL NOT be updated
- **THEN** a descriptive error message SHALL be displayed inline near the import button

#### Scenario: File is empty or has no data rows
- **WHEN** user selects a CSV file that contains only a header row or is completely empty
- **THEN** the submission list SHALL NOT update with any entries
- **THEN** an appropriate error or empty-state message SHALL be shown

#### Scenario: Successful import clears any previous error
- **WHEN** a previously failed import is followed by a successful import
- **THEN** the error message is cleared and the new data is displayed

## REMOVED Requirements

### Requirement: Drag-and-drop import on empty state
**Reason**: The empty-state concept no longer applies at the app level — the Project List view is now the app entry point. Within a project, the workspace is always shown regardless of CSV state. Drag-and-drop can be reconsidered as a UX enhancement in a future change.
**Migration**: Use the "Import CSV" button within a project to load submissions.

### Requirement: Page title reflects imported filename
**Reason**: The app now displays the project name as the active context heading. The CSV filename is no longer the primary identifier.
**Migration**: The project name is shown in the workspace header instead.
