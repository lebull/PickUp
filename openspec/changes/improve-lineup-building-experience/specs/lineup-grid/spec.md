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
