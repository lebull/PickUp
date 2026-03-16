## Context

The app has two genre-related fields on each `Submission`: `genre` (main festival genre) and `mlGenre` (Moonlight-specific genre). When a `Stage` has `useMoonlightScores: true`, the DJ selection panel and the lineup grid already switch to ML scores and ML-specific filtering — but the Genre column and slot labels still render `genre` unconditionally.

Two components need updating:

1. **`DJSelectionPanel.tsx`** — `renderCard` always reads `s.genre`. It already has `useMoonlight` in scope.
2. **`LineupGrid.tsx`** — Sequential slot cells derive `const genre = submission?.genre ?? ''` without checking the stage's `useMoonlightScores` flag. `resolveSimultaneousDJs` similarly always picks `sub?.genre`. Both need to consult the stage object that is already available in scope.

## Goals / Non-Goals

**Goals:**
- Show `mlGenre` (falling back to `'—'`) wherever a genre is displayed in a Moonlight-context slot (DJ picker panel, sequential grid cells, simultaneous DJ badges).
- Keep `genre` unchanged in Standard-context slots and in the browsing (no active slot) state of the DJ picker.

**Non-Goals:**
- Adding or removing columns — the existing Genre column is kept as-is, just its source value changes.
- Changing tooltip behavior, CSS, or visual layout.
- Altering how `mlGenre` is parsed or stored.

## Decisions

### 1. Where to resolve `mlGenre` vs `genre`

**Decision:** Choose the genre string inline at the point of rendering/resolving, using a ternary: `useMoonlight ? s.mlGenre : s.genre` (with `|| '—'` fallback).

**Rationale:** Both values are already on the `Submission` object. No new props, helpers, or derived state are needed. The logic is trivially one line, so extracting a helper would be over-engineering.

**Alternative considered:** A shared `getGenre(submission, useMoonlight)` utility — unnecessary for a two-branch expression.

### 2. `LineupGrid` — determining `useMoonlight` per stage

**Decision:** Use `stage.useMoonlightScores ?? false` directly, since the `Stage` object is already in scope at the point where `genre` is derived for both sequential and simultaneous rendering.

**Rationale:** The grid already iterates `stageColumns` (each containing the `stage` object), so no additional prop threading is needed. For `resolveSimultaneousDJs`, the `stageId` can be used to look up the stage from the existing `stages` prop.

**Alternative considered:** Pass a `useMoonlight` prop down from `LineupView` — unnecessary given the stage object is accessible.

## Risks / Trade-offs

- **`mlGenre` may be empty for some submissions** (e.g., non-moonlight-interest DJs who somehow appear on a Moonlight stage). The `|| '—'` fallback handles this gracefully, same as the current `genre` fallback.
- No migration or rollback concerns — purely a display-layer change with no data model or persistence impact.

## Open Questions

_(none)_
