## Context

The project workspace header currently contains: a back link, project title, submission count badge, navigation tabs, AppPreferencesControls (Standard/Moonlight + Hidden Names toggles), Export button, and CSV Import button — all in a single horizontal flex row. As features have been added the row has become visually noisy.

Both `SubmissionsView` and `LineupView` independently implement a left/right split layout (list ↔ detail and grid ↔ DJ panel respectively) using bespoke CSS classes (`lineup-main--split`, `lineup-grid-wrapper`, etc.). Neither split is resizable by the user.

## Goals / Non-Goals

**Goals:**
- Reduce header clutter by grouping secondary actions behind a single dropdown trigger.
- Move the submission count to the list view controls area where it is contextually relevant.
- Create a single `SplitPane` component that both views consume, eliminating duplicated layout code.
- Allow the user to drag the split divider to resize the two panes.

**Non-Goals:**
- Persisting split ratios or menu state across sessions.
- Vertical (top/bottom) split orientation in this change (horizontal only for now).
- Replacing the header navigation tabs or back link.
- Any change to routing, data loading, or scoring logic.

## Decisions

### Dropdown implementation: plain React state, no library
A small `NavActionsMenu` component with a boolean `open` state and a `useEffect` close-on-outside-click handler is sufficient. Adding a headless-UI or floating-UI library for a single dropdown is not warranted.

### Resizable split: pointer events + CSS custom property
`SplitPane` stores the left-pane width as a percentage in component state. A hidden drag handle `<div>` sits between the two panes. On `pointerdown` the component subscribes to `pointermove`/`pointerup` on the window to compute the new percentage from the container's bounding rect. CSS `flex-basis` is set via an inline style. This avoids any third-party dependency and works reliably on both mouse and touch.

**Alternative considered**: CSS `resize: horizontal` — rejected because it requires `overflow: auto` and produces browser-default resize handles that cannot be styled to match the app's design.

### SplitPane API
```tsx
<SplitPane initialSplit={35} minLeft={20} minRight={20}>
  <LeftChild />
  <RightChild />
</SplitPane>
```
`initialSplit` is a percentage for the left pane. `minLeft`/`minRight` clamp dragging. The component always expects exactly two children.

### Submission count placement
The count (e.g. "120 submissions / 34 shown") moves into the `SubmissionList` controls bar, adjacent to the score metric selector. This makes it contextually correct: when day-filters reduce the visible set, the "shown" count updates in the same place.

## Risks / Trade-offs

- [Risk] Pointer capture during drag can conflict with browser text selection → Mitigation: call `e.preventDefault()` in `pointermove` and use `setPointerCapture`.
- [Risk] `NavActionsMenu` close-on-outside-click fires before the open toggle, causing the menu to immediately re-open on the trigger button click → Mitigation: check `contains(e.target)` against the whole menu container (trigger + dropdown), not just the panel.
- [Risk] Removing `submission-count` span from the header may surprise users who expect it there → Mitigation: the count is still visible in the list controls row; the header retains the project name for identity.

## Open Questions

- Should the split ratio be persisted in `localStorage` per view (submissions vs lineup)? Deferred — can be added as a follow-up without API changes to `SplitPane`.
