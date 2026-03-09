## ADDED Requirements

### Requirement: DJ selection panel header sections are sticky
The DJ selection panel SHALL establish itself as a scrollable container. The header section (stage name and slot label), the slot tray, the focus-stage filter row, and the column-header row SHALL each be sticky within the panel's scroll container, remaining visible at the top while the DJ list scrolls beneath them. Only the DJ list section SHALL scroll.

#### Scenario: Panel header remains visible while scrolling the DJ list
- **WHEN** the DJ selection panel is open and the DJ list is long enough to require scrolling
- **THEN** the panel header (stage name, slot label, and close button) SHALL remain pinned to the top of the panel while the list scrolls

#### Scenario: Slot tray remains visible while scrolling the DJ list
- **WHEN** the DJ selection panel is open and the user scrolls the DJ list downward
- **THEN** the slot tray section SHALL remain pinned below the panel header and SHALL NOT scroll out of view

#### Scenario: Focus-stage filter row remains visible while scrolling
- **WHEN** the DJ selection panel is open, a focus-stage filter is displayed, and the user scrolls the DJ list
- **THEN** the focus-stage filter row SHALL remain pinned below the slot tray and SHALL NOT scroll out of view

#### Scenario: Column headers remain visible while scrolling
- **WHEN** the DJ selection panel is open and the user scrolls the DJ list
- **THEN** the column-header row (DJ, Score, Genre, Format/Gear, Stage Prefs, Vibefit) SHALL remain pinned below the filter row and SHALL NOT scroll out of view

#### Scenario: Sticky sections stack in correct order
- **WHEN** the panel is open and all sticky sections are visible
- **THEN** from top to bottom the sticky sections SHALL appear in order: header → slot tray → filter row → column headers → scrollable DJ list
- **THEN** no sticky section SHALL overlap another sticky section
