## 1. DJ Selection Panel — Genre Column

- [x] 1.1 In `DJSelectionPanel.tsx` `renderCard`, replace `s.genre || '—'` with `(useMoonlight ? s.mlGenre : s.genre) || '—'` in both the `title` attribute and the text content of the `dj-col-genre` span
- [x] 1.2 Update the `title` attribute on the same `dj-col-genre` span to also use `(useMoonlight ? s.mlGenre : s.genre) || '—'`

## 2. Lineup Grid — Sequential Slot Cells

- [x] 2.1 In `LineupGrid.tsx`, when deriving `genre` for a sequential slot cell, look up the current stage's `useMoonlightScores` flag and select `submission?.mlGenre` when true, falling back to `submission?.genre`, e.g.: `const genre = (stage.useMoonlightScores ? submission?.mlGenre : submission?.genre) ?? ''`

## 3. Lineup Grid — Simultaneous DJ Badges

- [x] 3.1 In `LineupGrid.tsx` `resolveSimultaneousDJs`, look up the stage by `stageId` from `stages` and use `sub?.mlGenre` when `stage?.useMoonlightScores` is true, otherwise use `sub?.genre`, e.g.: `genre: (stages.find(st => st.id === a.stageId)?.useMoonlightScores ? sub?.mlGenre : sub?.genre) ?? ''`
