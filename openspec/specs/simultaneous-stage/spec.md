## Requirements

### Requirement: Define a simultaneous stage type
The `Stage` data model SHALL support a `stageType` field with values `"sequential"` (default) and `"simultaneous"`. A simultaneous stage represents an event format where all assigned DJs perform concurrently throughout the entire event window rather than in sequential time slots. A simultaneous stage SHALL permit a maximum of 3 DJ assignments per evening.

#### Scenario: New stage defaults to sequential
- **WHEN** an organizer creates a new stage without specifying a type
- **THEN** the stage's `stageType` SHALL default to `"sequential"`
- **THEN** the stage behaves identically to existing sequential stages

#### Scenario: Stage type persisted correctly
- **WHEN** an organizer sets a stage's type to `"simultaneous"` and saves
- **THEN** the persisted `Stage` record contains `stageType: "simultaneous"`
- **THEN** reloading the project restores the simultaneous type without alteration

#### Scenario: Legacy data backward compatibility
- **WHEN** a project is loaded from IndexedDB and a stage record has no `stageType` field
- **THEN** the application SHALL treat that stage as `stageType: "sequential"`
- **THEN** no data migration or user action SHALL be required

#### Scenario: Maximum DJ cap enforced at data layer
- **WHEN** an attempt is made to add a 4th DJ assignment to a simultaneous stage for a given evening
- **THEN** the application SHALL reject the assignment with an error or no-op
- **THEN** the existing 3 assignments SHALL remain unchanged

### Requirement: Simultaneous stage assignment model
A simultaneous stage uses `positionIndex` (1–3) in lieu of `slotIndex` to identify the assignment's position within the concurrent set. A `SlotAssignment` targeting a simultaneous stage SHALL omit `slotIndex` and SHALL include `positionIndex`.

#### Scenario: Assign DJ to simultaneous stage position
- **WHEN** the organizer assigns a DJ to position 1 of a simultaneous stage on a given evening
- **THEN** a `SlotAssignment` is created with `stageId`, `evening`, `positionIndex: 1`, and `djName`
- **THEN** the DJ is removed from the unscheduled pool globally (same rule as sequential assignments)

#### Scenario: Remove DJ from simultaneous stage
- **WHEN** the organizer removes a DJ from a simultaneous stage position
- **THEN** the corresponding `SlotAssignment` is deleted
- **THEN** the DJ reappears in the unscheduled pool if they have no other assignments
