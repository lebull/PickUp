## REMOVED Requirements

### Requirement: Filter list by days available
**Reason**: The day filter is no longer needed on the submissions browser page. Day availability can still be read directly from the Days Available column. Fuzzy DJ name search (see `submission-list-search`) replaces this control area.
**Migration**: Remove day toggle buttons and `activeDays` state from `SubmissionsView`. Remove `activeDays` prop and related filtering logic from `SubmissionList`. The filtered count label remains but now only reflects the search filter.

## MODIFIED Requirements

### Requirement: Load and display submission list
The application SHALL parse a user-supplied CSV file — imported via the CSV import button — and display all submissions in a tabular list view with the following visible columns: DJ Name (or anonymous ID when Hidden Names is active), Final Main Score, Final Moonlight Score, Genre, Preferred Stages, Stage Assignment (when the stage-assignment toggle is on), Days Available. When the active app context is Moonlight, a Vibefit column SHALL also be displayed. The list SHALL default to sorting by submission number ascending. The controls row SHALL display the total submission count and, when a search or filter is active, the count of currently visible submissions.

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

#### Scenario: Default sort on load is submission number ascending
- **WHEN** the submission list is first displayed after CSV import
- **THEN** rows SHALL be sorted by submission number in ascending order

#### Scenario: Default sort resets to submission number when app context changes
- **WHEN** the active app context changes between Standard and Moonlight
- **THEN** the sort SHALL reset to submission number ascending

#### Scenario: Hidden Names mode masks DJ Name column
- **WHEN** `hiddenNames` is true and the submission list is displayed
- **THEN** the DJ Name column SHALL show `DJ #N` (1-based load-order index) instead of the real name

#### Scenario: Total count shown in controls row
- **WHEN** the submission list is displayed
- **THEN** the controls row SHALL show the total number of submissions (e.g. "120 submissions")

#### Scenario: Filtered count shown when search is active
- **WHEN** the name search bar contains text that reduces the visible count
- **THEN** the controls row SHALL show both the filtered count and the total (e.g. "34 / 120 submissions")
