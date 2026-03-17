## ADDED Requirements

### Requirement: Selected evening persists across panel open/close cycles
The selected evening in the Lineup Builder SHALL persist when the DJ selection panel opens or closes. The evening selector SHALL NOT reset to the first evening when the active slot changes.

#### Scenario: Evening stays selected when DJ panel opens
- **WHEN** the user has selected "Saturday" in the evening selector
- **THEN** opens a slot (activating the DJ selection panel)
- **THEN** the evening selector SHALL still show "Saturday" as the active evening

#### Scenario: Evening stays selected when DJ panel closes
- **WHEN** the DJ selection panel is open and the user presses Escape or clicks outside
- **THEN** the panel closes
- **THEN** the evening selector SHALL retain the previously selected evening

#### Scenario: Evening stays selected after DJ assignment
- **WHEN** the user assigns a DJ to a slot on "Friday"
- **THEN** the active slot advances (or stays)
- **THEN** the evening selector SHALL remain on "Friday"
