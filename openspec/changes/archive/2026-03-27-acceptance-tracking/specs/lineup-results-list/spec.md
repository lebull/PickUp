## ADDED Requirements

### Requirement: Results list integrates acceptance controls, replacement picker, search, and day grouping
The `lineup-results-list` surface SHALL compose the new capabilities defined in `acceptance-status`, `results-acceptance-controls`, `results-replacement-picker`, `results-list-search`, and `results-list-day-grouping`.

#### Scenario: Acceptance controls appear on stage-section DJ rows
- **WHEN** the Results list is displayed
- **THEN** each assigned DJ row within a stage section SHALL display the acceptance controls defined in the `results-acceptance-controls` spec

#### Scenario: Replacement picker appears within the Results view when triggered
- **WHEN** a user activates the replacement flow for a declined slot
- **THEN** the inline DJSelectionPanel SHALL appear within the Results view as defined in the `results-replacement-picker` spec

#### Scenario: Search field is present at the top of the Results list
- **WHEN** the Results list is displayed
- **THEN** the search input defined in the `results-list-search` spec SHALL be visible at or near the top of the view

#### Scenario: Stage sections display day-of-week group headings
- **WHEN** the Results list renders stage sections
- **THEN** slot rows SHALL be grouped under day headings as defined in the `results-list-day-grouping` spec
