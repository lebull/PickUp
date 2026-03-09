## ADDED Requirements

### Requirement: Reorder stages via drag-and-drop
The application SHALL allow organizers to change the display order of stages within the stage configuration panel using click-and-drag. Stage order SHALL determine the column order rendered in the lineup grid. Reordering SHALL only take effect when the organizer saves the stage configuration.

#### Scenario: Drag handle visible on each stage row
- **WHEN** the organizer opens the stage configuration panel
- **THEN** each stage row SHALL display a drag handle icon (e.g., ⠿ or ≡) at the leading edge of the row
- **THEN** the cursor SHALL change to a grab cursor when hovering over the drag handle

#### Scenario: Drag a stage to a new position
- **WHEN** the organizer drags a stage row by its handle and drops it above or below another stage row
- **THEN** the stage list reorders immediately in the draft state to reflect the new position
- **THEN** no other stage data (name, color, schedule, assignments) is modified by the reorder

#### Scenario: Drop visual feedback during drag
- **WHEN** the organizer is dragging a stage row and hovers over a valid drop target
- **THEN** a visual indicator (e.g., highlighted insertion line or highlighted target row) SHALL appear to show where the dragged stage will be inserted

#### Scenario: Stage order persists after save
- **WHEN** the organizer saves the stage configuration after reordering stages
- **THEN** the new stage order is saved to the project
- **THEN** the lineup grid renders stage columns in the saved order

#### Scenario: Stage order reflected in lineup grid columns
- **WHEN** stages are ordered A, B, C in the configuration
- **THEN** the lineup grid SHALL render columns left-to-right in the same order: A, B, C

#### Scenario: Reorder does not affect existing assignments
- **WHEN** stages are reordered after DJs have already been assigned to slots
- **THEN** all existing slot assignments remain valid and associated with the correct stage
- **THEN** no assignments are lost or moved to a different stage
