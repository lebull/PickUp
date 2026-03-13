## Context

The lineup grid currently exposes three rough areas:

1. **Blocking slots**: Blocking a slot currently requires using a pinned "Blocked slot" row at the top of the DJ list in the selection panel. This row is an awkward outlier — it doesn't behave like a DJ pick and is visually disconnected from the slot actions (like "Remove") that live in the slot tray.
2. **Moonlight scores**: A global `appContext: 'standard' | 'moonlight'` preference gates ML score visibility, sorting, filtering, and Vibefit display for all stages at once. In Moonlight mode the panel hides Main Score and in Standard mode it hides ML Score — operators can't see both at once.
3. **Time display**: Time labels (grid row headers, slot tray) are raw `"HH:MM"` 24-hour strings from the stage config. No formatting layer exists; the grid also only generates rows for slots that exist rather than a continuous axis, so visual time spacing is uneven when stages have different coverage.

## Goals / Non-Goals

**Goals:**
- Add a "Block Slot" action to empty slot tray rows in the DJ selection panel (mirroring "Remove" on occupied rows); remove the pinned blocked-slot row from the DJ list
- Replace global Moonlight `appContext` toggle with a per-stage `useMoonlightScores` flag
- Always show both Main Score and ML Score in the DJ panel
- Render the lineup grid time axis as a continuous range (start to end), with blank rows where no slot is scheduled
- Add an app-wide `timeFormat: '12h' | '24h'` preference; apply it wherever times are displayed

**Non-Goals:**
- Editing the blocked slot label (label defaults to "Blocked"; in-cell editing is out of scope)
- Changing how scores are calculated or stored
- Adding per-stage Moonlight _filtering_ (`moonlightInterest`) — filtering behavior follows `useMoonlightScores` but is not changed in logic
- Redesigning the stage config panel beyond adding the toggle

## Decisions

### 1. Block Slot action lives on the slot in the DJ selection panel

When the DJ selection panel is open for an empty slot, the slot tray row for that slot gains a "Block Slot" button — mirroring how the "Remove" button appears on occupied slot tray rows. Clicking it calls `onAssignBlank` with `blankLabel: 'Blocked'` and closes the panel. No data model change is needed. The pinned "Blocked slot" row at the top of the DJ list is removed.

**Alternative considered**: Standalone button on the raw grid cell (bypassing the panel). Rejected — blocking is a slot action and belongs in the same interaction context as assignment and removal. The slot tray row is the right owner, consistent with how "Remove" works.

**Label**: Blocked slots use the default `'Blocked'` label. Custom labels are out of scope.

### 2. `useMoonlightScores` moves to Stage; global `appContext` is removed

A new optional `useMoonlightScores?: boolean` field is added to the `Stage` type (in `projectStore` and `types.ts`). The `StageConfigPanel` gets a toggle for it. The global `appContext` preference is removed from `AppPreferencesContext`.

Wherever code previously checked `appContext === 'moonlight'`, it now checks `stage.useMoonlightScores`. In the DJ panel, the active stage's flag drives sorting and `moonlightInterest` filtering.

**Alternative considered**: Keep global toggle as a fallback default. Rejected — the user explicitly said to stop using the top-level settings for this. Per-stage is the cleaner model.

**Migration**: `pickup_prefs_v1` in localStorage drops the `appContext` key. On load, any stored `appContext` is silently ignored (no crash). Existing projects gain `useMoonlightScores: false` by default (field is optional → `undefined` = false).

### 3. DJ panel always shows both scores

The `scoreLabel()` context switch is replaced by two separate columns: "Main" and "ML". Both show `"—"` when their score is null. `mlVibefit` is shown in a third column regardless of stage type (empty string renders as `"—"`). This removes all `appContext`-gated column logic from the panel.

**Alternative considered**: Only show ML column when `useMoonlightScores = true`. Rejected — the user specifically asked to "just show both scores" without stage context switching.

### 4. Continuous time axis calculated across active stages

Currently each stage generates its own row set. The grid will instead compute a **shared time axis** spanning the union of all stages' start/end times for the active evening, stepping by the minimum `slotDuration` across stages. Stages that have no slot at a given time render an empty (non-interactive) cell. This is handled in `lineupUtils` (`getEveningTimeAxis` or equivalent).

**Alternative considered**: Per-stage axes with alignment CSS. Rejected — alignment breaks when stages have different slot durations.

### 5. Time formatting utility

A single `formatTimeLabel(hhmm: string, format: '12h' | '24h'): string` utility is added (likely in `lineupUtils.ts` or a new `timeUtils.ts`). It converts `"HH:MM"` strings to `"h:MM am/pm"` (12h) or returns the string as-is (24h). Default preference is `'24h'` to preserve existing behavior. The preference is persisted in `pickup_prefs_v1` alongside `hiddenNames`.

## Risks / Trade-offs

- **Shared time axis complexity**: Stages with different slot durations need a common step. Using `Math.min(slotDurations)` is correct but could produce many rows for events with a 15-min stage alongside a 60-min stage. → Mitigation: document this trade-off; consider capping number of axis rows in a follow-up.
- **Removing global Moonlight toggle**: Operators who relied on the global toggle to quickly switch all stages must now configure each stage individually. → Mitigation: on first load after migration, stages default to `useMoonlightScores: false`; Moonlight operators will notice and set per-stage flags. This is an acceptable one-time setup cost.
- **Both score columns**: Panel width increases with a second score column. → Mitigation: use compact formatting (e.g. `"3.45 / 2.10"` or small stacked display); exact layout is a UI detail for implementation.

## Open Questions

- Should `moonlightInterest` filtering follow `useMoonlightScores` per stage, or should it be a separate toggle? Current plan: it follows `useMoonlightScores` (if set, only `moonlightInterest: true` submissions shown).
- For the block action: confirmed to live in the DJ selection panel's slot tray row (as a "Block Slot" button mirroring the "Remove" button on occupied slots), not as a raw grid cell button.
