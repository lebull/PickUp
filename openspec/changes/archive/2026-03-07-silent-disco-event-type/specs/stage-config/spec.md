## MODIFIED Requirements

### Requirement: Define and configure stages
The application SHALL allow organizers to create, edit, and delete stages. Each stage SHALL have: a name, a `stageType` (`"sequential"` or `"simultaneous"`), a list of active days (subset of the convention days), a per-day schedule (start time and end time for each active day, only applicable to sequential stages), and a slot duration in minutes (only applicable to sequential stages). Stage configuration SHALL be persisted as part of the lineup data (see lineup-persistence spec).

#### Scenario: Add a new stage
- **WHEN** the organizer clicks "Add Stage" in the stage configuration panel
- **THEN** a new stage entry is created with default values (empty name, `stageType: "sequential"`, no active days, no schedule)
- **THEN** the organizer can edit the name, stage type, active days, per-day start/end times (sequential only), and slot duration (sequential only) inline

#### Scenario: Edit an existing stage
- **WHEN** the organizer modifies any field of an existing stage
- **THEN** the change is reflected immediately in the stage config panel
- **THEN** the change is saved to persistence when the organizer closes or saves the config

#### Scenario: Delete a stage
- **WHEN** the organizer clicks "Delete" on a stage that has no DJ assignments
- **THEN** the stage is removed from the configuration

#### Scenario: Delete a stage with existing assignments
- **WHEN** the organizer clicks "Delete" on a stage that has one or more DJ slots assigned
- **THEN** the application SHALL display a warning listing how many slots will be lost
- **THEN** the organizer must confirm before the stage and its assignments are deleted

#### Scenario: Stage active days subset
- **WHEN** an organizer assigns active days to a stage
- **THEN** only the selected days SHALL render a column for that stage in the schedule grid
- **THEN** per-day time inputs SHALL become visible for each checked day (sequential stages only)

#### Scenario: Per-day schedule (sequential stages only)
- **WHEN** a sequential stage is active on multiple days
- **THEN** the organizer SHALL be able to set independent start and end times for each active day
- **THEN** different days MAY have different start times, end times, and thus different slot counts

#### Scenario: Simultaneous stage active days
- **WHEN** the organizer assigns active days to a simultaneous stage
- **THEN** only the selected days SHALL render a column for that stage in the schedule grid
- **THEN** no per-day time or slot duration inputs SHALL be shown
