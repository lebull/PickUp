## 1. DJ Table in No-Slot-Selected State

- [x] 1.1 In `DJSelectionPanel.tsx`, change the `activeSlot` prop type from `ActiveSlot` to `ActiveSlot | null` and add a `currentEvening: string` prop to the Props interface
- [x] 1.2 Update the DJ availability filter in `DJSelectionPanel` to use `activeSlot?.evening ?? currentEvening` as the evening for filtering when `activeSlot` is null
- [x] 1.3 Update score-column visibility logic in `DJSelectionPanel`: when `activeSlot` is null, render both the standard score column and the moonlight score column simultaneously (bypass the existing moonlight-context toggle)
- [x] 1.4 Update slot tray rendering in `DJSelectionPanel`: when `activeSlot` is null, render a brief guidance message (e.g., "Click a slot or drag a DJ to assign") in place of the `SlotTray` component
- [x] 1.5 In `LineupView.tsx`, remove the `activeSlot ? <DJSelectionPanel> : <div className="lineup-empty-state">` ternary and always render `DJSelectionPanel`, passing `activeSlot={activeSlot}` (which may be null) and `currentEvening={selectedEvening}`

## 2. Stage View — Core State and Toggle

- [x] 2.1 Add `viewMode: 'day' | 'stage'` state (default `'day'`) to `LineupView.tsx`
- [x] 2.2 Add `activeStageId: string | null` state to `LineupView.tsx`, initialized to the first stage's id from `project.stages` (or null if no stages)
- [x] 2.3 Add a view mode toggle control (e.g., two segmented buttons "Day View" / "Stage View") to the lineup builder header area in `LineupView.tsx`; clicking toggles `viewMode`
- [x] 2.4 When switching to Stage View, if `activeStageId` is null, initialize it to the first stage's id; clear `activeSlot` on any view mode change
- [x] 2.5 In stage view mode, render a stage-selector row (tabs or buttons — one per stage with optional color accent) below the view toggle; clicking a stage sets `activeStageId` and clears `activeSlot`

## 3. Stage View — StageGrid Component

- [x] 3.1 Create `app/src/components/StageGrid.tsx` with props: `submissions`, `stages`, `assignments`, `activeStageId`, `onSlotClick`, `onAssign`, `onRemove`, `onAddSimultaneous`, `onRemoveSimultaneous`, `activeSlotKey`
- [x] 3.2 In `StageGrid`, derive the selected stage from `stages` using `activeStageId`; derive its active days in convention order (Thu → Fri → Sat → Sun filtered by `stage.activeDays`)
- [x] 3.3 Render the grid header row: a corner cell, then one column header per active day (day name, with stage color accent if configured)
- [x] 3.4 For a sequential stage: derive time slot labels using `getSlotLabels` (one event index for now); render one body row per time slot with a row header showing the time label
- [x] 3.5 Render each day×slot cell: show the assigned DJ's display name (or anonymous ID if hidden-names) with stage color tint if assigned; show as empty-interactive if not assigned
- [x] 3.6 Wire `onClick` on each sequential cell to call `onSlotClick` with the appropriate `ActiveSlot` (stageId, evening=day, slotIndex, eventIndex=0, timeLabel); apply `activeSlotKey` highlighting
- [x] 3.7 For a simultaneous stage: render one full-height cell per active day, listing assigned DJ names with the existing simultaneous cell presentation style
- [x] 3.8 Apply the stage color accent (using `hexToTint`) to occupied cells, consistent with `LineupGrid` behavior

## 4. Stage View — Integration in LineupView

- [x] 4.1 In `LineupView.tsx`, conditionally render `StageGrid` instead of `LineupGrid` when `viewMode === 'stage'`
- [x] 4.2 Pass all required assignment callbacks (`onAssign`, `onRemove`, etc.) to `StageGrid` using the same handlers already used for `LineupGrid`
- [x] 4.3 Hide the evening-selector tabs (currently inside `LineupGrid`) when `viewMode === 'stage'`; ensure they reappear when returning to Day View
- [x] 4.4 Verify that the DJ selection panel opens correctly (with `activeSlot` set) when clicking a cell in stage view, and that DJ assignment from the panel writes to the correct stage/day/slot
