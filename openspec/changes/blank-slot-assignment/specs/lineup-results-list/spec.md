## ADDED Requirements

### Requirement: Blank-assigned slots appear in the accepted section with their label
The Results view SHALL include blank-assigned slots in the accepted section alongside DJ entries. For each stage section, blank assignments SHALL appear as entries displaying the assignment's `blankLabel` (defaulting to `"Blocked"` if absent) as the display name, the slot time (for sequential) or position label (for simultaneous), and no contact or scoring information.

#### Scenario: Blank assignment appears in stage results section
- **WHEN** a sequential slot has a blank assignment with `blankLabel: 'Opening Ceremony'`
- **THEN** it SHALL appear in that stage's section in the Results view
- **THEN** the entry SHALL display `"Opening Ceremony"` as the label
- **THEN** the entry SHALL display the slot time
- **THEN** no contact email, Telegram/Discord, genre, or format/gear SHALL be shown for that entry

#### Scenario: Blank assignment with no label displays default
- **WHEN** a blank assignment has no `blankLabel`
- **THEN** the Results view SHALL display `"Blocked"` as the label for that entry

#### Scenario: Blank assignments are excluded from the rejection section
- **WHEN** a slot has a blank assignment
- **THEN** that blank assignment SHALL NOT appear in the "Did Not Make the Cut" section
- **THEN** the blank assignment SHALL NOT be counted as an unassigned or discarded submission

## MODIFIED Requirements

### Requirement: Accepted DJs are listed grouped by stage
The Results view SHALL display a section for each stage that has at least one assigned DJ or blank assignment. Each section SHALL use the stage name as a heading. Within each stage section, assigned DJs SHALL be listed with: DJ name, contact email, Telegram/Discord, genre, and format/gear. Blank-assigned slots SHALL be listed with the assignment's `blankLabel` (defaulting to `"Blocked"`) and the slot time, without contact or scoring fields.

#### Scenario: Each stage with assignments has its own section
- **WHEN** the lineup has assignments (DJ or blank) across one or more stages
- **THEN** the Results view SHALL render one section per stage that has at least one assigned DJ or blank slot
- **THEN** stages SHALL be ordered according to the stage order in `project.stages`

#### Scenario: Each accepted DJ entry shows contact info and secondary fields
- **WHEN** an assigned DJ entry is displayed
- **THEN** the DJ name SHALL be the primary label
- **THEN** contact email and Telegram/Discord SHALL be prominently visible
- **THEN** genre and format/gear SHALL be displayed as secondary info

#### Scenario: Empty state when no assignments exist
- **WHEN** no DJs or blank slots have been assigned to any position in the project
- **THEN** the Results view SHALL display an informational message indicating no lineup has been built yet
