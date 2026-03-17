## MODIFIED Requirements

### Requirement: Remove DJ from cell
Removing a DJ from any cell SHALL return that DJ to the unscheduled pool globally and update the cell to its empty state. For simultaneous cells this is done via the existing per-badge × button. For sequential cells, an equivalent in-cell × button (`.slot-remove-btn`) SHALL be rendered inside each occupied (non-blank) cell, visible on hover. Clicking it SHALL remove the assignment without opening the DJ Selection Panel.

#### Scenario: In-cell × removes DJ from sequential slot
- **WHEN** the organizer hovers over an occupied sequential slot cell and clicks the × button
- **THEN** the DJ is removed from that slot
- **THEN** the DJ reappears in the unscheduled pool
- **THEN** the cell reverts to its empty appearance
- **THEN** the DJ Selection Panel is NOT opened

#### Scenario: In-cell × on simultaneous badge removes DJ from position
- **WHEN** the organizer clicks the × button on a simultaneous DJ badge (existing behavior, unchanged)
- **THEN** the DJ is removed from that simultaneous position
- **THEN** the DJ reappears in the unscheduled pool

### Requirement: Drag-and-drop assignment
An event cell SHALL function as both a **drop target** and, when holding a real DJ assignment, a **drag source**. The drag source behavior is defined in the [`slot-to-slot-drag`](../slot-to-slot-drag/spec.md) capability. Drop behavior distinguishes between two drag origins:

- **From the unscheduled pool** (payload: `application/dj-submission-number` only): behavior is unchanged — assigns the DJ to the slot, replacing any existing occupant who returns to the pool.
- **From another slot** (payload: `application/dj-slot-key` present): dispatches a move-or-swap action. The source DJ does NOT pass through the pool.

Drop behavior is equivalent in results to selecting a DJ from the DJ Selection Panel, with the addition of the swap case which has no Panel equivalent.

#### Scenario: Drop DJ card onto empty cell (pool origin)
- **WHEN** the organizer drags a DJ card from the unscheduled pool and drops it onto an empty event cell
- **THEN** that DJ is assigned to the cell's slot (sequential) or next available position (simultaneous)
- **THEN** the DJ is removed from the unscheduled pool globally

#### Scenario: Drop DJ card onto occupied cell (pool origin)
- **WHEN** the organizer drags a DJ card and drops it onto an already-occupied sequential cell `[sequential-only]`
- **THEN** the dropped DJ replaces the existing assignment
- **THEN** the previously assigned DJ returns to the unscheduled pool

#### Scenario: Drop onto full simultaneous cell is a no-op `[simultaneous-only]`
- **WHEN** a simultaneous cell has reached its maximum DJ capacity (3 DJs assigned)
- **THEN** the `dragover` event SHALL set `dropEffect` to `'none'` so the browser renders a "no drop" cursor
- **THEN** dropping a DJ card onto the cell SHALL have no effect — no assignment is made and no error is shown

#### Scenario: Drop slot onto empty cell (slot-to-slot origin)
- **WHEN** the organizer drags an occupied sequential slot cell and drops it onto an empty sequential cell
- **THEN** the DJ moves to the target slot and the source slot becomes empty
- **THEN** the DJ does not appear in the unscheduled pool during this operation

#### Scenario: Drop slot onto occupied cell (slot-to-slot swap)
- **WHEN** the organizer drags an occupied sequential slot cell and drops it onto another occupied sequential cell
- **THEN** the two DJs swap slot coordinates atomically
- **THEN** neither DJ enters the unscheduled pool during the swap

#### Scenario: Drop simultaneous badge onto empty sequential cell
- **WHEN** the organizer drags a DJ badge from a simultaneous cell and drops it onto an empty sequential cell
- **THEN** the DJ is assigned to the sequential slot and removed from the simultaneous position
- **THEN** the DJ does not appear in the unscheduled pool

#### Scenario: Drop sequential slot onto simultaneous cell with capacity
- **WHEN** the organizer drags an occupied sequential slot and drops it onto a simultaneous cell with fewer than 3 DJs
- **THEN** the DJ is added to the next available simultaneous position
- **THEN** the sequential slot becomes empty
- **THEN** the DJ does not enter the unscheduled pool

#### Scenario: Drop sequential slot onto full simultaneous cell is a no-op `[simultaneous-only]`
- **WHEN** a simultaneous cell already has 3 DJs and the organizer drags a sequential slot onto it
- **THEN** `dropEffect` is set to `'none'` during dragover
- **THEN** no assignment changes occur
