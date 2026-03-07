## ADDED Requirements

### Requirement: Stage type selector in config panel
The Stage Config Panel SHALL include a stage type selector control allowing the organizer to choose between `"sequential"` and `"simultaneous"` when creating or editing a stage. The selector SHALL default to `"sequential"` for new stages.

#### Scenario: New stage shows sequential as default type
- **WHEN** the organizer adds a new stage via the Stage Config Panel
- **THEN** the type selector SHALL show `"Sequential"` as the selected value
- **THEN** slot duration and per-day time fields SHALL be visible (standard sequential layout)

#### Scenario: Switching to simultaneous hides slot duration only
- **WHEN** the organizer changes the stage type to `"Simultaneous"`
- **THEN** the slot duration field SHALL be hidden
- **THEN** the per-day start time and end time fields SHALL remain visible (the event still has a start and end time)
- **THEN** the panel SHALL display a note indicating this stage will allow up to 3 concurrent DJs

#### Scenario: Switching back to sequential restores slot duration
- **WHEN** the organizer changes the stage type from `"Simultaneous"` back to `"Sequential"`
- **THEN** the slot duration field SHALL reappear

#### Scenario: Existing simultaneous stage shows correct type on edit
- **WHEN** the organizer opens the config panel for an existing stage with `stageType: "simultaneous"`
- **THEN** the type selector SHALL show `"Simultaneous"` as the selected value
- **THEN** the slot duration field SHALL be hidden
- **THEN** the per-day start and end time fields SHALL be visible
