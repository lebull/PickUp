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
