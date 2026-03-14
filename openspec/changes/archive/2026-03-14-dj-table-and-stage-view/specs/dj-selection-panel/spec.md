## MODIFIED Requirements

### Requirement: Right-pane guidance shown when no slot is selected
When no slot or event is selected in the lineup builder, the right pane SHALL display the full DJ selection panel in a browsing state: a brief guidance message at the top, followed by the complete DJ table. The lineup grid SHALL remain visible and fully interactive while the browsing panel is displayed. The DJ table in the browsing state SHALL display **both** the standard score column and the moonlight score column simultaneously, regardless of the active app context, so the user can sort by either score freely. The slot tray SHALL be hidden in the browsing state. DJ rows ARE draggable onto lineup slot cells from the browsing state.

#### Scenario: DJ table shown on first load with both score columns
- **WHEN** the lineup builder first loads and no slot has been selected
- **THEN** the right pane SHALL display the DJ selection panel in browsing state
- **THEN** a guidance message SHALL be shown above the DJ table (e.g., "Click a slot or drag a DJ to assign")
- **THEN** the DJ table SHALL show both the standard score column and the moonlight score column
- **THEN** both score column headers SHALL be sortable
- **THEN** the slot tray SHALL NOT be rendered

#### Scenario: DJ table shown after closing the panel
- **WHEN** the user closes the DJ selection panel (via Escape or close button)
- **THEN** the right pane SHALL return to the DJ browsing state showing the DJ table
- **THEN** no blank or empty pane SHALL be shown

#### Scenario: DJ table shown after day change
- **WHEN** the user selects a different day of the week and the active slot is cleared
- **THEN** the right pane SHALL display the DJ browsing state

#### Scenario: Both score columns visible in browsing state regardless of app context
- **WHEN** no slot is selected and the active app context is Standard (non-moonlight)
- **THEN** the standard score column SHALL be visible in the DJ table
- **THEN** the moonlight score column SHALL also be visible in the DJ table

#### Scenario: Both score columns visible in browsing state in moonlight context
- **WHEN** no slot is selected and the active app context is Moonlight
- **THEN** the standard score column SHALL be visible in the DJ table
- **THEN** the moonlight score column SHALL also be visible in the DJ table

#### Scenario: DJ filtered by current evening in browsing state
- **WHEN** the user is viewing a particular evening and no slot is selected
- **THEN** the DJ table SHALL show only DJs available on that evening who are not discarded
- **THEN** already-assigned DJs SHALL be omitted from the browsing list
