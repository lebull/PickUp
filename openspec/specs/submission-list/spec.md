## ADDED Requirements

### Requirement: Load and display submission list
The application SHALL parse a user-supplied CSV file — imported via the CSV import button — and display all submissions in a tabular list view with the following visible columns: DJ Name, Final Main Score, Final Moonlight Score, Genre, Preferred Stages, and Days Available.

#### Scenario: CSV loads successfully after import
- **WHEN** the user imports a valid scoresheet CSV via the import button
- **THEN** all rows from the CSV are displayed in the list, one row per submission

#### Scenario: Missing Moonlight score
- **WHEN** a submission has no Moonlight judge scores (ML columns are empty)
- **THEN** the Final Moonlight Score cell displays "—" (em dash) rather than a number

#### Scenario: Preferred Stages displayed as single field
- **WHEN** a submission has one or more stage preferences ranked
- **THEN** all non-empty stage preference values SHALL be joined and displayed as a single comma-separated string in the Preferred Stages column

#### Scenario: Days Available displayed as single field
- **WHEN** a submission has one or more days listed in the availability field
- **THEN** they SHALL be displayed as a single string in the Days Available column

### Requirement: Empty state before import
The application SHALL display a prompt state — rather than an empty table — when no CSV has been imported yet.

#### Scenario: Initial load shows prompt
- **WHEN** the application first loads and no file has been imported
- **THEN** the submission list table SHALL NOT be rendered
- **THEN** a prompt message SHALL be displayed instructing the user to import a CSV file

### Requirement: Sort list by score
The application SHALL allow the user to sort the submission list by score by clicking column headers in the table.

#### Scenario: Click score column header to sort descending
- **WHEN** user clicks the "Main Score" or "ML Score" column header for the first time (or when that column is not the active sort)
- **THEN** rows are sorted in descending order by that column's score value using the current score metric (avg or sum)
- **THEN** the clicked header SHALL display a downward arrow (▼) indicating descending sort

#### Scenario: Click active sort column header to reverse direction
- **WHEN** user clicks the column header that is already the active sort column
- **THEN** the sort direction SHALL toggle between descending and ascending
- **THEN** the header arrow SHALL update to reflect the new direction (▼ for desc, ▲ for asc)

#### Scenario: Score metric dropdown changes sort value
- **WHEN** user changes the score metric dropdown between "Average" and "Sum"
- **THEN** the current sort column SHALL re-sort using the newly selected metric
- **THEN** no change to sort column or direction occurs

#### Scenario: Submissions with no score sort last
- **WHEN** a submission has no scores for the active sort column
- **THEN** it SHALL appear at the bottom of the sorted list regardless of sort direction

#### Scenario: Non-score columns are not sortable
- **WHEN** user clicks the DJ Name, Genre, Preferred Stages, or Days Available column header
- **THEN** no sort change occurs and no arrow is displayed on that header

### Requirement: Filter list by days available
The application SHALL allow the user to filter the submission list by one or more days using toggle buttons.

#### Scenario: Toggle a day on
- **WHEN** user clicks a day button that is not currently active (e.g., "Friday")
- **THEN** the button becomes active (highlighted)
- **THEN** only submissions whose Days Available field contains at least one of the currently active days are shown

#### Scenario: Toggle a day off
- **WHEN** user clicks a day button that is currently active
- **THEN** the button becomes inactive
- **THEN** the filter updates to reflect the remaining active days

#### Scenario: No days active shows all submissions
- **WHEN** no day buttons are active
- **THEN** all submissions are shown regardless of availability

#### Scenario: Multiple days active shows union
- **WHEN** two or more day buttons are active (e.g., "Friday" and "Saturday")
- **THEN** submissions available on Friday OR Saturday are shown (union, not intersection)

#### Scenario: Active day buttons are visually distinct
- **WHEN** a day button is active
- **THEN** it SHALL have a visually distinct appearance (e.g., filled background) compared to inactive buttons

### Requirement: Selecting a submission navigates to a detail route
Clicking a submission row SHALL navigate to a URL-addressable detail view rather than toggling local state. The detail panel URL SHALL be `/project/:id/submissions/:djIndex` where `:djIndex` is the 0-based integer position in the currently rendered (sorted and filtered) list.

#### Scenario: Clicking a row navigates to detail URL
- **WHEN** the user clicks a submission row in the list
- **THEN** the browser SHALL navigate to `/project/:id/submissions/:djIndex`
- **THEN** the submission detail panel SHALL be displayed for that submission

#### Scenario: Detail URL is bookmarkable
- **WHEN** the user copies the detail URL and opens it in a new tab
- **THEN** the submission detail panel for that index SHALL load directly

#### Scenario: Browser back from detail returns to list
- **WHEN** the user is viewing a submission detail and presses the browser back button
- **THEN** the app SHALL return to `/project/:id/submissions` with no detail panel shown

#### Scenario: Back button in detail panel navigates back
- **WHEN** the user clicks the back/close control within the submission detail panel
- **THEN** the app SHALL navigate back to `/project/:id/submissions`

### Requirement: Submission list pool view in Lineup Builder
When the Lineup Builder mode is active, the submission list SHALL be accessible as a read-only reference panel (the "pool") showing unscheduled DJs for the currently selected evening. This is separate from the full Submission Browser tab.

#### Scenario: Pool filters by evening availability and global assignment status
- **WHEN** the organizer is viewing an evening in Lineup Builder
- **THEN** only submissions whose days-available includes that evening are shown in the pool panel
- **THEN** submissions already assigned to any slot anywhere in the lineup (any evening, any stage) SHALL NOT appear in the pool

#### Scenario: Clicking a pool entry assigns to selected slot
- **WHEN** a grid slot is selected (awaiting assignment) and the organizer clicks a DJ in the pool
- **THEN** that DJ is assigned to the selected slot
