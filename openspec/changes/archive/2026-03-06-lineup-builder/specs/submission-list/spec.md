## ADDED Requirements

### Requirement: Submission list pool view in Lineup Builder
When the Lineup Builder mode is active, the submission list SHALL be accessible as a read-only reference panel (the "pool") showing unscheduled DJs for the currently selected evening. This is separate from the full Submission Browser tab.

#### Scenario: Pool filters by evening availability and global assignment status
- **WHEN** the organizer is viewing an evening in Lineup Builder
- **THEN** only submissions whose days-available includes that evening are shown in the pool panel
- **THEN** submissions already assigned to any slot anywhere in the lineup (any evening, any stage) SHALL NOT appear in the pool

#### Scenario: Clicking a pool entry assigns to selected slot
- **WHEN** a grid slot is selected (awaiting assignment) and the organizer clicks a DJ in the pool
- **THEN** that DJ is assigned to the selected slot
