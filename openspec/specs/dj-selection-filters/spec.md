## Requirements

### Requirement: Genre is visible in the DJ selection panel and submission list (not filterable)
Genre values SHALL be displayed as an informational column in the DJ selection panel and in the main submission list. No filter control for genre SHALL be provided, because genre values are free-text and not reliably categorisable.

#### Scenario: Genre column visible in DJ selection panel
- **WHEN** the DJ selection panel is open
- **THEN** each DJ card or row SHALL show the DJ's genre value as a display-only field

#### Scenario: Genre column visible in submission list
- **WHEN** the submission list is displayed
- **THEN** a Genre column SHALL be present as a display-only column with no filter control

### Requirement: Active context determines default primary sort score column
The submission list and DJ selection panel SHALL default to sorting by the score column that corresponds to the active app context, descending. Within stage-focus groups, the same score ordering SHALL apply within each group.

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

#### Scenario: Score ordering preserved within stage-focus groups
- **WHEN** a focus stage is active and DJs are grouped by preference rank
- **THEN** DJs within each group SHALL be ordered by active-context score descending
