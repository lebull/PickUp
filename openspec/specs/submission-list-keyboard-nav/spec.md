## ADDED Requirements

### Requirement: Arrow key navigation through submission list
The submission list container SHALL support keyboard navigation using the Up and Down arrow keys to move the focused row through the sorted and filtered list.

#### Scenario: Arrow Down moves cursor to next row
- **WHEN** the submission list container has focus and the user presses the Down arrow key
- **THEN** the highlighted (cursor) row SHALL advance to the next row in the displayed list
- **THEN** the cursor SHALL not move past the last row

#### Scenario: Arrow Up moves cursor to previous row
- **WHEN** the submission list container has focus and the user presses the Up arrow key
- **THEN** the highlighted (cursor) row SHALL move to the previous row in the displayed list
- **THEN** the cursor SHALL not move before the first row

#### Scenario: Cursor row is visually distinct
- **WHEN** a row is the current keyboard cursor row
- **THEN** that row SHALL have a visually distinct style (e.g. highlighted background) separate from the hover state

#### Scenario: Enter or Space activates the cursor row
- **WHEN** the user presses Enter or Space while a cursor row is set
- **THEN** the application SHALL navigate to the detail view for that submission, identical to clicking that row

#### Scenario: Clicking a row sets the cursor
- **WHEN** the user clicks a submission row
- **THEN** the keyboard cursor SHALL be set to that row's position in the displayed list

#### Scenario: Container must be focusable
- **WHEN** the user clicks anywhere within the submission list
- **THEN** the list container SHALL receive focus so that subsequent arrow key presses are handled
