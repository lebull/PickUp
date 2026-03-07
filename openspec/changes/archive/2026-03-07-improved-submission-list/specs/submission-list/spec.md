## MODIFIED Requirements

### Requirement: Selecting a submission navigates to a detail route
Clicking a submission row SHALL navigate to a URL-addressable detail view using an absolute path. The detail panel URL SHALL be `/project/:id/submissions/:djIndex` where `:djIndex` is the 0-based integer position in the original (unsorted, unfiltered) submissions array.

#### Scenario: Clicking a row navigates to detail URL using absolute path
- **WHEN** the user clicks a submission row in the list
- **THEN** the browser SHALL navigate to the absolute path `/project/:id/submissions/:djIndex`
- **THEN** the submission detail panel SHALL be displayed for that submission
- **THEN** the URL SHALL NOT contain duplicate or appended path segments regardless of the previously active URL

#### Scenario: Detail URL is bookmarkable
- **WHEN** the user copies the detail URL and opens it in a new tab
- **THEN** the submission detail panel for that index SHALL load directly

#### Scenario: Browser back from detail returns to list
- **WHEN** the user is viewing a submission detail and presses the browser back button
- **THEN** the app SHALL return to `/project/:id/submissions` with no detail panel shown

#### Scenario: Back button in detail panel navigates back
- **WHEN** the user clicks the back/close control within the submission detail panel
- **THEN** the app SHALL navigate back to `/project/:id/submissions`

## ADDED Requirements

### Requirement: Fluid column layout prevents hidden content
The submission table SHALL use a fluid column layout so that all columns — including the last column (Preferred Stages) — are always visible and never silently clipped.

#### Scenario: All columns visible without horizontal clip
- **WHEN** the submission table is rendered at any viewport width wide enough to contain the table container
- **THEN** all table columns SHALL be visible to the user without any column being cut off or hidden

#### Scenario: Table scrolls horizontally on narrow viewports
- **WHEN** the viewport is narrower than the minimum table content width
- **THEN** the table container SHALL scroll horizontally rather than silently hiding overflow columns
