## Requirements

### Requirement: DJ selection panel groups DJs by preference rank for a focused stage
The DJ selection panel SHALL provide a single-select "focus stage" control. When a stage is focused, the DJ list SHALL be divided into ordered groups based on each DJ's preference ranking for that stage. When no stage is focused, the flat sorted list SHALL be displayed as before.

#### Scenario: No stage focused shows flat sorted list
- **WHEN** no stage is focused in the DJ selection panel
- **THEN** all available DJs SHALL be displayed in a single flat list, sorted by active-context score descending

#### Scenario: Focusing a stage groups DJs by preference rank
- **WHEN** the user selects a stage as the focus stage
- **THEN** the DJ list SHALL be divided into groups in this order: "1st Choice", "2nd Choice", "3rd Choice", "4th / 5th Choice", "No Preference"
- **THEN** each group SHALL contain only DJs whose `stagePreferences` places the focused stage in the corresponding rank position
- **THEN** within each group, DJs SHALL be ordered by active-context score descending

#### Scenario: Empty groups are omitted
- **WHEN** a focus stage is active and no DJs fall into a particular rank group
- **THEN** that group heading SHALL NOT be rendered

#### Scenario: Clicking the focused stage again clears focus
- **WHEN** the user clicks the already-focused stage button
- **THEN** the focus stage SHALL be cleared
- **THEN** the panel SHALL revert to the flat sorted list

#### Scenario: Focus stage resets when active slot changes
- **WHEN** the user clicks a different slot while a focus stage is active
- **THEN** the focus stage SHALL reset to none
