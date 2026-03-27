## ADDED Requirements

### Requirement: DJSlotAssignment carries acceptance status
Each `DJSlotAssignment` SHALL carry an `acceptanceStatus` field with values `'pending'`, `'yes'`, or `'no'`. Assignments without this field SHALL be treated as `'pending'`.

#### Scenario: Default acceptance status for new assignments
- **WHEN** a DJ is assigned to a slot via the normal lineup builder flow
- **THEN** the resulting `DJSlotAssignment` SHALL have `acceptanceStatus` equal to `'pending'`

#### Scenario: Missing field treated as pending
- **WHEN** a `DJSlotAssignment` loaded from persisted data has no `acceptanceStatus` field
- **THEN** the application SHALL treat that assignment as having `acceptanceStatus` of `'pending'`

### Requirement: DJSlotAssignment tracks prior declined DJs
Each `DJSlotAssignment` SHALL carry a `declinedBy` field containing the `submissionNumber`s of DJs who previously held that slot and declined. Assignments without this field SHALL default to an empty array.

#### Scenario: New assignment starts with empty declinedBy
- **WHEN** a slot is assigned for the first time
- **THEN** the `DJSlotAssignment` SHALL have a `declinedBy` array that is empty

#### Scenario: Replacement preserves declined history
- **WHEN** a DJ with `acceptanceStatus` of `'no'` is replaced by a new DJ
- **THEN** the new `DJSlotAssignment` SHALL include the outgoing DJ's `submissionNumber` in its `declinedBy` array
- **THEN** the new `DJSlotAssignment` SHALL also include any `submissionNumber`s from the previous assignment's `declinedBy`

#### Scenario: Missing declinedBy treated as empty
- **WHEN** a `DJSlotAssignment` loaded from persisted data has no `declinedBy` field
- **THEN** the application SHALL treat that assignment as having an empty `declinedBy` array

### Requirement: Acceptance status is settable via project store
The project store SHALL expose an action to set the `acceptanceStatus` of a specific `DJSlotAssignment` to `'yes'` or `'no'`.

#### Scenario: Setting status to yes
- **WHEN** the set-acceptance action is called with status `'yes'` for a given slot coordinate
- **THEN** the matching `DJSlotAssignment` SHALL have `acceptanceStatus` equal to `'yes'`

#### Scenario: Setting status to no
- **WHEN** the set-acceptance action is called with status `'no'` for a given slot coordinate
- **THEN** the matching `DJSlotAssignment` SHALL have `acceptanceStatus` equal to `'no'`

#### Scenario: Setting status to pending
- **WHEN** the set-acceptance action is called with status `'pending'` for a given slot coordinate
- **THEN** the matching `DJSlotAssignment` SHALL have `acceptanceStatus` equal to `'pending'`

### Requirement: Acceptance status resets on reassignment from Lineup Builder
When a DJ is replaced via the standard Lineup Builder flow (not the replacement picker), the new `DJSlotAssignment` SHALL have `acceptanceStatus` of `'pending'` and `declinedBy` SHALL be empty.

#### Scenario: Standard reassignment clears history
- **WHEN** a user assigns a different DJ to an already-occupied slot via the Lineup Builder's DJSelectionPanel
- **THEN** the resulting assignment SHALL have `acceptanceStatus` equal to `'pending'`
- **THEN** the resulting assignment's `declinedBy` SHALL be empty
