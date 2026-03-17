## ADDED Requirements

### Requirement: Active slot auto-advances to next empty slot after assignment
After a DJ is assigned to a sequential slot, the system SHALL automatically move the active slot selection to the next empty sequential slot on the same evening. If no empty slot exists anywhere on that evening, the active slot SHALL remain unchanged.

#### Scenario: Next empty slot exists after assignment
- **WHEN** the user assigns a DJ to a sequential slot via the DJ selection panel
- **THEN** the active slot SHALL change to the next empty sequential slot on the same evening (scanning all stages in grid order, then continuing from the start of the slot list)
- **THEN** the DJ selection panel SHALL remain open showing the new active slot

#### Scenario: No empty slot remains after assignment
- **WHEN** the user assigns a DJ to the last empty sequential slot on the evening
- **THEN** the active slot SHALL remain on the just-filled slot
- **THEN** the DJ selection panel SHALL remain open

#### Scenario: Active slot stays selected after DJ is removed
- **WHEN** the user removes a DJ from a slot using the Remove button in the DJ selection panel
- **THEN** that slot SHALL remain the active slot
- **THEN** the DJ selection panel SHALL remain open so a replacement can be assigned immediately
