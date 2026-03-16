## Why

When a stage uses Moonlight Scores (`useMoonlightScores: true`), DJs in the DJ picker panel and in the lineup grid slots are still shown their **main genre** instead of their **Moonlight genre** (`mlGenre`). This misleads coordinators building a Moonlight lineup, since the Moonlight-specific genre is what's relevant for that context.

## What Changes

- In the **DJ selection panel**, when `useMoonlight` is true, the Genre column displays `submission.mlGenre` instead of `submission.genre`.
- In the **lineup grid**, sequential slot cells and simultaneous DJ badges on a Moonlight stage display `submission.mlGenre` instead of `submission.genre`.
- When neither value is present, the display falls back to `'—'`.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `dj-selection-panel`: Genre column shows `mlGenre` when the active stage uses Moonlight Scores.
- `lineup-event-cell`: Sequential slot cells on Moonlight stages show `mlGenre` instead of `genre`.
- `lineup-grid-simultaneous`: Simultaneous DJ badges on Moonlight stages show `mlGenre` instead of `genre`.

## Impact

- `app/src/components/DJSelectionPanel.tsx`: `renderCard` reads `s.mlGenre` when `useMoonlight` is true.
- `app/src/components/LineupGrid.tsx`: Sequential slot genre derivation and `resolveSimultaneousDJs` use `mlGenre` when the slot's stage has `useMoonlightScores: true`.
- No changes to `types.ts`, `csvColumns.ts`, or scoring logic — `mlGenre` already exists on `Submission`.
