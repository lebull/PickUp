## MODIFIED Requirements

### Requirement: Load and display submission list
The application SHALL parse a user-supplied CSV file — imported via the CSV import button — and display all submissions in a tabular list view with the following visible columns: DJ Name (or anonymous ID when Hidden Names is active), Final Main Score, Final Moonlight Score, Genre, Preferred Stages, Days Available. When the active app context is Moonlight, a Vibefit column SHALL also be displayed. The list SHALL default to sorting by the score column matching the active app context (Main Score for Standard, ML Score for Moonlight), descending. The controls row SHALL display the total submission count and, when a day filter is active, the count of currently visible (filtered) submissions.

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

#### Scenario: Default sort on load is active-context score descending
- **WHEN** the submission list is first displayed after CSV import
- **THEN** rows SHALL be sorted by the score column matching the active app context (Final Main Score for Standard, Final ML Score for Moonlight), in descending order

#### Scenario: Hidden Names mode masks DJ Name column
- **WHEN** `hiddenNames` is true and the submission list is displayed
- **THEN** the DJ Name column SHALL show `DJ #N` (1-based load-order index) instead of the real name

#### Scenario: Total count shown in controls row
- **WHEN** the submission list is displayed
- **THEN** the controls row SHALL show the total number of submissions (e.g. "120 submissions")

#### Scenario: Filtered count shown when day filter is active
- **WHEN** one or more day toggles are active
- **THEN** the controls row SHALL show both the filtered count and the total (e.g. "34 / 120 submissions")
