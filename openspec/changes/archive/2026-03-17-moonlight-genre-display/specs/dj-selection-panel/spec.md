## MODIFIED Requirements

### Requirement: DJ selection panel lists available DJs with relevant columns
The panel SHALL display only DJs who are available on the active slot's evening, are not already assigned elsewhere in the lineup, and are **not discarded**. Each row SHALL show: DJ Name (or anonymous ID when hidden-names is active), Main Score, ML Score, Vibefit (when the active stage has `useMoonlightScores: true`), Genre (display only), Format/Gear (display only), and Stage Preferences. The Genre column SHALL display the submission's **Moonlight genre** (`mlGenre`) when the active stage has `useMoonlightScores: true`, and the **main genre** (`genre`) otherwise. The list SHALL default to sorting by ML Score descending when the active stage has `useMoonlightScores: true`, and by Main Score descending otherwise. When a focus stage is active, DJs SHALL be grouped by their preference rank for that stage rather than shown as a flat list. The panel SHALL fill the width of its container rather than using a fixed width. The pinned "Blocked slot" row that previously appeared at the top of the DJ list SHALL NOT be rendered; slot blocking is performed directly from the lineup grid.

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

#### Scenario: Genre column shows Moonlight genre when stage uses Moonlight Scores
- **WHEN** the DJ selection panel is rendered for a stage with `useMoonlightScores: true`
- **THEN** each DJ row's Genre column SHALL display the submission's `mlGenre` value
- **WHEN** `mlGenre` is empty or absent
- **THEN** the Genre cell SHALL display "—"

#### Scenario: Genre column shows main genre when stage does not use Moonlight Scores
- **WHEN** the DJ selection panel is rendered for a stage with `useMoonlightScores: false` or unset
- **THEN** each DJ row's Genre column SHALL display the submission's `genre` value
- **WHEN** `genre` is empty or absent
- **THEN** the Genre cell SHALL display "—"

#### Scenario: Genre column shows main genre in browsing state
- **WHEN** no slot is selected (browsing state)
- **THEN** each DJ row's Genre column SHALL display the submission's `genre` value (main genre)

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
