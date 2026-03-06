## Why

DJ submission scoring for FWA 2026 is managed in a CSV spreadsheet that is difficult to navigate, compare, and filter — judges need a simple local tool to review submissions, compare scores across candidates, and drill into individual submission details without exposing the raw spreadsheet.

## What Changes

- New standalone local web application that reads the existing anonymized CSV and presents submissions in a usable UI
- List view of all submissions with computed main and Moonlight scores, sortable and filterable
- Detail view that surfaces all fields for a single submission in a readable layout
- Score calculation logic that correctly separates main judge scores (Judge 1 + Judge 2) from Moonlight judge scores (Judge ML)

## Capabilities

### New Capabilities

- `submission-list`: Browse all DJ submissions in a table; sort by main or Moonlight score (average or sum); filter by day(s) available; display DJ Name, Final Main Score, Final Moonlight Score, Genre, Preferred Stages, and Days Available
- `submission-detail`: Drill into a single submission to see all collected fields (contact info, bio, experience, format, stage preferences, Moonlight answers, judge scores and notes) in a clean layout
- `score-calculation`: Parse raw judge columns from CSV and compute per-judge averages, combined main score (across Judge 1 and Judge 2), and Moonlight score (across Judge ML Technical/Flow/Entertainment/Vibefit); handle missing/partial scores gracefully

### Modified Capabilities

## Impact

- New app directory (e.g., `app/`) with HTML, CSS, and TypeScript/JavaScript source
- Reads `FWA 2026 DJ Submissions (Responses) - Scoresheet ANONYMIZED.csv` from the workspace root at runtime — no backend required
- No external dependencies beyond a CSV parser; runs entirely in the browser via a local dev server or direct file open
- Does not modify the source CSV
