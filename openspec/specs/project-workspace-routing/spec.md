## Requirements

### Requirement: Tab views are nested routes
The project workspace SHALL use URL-based nested routes for the Submissions and Lineup Builder views. The URL SHALL reflect the active tab at all times.

#### Scenario: Submissions tab has its own URL
- **WHEN** the user is viewing the Submissions tab in a project
- **THEN** the URL SHALL be `/project/:id/submissions`

#### Scenario: Lineup Builder tab has its own URL
- **WHEN** the user is viewing the Lineup Builder tab in a project
- **THEN** the URL SHALL be `/project/:id/lineup`

#### Scenario: Project root redirects to submissions
- **WHEN** the user navigates to `/project/:id` with no tab segment
- **THEN** the app SHALL redirect to `/project/:id/submissions`

#### Scenario: Browser back/forward navigates between tabs
- **WHEN** the user has switched between the Submissions and Lineup Builder tabs
- **THEN** the browser back button SHALL navigate back to the previously viewed tab
- **THEN** the browser forward button SHALL navigate forward accordingly

#### Scenario: Active tab is reflected in the tab bar
- **WHEN** the user is on `/project/:id/submissions`
- **THEN** the Submissions tab SHALL display with its active style
- **WHEN** the user is on `/project/:id/lineup`
- **THEN** the Lineup Builder tab SHALL display with its active style

#### Scenario: Tab URL is bookmarkable
- **WHEN** the user copies the URL while on the Lineup Builder tab and opens it in a new tab
- **THEN** the Lineup Builder view SHALL load directly without requiring tab interaction
