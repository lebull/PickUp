> **Cell interaction contract**: Simultaneous stage cells conform to the [`lineup-event-cell`](../lineup-event-cell/spec.md) shared interaction contract. Requirements in that spec apply to simultaneous cells without needing to be repeated here. Requirements below are simultaneous-specific **exceptions** or **additions** to that shared contract.
>
> **Exceptions from `lineup-event-cell`**:
> - `[sequential-only]` *One DJ per cell*: simultaneous cells hold up to 3 DJs concurrently (one per position index).
> - `[sequential-only]` *Single cell action on occupied*: simultaneous cells do not replace an existing DJ on click/drop — they add to the next available position. Individual DJs are removed via per-badge remove controls, not a whole-cell action.
>
> **Additions** (simultaneous-only behaviors not in `lineup-event-cell`):
> - DJ capacity cap (maximum 3 per evening, enforced in UI and data layer)
> - Per-position DJ badges, each with an individual remove control
> - "Add DJ" button visibility gated on cap (hidden when 3 DJs assigned)
> - Cell placement spanning the stage's configured start/end time window on the time axis

## Requirements

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

### Requirement: DJ pool exclusion applies to simultaneous assignments
The unscheduled DJ pool SHALL exclude any DJ assigned to a simultaneous stage, consistent with the global exclusion rule for sequential assignments.

#### Scenario: DJ assigned to simultaneous stage removed from pool
- **WHEN** a DJ is assigned to any position on a simultaneous stage
- **THEN** that DJ SHALL NOT appear in the unscheduled pool panel regardless of the currently viewed evening

~~### Requirement: Clear Lineup action~~
~~**Removed**: The "Clear Lineup" button was destructive, rarely useful, and added visual noise to the lineup footer. Users can achieve the same result by deleting and recreating the project.~~
