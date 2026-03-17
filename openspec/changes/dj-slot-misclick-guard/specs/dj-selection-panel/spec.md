## ADDED Requirements

### Requirement: Click-to-assign is blocked when the active slot is occupied
When the active sequential slot already has a real DJ assigned, clicking a DJ card in the list SHALL NOT perform an assignment. Drag-and-drop from a DJ card remains unaffected and SHALL continue to work as the intentional replacement path.

#### Scenario: Clicking a DJ card when the slot is already filled does nothing
- **WHEN** the active slot is a sequential slot with a real DJ assignment
- **THEN** clicking any DJ card in the panel list SHALL NOT call the assign callback
- **THEN** no change SHALL be made to the lineup

#### Scenario: Click-to-assign resumes after the slot is emptied
- **WHEN** the user clicks "Remove" on the occupied slot in the slot tray
- **THEN** the slot becomes empty
- **THEN** clicking a DJ card SHALL assign that DJ to the now-empty slot

#### Scenario: Simultaneous-stage slots are unaffected
- **WHEN** the active slot is a simultaneous-stage position
- **THEN** clicking a DJ card SHALL assign them to that position as before (no position is "occupied" in the same blocking sense)

#### Scenario: Blank-slot (blocked slot) does not trigger the guard
- **WHEN** the active slot contains a blank/blocked assignment (not a real DJ)
- **THEN** clicking a DJ card SHALL assign that DJ, replacing the blank marker
