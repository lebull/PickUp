## MODIFIED Requirements

### Requirement: DJ selection panel provides a stage preference filter
**Reason**: Replaced by the stage focus grouping approach in `dj-panel-stage-focus`.
**Migration**: See `dj-panel-stage-focus/spec.md` for the replacement behaviour.

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
