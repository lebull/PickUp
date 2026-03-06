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

### Requirement: Empty state before import
The application SHALL display a prompt state — rather than an empty table — when no CSV has been imported yet.

#### Scenario: Initial load shows prompt
- **WHEN** the application first loads and no file has been imported
- **THEN** the submission list table SHALL NOT be rendered
- **THEN** a prompt message SHALL be displayed instructing the user to import a CSV file
