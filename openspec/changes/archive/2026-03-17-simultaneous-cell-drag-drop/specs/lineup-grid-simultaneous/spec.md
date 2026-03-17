## ADDED Requirements

### Requirement: Simultaneous cell accepts DJ card drops
A simultaneous stage cell SHALL function as a drag-and-drop target, accepting DJ cards from the unscheduled pool. Dropping a DJ card onto the cell assigns that DJ to the next available position index, identical in outcome to clicking "Add DJ" and selecting that DJ from the DJ Selection Panel.

#### Scenario: Drop DJ card onto simultaneous cell with open positions
- **WHEN** the organizer drags a DJ card from the unscheduled pool and drops it onto a simultaneous cell that has fewer than 3 DJs assigned
- **THEN** the DJ is assigned to the next available position index (1, 2, or 3)
- **THEN** the DJ is removed from the unscheduled pool globally
- **THEN** the DJ's name appears as a badge in the cell

#### Scenario: Drop onto full simultaneous cell is rejected
- **WHEN** the organizer drags a DJ card over a simultaneous cell that already has 3 DJs assigned
- **THEN** the drag-over event SHALL set `dropEffect` to `'none'` (browser shows "no drop" cursor)
- **WHEN** the organizer releases the drag over the full cell
- **THEN** no assignment is made and the cell's state is unchanged
