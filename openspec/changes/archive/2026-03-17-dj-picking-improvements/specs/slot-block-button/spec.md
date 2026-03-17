## ADDED Requirements

### Requirement: Block Slot action on empty slot tray rows
The DJ selection panel SHALL render a "Block Slot" button on the slot tray row for an empty (unassigned) sequential slot. Activating the button SHALL assign a `BlankSlotAssignment` (with `blankLabel: 'Blocked'`) to that slot and close the panel. This mirrors how the "Remove" button appears on occupied slot tray rows. The pinned "Blocked slot" row previously present at the top of the DJ list is removed; blocking is now an action on the slot itself, consistent with the remove-assignment pattern.

#### Scenario: Empty slot tray row shows Block Slot button
- **WHEN** the DJ selection panel is open and a slot tray row is empty (no DJ assigned)
- **THEN** a "Block Slot" button SHALL be visible on that slot tray row
- **THEN** no "Blocked slot" pinned row SHALL appear in the DJ list

#### Scenario: Clicking Block Slot assigns a blank and closes the panel
- **WHEN** the organizer clicks the "Block Slot" button on an empty slot tray row
- **THEN** a `BlankSlotAssignment` with default label `'Blocked'` SHALL be assigned to that slot
- **THEN** the DJ selection panel SHALL close
- **THEN** the grid cell SHALL update to display the blocked slot label and blank-slot styling

#### Scenario: Block Slot button absent on occupied slot tray rows
- **WHEN** a slot tray row has a DJ assigned
- **THEN** the "Block Slot" button SHALL NOT be shown on that row
- **THEN** only the existing "Remove" button SHALL be available for that row

#### Scenario: Blocked slot cell in the grid opens the panel for reassignment
- **WHEN** the organizer clicks a blocked slot cell in the lineup grid
- **THEN** the DJ selection panel SHALL open for that slot
- **THEN** the slot tray row SHALL show the blocked label and the "Remove" button (no "Block Slot" button since slot is occupied)
