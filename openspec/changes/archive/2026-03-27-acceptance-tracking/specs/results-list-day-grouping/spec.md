## ADDED Requirements

### Requirement: Results list groups each stage's slots by day of the week
Within each stage's accepted-DJ section, slot rows SHALL be grouped under a day-of-week heading. The heading SHALL display the day name (e.g., "Friday").

#### Scenario: Stage section with multiple active days shows day headings
- **WHEN** a stage has accepted DJs across more than one evening
- **THEN** the stage's slot rows SHALL be separated into groups, one per evening
- **THEN** each group SHALL display a heading with the day name before its rows

#### Scenario: Day headings respect the project's active-day order
- **WHEN** day groups are rendered within a stage section
- **THEN** the groups SHALL appear in the same order as the project's configured schedule or active-days list

#### Scenario: Stage with only one active day still shows a day heading
- **WHEN** a stage has all accepted DJs on a single evening
- **THEN** that evening's day heading SHALL still be displayed above its rows

#### Scenario: Sequential-stage rows are grouped by their evening field
- **WHEN** sequential-stage slot assignments are rendered in the Results list
- **THEN** each group SHALL contain only slots whose `evening` matches the group's day

#### Scenario: Simultaneous-stage rows are grouped by their evening field
- **WHEN** simultaneous-stage position assignments are rendered in the Results list
- **THEN** each group SHALL contain only position rows whose `evening` matches the group's day
- **THEN** simultaneous positions within the same day group SHALL remain together

#### Scenario: Slots with no attributable day appear in an Other group
- **WHEN** a slot assignment cannot be matched to a known active day
- **THEN** that slot SHALL appear in an "Other" group rendered after all named-day groups
