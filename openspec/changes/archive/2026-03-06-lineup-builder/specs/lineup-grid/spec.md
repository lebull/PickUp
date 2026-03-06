## ADDED Requirements

### Requirement: Render the schedule grid
The application SHALL render a schedule grid for a selected evening. Columns represent stages that are active on the selected evening. Rows represent time slots derived from each stage's start time, end time, and slot duration. Each cell is the intersection of a stage column and a time slot row.

#### Scenario: Grid renders columns for active stages on selected evening
- **WHEN** the organizer selects an evening (e.g., "Friday")
- **THEN** the grid renders one column per stage that has "Friday" in its active days
- **THEN** stages not active on that evening are not shown

#### Scenario: Grid renders time slot rows
- **WHEN** a stage has start time, end time, and slot duration configured
- **THEN** the grid renders one row per time slot derived from that configuration
- **THEN** the row header displays the slot start time (e.g., "20:00")

#### Scenario: Empty slot appears unoccupied
- **WHEN** a grid cell has no DJ assigned
- **THEN** the cell SHALL appear visually empty and interactive (inviting assignment)

#### Scenario: Occupied slot displays DJ name
- **WHEN** a DJ has been assigned to a slot
- **THEN** the cell SHALL display the DJ's name
- **THEN** the cell SHALL appear visually distinct from empty cells

### Requirement: Navigate between evenings
The application SHALL provide a navigation control to switch between the convention evenings. Only evenings that have at least one active stage SHALL be shown.

#### Scenario: Evening selector shows active evenings only
- **WHEN** stages are configured with various active days
- **THEN** the evening selector renders buttons only for days that appear in at least one stage's active days

#### Scenario: Selecting an evening updates the grid
- **WHEN** the organizer clicks an evening button
- **THEN** the grid updates to show only the stages and slots for that evening

### Requirement: Assign DJ to a slot
The application SHALL allow the organizer to assign a DJ from the unscheduled pool to an empty grid slot.

#### Scenario: Click empty slot to assign
- **WHEN** the organizer clicks an empty slot cell
- **THEN** a picker (dropdown or modal) opens listing all DJs who have no assignment anywhere in the lineup (any evening, any stage)
- **THEN** selecting a DJ from the picker assigns them to that slot and removes them from the pool globally

#### Scenario: DJ already scheduled is not in pool
- **WHEN** a DJ has been assigned to any slot (on any evening, on any stage)
- **THEN** that DJ SHALL NOT appear in the unscheduled pool regardless of which evening is currently viewed

#### Scenario: Click occupied slot to reassign or remove
- **WHEN** the organizer clicks a slot that already has a DJ assigned
- **THEN** options are shown to reassign (pick a different DJ) or remove the DJ (return them to the pool)

### Requirement: Unscheduled DJ pool
The application SHALL display a sidebar or panel showing all DJs who have not yet been assigned to any slot anywhere in the lineup.

#### Scenario: Pool shows only globally unscheduled DJs
- **WHEN** the organizer views any evening
- **THEN** the pool panel lists only DJs who have no slot assignment anywhere in the lineup (any evening, any stage)

#### Scenario: Pool updates after assignment
- **WHEN** a DJ is assigned to a slot
- **THEN** the DJ is removed from the pool panel immediately

#### Scenario: Pool updates after removal
- **WHEN** a DJ is removed from a slot
- **THEN** the DJ reappears in the pool panel immediately

### Requirement: Mode toggle between Submission Browser and Lineup Builder
The application SHALL provide a tab or toggle control to switch between the Submission Browser (the existing scoring list) and the Lineup Builder grid. Both modes are accessible without re-importing the CSV.

#### Scenario: Toggle switches active view
- **WHEN** the organizer clicks "Lineup Builder"
- **THEN** the schedule grid and DJ pool are displayed
- **THEN** the submission list is hidden

#### Scenario: Returning to submission browser preserves state
- **WHEN** the organizer switches from Lineup Builder back to the Submission Browser
- **THEN** the submission list, sort, filter, and selected detail state are unchanged
