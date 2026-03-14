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
