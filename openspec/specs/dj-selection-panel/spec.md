## MODIFIED Requirements

### Requirement: Panel closes when slot is filled
The `DJSelectionPanel` SHALL NOT automatically close after a DJ is assigned to the active slot. Instead, the parent (`LineupView`) SHALL determine the next active slot and the panel SHALL update to reflect it. The panel SHALL only close on Escape, outside click, or explicit close button press.

#### Scenario: Panel stays open after DJ assignment
- **WHEN** the user assigns a DJ to the active slot via the panel
- **THEN** the panel SHALL remain open
- **THEN** the active slot SHALL change to the next empty slot on the evening (or stay on the current slot if none exists)
- **THEN** the panel header SHALL update to reflect the new active slot

#### Scenario: Panel stays open after DJ is removed
- **WHEN** the user removes a DJ from the current slot using the Remove button
- **THEN** the panel SHALL remain open showing the now-empty slot
- **THEN** the DJ pool SHALL update to include the removed DJ

#### Scenario: Panel closes on Escape or outside click
- **WHEN** the user presses Escape or clicks outside the panel while it is open
- **THEN** the panel SHALL close without making any assignment change

## ADDED Requirements

### Requirement: Click-to-assign is blocked when the active slot is occupied
When the active sequential slot already has a real DJ assigned, clicking a DJ card in the list SHALL NOT perform an assignment. Drag-and-drop from a DJ card remains unaffected and SHALL continue to work as the intentional replacement path.

For simultaneous-stage slots, clicking a DJ card SHALL assign them to the active slot's position **and event** (identified by `positionIndex` and `eventIndex`). The active slot's `eventIndex` MUST be forwarded to the assignment callback so that multi-event simultaneous stages assign to the correct event.

#### Scenario: Clicking a DJ card when the slot is already filled does nothing
- **WHEN** the active slot is a sequential slot with a real DJ assignment
- **THEN** clicking any DJ card in the panel list SHALL NOT call the assign callback
- **THEN** no change SHALL be made to the lineup

#### Scenario: Click-to-assign resumes after the slot is emptied
- **WHEN** the user clicks "Remove" on the occupied slot in the slot tray
- **THEN** the slot becomes empty
- **THEN** clicking a DJ card SHALL assign that DJ to the now-empty slot

#### Scenario: Simultaneous-stage slots are unaffected by the occupancy guard
- **WHEN** the active slot is a simultaneous-stage position with open capacity
- **THEN** clicking a DJ card SHALL assign them to that position

#### Scenario: Click-to-assign on simultaneous stage uses the active slot's eventIndex
- **WHEN** the active slot is a simultaneous-stage position with `eventIndex` ≥ 1 (a second or later event on the same evening)
- **THEN** clicking a DJ card SHALL add the DJ to that event, not to event 0
- **THEN** the `onAddSimultaneous` callback SHALL be called with the correct `eventIndex`

#### Scenario: Blank-slot (blocked slot) does not trigger the guard
- **WHEN** the active slot contains a blank/blocked assignment (not a real DJ)
- **THEN** clicking a DJ card SHALL assign that DJ, replacing the blank marker

## ADDED Requirements

### Requirement: Slot tray rows display score and format/gear for filled slots
Each filled (non-blank) sequential and simultaneous slot row in the `DJSelectionPanel` slot tray SHALL display the DJ's context-appropriate average score and format/gear value inline, in addition to the existing name and genre.

#### Scenario: Sequential tray row shows score and gear for a slotted DJ
- **WHEN** a sequential slot row contains a real DJ assignment
- **THEN** the row SHALL display the DJ's average score (formatted to two decimal places, or "—" if null)
- **THEN** the row SHALL display the DJ's format/gear value (or "—" if empty)

#### Scenario: Simultaneous tray position shows score and gear for a slotted DJ
- **WHEN** a simultaneous slot position contains a real DJ assignment
- **THEN** the row SHALL display the DJ's average score and format/gear in the same manner as sequential rows

#### Scenario: Blank/blocked rows show no score or gear
- **WHEN** a slot row contains a blank/blocked assignment
- **THEN** no score or format/gear SHALL be displayed

### Requirement: Slot tray rows enable score peek on hover
Each filled (non-blank) slot tray row for a DJ who has at least one score SHALL trigger the score peek tooltip when the user hovers over the score value.

#### Scenario: Hovering the score in a tray row shows peek tooltip
- **WHEN** the user hovers over the score value in a filled tray row
- **THEN** the score peek tooltip SHALL appear showing the DJ's score breakdown and format/gear header
- **THEN** the tooltip SHALL disappear when the cursor leaves the score cell

#### Scenario: No peek for scoreless tray row
- **WHEN** a filled tray row's DJ has no scores (all null)
- **THEN** hovering the score cell ("—") SHALL NOT trigger any tooltip
