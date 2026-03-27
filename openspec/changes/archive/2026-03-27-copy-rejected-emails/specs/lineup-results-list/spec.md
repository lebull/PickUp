## ADDED Requirements

### Requirement: Rejection section supports bulk email copy
The Results view SHALL provide a bulk email copy action for the "Did Not Make the Cut" section that copies email addresses for rejected DJs shown in that section.

#### Scenario: Copy action appears for rejected DJs
- **WHEN** the Results view displays the "Did Not Make the Cut" section
- **THEN** that section SHALL include a "Copy emails" action in its heading area

#### Scenario: Copy action opens rejection email list
- **WHEN** the user activates the "Copy emails" action for the "Did Not Make the Cut" section
- **THEN** the Results view SHALL open the same email-copy modal pattern used by accepted stage sections
- **THEN** the modal SHALL contain a comma-separated list of contact email addresses for DJs in the rejection section

#### Scenario: Rejection copy excludes non-rejected or missing emails
- **WHEN** the rejection email list is prepared for copy
- **THEN** it SHALL include only DJs currently listed in the "Did Not Make the Cut" section
- **THEN** entries with empty contact email values SHALL be excluded from the copied email list