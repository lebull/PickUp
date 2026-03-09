## ADDED Requirements

### Requirement: View stage assignments toggle controls column and color coding
The submission list controls SHALL include a "View stage assignments" toggle. When the toggle is off (default), neither the Stage Assignment column nor per-row stage color tinting SHALL be visible. When the toggle is on, both SHALL be shown. The toggle state SHALL default to off each time the user opens the application.

#### Scenario: Toggle off hides Stage Assignment column
- **WHEN** the "View stage assignments" toggle is off
- **THEN** the Stage Assignment column SHALL NOT be rendered in the table

#### Scenario: Toggle off removes row color tinting
- **WHEN** the "View stage assignments" toggle is off
- **THEN** no stage-color tinting SHALL be applied to any submission row, regardless of lineup assignment status

#### Scenario: Toggle on shows Stage Assignment column
- **WHEN** the user enables the "View stage assignments" toggle
- **THEN** the Stage Assignment column SHALL appear in the submission table

#### Scenario: Toggle on enables row color tinting
- **WHEN** the "View stage assignments" toggle is on
- **THEN** rows for submissions assigned to a stage with a color SHALL display the stage color tint per the lineup-indicator spec

#### Scenario: Toggle defaults to off on load
- **WHEN** the application loads or the project changes
- **THEN** the "View stage assignments" toggle SHALL be in the off state
