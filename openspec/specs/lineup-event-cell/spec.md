## Capability: Lineup Event Cell — Shared Interaction Contract

An **event cell** is any interactive unit in the Lineup Grid to which a DJ can be assigned. This includes:
- **Sequential slot cells** — the intersection of a sequential stage column and a time-slot row.
- **Simultaneous stage cells** — the single spanning cell for a simultaneous stage on a given evening.

**All requirements in this spec apply equally to both cell types unless explicitly marked `[sequential-only]` or `[simultaneous-only]`.**

**Implementer rule**: When adding or modifying cell behavior in any spec, the requirement MUST be applied to both sequential and simultaneous cells. A type-specific exception must be explicitly marked in this spec or in the relevant type-specific spec (`lineup-grid` or `lineup-grid-simultaneous`). Silence means "applies to both."

---

## Requirements

### Requirement: Click to select and open DJ panel
Clicking any event cell — whether empty or occupied — SHALL select that cell as the active slot and open the DJ Selection Panel targeting that slot/stage/evening. This is the primary interaction for assigning or managing DJs.

#### Scenario: Clicking an empty cell opens the DJ panel
- **WHEN** the organizer clicks an empty event cell (sequential or simultaneous)
- **THEN** the DJ Selection Panel opens, scoped to that stage, evening, and position
- **THEN** the cell is marked as the active cell

#### Scenario: Clicking an occupied cell opens the DJ panel
- **WHEN** the organizer clicks a cell that already has a DJ assigned
- **THEN** the DJ Selection Panel opens for that cell
- **THEN** the panel allows the organizer to reassign or remove the DJ

### Requirement: Active selection state
Exactly one cell may be the active cell at a time. The active cell SHALL display a distinct visual treatment (e.g. border highlight, background shift) so the organizer can see which slot the DJ Selection Panel is currently targeting.

#### Scenario: Active cell is highlighted
- **WHEN** the organizer clicks a cell
- **THEN** that cell receives the active visual treatment
- **THEN** any previously active cell loses the active treatment

#### Scenario: Closing the DJ panel clears active state
- **WHEN** the organizer closes or dismisses the DJ Selection Panel
- **THEN** no cell has the active treatment

### Requirement: Empty cell invites assignment
An event cell with no DJ assigned SHALL appear interactive and visually invite the organizer to assign a DJ.

#### Scenario: Empty cell is visually distinct from occupied
- **WHEN** an event cell has no DJ assigned
- **THEN** the cell SHALL appear visually empty and interactive (e.g. a "+" indicator or prominent drop target area)
- **THEN** no color tint SHALL be applied to the empty cell

### Requirement: Occupied cell displays assigned DJ(s) and stage color
An event cell with at least one DJ assigned SHALL display the DJ's name and apply a color accent derived from the stage's palette color (if configured).

#### Scenario: Occupied cell shows DJ name with stage color
- **WHEN** a DJ is assigned to a cell and the stage has a palette color configured
- **THEN** the cell SHALL display the DJ's name
- **THEN** the cell SHALL display a subtle color tint (semi-transparent background) matching the stage's palette color
- **THEN** the cell SHALL appear visually distinct from empty cells

#### Scenario: Occupied cell shows DJ name without stage color
- **WHEN** a DJ is assigned to a cell and the stage has no palette color configured
- **THEN** the cell SHALL display the DJ's name with default occupied-cell styling and no color tint

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

### Requirement: Remove DJ from cell
Removing a DJ from any cell SHALL return that DJ to the unscheduled pool globally and update the cell to its empty state.

#### Scenario: Removing a DJ restores the pool entry
- **WHEN** the organizer removes a DJ from any cell (via the DJ Selection Panel or an in-cell remove control)
- **THEN** that DJ reappears in the unscheduled pool
- **THEN** the cell reverts to its empty appearance
