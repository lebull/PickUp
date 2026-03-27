## ADDED Requirements

### Requirement: Detail view shows declined assignment notice with slot context
When a submission is currently assigned to a lineup slot with `acceptanceStatus` equal to `'no'`, the submission detail view SHALL display a declined-status notice at the top of the detail content. The notice SHALL include the assignment context for that declined slot.

#### Scenario: Declined notice appears at top for sequential assignment
- **WHEN** a submission detail view is open for a DJ whose active sequential slot assignment has `acceptanceStatus` of `'no'`
- **THEN** a declined notice SHALL appear above the summary and other detail sections
- **THEN** the notice SHALL include stage name, day/evening label, and slot time label

#### Scenario: Declined notice appears at top for simultaneous assignment
- **WHEN** a submission detail view is open for a DJ whose active simultaneous position assignment has `acceptanceStatus` of `'no'`
- **THEN** a declined notice SHALL appear above the summary and other detail sections
- **THEN** the notice SHALL include stage name, day/evening label, event context, and position/slot label sufficient to identify the assignment

#### Scenario: No declined notice for accepted or pending assignments
- **WHEN** a submission detail view is open for a DJ whose active assignment status is `'pending'` or `'yes'`
- **THEN** the declined notice SHALL NOT be displayed

#### Scenario: Notice content honors hidden names mode
- **WHEN** hidden names mode is enabled and a declined notice is shown
- **THEN** any DJ identity shown in the notice SHALL use the same anonymized naming behavior as the rest of the detail view

#### Scenario: Declined notice appears in all pages using the shared detail view
- **WHEN** a user opens the same submission in different app pages that render the shared submission detail component
- **THEN** the declined notice behavior SHALL be consistent across those pages
