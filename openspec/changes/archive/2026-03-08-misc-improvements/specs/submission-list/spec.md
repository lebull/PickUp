## MODIFIED Requirements

### Requirement: Load and display submission list
The application SHALL parse a user-supplied CSV file — imported via the CSV import button — and display all submissions in a tabular list view with the following visible columns: DJ Name (or anonymous ID when Hidden Names is active), Final Main Score, Final Moonlight Score, Genre, Preferred Stages, Days Available. When the active app context is Moonlight, a Vibefit column SHALL also be displayed. The list SHALL default to sorting by submission number ascending. The controls row SHALL display the total submission count and, when a day filter is active, the count of currently visible (filtered) submissions.

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

#### Scenario: Filtered count shown when day filter is active
- **WHEN** one or more day toggles are active
- **THEN** the controls row SHALL show both the filtered count and the total (e.g. "34 / 120 submissions")

## ADDED Requirements

### Requirement: Sort list by submission number
The application SHALL allow the user to sort the submission list by submission number. Submission numbers SHALL be compared as integers (not lexicographically) when sorting.

#### Scenario: Default sort is submission number ascending
- **WHEN** the submission list is first loaded or the app context changes
- **THEN** the active sort SHALL be submission number ascending
- **THEN** the submission number column header SHALL display an upward arrow (▲)

#### Scenario: Clicking submission number header toggles direction
- **WHEN** the user clicks the submission number column header while it is the active sort
- **THEN** the sort direction SHALL toggle between ascending and descending
- **THEN** the header arrow SHALL update accordingly
