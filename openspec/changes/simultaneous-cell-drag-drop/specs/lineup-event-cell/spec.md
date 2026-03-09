## MODIFIED Requirements

### Requirement: Drag-and-drop assignment
An event cell SHALL function as a drop target. Dragging a DJ card from the DJ pool and dropping it onto a cell SHALL assign that DJ to the cell's slot or next available position. Drop behavior is equivalent to selecting a DJ from the DJ Selection Panel.

#### Scenario: Drop DJ card onto empty cell
- **WHEN** the organizer drags a DJ card from the unscheduled pool and drops it onto an empty event cell
- **THEN** that DJ is assigned to the cell's slot (sequential) or next available position (simultaneous)
- **THEN** the DJ is removed from the unscheduled pool globally

#### Scenario: Drop DJ card onto occupied cell
- **WHEN** the organizer drags a DJ card and drops it onto an already-occupied sequential cell  `[sequential-only]`
- **THEN** the dropped DJ replaces the existing assignment
- **THEN** the previously assigned DJ returns to the unscheduled pool

#### Scenario: Drop onto full simultaneous cell is a no-op  `[simultaneous-only]`
- **WHEN** a simultaneous cell has reached its maximum DJ capacity (3 DJs assigned)
- **THEN** the `dragover` event SHALL set `dropEffect` to `'none'` so the browser renders a "no drop" cursor
- **THEN** dropping a DJ card onto the cell SHALL have no effect — no assignment is made and no error is shown
