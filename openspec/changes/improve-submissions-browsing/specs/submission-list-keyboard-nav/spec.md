## MODIFIED Requirements

### Requirement: Arrow key navigation through submission list
The submission list container SHALL support keyboard navigation using the Up and Down arrow keys. Each arrow key press SHALL both move the cursor row AND immediately navigate to the detail view for the new cursor row (equivalent to clicking that row). The cursor row SHALL always be scrolled into the viewport after each arrow key movement.

#### Scenario: Arrow Down moves cursor and immediately navigates to next submission
- **WHEN** the submission list container has focus and the user presses the Down arrow key
- **THEN** the highlighted (cursor) row SHALL advance to the next row in the displayed list
- **THEN** the application SHALL immediately navigate to the detail view for the new cursor row without requiring Enter or Space
- **THEN** the cursor SHALL not move past the last row

#### Scenario: Arrow Up moves cursor and immediately navigates to previous submission
- **WHEN** the submission list container has focus and the user presses the Up arrow key
- **THEN** the highlighted (cursor) row SHALL move to the previous row in the displayed list
- **THEN** the application SHALL immediately navigate to the detail view for the new cursor row without requiring Enter or Space
- **THEN** the cursor SHALL not move before the first row

#### Scenario: Cursor row is visually distinct
- **WHEN** a row is the current keyboard cursor row
- **THEN** that row SHALL have a visually distinct style (e.g. highlighted background) separate from the hover state

#### Scenario: Cursor row is scrolled into viewport after arrow key press
- **WHEN** the user presses an arrow key and the new cursor row is outside the visible scroll area
- **THEN** the list SHALL scroll so the cursor row is visible (scroll-into-view with nearest block alignment)
- **WHEN** the new cursor row is already visible in the scroll area
- **THEN** the scroll position SHALL NOT change

#### Scenario: Enter or Space also activates the cursor row
- **WHEN** the user presses Enter or Space while a cursor row is set
- **THEN** the application SHALL navigate to the detail view for that submission (same as clicking or using arrow keys)

#### Scenario: Clicking a row sets the cursor
- **WHEN** the user clicks a submission row
- **THEN** the keyboard cursor SHALL be set to that row's position in the displayed list

#### Scenario: Container must be focusable
- **WHEN** the user clicks anywhere within the submission list
- **THEN** the list container SHALL receive focus so that subsequent arrow key presses are handled
