## ADDED Requirements

### Requirement: Declined DJ slot is selectable for replacement
In the Results list, a DJ slot row with `acceptanceStatus` of `'no'` SHALL be selectable to trigger an inline replacement picker.

#### Scenario: Clicking a declined row opens replacement picker
- **WHEN** a user clicks a DJ slot row with `acceptanceStatus` of `'no'`
- **THEN** an inline DJ selection panel SHALL appear within the Results view
- **THEN** the panel SHALL show the same DJ list as the Lineup Builder's DJSelectionPanel for that slot's stage and evening

#### Scenario: Only one replacement picker open at a time
- **WHEN** a replacement picker is open for one slot and the user clicks a different declined slot row
- **THEN** the picker SHALL close for the previous slot and open for the newly selected slot

#### Scenario: Clicking the same declined row closes the picker
- **WHEN** a replacement picker is open for a slot and the user clicks that same row again
- **THEN** the picker SHALL close without making any assignment

### Requirement: Replacement picker excludes previously declined DJs
The inline replacement picker in the Results list SHALL exclude DJs whose `submissionNumber` appears in the slot's `declinedBy` array.

#### Scenario: Prior declinee is absent from picker list
- **WHEN** the replacement picker is open for a slot with one or more entries in `declinedBy`
- **THEN** those DJs SHALL NOT appear in the picker's DJ list

#### Scenario: All prior declinee exclusions are cumulative
- **WHEN** a slot has gone through multiple rounds of replacement
- **THEN** all previously declined DJs SHALL be excluded from the picker regardless of replacement depth

#### Scenario: Picker otherwise matches Lineup Builder behavior
- **WHEN** the replacement picker is displayed in the Results view
- **THEN** it SHALL filter, sort, and display DJs in the same way as the Lineup Builder's DJSelectionPanel
- **THEN** it SHALL respect the same `discardedSubmissions` and stage-preference filters

### Requirement: Selecting a replacement DJ updates the slot and carries over history
When the user selects a DJ from the replacement picker, the slot SHALL be reassigned and the history of declines SHALL be preserved.

#### Scenario: Replacement assignment carries declinedBy forward
- **WHEN** a user selects a replacement DJ from the results replacement picker
- **THEN** the new `DJSlotAssignment` SHALL include the previously declined DJ's `submissionNumber` in `declinedBy`
- **THEN** the new assignment SHALL include all prior `declinedBy` entries as well
- **THEN** the new assignment SHALL have `acceptanceStatus` of `'pending'`

#### Scenario: Replacement picker closes after selection
- **WHEN** the user selects a DJ from the replacement picker
- **THEN** the inline picker SHALL close

#### Scenario: Simultaneous-stage slot replacement works identically
- **WHEN** a simultaneous-stage position slot has `acceptanceStatus` of `'no'`
- **THEN** the replacement flow SHALL work identically to sequential-stage replacement
- **THEN** `declinedBy` SHALL be carried forward for simultaneous-position slots

### Requirement: Slot and event context display in replacement picker
The replacement picker shown in the Results view SHALL display the same slot-level context (slot label, current stage, evening) as is shown in the Lineup Builder's SlotTray.

#### Scenario: Slot context header is present in replacement picker
- **WHEN** the replacement picker is open for a specific slot
- **THEN** the slot label (time and/or day) SHALL be displayed in the picker header area
- **THEN** the stage name SHALL be visible in or near the picker header
