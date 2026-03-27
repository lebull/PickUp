## MODIFIED Requirements

### Requirement: Navigate between evenings
The selected evening SHALL be controlled by the parent component (`LineupView`) and passed into the grid as a prop. The `LineupGrid` SHALL NOT own evening selection state. The evening selector SHALL call a provided `onSelectEvening` callback when an evening button is clicked.

#### Scenario: Evening selector shows active evenings only
- **WHEN** stages are configured with various active days
- **THEN** the evening selector renders buttons only for days that appear in at least one stage's active days

#### Scenario: Selecting an evening updates the grid
- **WHEN** the organizer clicks an evening button
- **THEN** the grid updates to show only the stages and slots for that evening
- **THEN** the `onSelectEvening` callback SHALL be called with the clicked evening name

#### Scenario: Evening selection persists across slot panel open/close
- **WHEN** the organizer selects a non-default evening (e.g., "Saturday")
- **THEN** opens and closes the DJ selection panel
- **THEN** the grid SHALL continue to show "Saturday" (state is owned by the parent, not the grid)

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
