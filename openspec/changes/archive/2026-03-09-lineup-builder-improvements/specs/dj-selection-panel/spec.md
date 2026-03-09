## MODIFIED Requirements

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

### Requirement: Slot tray displays all positions for the active event
The DJ selection panel SHALL display a slot tray at the top of the panel showing all slot positions for the currently selected event. For sequential stages, the tray shows the selected slot. For simultaneous stages, the tray shows all three positions. Each position row SHALL show the slot time (or stage time window for simultaneous), the assigned DJ's name, and the assigned DJ's genre. Empty positions SHALL be displayed as drop targets.

#### Scenario: Sequential slot tray shows the selected slot
- **WHEN** the user has selected a sequential stage slot
- **THEN** the slot tray SHALL display one row showing the slot's time label, the assigned DJ name and genre (or an "Empty" placeholder if unassigned)
- **THEN** the slot row SHALL be highlighted as active

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

### Requirement: DJ selection panel lists available DJs with relevant columns
The panel SHALL display only DJs who are available on the active slot's evening, are not already assigned elsewhere in the lineup, and are **not discarded**. Each row SHALL show: DJ Name (or anonymous ID when hidden-names is active), active-context score, Genre (display only), Format/Gear (display only), Stage Preferences, and Vibefit (Moonlight context only). The list SHALL default to sorting by active-context score descending. When a focus stage is active, DJs SHALL be grouped by their preference rank for that stage rather than shown as a flat list. The panel SHALL fill the width of its container rather than using a fixed width.

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
