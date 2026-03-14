## MODIFIED Requirements

### Requirement: Define and configure stages
The application SHALL allow organizers to create, edit, delete, reorder, and assign colors to stages. Each stage SHALL have: a name, a `stageType` (`"sequential"` or `"simultaneous"`), an optional display color (chosen from a fixed palette), a list of active days (subset of the convention days), a per-day schedule (one or more event blocks, each with a start time, end time, and optional label, for each active day — only applicable to sequential stages), and a slot duration in minutes (only applicable to sequential stages, shared across all events). Stage configuration SHALL be persisted as part of the lineup data (see lineup-persistence spec).

#### Scenario: Add a new stage
- **WHEN** the organizer clicks "Add Stage" in the stage configuration panel
- **THEN** a new stage entry is created with default values (empty name, `stageType: "sequential"`, no color, no active days, no schedule)
- **THEN** the organizer can edit the name, stage type, color, active days, per-day event blocks (sequential only), and slot duration (sequential only) inline

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
- **THEN** only the selected days SHALL render columns for that stage in the schedule grid
- **THEN** per-day event block inputs SHALL become visible for each checked day (sequential stages only)

#### Scenario: Per-day schedule with single event (sequential stages only)
- **WHEN** a sequential stage is active on multiple days and each day has one event
- **THEN** the organizer SHALL be able to set independent start and end times for each active day
- **THEN** different days MAY have different start times, end times, and thus different slot counts

#### Scenario: Add a second event to a day
- **WHEN** the organizer clicks "Add Event" on an active day row for a sequential stage
- **THEN** a new event entry appears with empty start/end time fields and an optional label field
- **THEN** the organizer can fill in the new event's start/end time and an optional label

#### Scenario: Remove an event from a day
- **WHEN** a day has more than one event and the organizer clicks the remove icon on one of them
- **THEN** the event entry is removed
- **THEN** if any DJ assignments existed for that event's slots the application SHALL warn the organizer and require confirmation

#### Scenario: Overlapping event times show inline validation error
- **WHEN** the organizer sets times for a second event that overlap an existing event on the same day
- **THEN** an inline error message is shown adjacent to the conflicting time inputs
- **THEN** the conflicting schedule is not saved until the overlap is resolved

#### Scenario: Simultaneous stage active days
- **WHEN** the organizer assigns active days to a simultaneous stage
- **THEN** only the selected days SHALL render a column for that stage in the schedule grid
- **THEN** no per-day time, event block, or slot duration inputs SHALL be shown

#### Scenario: Color swatch picker visible per stage
- **WHEN** the organizer is editing a stage
- **THEN** a row of palette color swatches SHALL be displayed for that stage (see stage-color spec)
- **THEN** the organizer can select or clear a color for the stage

#### Scenario: Drag handle visible per stage row
- **WHEN** the organizer opens the stage configuration panel
- **THEN** each stage row SHALL display a drag handle at its leading edge (see stage-reorder spec)
- **THEN** the organizer can drag stages to reorder them

### Requirement: Slot duration governs grid rows
The application SHALL derive the set of time slot labels for a stage event on a given evening from that event's start time, end time, and the stage's shared slot duration. Slots are half-open intervals starting at `startTime` and incrementing by `slotDuration` until `endTime` is reached or exceeded. The slot duration is shared across all events on a stage.

#### Scenario: Slot rows computed from config
- **WHEN** a stage has start time 20:00, end time 24:00, and slot duration 60 minutes on Friday
- **THEN** the grid renders 4 slot rows for that stage event on Friday: 20:00, 21:00, 22:00, 23:00

#### Scenario: Cross-midnight event
- **WHEN** a stage event has start time 22:00, end time 02:00 (next day), and slot duration 60 minutes
- **THEN** the application SHALL detect that endTime < startTime in 24-hour notation and treat end time as belonging to the next calendar day
- **THEN** the grid renders 4 slot rows: 22:00, 23:00, 00:00, 01:00
- **THEN** the config panel SHALL display a "↷ next day" indicator when cross-midnight is detected

#### Scenario: Stage with no time configuration shows placeholder
- **WHEN** a stage has no events (or an event with no start/end time) configured for the selected evening
- **THEN** the grid column for that stage SHALL display a placeholder indicating configuration is required
