## MODIFIED Requirements

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
