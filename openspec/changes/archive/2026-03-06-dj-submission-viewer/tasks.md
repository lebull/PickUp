## 1. Project Scaffold

- [x] 1.1 Initialize a Vite + React + TypeScript project in `app/` (`npm create vite@latest app -- --template react-ts`)
- [x] 1.2 Add PapaParse and its types as dependencies (`papaparse`, `@types/papaparse`)
- [x] 1.3 Remove Vite boilerplate (default CSS, SVG assets, placeholder content in `App.tsx`)
- [x] 1.4 Copy `FWA 2026 DJ Submissions (Responses) - Scoresheet ANONYMIZED.csv` into `app/public/` so it is served as a static asset

## 2. CSV Column Mapping

- [x] 2.1 Create `src/csvColumns.ts` that exports a typed constant mapping each logical field name to its 0-based column index (per the design doc table)
- [x] 2.2 Add a `validateHeaders` function that reads the first CSV row and warns to the console if expected column names at key indices don't match, without blocking load

## 3. Score Calculation Module

- [x] 3.1 Create `src/scoreCalculation.ts` with a `parseScore(value: string): number | null` helper that returns null for empty or non-numeric values
- [x] 3.2 Implement `computeJudgeAvg(technical, flow, entertainment)` returning null if any component is absent
- [x] 3.3 Implement `computeMainScore(row)` returning `{ avg, sum, partial }` using Judge 1 (cols 24–26) and Judge 2 (cols 32–34)
- [x] 3.4 Implement `computeMLScore(row)` returning `{ avg, sum }` using Judge ML Technical/Flow/Entertainment (cols 36–38), excluding Vibefit

## 4. CSV Loading and Data Model

- [x] 4.1 Create `src/types.ts` defining a `Submission` interface with all parsed fields as typed properties (string, number | null, string[], etc.)
- [x] 4.2 Create `src/loadSubmissions.ts` with an async function that fetches the CSV from `/submissions.csv`, parses it with PapaParse, maps each row to a `Submission` object using the column map, and computes main and ML scores
- [x] 4.3 In `App.tsx`, load submissions on mount using `useEffect` and store in state; display a loading indicator while parsing

## 5. Submission List View

- [x] 5.1 Create `src/components/SubmissionList.tsx` that accepts the submissions array, current sort mode, current day filter, and an `onSelect` callback
- [x] 5.2 Add a sort control (dropdown or button group) with options: Main Avg, Main Sum, ML Avg, ML Sum
- [x] 5.3 Add a day filter control (dropdown) with options: All Days, Thursday, Friday, Saturday, Sunday
- [x] 5.4 Apply sort and filter as derived computations before rendering the table; submissions with null scores for the active sort dimension sort to the bottom
- [x] 5.5 Render the table with columns: DJ Name, Final Main Score, Final Moonlight Score, Genre, Preferred Stages, Days Available
- [x] 5.6 Show a visual indicator (e.g., asterisk or badge) on the Final Main Score when only one judge has scored (partial score)
- [x] 5.7 Display "—" for null ML scores

## 6. Submission Detail View

- [x] 6.1 Create `src/components/SubmissionDetail.tsx` that accepts a `Submission` and an `onBack` callback
- [x] 6.2 Render a "← Back" button that calls `onBack`
- [x] 6.3 Render a Basic Info section: DJ Name, Fur Name, Contact Email, Telegram/Discord, Social Media, Phone, Submission Link, Genre, Format/Gear, Bio, Days Available, Prior Experience
- [x] 6.4 Render a Stage Preferences section listing all 5 ranked preferences (labeled "1st:", "2nd:", etc.), omitting any that are empty
- [x] 6.5 Render a Judge Scores section with Judge 1 and Judge 2 sub-sections, each showing Technical, Flow, Entertainment, computed average, and Notes; show Final Main Score at the bottom of the section
- [x] 6.6 Render a Moonlight section (only when Moonlight Interest is "Yes") with: ML Genre, ML Submission Link, Kink/Why response, and Judge ML scores (Technical, Flow, Entertainment, Vibefit, Notes); show Final ML Score
- [x] 6.7 Display "—" for any empty field; do not render section headers for sections where all fields are empty

## 7. Navigation Wiring

- [x] 7.1 In `App.tsx`, manage a `selectedIndex: number | null` state variable
- [x] 7.2 Render `SubmissionList` when `selectedIndex` is null; render `SubmissionDetail` when `selectedIndex` is set
- [x] 7.3 Pass sort mode and day filter state up to `App.tsx` so they are preserved when returning from the detail view

## 8. Styling and Polish

- [x] 8.1 Add minimal base styles: readable table layout, hover highlight on list rows, clear section headings in detail view
- [x] 8.2 Make the list table use `cursor: pointer` on rows to signal clickability
- [x] 8.3 Ensure the app is usable at typical laptop screen widths (no horizontal scrollbar on the list view)
- [x] 8.4 Add a page title ("FWA 2026 DJ Submissions") in the header
