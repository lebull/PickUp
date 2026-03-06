## ADDED Requirements

### Requirement: Load and display submission list
The application SHALL parse the anonymized CSV file and display all submissions in a tabular list view with the following visible columns: DJ Name, Final Main Score, Final Moonlight Score, Genre, Preferred Stages, and Days Available.

#### Scenario: CSV loads successfully
- **WHEN** the application starts
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

### Requirement: Sort list by score
The application SHALL allow the user to sort the submission list by score.

#### Scenario: Sort by main score average
- **WHEN** user selects "Sort: Main Score (Avg)"
- **THEN** rows are sorted in descending order by the computed main score average

#### Scenario: Sort by main score sum
- **WHEN** user selects "Sort: Main Score (Sum)"
- **THEN** rows are sorted in descending order by the sum of all raw main judge score components

#### Scenario: Sort by Moonlight score average
- **WHEN** user selects "Sort: ML Score (Avg)"
- **THEN** rows are sorted in descending order by the computed ML score average

#### Scenario: Sort by Moonlight score sum
- **WHEN** user selects "Sort: ML Score (Sum)"
- **THEN** rows are sorted in descending order by the sum of all raw ML score components

#### Scenario: Submissions with no score sort last
- **WHEN** a submission has no scores for the selected sort dimension
- **THEN** it SHALL appear at the bottom of the sorted list

### Requirement: Filter list by day available
The application SHALL allow the user to filter the submission list to show only DJs available on a selected day.

#### Scenario: Filter by a single day
- **WHEN** user selects a day from the day filter (e.g., "Friday")
- **THEN** only submissions whose Days Available field contains that day are shown

#### Scenario: Clear day filter
- **WHEN** user selects "All Days" in the day filter
- **THEN** all submissions are shown regardless of availability

### Requirement: Navigate to detail view
The application SHALL allow the user to click a submission row to open the detail view for that submission.

#### Scenario: Row click navigates to detail
- **WHEN** user clicks on any row in the submission list
- **THEN** the detail view for that submission is displayed

#### Scenario: Return to list from detail
- **WHEN** user clicks the Back button in the detail view
- **THEN** the list view is displayed again
