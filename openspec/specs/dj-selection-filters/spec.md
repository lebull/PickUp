```markdown
## ADDED Requirements

### Requirement: Genre is visible in the DJ selection panel and submission list (not filterable)
Genre values SHALL be displayed as an informational column in the DJ selection panel and in the main submission list. No filter control for genre SHALL be provided, because genre values are free-text and not reliably categorisable.

#### Scenario: Genre column visible in DJ selection panel
- **WHEN** the DJ selection panel is open
- **THEN** each DJ card or row SHALL show the DJ's genre value as a display-only field

#### Scenario: Genre column visible in submission list
- **WHEN** the submission list is displayed
- **THEN** a Genre column SHALL be present as a display-only column with no filter control

### Requirement: DJ selection panel provides a stage preference filter
The DJ selection panel SHALL provide a stage preference filter control that limits the visible DJ list to submissions that have listed at least one of the selected stages in their stage preferences.

#### Scenario: Stage filter shows all stages from project configuration
- **WHEN** the stage preference filter is rendered inside the DJ selection panel and a project is loaded with configured stages
- **THEN** the filter control SHALL list each configured stage by name

#### Scenario: Selecting a stage shows DJs that prefer it
- **WHEN** the user selects one or more stages in the stage preference filter within the DJ selection panel
- **THEN** only submissions that have at least one of the selected stages anywhere in their `stagePreferences` array SHALL be displayed in the panel

#### Scenario: No stages selected shows all available DJs
- **WHEN** no stage is selected in the stage preference filter
- **THEN** all available DJs SHALL be shown (no stage filtering applied)

#### Scenario: Stage filter composes with day availability filter
- **WHEN** a stage filter is active and the panel already filters by the active slot's evening
- **THEN** only submissions satisfying both the stage preference criteria AND the evening availability criteria SHALL be displayed (intersection)

### Requirement: Active context determines default primary sort score column
The submission list and DJ selection panel SHALL default to sorting by the score column that corresponds to the active app context, descending.

#### Scenario: Standard context defaults to Main Score sort
- **WHEN** the submission list or DJ selection panel loads and the active app context is Standard
- **THEN** the list SHALL be sorted by Final Main Score, descending

#### Scenario: Moonlight context defaults to ML Score sort
- **WHEN** the submission list or DJ selection panel loads and the active app context is Moonlight
- **THEN** the list SHALL be sorted by Final ML Score, descending

#### Scenario: Switching app context resets primary sort column
- **WHEN** the user changes the active app context while the submission list or DJ selection panel is displayed
- **THEN** the sort column SHALL reset to the score column matching the new context (Main for Standard, ML for Moonlight)
- **THEN** the sort direction SHALL reset to descending
```
