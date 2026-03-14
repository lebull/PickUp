## ADDED Requirements

### Requirement: Stage day events model multiple timed blocks per stage per day
A sequential stage's per-day schedule SHALL support one or more named timed event blocks on any active day. Each event block SHALL have: a `startTime` (HH:MM, 24-hour), an `endTime` (HH:MM, supports cross-midnight), and an optional `label` string (e.g., "Afternoon Set", "Evening Set"). When no label is provided the system SHALL display an auto-generated ordinal label ("Set 1", "Set 2", …) in the grid.

Multiple events on the same stage/day SHALL NOT have overlapping time ranges. The application SHALL validate this and prevent overlapping events from being saved.

#### Scenario: Stage with two events on the same day
- **WHEN** a sequential stage has two events configured for Friday (e.g., 14:00–18:00 and 20:00–24:00)
- **THEN** each event is stored as a separate entry in the stage's Friday schedule array
- **THEN** each event independently tracks its start time, end time, and optional label

#### Scenario: Label defaults when not provided
- **WHEN** an event has no label set
- **THEN** the system SHALL display "Set 1", "Set 2", etc. (1-based ordinal within the day) wherever the event name is shown

#### Scenario: Overlapping events rejected
- **WHEN** the organizer configures a second event on a stage/day whose time range overlaps an existing event
- **THEN** the application SHALL display an inline validation error
- **THEN** the overlapping schedule SHALL NOT be saved

#### Scenario: Single event behaves identically to the legacy model
- **WHEN** a stage/day has exactly one event (the common case)
- **THEN** behavior is identical to the pre-existing single-schedule model
- **THEN** no label is required and no UI affordances for multi-event are prominent

### Requirement: Slot assignments reference the event they belong to
Each sequential slot assignment SHALL carry an `eventIndex` (zero-based integer) identifying which event of the stage/day schedule array the slot belongs to. The app code SHALL treat `eventIndex` as always-present; projects must be run through the migration script before use with this version of the app.

#### Scenario: Assignment to a specific event's slot
- **WHEN** a DJ is assigned to slot index 2 of the Friday "Evening Set" (eventIndex 1)
- **THEN** the assignment record captures `stageId`, `evening: "Friday"`, `eventIndex: 1`, `slotIndex: 2`

### Requirement: One-time migration script converts legacy project data
A standalone script SHALL be provided to convert legacy project JSON (single-object `StageSchedule` per day, `SlotAssignment` records without `eventIndex`) to the new format. The script SHALL be run once against existing project data before deploying the updated app. The app itself SHALL NOT contain load-time normalization logic for the legacy format.

#### Scenario: Script converts single-object schedule to array
- **WHEN** the migration script processes a project whose stages use `{ startTime, endTime }` per day
- **THEN** each such value is converted to `[{ startTime, endTime }]` in the output
- **THEN** the output is valid under the new schema

#### Scenario: Script adds eventIndex to existing assignments
- **WHEN** the migration script processes a project whose slot assignments have no `eventIndex` field
- **THEN** each such assignment gains `eventIndex: 0` in the output

#### Scenario: Script is idempotent
- **WHEN** the migration script is run on a project that is already in the new format
- **THEN** the output is identical to the input (no double-wrapping, no duplicate fields)
