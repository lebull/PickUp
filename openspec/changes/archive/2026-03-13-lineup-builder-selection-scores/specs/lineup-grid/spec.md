## MODIFIED Requirements

### Requirement: Navigate between evenings
The application SHALL provide a navigation control to switch between the convention evenings. Only evenings that have at least one active stage (sequential or simultaneous) SHALL be shown. When the user selects a different evening, the active slot and event selection SHALL be cleared so the right pane returns to the idle/guidance state.

#### Scenario: Evening selector shows active evenings only
- **WHEN** stages are configured with various active days
- **THEN** the evening selector renders buttons only for days that appear in at least one stage's active days

#### Scenario: Selecting an evening updates the grid
- **WHEN** the organizer clicks an evening button
- **THEN** the grid updates to show only the stages and slots for that evening

#### Scenario: Selecting a new evening clears the active slot
- **WHEN** the organizer clicks an evening button that is different from the currently selected evening
- **THEN** any active slot or event selection SHALL be cleared
- **THEN** the right pane SHALL return to the guidance/idle state

## ADDED Requirements

### Requirement: Active event selection is stable and explicit-only
The active stage/event context in the lineup builder SHALL only change when the user explicitly clicks a slot or event cell in the grid. Automatic slot advancement after an assignment (advancing to the next empty slot) SHALL only move within the same stage (stageId). No background process, automatic navigation, or derived state change SHALL silently switch the active stage to a different event without user interaction.

#### Scenario: Auto-advance after assignment stays within the same stage
- **WHEN** the user assigns a DJ to a sequential slot and the system auto-advances to the next empty slot
- **THEN** the next slot SHALL be within the same stage (same stageId)
- **THEN** the active stage/event context SHALL NOT change to a different stage

#### Scenario: Auto-advance stops when no remaining empty slot in the stage
- **WHEN** the user assigns a DJ to the last empty sequential slot within the active stage
- **THEN** the active slot SHALL remain on the just-assigned slot (or the last slot in the stage)
- **THEN** NO automatic cross-stage jump SHALL occur
- **THEN** the user must explicitly click a slot in another stage to move there

#### Scenario: Event context unchanged by assignment to simultaneous position
- **WHEN** the user assigns a DJ to a simultaneous stage position
- **THEN** the active event context (stageId and evening) SHALL remain unchanged
- **THEN** only the active position index within the same event SHALL update (to the next empty position)
