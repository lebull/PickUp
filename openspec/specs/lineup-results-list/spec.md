## ADDED Requirements

### Requirement: Results list shows special-event selections below rejection list
The Results view SHALL include special-event DJ selections in a dedicated section rendered below "Did Not Make the Cut". Special-event entries SHALL not be included in the rejection section.

#### Scenario: Results order places special-event section below rejection section
- **WHEN** the Results view contains rejected DJs and at least one special-event selection
- **THEN** the "Did Not Make the Cut" section SHALL render before the special-events section
- **THEN** the special-events section SHALL be the next section after rejection content

#### Scenario: Special-event entries are excluded from rejection list
- **WHEN** a DJ is assigned to a special event
- **THEN** that DJ SHALL appear in the special-events section
- **THEN** that DJ SHALL NOT appear in "Did Not Make the Cut" solely because of special-event assignment

### Requirement: Special-event result entries use DJ identity fields consistent with lineup results
Each special-event result entry SHALL display the DJ name using existing hidden-name behavior and SHALL include available contact fields consistent with other result entries.

Special-event entries SHALL NOT require or imply a day-based slot label.

#### Scenario: Hidden-name mode applies to special-event entries
- **WHEN** hidden-name mode is enabled and a DJ appears in the special-events section
- **THEN** the entry SHALL display that DJ's anonymized identifier instead of legal name
