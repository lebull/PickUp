## 1. Layout Fix — Row Column Alignment

- [x] 1.1 Update `.results-dj-row--blank` in `App.css` to use `display: grid; grid-template-columns: 1fr 1fr 1fr` instead of `display: flex`
- [x] 1.2 Update the blank row JSX in `ResultsList.tsx` so the blank label renders in column 1 and the slot-time label renders in column 3 (wrap in a `<span>` in the meta column position, leave column 2 empty with an empty `<span>`)
- [x] 1.3 Verify visually that blank rows and DJ rows are column-aligned

## 2. Count Calculation

- [x] 2.1 Update `buildResultsData` to return `djCountByStage: Map<string, number>` — count of non-blank assigned rows per stage
- [x] 2.2 Update `buildResultsData` to return `totalDjCount: number` — sum of all stage counts
- [x] 2.3 Destructure and use the new count values in the `ResultsList` render

## 3. Count Display

- [x] 3.1 Add a `(N DJs)` count badge next to each stage heading in the accepted sections
- [x] 3.2 Add a project-total line above the first stage section: "N DJs assigned across all stages"
- [x] 3.3 Add a note beneath the total: "Blocked/open slots are not included in these counts"
- [x] 3.4 Add CSS for count badge and total note (muted color, small font)

## 4. Individual Email Copy

- [x] 4.1 Add a small clipboard icon copy button after each email address in `DJRowItem`
- [x] 4.2 Wire `onClick` to call `navigator.clipboard.writeText(email)` and stop event propagation
- [x] 4.3 Implement a per-email "Copied!" transient confirmation (e.g., local state with a timeout to reset)
- [x] 4.4 Add CSS for the copy icon button (inline, subtle, visible on row hover)
- [x] 4.5 Disable the copy button (and show a tooltip) when `navigator.clipboard` is unavailable

## 5. Copy All Emails per Stage (Modal)

- [x] 5.1 Add a "Copy emails" button to each stage heading in the accepted area
- [x] 5.2 On button click, collect all non-blank row `contactEmail` values for that stage, filter out empty values, and join with `, `
- [x] 5.3 Open a modal displaying the email list in a read-only `<textarea>` so the coordinator can review the addresses
- [x] 5.4 Add a "Copy to clipboard" button inside the modal that writes the string to clipboard and closes the modal
- [x] 5.5 Add a "Close" / dismiss action that closes the modal without copying
- [x] 5.6 Add CSS for the modal overlay, dialog, textarea, and action buttons
