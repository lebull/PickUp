## ADDED Requirements

### Requirement: Results slot panel shows prior-decline status for selected slot
When a slot in the Results list has one or more previously declined DJs recorded in `declinedBy`, the active right-side slot panel SHALL show a prior-decline status at the top of whichever panel is currently displayed for that slot.

#### Scenario: Prior-decline status appears at top of detail panel
- **WHEN** a slot with at least one `declinedBy` entry is selected and the slot's DJ detail panel is displayed
- **THEN** the top of the detail panel SHALL show a prior-decline status message
- **THEN** the message SHALL list at least one previously declined DJ identity for that slot

#### Scenario: Prior-decline status appears at top of replacement picker panel
- **WHEN** a slot with at least one `declinedBy` entry is selected and the replacement picker panel is displayed
- **THEN** the top of the replacement picker SHALL show the same prior-decline status message
- **THEN** the message SHALL be shown above picker controls and candidate list content

#### Scenario: No prior-decline status when slot has no decline history
- **WHEN** the selected slot has an empty or missing `declinedBy` history
- **THEN** no prior-decline status message SHALL be displayed

#### Scenario: Prior-decline status honors hidden names mode
- **WHEN** hidden names mode is enabled and prior-decline status is shown
- **THEN** previously declined DJ identities in the status message SHALL use anonymized naming consistent with the rest of the Results view

#### Scenario: Prior-decline status supports simultaneous slots
- **WHEN** a selected simultaneous-stage position has `declinedBy` entries
- **THEN** the prior-decline status behavior SHALL match sequential slots, including top-of-panel placement in detail or picker mode
