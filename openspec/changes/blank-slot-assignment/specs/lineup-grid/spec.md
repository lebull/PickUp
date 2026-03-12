## ADDED Requirements

### Requirement: Blank-assigned slots render with the assignment's label
When a sequential slot or simultaneous position has a blank assignment (`submissionNumber === '__blank__'`), the lineup grid SHALL render that cell displaying the assignment's `blankLabel` (defaulting to `"Blocked"` if absent). The cell SHALL appear visually occupied but visually distinct from DJ-assigned cells (e.g., muted or italicized label, no stage color tint).

#### Scenario: Blank-assigned sequential cell shows the blank label
- **WHEN** a sequential slot has a blank assignment with `blankLabel: 'Break'`
- **THEN** the cell SHALL display `"Break"`
- **THEN** the cell SHALL NOT display a color tint from the stage color
- **THEN** the cell SHALL appear distinct from both empty cells and DJ-assigned cells

#### Scenario: Blank-assigned cell with no label shows default
- **WHEN** a sequential slot has a blank assignment with no `blankLabel`
- **THEN** the cell SHALL display `"Blocked"`

#### Scenario: Blank-assigned simultaneous position shows the label
- **WHEN** a simultaneous stage position has a blank assignment
- **THEN** that position row in the cell SHALL display the assignment's `blankLabel` (or `"Blocked"`)
- **THEN** no DJ name or genre SHALL be shown for that position

#### Scenario: Blank-assigned slot can be clicked to reassign or relabel
- **WHEN** the user clicks a blank-assigned sequential cell
- **THEN** the DJ selection panel SHALL open for that slot with the blank slot row's label input pre-filled with the existing label
