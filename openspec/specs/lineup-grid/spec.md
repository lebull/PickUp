> **Cell interaction contract**: Sequential slot cells conform to the [`lineup-event-cell`](../lineup-event-cell/spec.md) shared interaction contract. Requirements in that spec apply to sequential cells without needing to be repeated here. Requirements below that describe per-cell behavior are sequential-specific extensions or clarifications. In any conflict, `lineup-event-cell` governs.

## Requirements

### Requirement: Render the schedule grid
The application SHALL render a schedule grid for a selected evening. Columns represent stages that are active on the selected evening. Sequential stage columns have rows representing time slots derived from each stage's start time, end time, and slot duration. Simultaneous stage columns render as a single cell spanning the full time axis, showing all assigned DJs concurrently. Each sequential cell is the intersection of a stage column and a time slot row. Stage columns SHALL appear left-to-right in the order stages are defined in the project configuration. When a stage has an assigned color, its column header and occupied cells SHALL display a color accent derived from the stage's palette color.

#### Scenario: Grid renders columns for active stages on selected evening
- **WHEN** the organizer selects an evening (e.g., "Friday")
- **THEN** the grid renders one column per stage (sequential or simultaneous) that has "Friday" in its active days
- **THEN** stages not active on that evening are not shown
- **THEN** columns appear left-to-right in the order stages are defined in the project

#### Scenario: Grid renders time slot rows for sequential stages
- **WHEN** a sequential stage has start time, end time, and slot duration configured
- **THEN** the grid renders one row per time slot derived from that configuration
- **THEN** the row header displays the slot start time (e.g., "20:00")

#### Scenario: Simultaneous stage column spans full height
- **WHEN** a simultaneous stage is active on the selected evening
- **THEN** its column renders as a single cell spanning the entire height of the time axis
- **THEN** no row divisions appear within that column

#### Scenario: Empty sequential slot appears unoccupied
- **WHEN** a sequential grid cell has no DJ assigned
- **THEN** the cell SHALL appear visually empty and interactive (inviting assignment)
- **THEN** no color tint SHALL be applied to empty cells

#### Scenario: Occupied sequential slot displays DJ name with stage color
- **WHEN** a DJ has been assigned to a sequential slot and the stage has a color assigned
- **THEN** the cell SHALL display the DJ's name
- **THEN** the cell SHALL display a subtle color tint (semi-transparent background) matching the stage's palette color
- **THEN** the cell SHALL appear visually distinct from empty cells

#### Scenario: Occupied sequential slot no stage color
- **WHEN** a DJ has been assigned to a sequential slot and the stage has no color assigned
- **THEN** the cell SHALL display the DJ's name with the default occupied-cell styling and no color tint

#### Scenario: Stage column header tinted with stage color
- **WHEN** a stage with an assigned color is rendered in the grid
- **THEN** that stage's column header SHALL display a color accent (e.g., colored bottom border or tinted background) using the stage's palette color
- **THEN** stages without a color SHALL render column headers with default neutral styling

### Requirement: Assign DJ to a slot
The application SHALL allow the organizer to assign a DJ from the unscheduled pool to an empty sequential grid slot or to an open position in a simultaneous stage cell.

#### Scenario: Click empty sequential slot to assign
- **WHEN** the organizer clicks an empty sequential slot cell
- **THEN** a picker opens listing all DJs who have no assignment anywhere in the lineup
- **THEN** selecting a DJ assigns them to that slot and removes them from the pool globally

#### Scenario: Add DJ to simultaneous stage
- **WHEN** the organizer clicks "Add DJ" in a simultaneous stage cell that has fewer than 3 DJs assigned
- **THEN** a picker opens listing all DJs who have no assignment anywhere in the lineup
- **THEN** selecting a DJ adds them to the next available position and removes them from the pool globally

#### Scenario: DJ already scheduled is not in pool
- **WHEN** a DJ has been assigned to any slot or simultaneous position (on any evening, on any stage)
- **THEN** that DJ SHALL NOT appear in the unscheduled pool regardless of which evening is currently viewed

#### Scenario: Click occupied sequential slot to reassign or remove
- **WHEN** the organizer clicks a slot that already has a DJ assigned
- **THEN** options are shown to reassign (pick a different DJ) or remove the DJ (return them to the pool)

### Requirement: Navigate between evenings
The application SHALL provide a navigation control to switch between the convention evenings. Only evenings that have at least one active stage (sequential or simultaneous) SHALL be shown. When the user selects a different evening, the active slot and event selection SHALL be cleared so the right pane returns to the idle/guidance state.

#### Scenario: Evening selector shows active evenings only
- **WHEN** stages are configured with various active days
- **THEN** the evening selector renders buttons only for days that appear in at least one stage's active days

#### Scenario: Selecting an evening updates the grid
- **WHEN** the organizer clicks an evening button
- **THEN** the grid updates to show only the stages and slots for that evening

#### Scenario: Selecting a new evening clears the active slot
- **WHEN** the organizer clicks an evening button that is different from the currently selected evening
- **THEN** any active slot or event selection SHALL be cleared
- **THEN** the right pane SHALL return to the guidance/idle state

### Requirement: Active event selection is stable and explicit-only
The active stage/event context in the lineup builder SHALL only change when the user explicitly clicks a slot or event cell in the grid. Automatic slot advancement after an assignment (advancing to the next empty slot) SHALL only move within the same stage (stageId). No background process, automatic navigation, or derived state change SHALL silently switch the active stage to a different event without user interaction.

#### Scenario: Auto-advance after assignment stays within the same stage
- **WHEN** the user assigns a DJ to a sequential slot and the system auto-advances to the next empty slot
- **THEN** the next slot SHALL be within the same stage (same stageId)
- **THEN** the active stage/event context SHALL NOT change to a different stage

#### Scenario: Auto-advance stops when no remaining empty slot in the stage
- **WHEN** the user assigns a DJ to the last empty sequential slot within the active stage
- **THEN** the active slot SHALL remain on the just-assigned slot (or the last slot in the stage)
- **THEN** NO automatic cross-stage jump SHALL occur
- **THEN** the user must explicitly click a slot in another stage to move there

#### Scenario: Event context unchanged by assignment to simultaneous position
- **WHEN** the user assigns a DJ to a simultaneous stage position
- **THEN** the active event context (stageId and evening) SHALL remain unchanged
- **THEN** only the active position index within the same event SHALL update (to the next empty position)

### Requirement: Unscheduled DJ pool
The application SHALL display a sidebar or panel showing all DJs who have not yet been assigned to any slot or simultaneous position anywhere in the lineup.

#### Scenario: Pool shows only globally unscheduled DJs
- **WHEN** the organizer views any evening
- **THEN** the pool panel lists only DJs who have no assignment anywhere in the lineup (sequential or simultaneous, any evening, any stage)

#### Scenario: Pool updates after assignment
- **WHEN** a DJ is assigned to a slot or simultaneous position
- **THEN** the DJ is removed from the pool panel immediately

#### Scenario: Pool updates after removal
- **WHEN** a DJ is removed from a slot or simultaneous position
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
