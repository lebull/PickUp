## MODIFIED Requirements

### Requirement: Render the schedule grid
The application SHALL render a schedule grid for a selected evening. Columns represent stages that are active on the selected evening. Sequential stage columns share a **common time axis** spanning the union of all active sequential stages' start and end times on that evening, stepped by the minimum slot duration across those stages. Each sequential cell is the intersection of a stage column and a time axis row; stages that have no scheduled slot at a given time row SHALL render an empty, non-interactive cell at that position rather than being absent. Simultaneous stage columns render as a single cell spanning the full time axis, showing all assigned DJs concurrently. Stage columns SHALL appear left-to-right in the order stages are defined in the project configuration. When a stage has an assigned color, its column header and occupied cells SHALL display a color accent derived from the stage's palette color. All time labels displayed in the grid (row headers) SHALL be formatted according to the active `timeFormat` preference (`'12h'` or `'24h'`).

#### Scenario: Grid renders columns for active stages on selected evening
- **WHEN** the organizer selects an evening (e.g., "Friday")
- **THEN** the grid renders one column per stage (sequential or simultaneous) that has "Friday" in its active days
- **THEN** stages not active on that evening are not shown
- **THEN** columns appear left-to-right in the order stages are defined in the project

#### Scenario: Time axis spans the union of all active sequential stage ranges
- **WHEN** the selected evening has multiple sequential stages with different start/end times
- **THEN** the grid renders a single shared time axis from the earliest start time to the latest end time across all active sequential stages
- **THEN** every time slot at the minimum step interval is represented as a row in the shared axis
- **THEN** stages with no scheduled slot at a given time row show an empty non-interactive cell at that row

#### Scenario: Gap rows appear when a stage does not cover part of the time range
- **WHEN** one sequential stage runs 20:00–23:00 and another runs 22:00–02:00 on the same evening
- **THEN** the shared time axis spans 20:00 through 01:00
- **THEN** the first stage shows empty cells for rows from 23:00 onward
- **THEN** the second stage shows empty cells for rows from 20:00 to 21:00

#### Scenario: Grid renders time slot rows for sequential stages
- **WHEN** a sequential stage has start time, end time, and slot duration configured
- **THEN** the stage column shows content (assigned DJ or empty) aligned to the appropriate row in the shared time axis

#### Scenario: Simultaneous stage column spans full height
- **WHEN** a simultaneous stage is active on the selected evening
- **THEN** its column renders as a single cell spanning the entire height of the shared time axis
- **THEN** no row divisions appear within that column

#### Scenario: Empty sequential slot appears unoccupied
- **WHEN** a sequential grid cell has no DJ assigned and is within the stage's scheduled range
- **THEN** the cell SHALL appear visually interactive (inviting assignment via click to open the DJ selection panel)
- **THEN** no color tint SHALL be applied to empty cells

#### Scenario: Occupied sequential slot displays DJ name with stage color
- **WHEN** a DJ has been assigned to a sequential slot and the stage has a color assigned
- **THEN** the cell SHALL display the DJ's name
- **THEN** the cell SHALL display a subtle color tint matching the stage's palette color

#### Scenario: Stage column header tinted with stage color
- **WHEN** a stage with an assigned color is rendered in the grid
- **THEN** that stage's column header SHALL display a color accent using the stage's palette color
- **THEN** stages without a color SHALL render column headers with default neutral styling

#### Scenario: Row headers display times in the active time format
- **WHEN** the time axis row headers are rendered
- **THEN** each row header SHALL display the slot start time formatted according to the `timeFormat` preference
- **WHEN** `timeFormat` is `'12h'`
- **THEN** times SHALL be displayed as `h:MM am/pm` (e.g., "8:00 pm", "12:00 am")
- **WHEN** `timeFormat` is `'24h'`
- **THEN** times SHALL be displayed as `HH:MM` (e.g., "20:00", "00:00")

## ADDED Requirements

### Requirement: Time labels in the grid apply the app-wide time format
All time labels rendered in the lineup grid (row headers and any inline slot-time displays) SHALL use the `formatTimeLabel` utility with the active `timeFormat` preference from `AppPreferencesContext`.

#### Scenario: 24-hour format renders HH:MM labels
- **WHEN** the `timeFormat` preference is `'24h'`
- **THEN** all time labels SHALL appear as `HH:MM` strings (e.g., "20:00", "00:30")

#### Scenario: 12-hour format renders h:MM am/pm labels
- **WHEN** the `timeFormat` preference is `'12h'`
- **THEN** all time labels SHALL appear with a 12-hour clock and AM/PM suffix (e.g., "8:00 pm", "12:30 am")
