## ADDED Requirements

### Requirement: Import CSV button
The application SHALL provide a visible "Import CSV" button in the top-right corner of the page header that opens a native file picker restricted to `.csv` files.

#### Scenario: Button is always visible
- **WHEN** the application loads (with or without data)
- **THEN** the "Import CSV" button SHALL be visible in the top-right corner of the header

#### Scenario: Clicking button opens file picker
- **WHEN** user clicks the "Import CSV" button
- **THEN** a native OS file picker opens, filtered to accept only `.csv` files

### Requirement: Parse and load imported CSV
Upon file selection, the application SHALL parse the chosen CSV file entirely in-browser using the existing parsing pipeline and populate the submission list with the resulting data.

#### Scenario: Valid CSV is loaded
- **WHEN** user selects a valid scoresheet CSV file
- **THEN** the file is parsed using the existing column mapping and score calculation logic
- **THEN** the submission list is populated with all parsed submissions
- **THEN** any previously loaded data is replaced

#### Scenario: File reading is synchronous in-browser
- **WHEN** user selects a file
- **THEN** the file SHALL be read using the browser's `File.text()` API without any server round-trip

### Requirement: CSV import error handling
The application SHALL display an inline error message near the import button when the selected file cannot be parsed successfully.

#### Scenario: File has wrong or missing columns
- **WHEN** user selects a CSV file that does not contain the expected header columns
- **THEN** the submission list SHALL NOT be updated
- **THEN** a descriptive error message SHALL be displayed inline near the import button

#### Scenario: File is empty or has no data rows
- **WHEN** user selects a CSV file that contains only a header row or is completely empty
- **THEN** the submission list SHALL NOT update with any entries
- **THEN** an appropriate error or empty-state message SHALL be shown

#### Scenario: Successful import clears any previous error
- **WHEN** a previously failed import is followed by a successful import
- **THEN** the error message is cleared and the new data is displayed

### Requirement: Drag-and-drop import on empty state
When no CSV has been imported yet, the application SHALL accept a `.csv` file dragged and dropped onto the empty/prompt area as an alternative to using the file picker button.

#### Scenario: Valid CSV dropped onto empty state
- **WHEN** user drags a valid CSV file and drops it onto the prompt area
- **THEN** the file is parsed using the existing pipeline
- **THEN** the submission list is populated with the parsed submissions

#### Scenario: Invalid CSV dropped onto empty state
- **WHEN** user drags an invalid or malformed CSV file and drops it onto the prompt area
- **THEN** the submission list SHALL NOT be populated
- **THEN** an inline error message SHALL be displayed

#### Scenario: Drop zone provides visual feedback during drag
- **WHEN** user drags a file over the prompt area
- **THEN** the prompt area SHALL display a highlighted/active visual state to indicate it is an active drop target

#### Scenario: Drag-and-drop is not active after data is loaded
- **WHEN** submissions have already been imported and are displayed
- **THEN** dragging a file over the page SHALL NOT trigger a drop zone
- **THEN** re-importing requires using the Import CSV button

### Requirement: Page title reflects imported filename
After a successful import, the application SHALL update the page heading to display the imported file's name in place of the default title.

#### Scenario: Title updates after successful import
- **WHEN** user successfully imports a CSV file (via button or drag-and-drop)
- **THEN** the page heading SHALL display the imported filename (e.g., `FWA 2026 DJ Submissions.csv`)

#### Scenario: Default title shown before any import
- **WHEN** no CSV has been imported yet
- **THEN** the page heading SHALL display the default title "FWA 2026 DJ Submissions"
