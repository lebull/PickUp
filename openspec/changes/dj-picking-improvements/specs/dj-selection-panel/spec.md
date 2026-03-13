## MODIFIED Requirements

### Requirement: DJ selection panel lists available DJs with relevant columns
The panel SHALL display only DJs who are available on the active slot's evening, are not already assigned elsewhere in the lineup, and are **not discarded**. Each row SHALL show: DJ Name (or anonymous ID when hidden-names is active), Main Score, ML Score, Vibefit (when the active stage has `useMoonlightScores: true`), Genre (display only), Format/Gear (display only), and Stage Preferences. The list SHALL default to sorting by ML Score descending when the active stage has `useMoonlightScores: true`, and by Main Score descending otherwise. When a focus stage is active, DJs SHALL be grouped by their preference rank for that stage rather than shown as a flat list. The panel SHALL fill the width of its container rather than using a fixed width. The pinned "Blocked slot" row that previously appeared at the top of the DJ list SHALL NOT be rendered; slot blocking is performed directly from the lineup grid.

#### Scenario: Only available, non-discarded DJs shown
- **WHEN** the DJ selection panel is open for a slot on a given evening
- **THEN** only submissions whose `daysAvailable` includes that evening AND who are not already assigned to another slot AND whose `submissionNumber` is NOT in `project.discardedSubmissions` SHALL be listed

#### Scenario: Moonlight interest filter applied when stage uses Moonlight Scores
- **WHEN** the DJ selection panel is open for a slot on a stage with `useMoonlightScores: true`
- **THEN** only submissions with `moonlightInterest === true` SHALL be listed
- **WHEN** the active stage has `useMoonlightScores: false` or unset
- **THEN** all available non-discarded DJs SHALL be listed regardless of `moonlightInterest`

#### Scenario: Currently assigned DJ excluded from available list
- **WHEN** the active slot already has a DJ assigned
- **THEN** that DJ SHALL NOT appear in the available list (they are shown in the slot tray instead)

#### Scenario: Both Main Score and ML Score are always shown as separate columns
- **WHEN** the DJ selection panel is rendered for any stage
- **THEN** each DJ row SHALL display both a "Main" score column and an "ML" score column
- **THEN** a null score SHALL display as "—" in its respective column

#### Scenario: Sorted by ML Score when stage uses Moonlight Scores
- **WHEN** the active stage has `useMoonlightScores: true`
- **THEN** the DJ list SHALL default to sorting by ML Score descending (nulls sorted last)

#### Scenario: Sorted by Main Score when stage does not use Moonlight Scores
- **WHEN** the active stage has `useMoonlightScores: false` or unset
- **THEN** the DJ list SHALL default to sorting by Main Score descending (nulls sorted last)

#### Scenario: Vibefit column shown only when stage uses Moonlight Scores
- **WHEN** the active stage has `useMoonlightScores: true` and the panel is open
- **THEN** each DJ row SHALL show the submission's ML Vibefit value (or "—" if absent)
- **WHEN** the active stage has `useMoonlightScores: false` or unset
- **THEN** no Vibefit column SHALL be rendered in the panel

#### Scenario: Pinned blocked-slot row is absent; Block Slot action is on the slot tray row
- **WHEN** the DJ selection panel is rendered for any slot
- **THEN** no "Blocked slot" pinned row SHALL appear at the top or anywhere in the DJ list
- **THEN** the "Block Slot" action SHALL be available as a button on empty slot tray rows (see slot-block-action spec)

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
- **THEN** the text SHALL be truncated with an ellipsis and the full text accessible via `title` attribute

#### Scenario: All column values have a native tooltip
- **WHEN** the DJ selection panel is rendered
- **THEN** every column value (name, main score, ml score, genre, format/gear, stage preferences, vibefit) SHALL have a `title` attribute containing the full display value

#### Scenario: Hidden-names mode masks DJ names in the panel
- **WHEN** `hiddenNames` is true and the panel is open
- **THEN** each DJ row SHALL show `DJ #N` (1-based load-order index) instead of the real name

#### Scenario: Panel fills its container width
- **WHEN** the DJ selection panel is rendered inside a resizable split pane
- **THEN** the panel SHALL expand to fill the available width of its container

## MODIFIED Requirements

### Requirement: Slot tray displays all positions for the active event
The DJ selection panel SHALL display a slot tray at the top of the panel showing all slot positions for the currently selected event. For sequential stages, the tray shows all time slots for the stage on that evening. For simultaneous stages, the tray shows all three positions. Each position row SHALL show the slot time (or position label for simultaneous), the assigned DJ's name, and the assigned DJ's genre. Empty positions SHALL be displayed as drop targets. Slot time labels in the tray SHALL be formatted according to the active `timeFormat` preference.

#### Scenario: Sequential slot tray shows all time slots for the evening
- **WHEN** the user has selected a sequential stage slot
- **THEN** the slot tray SHALL display one row per time slot for that stage on the evening
- **THEN** the currently active slot row SHALL be highlighted
- **THEN** clicking an inactive slot row SHALL navigate the active slot to that time

#### Scenario: Simultaneous event tray shows all three positions
- **WHEN** the user has selected a simultaneous stage event
- **THEN** the slot tray SHALL display up to three position rows (Position 1, 2, 3)
- **THEN** each row SHALL show the position label, the assigned DJ's name and genre, or an "Empty" placeholder

#### Scenario: Empty slot position is a drag-and-drop target
- **WHEN** a slot tray row shows an empty/unassigned position
- **THEN** it SHALL accept a DJ card dragged from the available DJ list

#### Scenario: Slot tray time labels use the active time format
- **WHEN** the slot tray is rendered
- **THEN** each time label SHALL be formatted according to the `timeFormat` preference (12-hour or 24-hour)
