## ADDED Requirements

### Requirement: Results list displays acceptance status per assigned slot row
Each assigned DJ row in the Results list SHALL display the current `acceptanceStatus` of their slot assignment and provide controls to change it.

#### Scenario: Pending slot shows action buttons
- **WHEN** an assigned DJ row has `acceptanceStatus` of `'pending'`
- **THEN** the row SHALL display a "Yes" button and a "No" button
- **THEN** neither button SHALL appear visually selected

#### Scenario: Yes slot shows confirmed state
- **WHEN** an assigned DJ row has `acceptanceStatus` of `'yes'`
- **THEN** the row SHALL display a confirmed visual indicator (e.g., "Yes" highlighted green)
- **THEN** the row SHALL still provide a way to revert to pending or set to no

#### Scenario: No slot shows declined state
- **WHEN** an assigned DJ row has `acceptanceStatus` of `'no'`
- **THEN** the row SHALL display a declined visual indicator (e.g., "No" highlighted red)
- **THEN** the row SHALL provide a way to revert to pending or set to yes

#### Scenario: Clicking Yes sets status to yes
- **WHEN** a user clicks the "Yes" button on a pending or declined slot row
- **THEN** the slot's `acceptanceStatus` SHALL be set to `'yes'`

#### Scenario: Clicking No sets status to no
- **WHEN** a user clicks the "No" button on a pending or accepted slot row
- **THEN** the slot's `acceptanceStatus` SHALL be set to `'no'`

#### Scenario: Simultaneous-stage slot rows show acceptance controls
- **WHEN** a simultaneous-stage position is occupied by a DJ
- **THEN** that row in the Results list SHALL display the same acceptance status controls as a sequential-stage slot row
