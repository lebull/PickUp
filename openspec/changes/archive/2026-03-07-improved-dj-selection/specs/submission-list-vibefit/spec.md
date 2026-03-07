## ADDED Requirements

### Requirement: Vibefit column visible in submission list when Moonlight context is active
When the active app context is Moonlight, the submission list SHALL display a Vibefit column showing the ML Vibefit value for each submission.

#### Scenario: Vibefit column appears in Moonlight context
- **WHEN** the active app context is Moonlight and the submission list is displayed
- **THEN** a "Vibefit" column SHALL be rendered in the submission table

#### Scenario: Vibefit column hidden in Standard context
- **WHEN** the active app context is Standard
- **THEN** the Vibefit column SHALL NOT be rendered in the submission table

#### Scenario: Vibefit value displayed for submissions with ML data
- **WHEN** a submission has a non-empty ML Vibefit field and the Moonlight context is active
- **THEN** the Vibefit cell SHALL display the raw Vibefit value from the CSV (it is a non-numeric marker/label, not a score)

#### Scenario: Vibefit cell shows em dash when value is absent
- **WHEN** a submission has no ML Vibefit value and the Moonlight context is active
- **THEN** the Vibefit cell SHALL display "—" (em dash)
