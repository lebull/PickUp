## 1. Empty State in Right Pane

- [x] 1.1 In `LineupView`, always render the `SplitPane` layout (not only when `activeSlot` is set), passing an `EmptyStatePanel` to the right pane when `activeSlot` is null
- [x] 1.2 Create a lightweight `EmptyStatePanel` component (inline in `LineupView` or as a tiny file) that renders the guidance message: "Drag and drop a DJ to a slot, or click a slot to get started"
- [x] 1.3 Style the empty state pane so it is visually distinct but not distracting (centered text, muted color)

## 2. Day Change Clears Active Slot

- [x] 2.1 In `LineupView.handleSelectEvening`, call `setActiveSlot(null)` before (or alongside) the `navigate` call so the right pane reverts to empty state when the day changes

## 3. Event Selection Stability

- [x] 3.1 In `findNextEmptySlot`, restrict the scan to slots within `currentSlot.stageId` only — remove cross-stage iteration
- [x] 3.2 Verify that if no empty slot remains within the current stage, `findNextEmptySlot` returns `null` and the active slot does not change

## 4. Context-Sensitive Score Column

- [x] 4.1 In `DJSelectionPanel`, conditionally render the main-score column header (`dj-col-main-score`) only when `!useMoonlight`
- [x] 4.2 In `DJSelectionPanel`, conditionally render the ML-score column header (`dj-col-ml-score`) only when `useMoonlight`
- [x] 4.3 In `DJSelectionPanel.renderCard`, conditionally render the main-score cell only when `!useMoonlight`
- [x] 4.4 In `DJSelectionPanel.renderCard`, conditionally render the ML-score cell only when `useMoonlight`
- [x] 4.5 Update the CSS grid template for `.dj-panel-card` and `.dj-panel-list-header` so removing a column does not leave a blank gap (use a single column definition path for each context, or use `display: contents` / CSS subgrid)

## 5. Score Peek Popover

- [x] 5.1 Add a `ScorePeek` component (or inline render helper) that accepts a `Submission` and `context: 'main' | 'ml'` and renders the per-judge breakdown: for main — J1/J2/J3 technical, flow, entertainment, and notes; for ML — ML technical, flow, entertainment, and notes
- [x] 5.2 Wrap the score cell in `renderCard` with a `<div className="score-peek-wrapper">` that contains both the score value span and the hidden `ScorePeek` tooltip `<div>`
- [x] 5.3 Add CSS for `.score-peek-wrapper` (position: relative) and `.score-peek-tooltip` (hidden by default, visible on `.score-peek-wrapper:hover`), positioning the tooltip above or below the score cell
- [x] 5.4 Ensure the tooltip is not shown when the score is null (the "—" case)
- [x] 5.5 Ensure the tooltip rows omit judges with no scores and omit empty notes lines
