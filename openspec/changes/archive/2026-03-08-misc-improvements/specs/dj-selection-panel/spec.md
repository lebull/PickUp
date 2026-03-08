## MODIFIED Requirements

### Requirement: DJ selection panel lists available DJs with relevant columns
The panel SHALL display only DJs who are available on the active slot's evening, are not already assigned elsewhere in the lineup, and are **not discarded**. Each row SHALL show: DJ Name (or anonymous ID when hidden-names is active), active-context score, Genre (display only), Format/Gear (display only), Stage Preferences, and Vibefit (Moonlight context only). The list SHALL default to sorting by active-context score descending. When a focus stage is active, DJs SHALL be grouped by their preference rank for that stage rather than shown as a flat list. The panel SHALL fill the width of its container rather than using a fixed width.

#### Scenario: Only available, non-discarded DJs shown
- **WHEN** the DJ selection panel is open for a slot on a given evening
- **THEN** only submissions whose `daysAvailable` includes that evening AND who are not already assigned to another slot AND whose `submissionNumber` is NOT in `project.discardedSubmissions` SHALL be listed

#### Scenario: Currently assigned DJ excluded from available list
- **WHEN** the active slot already has a DJ assigned
- **THEN** that DJ SHALL NOT appear in the available list (they are shown in the "current assignment" indicator instead)

#### Scenario: Genre shown as display-only column
- **WHEN** the DJ selection panel is rendered
- **THEN** each DJ row SHALL display the submission's genre value as a read-only field
- **THEN** no filter control for genre SHALL be present in the panel

#### Scenario: Format/Gear shown as display-only column
- **WHEN** the DJ selection panel is rendered
- **THEN** each DJ row SHALL display the submission's `formatGear` value as a read-only field
- **WHEN** the `formatGear` value is empty or absent
- **THEN** the cell SHALL display "—"
- **THEN** no filter control for Format/Gear SHALL be present in the panel

#### Scenario: Long Format/Gear text is truncated
- **WHEN** a submission's `formatGear` value exceeds the column width
- **THEN** the text SHALL be truncated with an ellipsis
- **THEN** the full text SHALL be accessible via the element's `title` attribute (native tooltip)

#### Scenario: Vibefit column shown only in Moonlight context
- **WHEN** the active app context is Moonlight and the panel is open
- **THEN** each DJ row SHALL show the submission's ML Vibefit value (or "—" if absent)
- **WHEN** the active app context is Standard
- **THEN** no Vibefit column SHALL be rendered in the panel

#### Scenario: Hidden-names mode masks DJ names in the panel
- **WHEN** `hiddenNames` is true and the panel is open
- **THEN** each DJ row SHALL show `DJ #N` (1-based load-order index) instead of the real name

#### Scenario: Panel fills its container width
- **WHEN** the DJ selection panel is rendered inside a resizable split pane
- **THEN** the panel SHALL expand to fill the available width of its container
- **THEN** no fixed pixel width SHALL constrain the panel

#### Scenario: Column widths accommodate all columns without overflow
- **WHEN** the DJ selection panel is rendered at its minimum usable width
- **THEN** all columns (Score, DJ Name, Genre, Format/Gear, Stage Prefs, Vibefit) SHALL be visible without horizontal scroll
- **THEN** text columns SHALL use fluid widths (`minmax(0, 1fr)`) to share available space proportionally
