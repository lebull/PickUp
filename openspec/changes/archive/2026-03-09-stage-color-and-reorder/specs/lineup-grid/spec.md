## MODIFIED Requirements

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
