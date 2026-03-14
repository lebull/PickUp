## Purpose
Defines the stage-view mode in the lineup builder, which pivots the grid to show one selected stage for all active event days simultaneously, instead of all stages for one day.

## Requirements

### Requirement: Lineup builder provides a stage-view mode toggle
The lineup builder SHALL provide a control to switch between "Day View" (all stages for one evening — existing behavior) and "Stage View" (all active event days for one stage). The active view mode SHALL be preserved until the user toggles it. Day view is the default when the lineup builder loads.

#### Scenario: View mode toggle is present in the lineup builder header
- **WHEN** the lineup builder is rendered
- **THEN** a control SHALL be visible that allows switching between Day View and Stage View
- **THEN** the active mode SHALL be visually indicated

#### Scenario: Switching to Stage View activates stage-view grid
- **WHEN** the user switches to Stage View
- **THEN** the lineup grid SHALL transition to the stage-view grid
- **THEN** the existing evening-selector tabs SHALL be hidden or replaced by a stage selector

#### Scenario: Switching back to Day View restores normal grid
- **WHEN** the user switches back to Day View
- **THEN** the lineup grid SHALL return to the normal day-view layout
- **THEN** the evening-selector tabs SHALL be visible again

### Requirement: Stage-view grid shows all active days as columns for a selected stage
In stage-view mode, the grid SHALL render one column per active event day for the selected stage, ordered Thursday → Friday → Saturday → Sunday. Rows represent the sequential time slots for that stage. Each cell is the intersection of a day column and a time slot row. The stage's assigned color SHALL be applied to the column headers and occupied cells, consistent with day-view styling.

#### Scenario: Stage-view columns represent active days for the selected stage
- **WHEN** stage view is active and a sequential stage is selected
- **THEN** the grid SHALL render one column per day in the stage's `activeDays`, in convention order (Thu → Fri → Sat → Sun)
- **THEN** each column header SHALL display the day name
- **THEN** the stage color accent SHALL be applied to the column headers

#### Scenario: Stage-view rows represent time slots
- **WHEN** stage view is active and a sequential stage is selected
- **THEN** the grid SHALL render one row per time slot derived from the stage's start time, end time, and slot duration
- **THEN** the row header SHALL display the slot start time

#### Scenario: Occupied cell displays assigned DJ name
- **WHEN** a slot on a given day has a DJ assigned in stage view
- **THEN** the cell SHALL display the DJ's display name (real name or anonymous ID based on hidden-names setting)
- **THEN** the cell SHALL display a color tint if the stage has an assigned color

#### Scenario: Empty cell is interactive
- **WHEN** a slot on a given day has no DJ assigned in stage view
- **THEN** the cell SHALL appear empty and clickable
- **THEN** clicking the cell SHALL open the DJ selection panel for that stage/day/slot, consistent with day-view behavior

#### Scenario: Simultaneous stage in stage view shows one full-height cell per day
- **WHEN** stage view is active and a simultaneous stage is selected
- **THEN** each day column SHALL render as a single full-height cell (no row divisions)
- **THEN** assigned DJ names SHALL be listed within the cell

### Requirement: Stage-view provides a stage selector
In stage-view mode, the lineup builder SHALL display a stage selector that lets the user choose which stage to view. Only stages with at least one active day SHALL be selectable. The first stage in the project's stage order SHALL be selected by default when entering stage view. The selected stage SHALL be visually indicated.

#### Scenario: Stage selector shown when stage view is active
- **WHEN** the user switches to Stage View
- **THEN** a stage selector SHALL be displayed (e.g., tabs or segmented control)
- **THEN** each selectable stage SHALL be listed by name
- **WHEN** the stage has an assigned color
- **THEN** the stage selector item SHALL display the stage's color accent

#### Scenario: Default stage is the first in project order
- **WHEN** the user switches to Stage View for the first time in a session
- **THEN** the first stage (in project stage order) SHALL be auto-selected

#### Scenario: Selecting a stage updates the grid
- **WHEN** the user selects a different stage from the stage selector in stage view
- **THEN** the grid SHALL update to show that stage's schedule for all active days
- **THEN** the active slot selection SHALL be cleared
