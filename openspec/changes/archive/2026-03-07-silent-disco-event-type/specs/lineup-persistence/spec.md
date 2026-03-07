## MODIFIED Requirements

### Requirement: Persist lineup state to a project
The application SHALL save the complete lineup state — stage configuration and all slot assignments (sequential and simultaneous) — to the active project's IndexedDB record automatically whenever state changes. The record SHALL be keyed by the project's UUID, not the CSV filename.

#### Scenario: State is saved after each change
- **WHEN** the organizer makes any change to stage config or slot assignments (including adding/removing DJs from simultaneous stages)
- **THEN** the updated lineup state is written to the active project's IndexedDB record within 1 second (debounced)

#### Scenario: State is scoped to project ID
- **WHEN** the organizer is working within a project
- **THEN** all lineup changes are persisted to that project's record
- **WHEN** the organizer switches to a different project
- **THEN** each project's lineup state is independent

### Requirement: Restore lineup when project is opened
The application SHALL restore the saved stage configuration and all slot assignments — including simultaneous stage assignments — when a project is opened.

#### Scenario: Opening a project restores lineup including simultaneous stages
- **WHEN** the organizer opens an existing project that contains simultaneous stage assignments
- **THEN** the saved stage config and all assignments (sequential and simultaneous) are restored without requiring any manual action

#### Scenario: New project starts with empty lineup
- **WHEN** the organizer opens a newly created project with no prior lineup data
- **THEN** the lineup starts empty (no stages configured, no assignments)

#### Scenario: Row count mismatch triggers warning
- **WHEN** a CSV is re-imported into a project that already has a saved lineup
- **AND** the new CSV row count does not match the saved row count
- **THEN** the application SHALL display a warning indicating the submission count has changed and the lineup may be mismatched
- **THEN** the lineup SHALL still be restored (not discarded) and the organizer may choose to proceed or clear it

### Requirement: Clear saved lineup
The application SHALL provide an action to clear the saved lineup for the active project, resetting the Lineup Builder to an empty state.

#### Scenario: Clear lineup resets to empty
- **WHEN** the organizer chooses "Clear Lineup" and confirms
- **THEN** all slot assignments (sequential and simultaneous) and stage configuration are removed from both in-memory state and the project's IndexedDB record
- **THEN** the Lineup Builder shows no stages and no assignments

### Requirement: Assignment serialization supports both sequential and simultaneous variants
The persisted `SlotAssignment` shape SHALL accommodate both assignment types. Sequential assignments SHALL include `slotIndex`. Simultaneous assignments SHALL include `positionIndex` (1–3) and SHALL omit `slotIndex`. Both SHALL include `stageId`, `evening`, and `djName`.

#### Scenario: Sequential assignment round-trips correctly
- **WHEN** a sequential slot assignment is persisted and then the project is reopened
- **THEN** the restored assignment has `stageId`, `evening`, `slotIndex`, and `djName` matching the original

#### Scenario: Simultaneous assignment round-trips correctly
- **WHEN** a simultaneous stage assignment is persisted and then the project is reopened
- **THEN** the restored assignment has `stageId`, `evening`, `positionIndex`, and `djName` matching the original
- **THEN** no `slotIndex` field is present on the restored assignment
