## Context

The Lineup Builder currently has three friction points:

1. **Panel auto-closes on assign** — After placing a DJ, the `DJSelectionPanel` calls `onClose()`, dismissing itself. To fill the next slot, the judge must click the grid again. This makes filling a full evening's lineup repetitive.

2. **Evening selection resets to "Thursday"** — `selectedEvening` state lives inside `LineupGrid` and initialises to `activeEvenings[0]` (Thursday) on each mount. Because `LineupView` unmounts and remounts parts of the tree (e.g., wrapping/unwrapping the `SplitPane`) when `activeSlot` changes, the evening selector resets unexpectedly.

3. **Moonlight context shows non-moonlight DJs** — The `DJSelectionPanel` filters by availability, assignment status, and discard status, but does not check `submission.moonlightInterest`. When judges are working in moonlight context, all non-moonlight submissions clutter the list.

## Goals / Non-Goals

**Goals:**
- Lift evening selection state out of `LineupGrid` into `LineupView` so it persists across slot-panel open/close and mode changes.
- After a DJ is assigned to a slot, automatically advance `activeSlot` to the next empty sequential slot on the same evening (scanning slots in order across all stages); if no empty slot exists, keep the current slot selected.
- After a slot is cleared (DJ removed), keep that slot selected so a replacement can be immediately chosen.
- Filter the DJ picker in moonlight context to only show `moonlightInterest === true` submissions.

**Non-Goals:**
- Auto-advance for simultaneous (silent disco) stages — those don't have linear slot ordering.
- Persisting the selected evening across page reloads (session memory is sufficient).
- Changing the panel layout or columns.

## Decisions

### Decision: Lift `selectedEvening` to `LineupView`

`LineupGrid` currently owns `selectedEvening` state. Because `LineupView` conditionally renders `LineupGrid` inside a `SplitPane` vs. a bare wrapper depending on whether `activeSlot` is set, the component re-mounts and state resets.

**Chosen approach**: Pass `selectedEvening` and `onSelectEvening` as props to `LineupGrid`. `LineupView` owns the state, initialising it to the first active evening. This is a straightforward prop lift — no new context or reducer needed.

**Alternatives considered**:
- Store in `localStorage`: overkill; evening selection is ephemeral.
- React context for lineup UI state: introduces coupling; prop drilling is fine given the shallow tree.

### Decision: Slot-advance logic lives in `LineupView.handleAssign`

After assignment, `LineupView` already has all the data needed to compute the next empty slot (`project.stages`, `project.assignments`, `selectedEvening`). A helper `findNextEmptySlot(stages, assignments, evening, currentSlot)` can return the next empty `ActiveSlot` or `null`.

**Chosen approach**: After `handleAssign` updates `project`, call the helper and call `setActiveSlot` with the result (or leave it unchanged if no empty slot found). The `DJSelectionPanel` no longer calls `onClose()` on assign — the parent decides what to do with the slot.

**Alternatives considered**:
- Pass a callback `onSlotAdvance` to the panel: couples the panel to advance logic it shouldn't own.
- Panel manages its own slot list: duplicates state already in the parent.

### Decision: Remove `onClose()` call from `DJSelectionPanel.handleAssign`

Currently `handleAssign` in the panel calls `onClose()` after dispatching the assignment. We'll remove that call. The `onClose` prop remains for Escape / outside-click dismissal.

For the "Remove" button in the panel, we will also stop calling `onClose()`, keeping the slot selected.

### Decision: Moonlight filter is applied in `DJSelectionPanel.available` memo

The existing `available` memo already applies several filters. Adding `if (appContext === 'moonlight' && !s.moonlightInterest) return false` is minimal and local to the panel.

## Risks / Trade-offs

- [Prop addition to `LineupGrid`] Adding `selectedEvening`/`onSelectEvening` props is a breaking interface change for any test that renders `LineupGrid` directly. Mitigation: update test fixtures; the change is mechanical.
- [Auto-advance skips simultaneous stages] Simultaneous stages have no `slotIndex`-based ordering, so they are excluded from advance logic. Judges must click them manually. Acceptable for the current use case.
- [Slot stays selected after remove] If a judge removes a DJ and then presses Escape, the slot is still "selected" but now empty. This is the desired UX per requirements.
