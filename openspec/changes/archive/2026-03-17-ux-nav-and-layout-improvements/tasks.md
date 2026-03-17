## 1. SplitPane Component

- [x] 1.1 Create `app/src/components/SplitPane.tsx` with `initialSplit`, `minLeft`, `minRight` props and exactly-two-children enforcement
- [x] 1.2 Implement pointer-event drag logic: `pointerdown` on divider → `pointermove`/`pointerup` on window; compute new percentage from container `getBoundingClientRect`
- [x] 1.3 Clamp split percentage to `[minLeft, 100 - minRight]` on every drag update
- [x] 1.4 Set `left pane flex-basis` via inline style; set `cursor: col-resize` on the divider element; call `e.preventDefault()` in `pointermove`
- [x] 1.5 Add CSS for `.split-pane`, `.split-pane-left`, `.split-pane-divider`, `.split-pane-right` to `App.css`

## 2. Refactor SubmissionsView to use SplitPane

- [x] 2.1 In `SubmissionsView.tsx`, replace the bespoke two-column split markup/classes with `<SplitPane initialSplit={40} minLeft={25} minRight={20}>`
- [x] 2.2 Remove now-unused bespoke split CSS classes for the submissions view from `App.css`

## 3. Refactor LineupView to use SplitPane

- [x] 3.1 In `LineupView.tsx`, replace the `.lineup-main--split` / `.lineup-grid-wrapper` wrapper divs with `<SplitPane initialSplit={65} minLeft={35} minRight={20}>` when `activeSlot` is set
- [x] 3.2 Remove now-unused `.lineup-main--split` and `.lineup-grid-wrapper` CSS rules from `App.css`

## 4. NavActionsMenu Component

- [x] 4.1 Create `app/src/components/NavActionsMenu.tsx` with a trigger button (e.g. "⚙ Settings") and a boolean `open` state
- [x] 4.2 Render the dropdown panel containing `<AppPreferencesControls />` and the Export button when `open` is true
- [x] 4.3 Add `useEffect` close-on-outside-click handler (check `containerRef.current.contains(e.target)`) and Escape keydown listener
- [x] 4.4 Add CSS for `.nav-actions-menu`, `.nav-actions-trigger`, `.nav-actions-dropdown` to `App.css`

## 5. Update App.tsx Header

- [x] 5.1 In `ProjectWorkspace`, replace the inline `<AppPreferencesControls />` and Export `<button>` in the `header-actions` div with `<NavActionsMenu project={project} />`
- [x] 5.2 Remove the `<span className="submission-count">` element from the header
- [x] 5.3 Pass `exportProject` callback into `NavActionsMenu` (or import it directly inside the component)

## 6. Add Submission Count to SubmissionList

- [x] 6.1 In `SubmissionList.tsx`, add total and filtered counts to the `Props` interface (or derive filtered count from `sorted.length` vs `submissions.length`)
- [x] 6.2 Render a count label in the controls row: "N submissions" when no filter active; "M / N submissions" when a day filter is reducing results
- [x] 6.3 Add CSS for `.submission-count-label` to `App.css`

## 7. Verification

- [x] 7.1 Run `npx tsc --noEmit` in `app/` and confirm zero type errors
- [x] 7.2 Manually verify: header shows only trigger button + Import CSV; dropdown reveals Export and prefs controls
- [x] 7.3 Manually verify: both Submissions and Lineup views are resizable via the divider
- [x] 7.4 Manually verify: submission count appears in the list controls row
