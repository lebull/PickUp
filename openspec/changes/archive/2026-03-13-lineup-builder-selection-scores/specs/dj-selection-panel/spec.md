## MODIFIED Requirements

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

## ADDED Requirements

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
