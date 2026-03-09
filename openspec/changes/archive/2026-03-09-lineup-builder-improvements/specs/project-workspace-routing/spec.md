## ADDED Requirements

### Requirement: Selected evening is encoded in the Lineup Builder URL
When the user is viewing the Lineup Builder, the currently selected evening SHALL be encoded as a URL segment so the view survives page refresh and supports browser history navigation.

#### Scenario: Lineup Builder URL includes the selected evening
- **WHEN** the user is viewing the Lineup Builder and has selected an evening (e.g. "Friday")
- **THEN** the URL SHALL be `/project/:id/lineup/friday` (lowercase day slug)

#### Scenario: Selecting a different evening updates the URL
- **WHEN** the user clicks a different evening button in the lineup grid
- **THEN** the URL SHALL update to reflect the newly selected evening
- **THEN** the browser history SHALL receive a new entry so back navigation returns to the previous evening

#### Scenario: Page refresh preserves the selected evening
- **WHEN** the user refreshes the page while viewing a specific evening in the Lineup Builder
- **THEN** the same evening SHALL be selected after reload

#### Scenario: Navigating to lineup root redirects to first active evening
- **WHEN** the user navigates to `/project/:id/lineup` with no evening segment
- **THEN** the app SHALL redirect to `/project/:id/lineup/:firstEvening` where `:firstEvening` is the first active evening in convention order

#### Scenario: Invalid day segment falls back to first active evening
- **WHEN** the URL contains a day slug that does not correspond to any active evening
- **THEN** the app SHALL display the first active evening without an error state
