## Context

The Lineup Builder uses a CSS grid (`LineupGrid.tsx`) to display one column per stage per evening. Sequential stage columns render one cell per time slot; simultaneous stage columns render a single `SimultaneousCell` that spans its configured time range. Only sequential slot cells are currently clickable — clicking them calls `onSlotClick` in the parent `LineupView`, which sets `activeSlot` and opens the `DJSelectionPanel`. Simultaneous cells expose only an explicit "+ Add DJ" button that calls `onSimultaneousClick`; clicking the cell body does nothing.

The `DJSelectionPanel` renders as a vertically-stacked flex column inside a fixed-height split-pane right pane. The entire panel scrolls as one unit, so the header, slot tray, focus-stage buttons, and column headers scroll out of view when the DJ list is long enough to overflow, limiting drag-and-drop usability.

## Goals / Non-Goals

**Goals:**
- Make a simultaneous cell click (anywhere on the cell body, not just the button) trigger slot selection and open the DJ selection panel, consistent with sequential slots.
- Make the DJ selection panel's non-list sections (header, slot tray, focus-stage filter, column-header row) sticky so only the DJ list scrolls.

**Non-Goals:**
- Changing the active-slot highlighting or slot-key format for simultaneous stages beyond what is needed to support the click behavior.
- Redesigning the slot tray or how simultaneous-position selection works.
- Adding any new filtering, sorting, or display columns to the panel.

## Decisions

### 1. Cell-level click handler on `SimultaneousCell`

`SimultaneousCell` already receives an `onAddClick` prop used only by the "+ Add DJ" button. We add a new `onCellClick?: () => void` prop that is attached to the outer `div`. The parent call site (`LineupGrid`) passes the same call it makes to `onSimultaneousClick` — opening the panel for the next-empty position — as the `onCellClick` handler. `onAddClick` on the internal button calls `stopPropagation` so the button click doesn't double-fire.

**Alternative considered:** Unify `onAddClick` and `onCellClick` into one handler. Rejected because the existing button already has specific behavior (it's the explicit "+ Add DJ" control) and some callers may want to distinguish button vs. background click in the future.

**Active-slot highlighting for simultaneous cells:** The existing `activeSlotKey` format is `"stageId|evening|slotIndex"`. Simultaneous cells don't have a `slotIndex`. We will use `"stageId|evening|simultaneous"` as a synthetic key so the cell can show an active border without changing the sequential slot format. `LineupGrid` will apply `grid-slot--active` to the `SimultaneousCell` when `activeSlotKey.startsWith(stageId + '|' + evening + '|simultaneous')`.

### 2. Sticky panel header via CSS flex + `position: sticky`

The `DJSelectionPanel` currently has `overflow-y: auto` on its outer container (or inherits it from the split pane). To make internal elements sticky, the elements must live inside the scrolling container, not a parent of it.

**Approach:** 
- The outer `.dj-selection-panel` div becomes the scroll container (`overflow-y: auto`, fixed height from the split pane).
- `.dj-panel-header`, `.slot-tray` (the slot tray wrapper), `.dj-panel-filters`, and `.dj-panel-list-header` all get `position: sticky; top: 0; z-index: N` with descending z-index values so they stack cleanly.
- `.dj-panel-list` keeps `overflow: visible` (no inner scroll) — the panel itself scrolls.

**Alternative considered:** Wrapping the sticky sections in a single sticky header container. Simpler but requires more structural HTML changes. Not needed since individual sticky elements work fine with clearly separated sections.

## Risks / Trade-offs

- **Accidental cell click during drag:** A user who drags a DJ card and drops it might "select" the simultaneous cell if they start the drag on an empty area of the cell. Browsers fire click after a drag only if the pointer didn't move (i.e., mousedown + mouseup at same position). In practice, drag events suppress click, so this is low risk.
- **Sticky header z-index conflicts:** The panel lives inside a SplitPane; other elements (e.g. lineup grid headers) may also use `position: sticky`. Each panel header section will use modest z-index values (10, 9, 8, 7) scoped to the panel's stacking context.
- **Panel height dependency:** The sticky behavior requires the panel container to have a constrained height (provided by the split pane). If the panel is ever rendered outside a height-constrained container it will not scroll at all and stickiness will be irrelevant but harmless.
