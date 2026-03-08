## MODIFIED Requirements

### Requirement: Assignment serialization supports both sequential and simultaneous variants
The persisted `SlotAssignment` shape SHALL accommodate both assignment types. Sequential assignments SHALL include `slotIndex`. Simultaneous assignments SHALL include `positionIndex` (1–3) and SHALL omit `slotIndex`. Both SHALL include `stageId`, `evening`, and `submissionNumber`. The `djName` field SHALL NOT be present on new assignments.

#### Scenario: Sequential assignment round-trips correctly
- **WHEN** a sequential slot assignment is persisted and then the project is reopened
- **THEN** the restored assignment SHALL have `stageId`, `evening`, `slotIndex`, and `submissionNumber` matching the original
- **THEN** no `djName` field SHALL be present on the restored assignment

#### Scenario: Simultaneous assignment round-trips correctly
- **WHEN** a simultaneous stage assignment is persisted and then the project is reopened
- **THEN** the restored assignment SHALL have `stageId`, `evening`, `positionIndex`, and `submissionNumber` matching the original
- **THEN** no `slotIndex` or `djName` field SHALL be present on the restored assignment

#### Scenario: Legacy djName-keyed assignment is migrated on load
- **WHEN** an existing project is opened that has `SlotAssignment` records with `djName` but no `submissionNumber`
- **AND** the project's CSV has been loaded
- **THEN** the application SHALL attempt to resolve each legacy assignment by finding a submission whose `djName` matches
- **THEN** matched assignments SHALL be silently upgraded to use `submissionNumber`
- **WHEN** no matching submission is found for a legacy assignment
- **THEN** that assignment SHALL be dropped and a warning SHALL be logged to the console
