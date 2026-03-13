## Purpose
Defines the behavior of the DJ selection panel used in the Lineup Builder, including how DJs are listed, filtered, and assigned to slots.

## Requirements

### Requirement: DJ selection panel opens inline beside the lineup grid
When a user clicks an empty or filled lineup slot, the application SHALL display a `DJSelectionPanel` as a side panel adjacent to the `LineupGrid` inside `LineupView`, replacing the existing `SlotPicker` modal. The lineup grid SHALL remain fully visible while the panel is open.

#### Scenario: Clicking an empty slot opens the panel
- **WHEN** the user clicks an empty slot cell in the lineup grid
- **THEN** the `DJSelectionPanel` SHALL appear beside the grid
- **THEN** the panel header SHALL identify the active stage (stage name, evening)
- **THEN** the slot tray SHALL show the slot's time and an empty drop target

#### Scenario: Clicking a filled slot opens the panel with current assignment shown
- **WHEN** the user clicks a slot that already has a DJ assigned
- **THEN** the panel SHALL open
- **THEN** the slot tray SHALL highlight the selected slot, showing the assigned DJ and their genre

#### Scenario: Remove button clears assignment but keeps panel open and slot selected
- **WHEN** the user clicks the Remove button on an assigned slot in the slot tray
- **THEN** that slot's assignment SHALL be cleared
- **THEN** the panel SHALL remain open
- **THEN** the slot SHALL remain the active/highlighted slot in the tray
- **THEN** the cleared slot SHALL become an empty drop target in the tray

#### Scenario: Panel closes on Escape or outside click
- **WHEN** the user presses Escape or clicks outside the panel while it is open
- **THEN** the panel SHALL close without making any assignment change

### Requirement: DJ selection panel lists available DJs with relevant columns
The panel SHALL display only DJs who are available on the active slot's evening, are not already assigned elsewhere in the lineup, and are **not discarded**. Each row SHALL show: DJ Name (or anonymous ID when hidden-names is active), active-context score, Genre (display only), Format/Gear (display only), Stage Preferences, and Vibefit (Moonlight context only). The list SHALL default to sorting by active-context score descending. When a focus stage is active, DJs SHALL be grouped by their preference rank for that stage rather than shown as a flat list. The panel SHALL fill the width of its container rather than using a fixed width.

The panel SHALL display **only the score column relevant to the active context**. In standard (non-moonlight) mode, only the main score column SHALL be rendered; the ML score column SHALL be hidden. In moonlight mode, only the ML score column SHALL be rendered; the main score column SHALL be hidden. This applies to both the column header row and all DJ card rows.

#### Scenario: Only available, non-discarded DJs shown
- **WHEN** the DJ selection panel is open for a slot on a given evening
- **THEN** only submissions whose `daysAvailable` includes that evening AND who are not already assigned to another slot AND whose `submissionNumber` is NOT in `project.discardedSubmissions` SHALL be listed

#### Scenario: Currently assigned DJ excluded from available list
- **WHEN** the active slot already has a DJ assigned
- **THEN** that DJ SHALL NOT appear in the available list (they are shown in the slot tray instead)

#### Scenario: Genre shown as display-only column
- **WHEN** the DJ selection panel is rendered
- **THEN** each DJ row SHALL display the submission's genre value as a read-only field
- **THEN** no filter control for genre SHALL be present in the panel

#### Scenario: Format/Gear shown as display-only column with truncation and tooltip
- **WHEN** the DJ selection panel is rendered
- **THEN** each DJ row SHALL display the submission's `formatGear` value as a read-only field
- **WHEN** the `formatGear` value is empty or absent
- **THEN** the cell SHALL display "—"
- **WHEN** the `formatGear` value exceeds the column width
- **THEN** the text SHALL be truncated with an ellipsis
- **THEN** the full text SHALL be accessible via the element's `title` attribute (native tooltip)

#### Scenario: All column values have a native tooltip
- **WHEN** the DJ selection panel is rendered
- **THEN** every column value in each DJ row (name, score, genre, format/gear, stage preferences, vibefit) SHALL have a `title` attribute containing the full display value
- **THEN** hovering any truncated column cell SHALL reveal the full text as a native browser tooltip

#### Scenario: DJ name column is narrower than other text columns
- **WHEN** the DJ selection panel is rendered
- **THEN** the DJ Name column SHALL be visually narrower than the default, allowing other columns more space
- **THEN** the DJ Name SHALL be truncated with an ellipsis when it exceeds the column width

#### Scenario: Vibefit column shown only in Moonlight context
- **WHEN** the active app context is Moonlight and the panel is open
- **THEN** each DJ row SHALL show the submission's ML Vibefit value (or "—" if absent)
- **WHEN** the active app context is Standard
- **THEN** no Vibefit column SHALL be rendered in the panel

#### Scenario: Main score column hidden in Moonlight context
- **WHEN** the active app context is Moonlight and the panel is open
- **THEN** the main score column header SHALL NOT be rendered
- **THEN** no main score cell SHALL appear in any DJ card row
- **THEN** the ML score column SHALL be rendered and visible

#### Scenario: ML score column hidden in Standard context
- **WHEN** the active app context is Standard (not Moonlight) and the panel is open
- **THEN** the ML score column header SHALL NOT be rendered
- **THEN** no ML score cell SHALL appear in any DJ card row
- **THEN** the main score column SHALL be rendered and visible

#### Scenario: Hidden-names mode masks DJ names in the panel
- **WHEN** `hiddenNames` is true and the panel is open
- **THEN** each DJ row SHALL show `DJ #N` (1-based load-order index) instead of the real name

#### Scenario: Panel fills its container width
- **WHEN** the DJ selection panel is rendered inside a resizable split pane
- **THEN** the panel SHALL expand to fill the available width of its container
- **THEN** no fixed pixel width SHALL constrain the panel

#### Scenario: Column widths accommodate all columns without overflow
- **WHEN** the DJ selection panel is rendered at its minimum usable width
- **THEN** all visible columns (Score, DJ Name, Genre, Format/Gear, Stage Prefs, Vibefit) SHALL be visible without horizontal scroll
- **THEN** text columns SHALL use fluid widths (`minmax(0, 1fr)`) to share available space proportionally

### Requirement: Right-pane guidance shown when no slot is selected
When no slot or event is selected in the lineup builder, the right pane SHALL display a guidance message instructing the user how to begin assigning DJs. The lineup grid SHALL remain visible and fully interactive while the guidance is displayed.

#### Scenario: Guidance message shown on first load
- **WHEN** the lineup builder first loads and no slot has been selected
- **THEN** the right pane SHALL display a guidance message such as "Drag and drop a DJ to a slot, or click a slot to get started"
- **THEN** the lineup grid SHALL be displayed and fully interactive at the same time

#### Scenario: Guidance message shown after closing the panel
- **WHEN** the user closes the DJ selection panel (via Escape or close button)
- **THEN** the right pane SHALL return to the guidance message
- **THEN** no blank or empty pane SHALL be shown

#### Scenario: Guidance message shown after day change
- **WHEN** the user selects a different day of the week and the active slot is cleared
- **THEN** the right pane SHALL display the guidance message

### Requirement: DJ cards in the panel are draggable onto lineup slot cells
The `DJSelectionPanel` SHALL support HTML5 drag-and-drop. DJ rows/cards SHALL be draggable. Lineup slot cells in `LineupGrid` SHALL be valid drop targets. Dropping a DJ card onto a slot cell SHALL assign that DJ to that slot.

#### Scenario: User drags a DJ card onto a target slot
- **WHEN** the user starts dragging a DJ card from the selection panel
- **THEN** slot cells in the lineup grid SHALL visually indicate they are valid drop targets
- **WHEN** the user drops the DJ card onto an empty or filled slot cell
- **THEN** the DJ SHALL be assigned to that slot
- **THEN** any previously assigned DJ in that slot SHALL be replaced

#### Scenario: Drag onto the same slot is a no-op
- **WHEN** the user drags the currently assigned DJ from the panel and drops it onto the same slot
- **THEN** the assignment SHALL remain unchanged

#### Scenario: Clicking a DJ card also assigns them (non-drag fallback)
- **WHEN** the user clicks a DJ row/card in the panel (without dragging)
- **THEN** that DJ SHALL be assigned to the active slot
- **THEN** the panel SHALL close

### Requirement: Slot tray displays all positions for the active event
The DJ selection panel SHALL display a slot tray at the top of the panel showing all slot positions for the currently selected event. For sequential stages, the tray shows all time slots for the stage on that evening. For simultaneous stages, the tray shows all three positions. Each position row SHALL show the slot time (or position label for simultaneous), the assigned DJ's name, and the assigned DJ's genre. Empty positions SHALL be displayed as drop targets.

#### Scenario: Sequential slot tray shows all time slots for the evening
- **WHEN** the user has selected a sequential stage slot
- **THEN** the slot tray SHALL display one row per time slot for that stage on the evening
- **THEN** the currently active slot row SHALL be highlighted
- **THEN** clicking an inactive slot row SHALL navigate the active slot to that time

#### Scenario: Simultaneous event tray shows all three positions
- **WHEN** the user has selected a simultaneous stage event
- **THEN** the slot tray SHALL display up to three position rows (Position 1, 2, 3)
- **THEN** each row SHALL show the position label, the assigned DJ's name and genre, or an "Empty" placeholder
- **THEN** the currently active position SHALL be highlighted

#### Scenario: Empty slot position is a drag-and-drop target
- **WHEN** a slot tray row shows an empty/unassigned position
- **THEN** it SHALL accept a DJ card dragged from the available DJ list
- **THEN** dropping a DJ card on the empty position SHALL assign that DJ to that position

#### Scenario: Slot tray position colored with stage color
- **WHEN** the active stage has a configured color
- **THEN** assigned slot tray rows SHALL display a color tint matching the stage's color
- **THEN** empty slot tray rows SHALL display without a color tint

### Requirement: Simultaneous stage DJ assignment fills the next empty position
When a DJ is selected for assignment to a simultaneous stage, the application SHALL assign them to the next available (empty) position rather than the specific position that was active at the time of clicking "Add DJ". If all positions are full when the assignment is processed, the assignment SHALL be rejected.

#### Scenario: Selecting a DJ fills the next empty simultaneous position
- **WHEN** the user has a simultaneous stage event open in the DJ picker
- **THEN** clicking a DJ card SHALL assign that DJ to the lowest-numbered empty position (1, 2, or 3)
- **THEN** the DJ SHALL NOT replace a DJ already assigned to a lower-numbered position

#### Scenario: After filling a position, next pick targets the following empty position
- **WHEN** the user assigns a DJ to position 1 of a simultaneous stage
- **THEN** the active position SHALL automatically advance to position 2 (the next empty slot)
- **THEN** clicking another DJ card SHALL assign them to position 2 without replacing position 1

#### Scenario: All positions filled — no more picks accepted
- **WHEN** all three positions of a simultaneous stage are assigned
- **THEN** the "Add DJ" affordance SHALL be hidden in both the grid cell and the slot tray
- **THEN** no further DJ cards SHALL be assignable to that event by clicking

