## ADDED Requirements

### Requirement: Lineup navigation includes a Special Events tab
The lineup builder SHALL provide a Special Events tab in the same primary mode control that contains Day View and Stage View. The active mode SHALL be visually indicated, and switching modes SHALL update the visible planning surface.

#### Scenario: Special Events tab appears with existing view tabs
- **WHEN** the lineup builder header is rendered
- **THEN** the mode control SHALL include Day View, Stage View, and Special Events
- **THEN** exactly one mode SHALL be shown as active

#### Scenario: Switching to Special Events opens special-event planning surface
- **WHEN** the user selects the Special Events tab
- **THEN** the lineup area SHALL render the special-events assignment surface
- **THEN** day-view evening tabs and stage-view stage selector SHALL be hidden for that mode
- **THEN** no day selector SHALL be required to view or edit special-stage assignments

#### Scenario: Leaving Special Events restores selected standard mode
- **WHEN** the user switches from Special Events to Day View or Stage View
- **THEN** the lineup builder SHALL render the target mode's existing controls and grid behavior unchanged
