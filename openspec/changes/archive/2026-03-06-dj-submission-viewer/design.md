## Context

The FWA 2026 DJ submission process uses a Google Form that exports to a CSV spreadsheet. The CSV has been anonymized for review. There is no existing tooling — judges currently navigate the raw spreadsheet.

The spreadsheet has a quirk: the Judge 2 score column _headers_ have copy-paste labeling errors (several are mislabeled "Judge 1: Flow" or "Judge 1: Notes" instead of "Judge 2"). Additionally, there appear to be two "blocks" of Judge 2 columns — the first block (4 columns) is consistently empty across all rows; the second block contains the real Judge 2 scores. The Moonlight judge has an extra "Vibefit" column that contains an "X" marker (not a numeric score) and should be excluded from numeric averaging.

This application must run locally (internal use only, no server deployment). There are 2 main judges and 1 Moonlight judge.

## Goals / Non-Goals

**Goals:**
- Parse the CSV correctly, working around mislabeled and duplicate headers
- Compute per-judge averages and combined scores for both main and Moonlight tracks
- Provide a list view with sort (by main or ML score, average or sum) and filter (by day available)
- Provide a detail view that exposes all submission fields
- Run entirely in the browser via a local dev server (`npm run dev`)

**Non-Goals:**
- No backend, authentication, or network requests
- No editing, scoring, or annotating submissions
- No persistance of sort/filter state across sessions
- No deployment outside localhost

## Decisions

### 1. Tech stack: Vite + React + TypeScript

**Decision**: Use Vite + React + TypeScript with PapaParse for CSV parsing.

**Rationale**: The workspace already uses TypeScript. React gives clean component separation for list vs. detail views. Vite has near-zero config and starts instantly. PapaParse is the de-facto standard for robust CSV parsing — it handles the quoted multi-line fields present in this CSV (e.g., the Moonlight question field spans multiple lines due to bullet points in the original Google Form label).

**Alternatives considered**:
- *Plain HTML/JS with no build step* — Avoids any setup but loses type safety, which matters for correctness of score column mapping.
- *Vue/Svelte* — No meaningful advantage here; React is familiar and sufficient.

### 2. Column access by index, not by header name

**Decision**: Map CSV columns by their 0-based index rather than by header string.

**Rationale**: Multiple headers are mislabeled (e.g., several "Judge 2" columns carry "Judge 1" labels). Relying on column names would silently pick wrong data or crash. Accessing by index is deterministic given the fixed spreadsheet structure. The mapping will be documented in a constants file.

**Alternatives considered**:
- *Fixing/renaming headers at load time* — More fragile; requires matching partial strings. Index-based is safer.

**Column mapping** (0-based):

| Index | Field |
|-------|-------|
| 2 | DJ Name |
| 3 | Fur Name |
| 4 | Contact Email |
| 5 | Telegram/Discord |
| 6 | Social Media |
| 7 | Phone |
| 8 | Submission Link |
| 9 | Genre (Mix Genre?) |
| 10 | Prior Experience |
| 11 | Format/Gear |
| 12 | Bio (Tell us about you) |
| 13 | Days Available |
| 14 | Moonlight Interest |
| 15–19 | Stage Preferences (1st–5th) |
| 20 | Moonlight Kink/Why |
| 21 | Moonlight Genre |
| 22 | Moonlight Submission Link |
| 23 | Notes for Judges |
| 24 | Judge 1: Technical |
| 25 | Judge 1: Flow |
| 26 | Judge 1: Entertainment |
| 27 | Judge 1: Notes |
| 28–31 | (Empty / abandoned columns — skip) |
| 32 | Judge 2: Technical |
| 33 | Judge 2: Flow |
| 34 | Judge 2: Entertainment |
| 35 | Judge 2: Notes |
| 36 | Judge ML: Technical |
| 37 | Judge ML: Flow |
| 38 | Judge ML: Entertainment |
| 39 | Judge ML: Vibefit (non-numeric "X" marker — excluded from score) |
| 40 | Judge ML: Notes |
| 41 | Judge ML: Notes (secondary) |

### 3. Score calculation: per-judge average, then cross-judge mean

**Decision**: Each judge's score is `avg(Technical, Flow, Entertainment)`. The final main score is the mean of Judge 1 score and Judge 2 score. The final ML score is `avg(ML Technical, ML Flow, ML Entertainment)` (Vibefit excluded). Scores are surfaced as both `avg` and `sum` (of raw component scores) to support both sort modes.

**Rationale**: Averaging within a judge normalizes against point-count differences. The "sum" mode is offered for users who prefer seeing total points. Missing scores (empty cells) are treated as absent — a score is only computed when all three components for a judge are present.

**Alternatives considered**:
- *Simple sum of all raw scores* as the only mode — loses nuance between high-scoring across all judges vs. one judge being dominant.

### 4. Navigation: state-based (no router)

**Decision**: Use a single top-level React state variable (`selectedIndex`) to toggle between list view and detail view. No React Router.

**Rationale**: There are only two views. Introducing a router adds routes, a `BrowserRouter`, and URL management with no user benefit for a local-only tool. State-based navigation is simpler, has no dependencies, and works correctly with `file://` origins if the user opens the build directly.

### 5. Sorting and filtering in-memory

**Decision**: Sort and filter are applied as derived computations over the in-memory parsed CSV array on each render. No virtualization.

**Rationale**: The dataset is small (< 100 submissions). No need for virtual lists or memoization of sort results for this scale.

## Risks / Trade-offs

- **Column index brittleness** → If the Google Form or spreadsheet is restructured (columns added/reordered), the index mapping breaks silently. Mitigation: document clearly in `src/csvColumns.ts`; add a header validation check at load time that verifies key column names at expected indices.
- **Multi-line CSV fields** → The Moonlight question header itself contains newlines, which can confuse naïve CSV parsers. Mitigation: PapaParse handles RFC 4180 quoting correctly.
- **Partial scores skew averages** → If only one judge has scored a submission, the "final main score" will be based on a single judge's avg. Mitigation: indicate visually when a score is partial (only one judge has scored).
