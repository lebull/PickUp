## ADDED Requirements

### Requirement: Blank slot assignment is a discriminated union variant of SlotAssignment
`SlotAssignment` SHALL be a discriminated union of `DJSlotAssignment` (`type: 'dj'`, required `submissionNumber: string`) and `BlankSlotAssignment` (`type: 'blank'`, optional `blankLabel?: string`). Both variants SHALL include the shared slot-location fields: `stageId`, `evening`, `slotIndex?`, `positionIndex?`. A utility function `isBlankAssignment` SHALL return `true` when `a.type === 'blank'`.

#### Scenario: Blank assignment stored in project lineup
- **WHEN** the user assigns a blank slot to a lineup position
- **THEN** a `SlotAssignment` record SHALL be added with `type: 'blank'` and the slot-location fields matching the target slot
- **THEN** no `submissionNumber` field SHALL be present on the record
- **THEN** no submission lookup SHALL be performed for this assignment

#### Scenario: DJ assignment retains required submissionNumber
- **WHEN** a DJ is assigned to a slot
- **THEN** the resulting `SlotAssignment` SHALL have `type: 'dj'` and a non-empty `submissionNumber`

#### Scenario: isBlankAssignment helper identifies blank records
- **WHEN** `isBlankAssignment` is called with a `SlotAssignment` where `type === 'blank'`
- **THEN** it SHALL return `true`
- **WHEN** called with a `SlotAssignment` where `type === 'dj'`
- **THEN** it SHALL return `false`

### Requirement: Each blank assignment carries an individual label
The `SlotAssignment` type SHALL include an optional `blankLabel?: string` field. When a blank assignment is created, the label entered by the user SHALL be stored in `blankLabel`. When `blankLabel` is absent or empty, the effective display label SHALL default to `"Blocked"`. Non-blank assignments SHALL ignore this field.

#### Scenario: Blank assignment stores the provided label
- **WHEN** the user assigns a blank slot and provides a label (e.g., "Break")
- **THEN** the resulting `SlotAssignment` SHALL have `blankLabel: 'Break'`

#### Scenario: Missing or empty label defaults to "Blocked"
- **WHEN** a blank assignment has no `blankLabel` or an empty string
- **THEN** the effective display label SHALL be `"Blocked"`

#### Scenario: Blank label is persisted with the assignment
- **WHEN** the project is saved after a blank assignment with a label is created
- **THEN** reloading the project SHALL restore the same `blankLabel` on that assignment
