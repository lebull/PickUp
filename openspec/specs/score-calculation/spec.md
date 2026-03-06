## ADDED Requirements

### Requirement: Parse judge scores from CSV by column index
The score calculation module SHALL access judge score values by fixed column index rather than by header name, due to mislabeled headers in the source CSV.

#### Scenario: Judge 1 scores read from correct columns
- **WHEN** parsing a CSV row
- **THEN** Judge 1 Technical, Flow, and Entertainment SHALL be read from column indices 24, 25, and 26 respectively

#### Scenario: Judge 2 scores read from correct columns
- **WHEN** parsing a CSV row
- **THEN** Judge 2 Technical, Flow, and Entertainment SHALL be read from column indices 32, 33, and 34 respectively (columns 28–31 are always empty and SHALL be ignored)

#### Scenario: ML scores read from correct columns
- **WHEN** parsing a CSV row
- **THEN** Judge ML Technical, Flow, and Entertainment SHALL be read from column indices 36, 37, and 38 respectively; Vibefit (index 39) is a non-numeric marker and SHALL NOT be included in score calculations

### Requirement: Compute per-judge average score
For each judge, the system SHALL compute an average score as the mean of that judge's Technical, Flow, and Entertainment values.

#### Scenario: All three components present
- **WHEN** a judge's Technical, Flow, and Entertainment values are all non-empty numbers
- **THEN** that judge's score SHALL equal `(Technical + Flow + Entertainment) / 3`, rounded to two decimal places

#### Scenario: One or more components missing
- **WHEN** any of a judge's three score components is empty or non-numeric
- **THEN** that judge's score SHALL be treated as absent (null/undefined) and excluded from cross-judge averaging

### Requirement: Compute Final Main Score
The system SHALL compute a Final Main Score by averaging the scores of Judge 1 and Judge 2.

#### Scenario: Both judges have scored
- **WHEN** both Judge 1 and Judge 2 have valid average scores
- **THEN** Final Main Score (avg) SHALL equal `(Judge1Avg + Judge2Avg) / 2`, rounded to two decimal places
- **THEN** Final Main Score (sum) SHALL equal the sum of all six raw component scores (J1 Technical + J1 Flow + J1 Entertainment + J2 Technical + J2 Flow + J2 Entertainment)

#### Scenario: Only one judge has scored
- **WHEN** exactly one of Judge 1 or Judge 2 has a valid average score and the other is absent
- **THEN** Final Main Score (avg) SHALL equal that single judge's average
- **THEN** a partial-score indicator SHALL be set so the UI can display a visual warning

#### Scenario: No judges have scored
- **WHEN** both Judge 1 and Judge 2 scores are absent
- **THEN** Final Main Score SHALL be null

### Requirement: Compute Final Moonlight Score
The system SHALL compute a Final Moonlight Score for submissions that have Moonlight judge data.

#### Scenario: All ML components present
- **WHEN** Judge ML Technical, Flow, and Entertainment are all non-empty numbers
- **THEN** Final ML Score (avg) SHALL equal `(ML Technical + ML Flow + ML Entertainment) / 3`, rounded to two decimal places
- **THEN** Final ML Score (sum) SHALL equal `ML Technical + ML Flow + ML Entertainment`

#### Scenario: ML scores absent
- **WHEN** all ML score columns are empty
- **THEN** Final ML Score SHALL be null

### Requirement: Handle non-numeric score values
The score calculation module SHALL treat any cell value that is not a finite number as absent rather than throwing an error.

#### Scenario: Empty string in score cell
- **WHEN** a score cell contains an empty string
- **THEN** it SHALL be treated as absent (not 0)

#### Scenario: Non-numeric string in score cell
- **WHEN** a score cell contains a non-numeric string (e.g., "X", "N/A")
- **THEN** it SHALL be treated as absent (not 0)
