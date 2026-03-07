## ADDED Requirements

### Requirement: Filter submission list by genre
The submission list SHALL provide a multi-select genre filter control that limits visible submissions to those whose genre matches at least one selected genre value.

#### Scenario: Genre filter shows all unique genres from loaded submissions
- **WHEN** submissions are loaded and the genre filter is rendered
- **THEN** the filter control SHALL show each unique genre value present across all submissions, deduplicated

#### Scenario: Selecting a genre shows only matching submissions
- **WHEN** the user selects one or more genres in the genre filter
- **THEN** only submissions whose genre matches one of the selected genres SHALL be displayed

#### Scenario: No genres selected shows all submissions
- **WHEN** no genre is selected in the genre filter
- **THEN** all submissions SHALL be shown (no genre filtering applied)

#### Scenario: Genre filter composes with day filter
- **WHEN** both a genre filter and a day filter are active simultaneously
- **THEN** only submissions matching both the genre criteria AND the day criteria SHALL be shown (intersection)

### Requirement: Filter submission list by stage preference
The submission list SHALL provide a stage preference filter control that limits visible submissions to those who have listed at least one of the selected stages in their stage preferences.

#### Scenario: Stage filter shows all stages from project configuration
- **WHEN** the stage preference filter is rendered and a project is loaded with configured stages
- **THEN** the filter control SHALL list each configured stage by name

#### Scenario: Selecting a stage shows submissions that prefer it
- **WHEN** the user selects one or more stages in the stage preference filter
- **THEN** only submissions that have at least one of the selected stages anywhere in their `stagePreferences` array SHALL be displayed

#### Scenario: No stages selected shows all submissions
- **WHEN** no stage is selected in the stage preference filter
- **THEN** all submissions SHALL be shown (no stage filtering applied)

#### Scenario: Stage filter composes with genre and day filters
- **WHEN** stage, genre, and day filters are all active simultaneously
- **THEN** only submissions satisfying all three filter criteria SHALL be displayed (intersection)

### Requirement: Active context determines default primary sort score column
The submission list SHALL default to sorting by the score column that corresponds to the active app context, descending.

#### Scenario: Standard context defaults to Main Score sort
- **WHEN** the submission list loads and the active app context is Standard
- **THEN** the list SHALL be sorted by Final Main Score, descending

#### Scenario: Moonlight context defaults to ML Score sort
- **WHEN** the submission list loads and the active app context is Moonlight
- **THEN** the list SHALL be sorted by Final ML Score, descending

#### Scenario: Switching app context resets primary sort column
- **WHEN** the user changes the active app context while the submission list is displayed
- **THEN** the sort column SHALL reset to the score column matching the new context (Main for Standard, ML for Moonlight)
- **THEN** the sort direction SHALL reset to descending
