## ADDED Requirements

### Requirement: Blank slot entry appears pinned at the top of the DJ picker list
The `DJSelectionPanel` SHALL render a blank slot row as the first item in the DJ list, above all DJ submission rows, regardless of sort order, filters, or stage focus grouping. The row SHALL include an editable text input pre-filled with `"Blocked"` that sets the label for the assignment. The blank slot row SHALL always be visible (never filtered out).

#### Scenario: Blank slot row is the first item in the panel
- **WHEN** the DJ selection panel is open for any slot
- **THEN** the first row in the list SHALL be the blank slot entry
- **THEN** all DJ submission rows SHALL appear below it

#### Scenario: Blank slot row has an editable label input pre-filled with "Blocked"
- **WHEN** the DJ selection panel is rendered
- **THEN** the blank slot row SHALL contain a text input pre-filled with `"Blocked"`
- **THEN** the user MAY edit the input to set a custom label before assigning

#### Scenario: For an already-blank slot, the panel pre-fills existing label
- **WHEN** the user opens the DJ selection panel for a slot that already has a blank assignment
- **THEN** the blank slot row's label input SHALL be pre-filled with that slot's existing `blankLabel` (or `"Blocked"` if absent)

#### Scenario: Blank slot is not affected by filters or stage grouping
- **WHEN** any search filter or stage focus is active
- **THEN** the blank slot row SHALL still appear as the first item in the list

### Requirement: Clicking the blank slot row assigns a blank with the entered label
When the user clicks the blank slot row (outside the label input), the active slot SHALL be assigned as blank using the `'__blank__'` sentinel and the current value of the label input as `blankLabel`. If the input is empty, `blankLabel` SHALL be omitted (defaulting to `"Blocked"` at display time). The panel SHALL then close.

#### Scenario: Clicking blank slot row assigns blank with label and closes panel
- **WHEN** the user has entered `"Break"` in the label input and clicks the blank slot row
- **THEN** the active slot SHALL be assigned with `type: 'blank'` and `blankLabel: 'Break'`
- **THEN** the DJ selection panel SHALL close

#### Scenario: Clicking with default label assigns blank with no explicit blankLabel
- **WHEN** the user clicks the blank slot row without changing the default `"Blocked"` label
- **THEN** the assignment SHALL have `type: 'blank'` and MAY omit `blankLabel` (display code will default to `"Blocked"`)

#### Scenario: Blank-assigned slot can be reassigned by reopening the panel
- **WHEN** the user clicks a blank-assigned slot in the lineup grid
- **THEN** the DJ selection panel SHALL open with the blank slot row at the top
- **THEN** the label input SHALL be pre-filled with the existing `blankLabel`
- **THEN** the user MAY update the label and re-click the blank slot row to save the new label
