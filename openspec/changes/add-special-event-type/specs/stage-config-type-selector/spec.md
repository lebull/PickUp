## MODIFIED Requirements

### Requirement: Stage type selector in config panel
The Stage Config Panel SHALL include a stage type selector control allowing the organizer to choose between `"sequential"`, `"simultaneous"`, and `"special"` when creating or editing a stage. The selector SHALL default to `"sequential"` for new stages.

#### Scenario: Switching to special hides day/schedule configuration
- **WHEN** the organizer changes the stage type to `"special"`
- **THEN** day checkboxes and per-day start/end schedule fields SHALL be hidden or disabled for that stage
- **THEN** the panel SHALL display guidance that special stages are not day-bound and use open-ended picks

#### Scenario: Switching from special back to timed stage restores day/schedule controls
- **WHEN** the organizer changes the stage type from `"special"` to `"sequential"` or `"simultaneous"`
- **THEN** day selection and schedule controls SHALL reappear
- **THEN** timed-stage validation rules SHALL apply again

#### Scenario: Existing special stage shows correct type on edit
- **WHEN** the organizer opens the config panel for an existing stage with `stageType: "special"`
- **THEN** the type selector SHALL show `"Special"` as selected
- **THEN** no day/schedule inputs SHALL be required before save
