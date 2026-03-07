```markdown
## ADDED Requirements

### Requirement: DJ selection panel opens inline beside the lineup grid
When a user clicks an empty or filled lineup slot, the application SHALL display a `DJSelectionPanel` as a side panel adjacent to the `LineupGrid` inside `LineupView`, replacing the existing `SlotPicker` modal. The lineup grid SHALL remain fully visible while the panel is open.

#### Scenario: Clicking an empty slot opens the panel
- **WHEN** the user clicks an empty slot cell in the lineup grid
- **THEN** the `DJSelectionPanel` SHALL appear beside the grid
- **THEN** the panel header SHALL identify the active slot (stage name, evening, time)

#### Scenario: Clicking a filled slot opens the panel with current assignment shown
- **WHEN** the user clicks a slot that already has a DJ assigned
- **THEN** the panel SHALL open and indicate the currently assigned DJ
- **THEN** a Remove button SHALL be available to clear the assignment

#### Scenario: Panel closes when slot is filled
- **WHEN** the user assigns a DJ to the active slot via the panel
- **THEN** the panel SHALL close and the lineup grid SHALL reflect the new assignment

#### Scenario: Panel closes on Escape or outside click
- **WHEN** the user presses Escape or clicks outside the panel while it is open
- **THEN** the panel SHALL close without making any assignment change

### Requirement: DJ selection panel lists available DJs with relevant columns
The panel SHALL display only DJs who are available on the active slot's evening and are not already assigned elsewhere in the lineup. Each row SHALL show: DJ Name (or anonymous ID when hidden-names is active), active-context score, Genre (display only), Stage Preferences, and Vibefit (Moonlight context only). The list SHALL default to sorting by active-context score descending.

#### Scenario: Only available DJs shown
- **WHEN** the DJ selection panel is open for a slot on a given evening
- **THEN** only submissions whose `daysAvailable` includes that evening AND who are not already assigned to another slot SHALL be listed

#### Scenario: Currently assigned DJ excluded from available list
- **WHEN** the active slot already has a DJ assigned
- **THEN** that DJ SHALL NOT appear in the available list (they are shown in the "current assignment" indicator instead)

#### Scenario: Genre shown as display-only column
- **WHEN** the DJ selection panel is rendered
- **THEN** each DJ row SHALL display the submission's genre value as a read-only field
- **THEN** no filter control for genre SHALL be present in the panel

#### Scenario: Vibefit column shown only in Moonlight context
- **WHEN** the active app context is Moonlight and the panel is open
- **THEN** each DJ row SHALL show the submission's ML Vibefit value (or "—" if absent)
- **WHEN** the active app context is Standard
- **THEN** no Vibefit column SHALL be rendered in the panel

#### Scenario: Hidden-names mode masks DJ names in the panel
- **WHEN** `hiddenNames` is true and the panel is open
- **THEN** each DJ row SHALL show `DJ #N` (1-based load-order index) instead of the real name

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

### Requirement: Stage preference filter in the DJ selection panel
The panel SHALL provide a stage preference filter that limits the visible DJ list to submissions whose `stagePreferences` include at least one of the selected stages. This is the same filter logic described in `dj-selection-filters/spec.md`, applied within the panel.

#### Scenario: Stage filter derives options from project stages
- **WHEN** the DJ selection panel renders its stage preference filter
- **THEN** each configured stage from the project SHALL be listed as a selectable option

#### Scenario: Selecting stages narrows the panel list
- **WHEN** the user selects one or more stages in the panel's stage filter
- **THEN** only DJs with at least one matching stage preference SHALL remain visible in the panel list

#### Scenario: Stage filter composes with evening availability filter
- **WHEN** a stage filter is active
- **THEN** the visible DJs SHALL satisfy both the stage preference criteria AND the evening availability criteria (intersection)
```
