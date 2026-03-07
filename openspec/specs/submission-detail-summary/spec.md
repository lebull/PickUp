## ADDED Requirements

### Requirement: Summary section at top of submission detail view
The submission detail view SHALL display a compact summary section immediately after the DJ name heading and before any detailed sections. The summary SHALL include the Final Main Score, Final Moonlight Score (or an em dash if not applicable), and Genre.

#### Scenario: Summary shows final main score
- **WHEN** a submission detail view is open
- **THEN** the summary section SHALL display the Final Main Score (average) prominently

#### Scenario: Summary shows final ML score when applicable
- **WHEN** a submission detail view is open and the submission has Moonlight interest
- **THEN** the summary section SHALL display the Final ML Score (average)

#### Scenario: Summary shows em dash for ML score when not applicable
- **WHEN** a submission detail view is open and the submission does not have Moonlight interest (or has no ML scores)
- **THEN** the summary section SHALL display "—" for the ML Score field

#### Scenario: Summary shows genre
- **WHEN** a submission detail view is open
- **THEN** the summary section SHALL display the Genre value (or "—" if empty)

#### Scenario: Summary is visually distinct from detail sections
- **WHEN** a submission detail view is open
- **THEN** the summary section SHALL be styled differently from the body sections (e.g. card/banner treatment) to provide clear at-a-glance recognition

#### Scenario: Summary appears before all other sections
- **WHEN** a submission detail view is open
- **THEN** the summary section SHALL appear immediately after the DJ name and before the Basic Info section
- **THEN** the summary section SHALL NOT be rendered after any other detail section
