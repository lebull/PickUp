## ADDED Requirements

### Requirement: Summary section precedes all detail sections
The submission detail view SHALL render a summary section as the first content block after the DJ name heading, before the Basic Info, Judge Scores, and Moonlight sections.

#### Scenario: Summary appears before all other sections
- **WHEN** a submission detail view is open
- **THEN** the summary section SHALL appear immediately after the DJ name and before the Basic Info section
- **THEN** the summary section SHALL NOT be rendered after any other detail section
