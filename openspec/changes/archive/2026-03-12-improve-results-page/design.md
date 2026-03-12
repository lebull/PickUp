## Context

The Results page is the final handoff tool for event coordinators — they use it to confirm who is playing and to gather contact information to send acceptance/rejection emails. Three issues need to be resolved:

1. **Layout regression**: `.results-dj-row` uses `display: grid` with `grid-template-columns: 1fr 1fr 1fr`, while `.results-dj-row--blank` uses `display: flex`. This means blank rows (blocked/open slots) and DJ rows do not share the same column structure, causing visible misalignment in the contact/meta columns.

2. **Email copy UX**: Emails appear as plain text spans inside clickable `<button>` rows. There is no mechanism to copy an individual email without carefully triple-clicking the span, and because the row itself is a button, text selection is awkward.

3. **Missing counts**: Coordinators need to know how many DJs are confirmed per stage and overall. Blank/blocked slots must be excluded from counts to avoid inflating numbers.

## Goals / Non-Goals

**Goals:**
- Fix row layout so blank and DJ rows are visually aligned (same column widths)
- Allow copying a single email address with one click without navigating away
- Provide a "Copy all emails" button per stage that produces a comma-separated list
- Show assigned-DJ count per stage section heading and a grand total at the top of the accepted area
- Exclude blank/blocked slots from all counts; display a note to that effect

**Non-Goals:**
- Copying Telegram/Discord handles
- Bulk copy of rejection-section emails
- Sorting or filtering results rows
- Any changes to the submission detail side panel

## Decisions

### 1. Layout fix: make blank rows use grid too

Blank rows currently use `display: flex` with `justify-content: space-between`. The fix is to apply the same `display: grid; grid-template-columns: 1fr 1fr 1fr` to blank rows. The blank-label goes in column 1, slot-time goes in column 3 (right-aligned), and column 2 is left empty. This maintains visual spacing without a structural overhaul.

**Alternative considered**: Use a wrapper `<table>` for the list. Rejected — would require more extensive restructuring and the grid approach is already partially correct; the fix is surgical.

### 2. Copy individual email: inline copy icon button

Rather than making the email span itself a copy target (which conflicts with the row's existing `<button>` click handler for selecting a submission), a small clipboard icon button is placed after each email address. Clicking the icon copies the email and shows a brief "Copied!" tooltip/label — it stops event propagation so it does not also open the detail panel.

**Alternative considered**: Make the entire email span a copy target that suppresses the row click. Rejected — clicking text inside a button row is unreliable across browsers; an explicit icon button is more discoverable and accessible.

### 3. Copy all emails per stage: review modal before copying

A "Copy emails" button is placed inline with each stage heading. Clicking it opens a small modal that displays the comma-separated email list in a read-only text area so the coordinator can review (and optionally edit) the list before copying. A "Copy to clipboard" button inside the modal performs the copy and closes the modal; a "Close" button dismisses without copying.

Showing emails in the modal before copying lets coordinators catch omissions (e.g., a DJ with no email address on file) and verify the list before pasting into an email client.

**Alternatives considered**:
- *Blind copy with count toast* — copy immediately on button click and show "Copied N emails". Rejected — coordinators cannot see or verify what was copied without pasting elsewhere first.
- *Inline expandable panel below the heading* — reveal the email list in-place without a modal. Not chosen; a modal is self-contained, draws clear focus, and dismisses cleanly without affecting the layout of the results list.
- *Separate bulk copy area below the stage* — rejected as less ergonomic and harder to associate with a specific stage.

### 4. Count display: badge in stage heading + project total

Each stage heading shows `(N DJs)` next to the stage name, where N counts only assigned-submission rows (not blank slots). A single line above all stage sections (below the duplicate alert) shows the project total: `N DJs assigned across all stages`. A sub-note reads "Blocked/open slots are not included in these counts."

The count logic lives in `buildResultsData` — it already tracks `assignedNumbers`; the new return value is `djCountByStage` (a `Map<stageId, number>`) and `totalDjCount`.

### 5. Clipboard API

Use `navigator.clipboard.writeText()`. This is supported in all modern browsers in secure contexts (HTTPS / localhost). No fallback for older browsers is needed for this internal tool.

## Risks / Trade-offs

- [Clipboard API unavailable in non-secure contexts] → Acceptable: this tool is used in production over HTTPS or locally; if unavailable, the button is disabled and shows a tooltip.
- [Grid column change for blank rows may affect narrow viewports] → Low risk: existing grid layout already constrains narrow viewports; blank rows will behave consistently with DJ rows now.
