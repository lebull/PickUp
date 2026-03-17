## ADDED Requirements

### Requirement: Occupied sequential slot cells are draggable
Every sequential slot cell that holds a real DJ assignment (not a blank marker) SHALL be a valid HTML5 drag source. The cell SHALL set `draggable="true"` and, on `dragstart`, write two MIME types to `dataTransfer`:

1. `application/dj-slot-key` — a JSON string encoding the source slot: `{ stageId, evening, slotIndex, eventIndex }`.
2. `application/dj-submission-number` — the assigned DJ's submission number (preserving compatibility with the slot-tray drop targets in the DJ Selection Panel).

Blank slot markers (`type: 'blank'`) SHALL NOT be draggable.

#### Scenario: DJ cell starts a drag operation
- **WHEN** the organizer begins dragging an occupied non-blank sequential slot cell
- **THEN** the browser initiates a drag gesture with `effectAllowed` set to `'move'`
- **THEN** `application/dj-slot-key` is set with the JSON-encoded source slot coordinates
- **THEN** `application/dj-submission-number` is set with the DJ's submission number

#### Scenario: Blank cell cannot be dragged
- **WHEN** the organizer attempts to drag a blank marker cell
- **THEN** no drag operation is initiated (the cell is not draggable)

### Requirement: Drop target cells display a visual indicator
Any sequential slot cell or simultaneous stage cell that is a valid drop target SHALL display a distinct visual treatment (e.g., a 2 px outline or border highlight) while a drag is actively over it. The indicator SHALL be removed immediately when the drag leaves the cell or the drop completes. Cells that would reject the drop (e.g., a full simultaneous cell) SHALL NOT display the active indicator.

#### Scenario: Valid drop target is highlighted during drag-over
- **WHEN** the organizer drags a DJ card or slot cell over a valid drop target
- **THEN** the target cell displays a visible outline or border highlight
- **THEN** other cells do not display the outline

#### Scenario: Indicator removed after drop or drag-leave
- **WHEN** the organizer drops onto the cell or moves the cursor away
- **THEN** the outline is removed immediately

#### Scenario: Full simultaneous cell does not show the indicator
- **WHEN** the organizer drags a card over a simultaneous cell that is at capacity (3 DJs)
- **THEN** no drop-target indicator is shown
- **THEN** the cursor shows a no-drop icon

### Requirement: Drop onto a slot dispatches a move-or-swap action
When the drag payload contains `application/dj-slot-key`, dropping onto a sequential slot cell SHALL invoke the `handleMoveSlot` action rather than the existing `handleAssign`. The drop handler SHALL check for `application/dj-slot-key` first; if absent it SHALL fall back to `application/dj-submission-number` (unchanged pool-to-slot behavior).

#### Scenario: Move DJ from occupied slot to empty slot
- **WHEN** the organizer drags a slot cell containing DJ A and drops it onto an empty sequential slot
- **THEN** DJ A is assigned to the target slot
- **THEN** the source slot becomes empty
- **THEN** DJ A does not appear in the unscheduled pool at any point during the operation

#### Scenario: Swap two DJ slots
- **WHEN** the organizer drags a slot cell containing DJ A and drops it onto a slot containing DJ B
- **THEN** DJ A is assigned to DJ B's former slot
- **THEN** DJ B is assigned to DJ A's former slot
- **THEN** neither DJ enters the unscheduled pool during the swap

#### Scenario: Move DJ from slot onto a blank marker
- **WHEN** the organizer drags a slot cell containing DJ A and drops it onto a slot that holds a blank marker
- **THEN** DJ A is assigned to the target slot (replacing the blank)
- **THEN** the blank marker moves to DJ A's former slot
- **THEN** no assignments are lost

#### Scenario: Drop on same slot is a no-op
- **WHEN** the organizer drags a slot cell and drops it onto the same slot
- **THEN** no assignments change

#### Scenario: Pool-drag onto occupied cell still replaces (unchanged behavior)
- **WHEN** the organizer drags a DJ card from the unscheduled DJ pool and drops it onto an occupied sequential cell
- **THEN** the dropped DJ replaces the existing assignment
- **THEN** the previously assigned DJ returns to the unscheduled pool
- **THEN** behavior is identical to the pre-existing replacement contract in `lineup-event-cell`

### Requirement: Stage-view grid (StageGrid) has full parity
All slot-to-slot drag behavior defined above SHALL apply equally to sequential cells rendered in stage-view (`StageGrid`). Day columns in stage-view are treated as distinct slot coordinates identical to evening columns in day-view.

#### Scenario: DJ dragged between columns in stage view
- **WHEN** stage view is active and the organizer drags from a slot on Friday to a slot on Saturday for the same stage
- **THEN** the DJ is moved to the Saturday slot and the Friday slot becomes empty

### Requirement: Simultaneous DJ badges are draggable
Each individual DJ badge (`.simultaneous-dj-badge`) inside a simultaneous stage cell SHALL be a valid HTML5 drag source. The badge SHALL set `draggable="true"` and write both `application/dj-slot-key` (JSON: `{ stageId, evening, positionIndex, eventIndex }`) and `application/dj-submission-number` to `dataTransfer` on `dragstart`.

#### Scenario: Simultaneous badge starts a drag
- **WHEN** the organizer begins dragging a DJ badge inside a simultaneous cell
- **THEN** the browser initiates a drag with `effectAllowed = 'move'`
- **THEN** `application/dj-slot-key` encodes the badge's `{ stageId, evening, positionIndex, eventIndex }`
- **THEN** `application/dj-submission-number` is set with the DJ's submission number

### Requirement: Dropping a simultaneous badge onto a sequential slot moves the DJ
When a drag originating from a simultaneous badge is dropped onto a sequential slot, the DJ SHALL be removed from the simultaneous position and placed in the sequential slot using move-or-swap semantics.

#### Scenario: Simultaneous badge dropped onto empty sequential slot
- **WHEN** the organizer drags a simultaneous badge and drops it onto an empty sequential slot
- **THEN** the DJ is assigned to that sequential slot
- **THEN** the DJ is removed from the simultaneous position
- **THEN** the DJ does not appear in the unscheduled pool

#### Scenario: Simultaneous badge dropped onto occupied sequential slot
- **WHEN** the organizer drags a simultaneous badge and drops it onto an occupied sequential slot
- **THEN** the dragged DJ takes the sequential slot and the displaced sequential DJ takes the next available simultaneous position in the source cell
- **THEN** neither DJ enters the unscheduled pool

### Requirement: Dropping a sequential slot onto a simultaneous cell moves the DJ
When a drag originating from a sequential slot cell is dropped onto a simultaneous cell that has capacity, the DJ SHALL be removed from the sequential slot and added to the next available position in the simultaneous cell.

#### Scenario: Sequential slot dropped onto simultaneous cell with capacity
- **WHEN** the organizer drags an occupied sequential slot and drops it onto a simultaneous cell with fewer than 3 DJs
- **THEN** the DJ is added to the next available simultaneous position
- **THEN** the sequential slot becomes empty
- **THEN** the DJ does not enter the unscheduled pool

#### Scenario: Sequential slot dropped onto full simultaneous cell
- **WHEN** the organizer drags an occupied sequential slot and drops it onto a simultaneous cell that already has 3 DJs assigned
- **THEN** `dropEffect` is set to `'none'` during dragover
- **THEN** no assignment changes occur
