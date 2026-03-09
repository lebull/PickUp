## 1. Simultaneous Cell Click — Select Slot

- [x] 1.1 Add an `onCellClick?: () => void` prop to `SimultaneousCellProps` in `LineupGrid.tsx`
- [x] 1.2 Attach `onClick={onCellClick}` to the outer `div` of `SimultaneousCell`
- [x] 1.3 Add `onClick={(e) => e.stopPropagation()}` to each `simultaneous-dj-remove` button and the `simultaneous-add-btn` button inside `SimultaneousCell` so they don't bubble to the cell handler
- [x] 1.4 Add `isActive?: boolean` prop to `SimultaneousCellProps` and apply `grid-slot--active` CSS class on the outer `div` when `isActive` is true
- [x] 1.5 Update both `SimultaneousCell` call sites in `LineupGrid.tsx` to pass `onCellClick` — invoking the same `onSimultaneousClick` callback used by `onAddClick` — and pass `isActive` derived from `activeSlotKey === stageId + '|' + evening + '|simultaneous'`
- [x] 1.6 In `LineupView.tsx`, ensure `handleSimultaneousClick` sets `activeSlot` in a way that produces the `"stageId|evening|simultaneous"` key (or confirm existing logic already does so)
- [x] 1.7 Verify in the browser: clicking the cell body opens the DJ panel; clicking the remove badge or "+ Add DJ" button does not double-fire the panel open

## 2. DJ Selection Panel Sticky Headers

- [x] 2.1 In `DJSelectionPanel.tsx`, ensure `.dj-selection-panel` is the scroll container: set `overflow-y: auto` and let its height be constrained by the split pane parent (no change needed if already the case — verify)
- [x] 2.2 Add `position: sticky; top: 0; z-index: 10; background: <panel-bg>` to `.dj-panel-header` in the panel's CSS
- [x] 2.3 Add `position: sticky; top: <header-height>px; z-index: 9; background: <panel-bg>` to the `.slot-tray` wrapper element (or whatever class wraps the `SlotTray` render)
- [x] 2.4 Add `position: sticky; top: <header+tray height>px; z-index: 8; background: <panel-bg>` to `.dj-panel-filters`
- [x] 2.5 Add `position: sticky; top: <header+tray+filters height>px; z-index: 7; background: <panel-bg>` to `.dj-panel-list-header`
- [x] 2.6 Verify in the browser with a long DJ list: scroll down and confirm all four sticky sections remain pinned; confirm they stack in order without overlap
- [x] 2.7 Verify the panel renders correctly when the filter row is absent (no focus-stage preferences) — the column headers should still be sticky with no gap
