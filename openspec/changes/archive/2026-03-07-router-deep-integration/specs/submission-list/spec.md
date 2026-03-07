## MODIFIED Requirements

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
