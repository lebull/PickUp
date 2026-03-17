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
