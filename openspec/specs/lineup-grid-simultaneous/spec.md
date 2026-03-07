## Requirements

### Requirement: Render simultaneous stage columns without slot rows
The Lineup Grid SHALL render simultaneous stage columns as a single full-height cell spanning the entire time axis, rather than as a row-per-slot layout. The cell SHALL display the names of all currently assigned DJs stacked vertically, one per position.

#### Scenario: Simultaneous stage column renders as single cell
- **WHEN** the organizer views an evening that has one sequential stage and one simultaneous stage
- **THEN** the sequential stage column renders one row per time slot
- **THEN** the simultaneous stage column renders as a single cell with no row divisions
- **THEN** the simultaneous cell visually spans the full height of the time axis rows

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

### Requirement: DJ pool exclusion applies to simultaneous assignments
The unscheduled DJ pool SHALL exclude any DJ assigned to a simultaneous stage, consistent with the global exclusion rule for sequential assignments.

#### Scenario: DJ assigned to simultaneous stage removed from pool
- **WHEN** a DJ is assigned to any position on a simultaneous stage
- **THEN** that DJ SHALL NOT appear in the unscheduled pool panel regardless of the currently viewed evening
