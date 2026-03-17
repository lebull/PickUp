## ADDED Requirements

### Requirement: Fuzzy DJ name search filters submission list
The submission list controls SHALL include a text input search bar that filters displayed submissions by DJ name. Filtering SHALL use a case-insensitive substring match against each submission's DJ name (or anonymous ID when Hidden Names mode is active). The search bar SHALL be cleared when the active app context changes.

#### Scenario: Typing in search bar filters list
- **WHEN** the user types text into the search bar
- **THEN** only submissions whose DJ name contains the typed text (case-insensitive) SHALL be displayed

#### Scenario: Empty search shows all submissions
- **WHEN** the search bar is empty
- **THEN** all submissions (subject to any other active filters) SHALL be displayed

#### Scenario: Search against anonymous ID in Hidden Names mode
- **WHEN** Hidden Names mode is active and the user types in the search bar
- **THEN** the filter SHALL match against the anonymized label (e.g., "DJ #5") rather than the real DJ name

#### Scenario: Search count shown in controls row
- **WHEN** the search bar contains text that reduces the visible submission count
- **THEN** the controls row SHALL show the filtered count alongside the total (e.g., "12 / 89 submissions")

#### Scenario: Search is cleared on app context change
- **WHEN** the active app context changes (e.g., Standard ↔ Moonlight)
- **THEN** the search bar SHALL be cleared and all submissions SHALL be shown again
