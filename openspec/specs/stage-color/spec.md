## Requirements

### Requirement: Assign a color to a stage
The application SHALL expose a fixed color palette for organizers to assign an optional display color to each stage. The palette SHALL contain at least 8 distinct, visually accessible colors and SHALL NOT include red or yellow hues, which are reserved for application alert and warning states. A stage with no color assigned SHALL render without any color accent (default/neutral styling). The selected color SHALL be stored as a hex string (e.g. `"#6366f1"`) directly in the `Stage` data model and persisted with the project.

#### Scenario: Color palette displayed in stage config
- **WHEN** the organizer is editing a stage in the stage configuration panel
- **THEN** a row of color swatches representing the available palette options SHALL be displayed for that stage
- **THEN** the currently selected color swatch SHALL appear visually selected (e.g., highlighted border or checkmark)

#### Scenario: Select a color from the palette
- **WHEN** the organizer clicks a color swatch for a stage
- **THEN** that color is immediately reflected as the stage's selected color in the draft state
- **THEN** the swatch becomes visually selected and all other swatches for that stage become deselected

#### Scenario: Clear a stage color
- **WHEN** the organizer clicks the currently selected color swatch a second time, OR clicks a "no color" neutral swatch
- **THEN** the stage's color is cleared (set to undefined/none)
- **THEN** no color accent is applied to that stage anywhere in the UI

#### Scenario: Color persists with stage data
- **WHEN** the organizer saves the stage configuration
- **THEN** the selected color is stored as a hex string on the `Stage` record and round-trips through project export and import without loss

#### Scenario: Stage color applied to lineup grid column header
- **WHEN** a stage has a color assigned and the lineup grid is rendered
- **THEN** that stage's column header SHALL display a color accent (e.g., colored border-bottom or tinted background) derived from the stage's palette color

#### Scenario: Stage color applied to occupied lineup grid cells
- **WHEN** a sequential stage has a DJ assigned to a slot and that stage has a color
- **THEN** the occupied cell SHALL display a subtle color tint (e.g., semi-transparent background) matching the stage's palette color
- **THEN** empty cells SHALL NOT be tinted

#### Scenario: Stage color applied to submission list lineup indicator
- **WHEN** a submission is assigned to a stage that has a color
- **THEN** the "✓ In Lineup" badge on that submission's row SHALL be tinted with the stage's assigned color
- **THEN** a submission assigned to a stage with no color SHALL display the default neutral badge styling

#### Scenario: Red and yellow hues absent from palette
- **WHEN** the organizer opens the color palette in the stage configuration panel
- **THEN** no red, orange-red, or yellow swatches SHALL be present in the palette
- **THEN** all palette swatches SHALL be visually distinct from the application's alert and warning color conventions
