## 1. Data Model

- [x] 1.1 Add optional `color?: string` field (hex string, e.g. `"#6366f1"`) to the `Stage` interface in `app/src/types.ts`
- [x] 1.2 Define `STAGE_COLOR_PALETTE` constant in a new `app/src/stageColors.ts` file as an array of hex strings — curated set excluding red and yellow hues (e.g. indigo `#6366f1`, violet `#8b5cf6`, sky `#0ea5e9`, teal `#14b8a6`, emerald `#10b981`, pink `#ec4899`, fuchsia `#d946ef`, slate `#64748b`)
- [x] 1.3 Export a helper `hexToTint(hex: string, alpha?: number): string` from `stageColors.ts` that converts a hex color to a semi-transparent `rgba()` string for use as cell background tints (default alpha ~0.2)
- [x] 1.4 Update `newStage()` in `StageConfigPanel.tsx` (and any other factory usage) to omit `color` (undefined by default)

## 2. Stage Config Panel — Color Picker

- [x] 2.1 Add a color swatch row to each stage row in `StageConfigPanel.tsx`, rendering one swatch button per palette entry plus a "no color" neutral swatch
- [x] 2.2 Clicking a swatch calls `updateStage(id, { color: key })` on unselected swatches and `updateStage(id, { color: undefined })` when clicking the already-selected swatch or the neutral swatch
- [x] 2.3 Style the selected swatch with a visible selection ring; unselected swatches appear at reduced opacity
- [x] 2.4 Add CSS for `.stage-color-swatches`, `.stage-color-swatch`, and `.stage-color-swatch--selected` classes

## 3. Stage Config Panel — Drag-to-Reorder

- [x] 3.1 Add a `dragIndex` state variable (or use a ref) to track which stage row index is being dragged
- [x] 3.2 Add a drag handle `<span>` (e.g. `⠿`) with `draggable` attribute to the leading edge of each stage row
- [x] 3.3 Implement `onDragStart` handler to record the dragged stage's index
- [x] 3.4 Implement `onDragOver` handler to prevent default (enable drop) and show a drop target indicator class on the hovered row
- [x] 3.5 Implement `onDrop` handler to reorder the `draft` array: remove the dragged item, insert before the drop target index
- [x] 3.6 Implement `onDragEnd` handler to clear drag state and remove all drop target indicator classes
- [x] 3.7 Add CSS for `.stage-drag-handle`, `.stage-config-row--drag-over` indicator styles, and `cursor: grab` on the handle

## 4. Lineup Grid — Stage Color Accents

- [x] 4.1 In `LineupGrid.tsx`, build a `stageColorMap: Record<string, string | undefined>` mapping stage id → `stage.color` hex string (or undefined) using `useMemo`
- [x] 4.2 Apply a color accent to stage column headers: add an inline `style` with `borderBottom` color set directly from the stage's hex value
- [x] 4.3 Apply a color tint to occupied sequential slot cells: add an inline `style` with `backgroundColor` set to `hexToTint(stage.color)` at reduced opacity
- [x] 4.4 Ensure empty slot cells receive no color tint (no style applied)
- [x] 4.5 Apply color to occupied simultaneous stage cells in the same way as sequential occupied cells

## 5. Submission List — Stage Color on Lineup Badge

- [x] 5.1 In the component that renders the lineup indicator badge (`SubmissionList.tsx` or equivalent), look up the stage for each in-lineup submission via its `stageId` assignment
- [x] 5.2 If the stage has a `color` hex value, apply `hexToTint(stage.color)` as inline `backgroundColor` and the hex directly as `borderColor` on the "✓ In Lineup" badge element
- [x] 5.3 If the stage has no color, render the badge with default neutral styling (no inline style override)
- [x] 5.4 Ensure color updates reactively when stage color changes (data flows through project context)

## 6. Verification

- [ ] 6.1 Manually verify: open stage config, assign colors to two stages (confirm no red or yellow swatches appear in the palette), save — confirm both lineup grid headers and cells are tinted correctly
- [ ] 6.2 Manually verify: drag a stage to a new position, save — confirm lineup grid columns reorder to match
- [ ] 6.3 Manually verify: assign a DJ from a colored stage — confirm the submission list badge is tinted with that stage's color
- [ ] 6.4 Manually verify: clear a stage's color — confirm all accents revert to neutral styling
- [ ] 6.5 Manually verify: load an existing project JSON that has no `color` field on stages — confirm no errors and neutral rendering
- [x] 6.6 Run `npm run build` and confirm zero TypeScript errors
