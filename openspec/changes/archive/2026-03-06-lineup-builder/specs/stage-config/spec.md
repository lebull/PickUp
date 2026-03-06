## ADDED Requirements

### Requirement: Define and configure stages
The application SHALL allow organizers to create, edit, and delete stages. Each stage SHALL have: a name, a list of active days (subset of the convention days), a per-day schedule (start time and end time for each active day), and a slot duration in minutes. Stage configuration SHALL be persisted as part of the lineup data (see lineup-persistence spec).

#### Scenario: Add a new stage
- **WHEN** the organizer clicks "Add Stage" in the stage configuration panel
- **THEN** a new stage entry is created with default values (empty name, no active days, no schedule)
- **THEN** the organizer can edit the name, active days, per-day start/end times, and slot duration inline

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
- **THEN** per-day time inputs SHALL become visible for each checked day

#### Scenario: Per-day schedule
- **WHEN** a stage is active on multiple days
- **THEN** the organizer SHALL be able to set independent start and end times for each active day
- **THEN** different days MAY have different start times, end times, and thus different slot counts

### Requirement: Slot duration governs grid rows
The application SHALL derive the set of time slot labels for a stage on a given evening from its per-day start time, end time, and slot duration. Slots are half-open intervals starting at `startTime` and incrementing by `slotDuration` until `endTime` is reached or exceeded.

#### Scenario: Slot rows computed from config
- **WHEN** a stage has start time 20:00, end time 24:00, and slot duration 60 minutes on Friday
- **THEN** the grid renders 4 slot rows for that stage on Friday: 20:00, 21:00, 22:00, 23:00

#### Scenario: Cross-midnight event
- **WHEN** a stage has start time 22:00, end time 02:00 (next day), and slot duration 60 minutes
- **THEN** the application SHALL detect that endTime < startTime in 24-hour notation and treat end time as belonging to the next calendar day
- **THEN** the grid renders 4 slot rows: 22:00, 23:00, 00:00, 01:00
- **THEN** the config panel SHALL display a "↷ next day" indicator when cross-midnight is detected

#### Scenario: Stage with no time configuration shows placeholder
- **WHEN** a stage has no start time, end time, or slot duration set for the selected evening
- **THEN** the grid column for that stage SHALL display a placeholder indicating configuration is required
