## Requirements

### Requirement: Users can mark a submission as discarded
The application SHALL allow a user to mark any submission as discarded from the submission detail view. A discarded submission SHALL be excluded from all DJ selection panels and lineup assignment flows. The discarded state SHALL be persisted with the project.

#### Scenario: User discards a submission
- **WHEN** the user activates the discard action in the submission detail view
- **THEN** the submission's `submissionNumber` SHALL be added to `project.discardedSubmissions`
- **THEN** the submission list row SHALL immediately display the `discarded` visual state
- **THEN** the project SHALL be saved to persist the change

#### Scenario: User un-discards a submission
- **WHEN** the user activates the discard action in the detail view for a submission that is already discarded
- **THEN** the submission's `submissionNumber` SHALL be removed from `project.discardedSubmissions`
- **THEN** the submission list row SHALL revert to its appropriate visual state (in-lineup, duplicate-name, or none)
- **THEN** the project SHALL be saved to persist the change

#### Scenario: Discard state persists across sessions
- **WHEN** a project with discarded submissions is closed and reopened
- **THEN** the previously discarded submissions SHALL still display the `discarded` visual state

#### Scenario: Discard state is included in project export and import
- **WHEN** a project is exported to JSON and re-imported
- **THEN** the `discardedSubmissions` field SHALL be preserved
- **THEN** discarded submissions SHALL still show as discarded after import

### Requirement: Duplicate DJ name warning
The application SHALL display a duplicate-name warning indicator on any submission row whose `djName` matches the `djName` of one or more other non-discarded submissions in the same project.

#### Scenario: Duplicate name warning appears when two non-discarded submissions share a name
- **WHEN** two or more non-discarded submissions share the same `djName`
- **THEN** all such submission rows SHALL display the `duplicate-name` visual state

#### Scenario: Duplicate name warning resolves when all but one duplicate is discarded
- **WHEN** all but one submission sharing a given `djName` have been discarded
- **THEN** the remaining non-discarded submission SHALL no longer display the `duplicate-name` indicator

#### Scenario: Discarded submissions do not trigger duplicate-name warnings
- **WHEN** a submission is in the `discarded` state
- **THEN** it SHALL NOT cause the `duplicate-name` indicator to appear on other rows
- **THEN** its own row SHALL show only the `discarded` state, not the `duplicate-name` state

### Requirement: Project schema includes discardedSubmissions field
The `Project` type SHALL include a `discardedSubmissions` field containing an array of `submissionNumber` strings. Legacy projects without this field SHALL be normalized to an empty array on load.

#### Scenario: Legacy project normalizes discardedSubmissions
- **WHEN** a project loaded from IndexedDB does not have a `discardedSubmissions` field
- **THEN** `normalizeProject` SHALL set `discardedSubmissions` to `[]`
- **THEN** no submissions SHALL be treated as discarded by default
