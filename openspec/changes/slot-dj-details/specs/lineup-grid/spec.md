## ADDED Requirements

### Requirement: Occupied sequential grid cells show score peek on hover
An occupied (non-blank) sequential slot cell in the `LineupGrid` SHALL trigger a score peek tooltip when the user hovers over the cell, showing the same breakdown content as the DJ selection panel's score peek.

#### Scenario: Hovering an occupied sequential cell with scores shows peek tooltip
- **WHEN** the user hovers over an occupied sequential grid cell for a DJ who has at least one score
- **THEN** a score peek tooltip SHALL appear showing the DJ's score breakdown (and format/gear header per the updated dj-score-peek spec)
- **THEN** the tooltip SHALL disappear when the cursor leaves the cell

#### Scenario: No peek for occupied sequential cell with no scores
- **WHEN** the user hovers over an occupied sequential grid cell for a DJ with no scores
- **THEN** no tooltip SHALL appear

#### Scenario: No peek for blank/blocked sequential cells
- **WHEN** the user hovers over a blank/blocked sequential grid cell
- **THEN** no tooltip SHALL appear

#### Scenario: No peek for empty sequential cells
- **WHEN** the user hovers over an empty sequential grid cell
- **THEN** no tooltip SHALL appear (existing "+" button behaviour is unchanged)

### Requirement: Occupied simultaneous grid cell DJ entries show score peek on hover
Each individual DJ entry within an occupied simultaneous stage cell in the `LineupGrid` SHALL trigger a score peek tooltip when the user hovers over that DJ's name or score area, showing the same breakdown content as the DJ selection panel's score peek.

#### Scenario: Hovering a DJ entry in a simultaneous cell with scores shows peek tooltip
- **WHEN** the user hovers over a DJ entry inside a simultaneous grid cell for a DJ who has at least one score
- **THEN** a score peek tooltip SHALL appear showing that DJ's score breakdown and format/gear header
- **THEN** the tooltip SHALL disappear when the cursor leaves the DJ entry

#### Scenario: No peek for a simultaneous cell DJ entry with no scores
- **WHEN** the user hovers over a DJ entry in a simultaneous cell for a DJ with no scores
- **THEN** no tooltip SHALL appear

#### Scenario: No peek for blank/blocked simultaneous entries
- **WHEN** a simultaneous cell position contains a blank/blocked assignment
- **THEN** hovering that entry SHALL NOT trigger a tooltip
