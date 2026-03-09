## MODIFIED Requirements

### Requirement: Render simultaneous stage columns without slot rows
The Lineup Grid SHALL render simultaneous stage columns as a cell that spans the portion of the time axis corresponding to the stage's configured start and end times for the selected evening, rather than spanning the full height of the grid. When a simultaneous stage has no schedule configured for the selected evening, it SHALL fall back to spanning the full height of the time axis. The cell SHALL display the names of all currently assigned DJs stacked vertically, one per position.

#### Scenario: Simultaneous stage cell is sized by start/end time
- **WHEN** a simultaneous stage has a start time and end time configured for the selected evening
- **THEN** its grid cell SHALL begin at the row corresponding to that stage's start time on the time axis
- **THEN** its grid cell SHALL end at the row corresponding to that stage's end time on the time axis (or the bottom of the grid if end time is after the last row)
- **THEN** the cell SHALL NOT span rows outside the stage's configured time window

#### Scenario: Simultaneous cell falls back to full span when no schedule is configured
- **WHEN** a simultaneous stage has no startTime or endTime configured for the selected evening
- **THEN** its column renders as a single cell spanning the full height of the time axis (existing behavior)

#### Scenario: Simultaneous stage column renders as single cell
- **WHEN** the organizer views an evening that has one sequential stage and one simultaneous stage
- **THEN** the sequential stage column renders one row per time slot
- **THEN** the simultaneous stage column renders as a single cell with no row divisions
- **THEN** the simultaneous cell is visually positioned to match its configured time window

#### Scenario: Empty simultaneous cell invites assignment
- **WHEN** a simultaneous stage has no DJs assigned for the selected evening
- **THEN** the cell SHALL display an "Add DJ" control (button or drop target)
- **THEN** clicking "Add DJ" opens the DJ picker

#### Scenario: Simultaneous cell shows assigned DJs
- **WHEN** a simultaneous stage has 1 or 2 DJs assigned for the selected evening
- **THEN** each assigned DJ's name SHALL appear in the cell as a distinct badge or row
- **THEN** an "Add DJ" control SHALL remain visible (cap not yet reached)

#### Scenario: Simultaneous cell at maximum capacity
- **WHEN** a simultaneous stage has 3 DJs assigned for the selected evening
- **THEN** all three DJ names SHALL be displayed in the cell
- **THEN** the "Add DJ" control SHALL NOT be shown (cap enforced in UI)

#### Scenario: Remove DJ from simultaneous cell
- **WHEN** the organizer clicks a remove/dismiss control on an assigned DJ badge within the simultaneous cell
- **THEN** that DJ is removed from the assignment
- **THEN** the DJ reappears in the unscheduled pool
- **THEN** the "Add DJ" control reappears if it was hidden

## REMOVED Requirements

### Requirement: Clear Lineup action
**Reason**: The "Clear Lineup" button is destructive, rarely useful, and adds visual noise to the lineup footer. Users can achieve the same result by deleting and recreating the project.
**Migration**: No migration needed. Existing lineup data is unaffected; the action is simply no longer available from the UI.
