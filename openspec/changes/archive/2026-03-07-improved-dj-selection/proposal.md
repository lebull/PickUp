## Why

DJ selection is the most critical workflow in this application — it's how judges and coordinators choose performers for the lineup. Currently the submission list and detail view expose raw data but provide no tools to compare, filter, or contextualize DJs for specific slots or contexts (Standard vs. Moonlight). Adding structured selection UX, app-wide context switching, and a hidden-names privacy mode will make this process faster and less biased.

## What Changes

- **Sort submission list by Judge Score descending by default**, surfacing the highest-scored DJs immediately
- **Stage Preference becomes filterable** in the DJ selection panel so coordinators can narrow to DJs suited for a specific slot; **Genre is visible** in the panel but is not used as a filter (genre values are too varied to categorize reliably)
- **DJ selection moves from a modal to a side panel** within the lineup view — when a user clicks a slot to fill it, a panel opens beside the lineup grid showing a scored, filtered list of available DJs that can be **dragged and dropped** onto the target slot
- **App-wide Standard/Moonlight context toggle** switches which score set (Main vs. ML) is used for sorting, filtering, and display throughout the entire app
- **Moonlight-context view surfaces Vibefit** as a visible column/field when the Moonlight context is active
- **Hidden Names mode** obscures DJ names (and fur names) app-wide so judges can evaluate submissions without identity bias; names are replaced with an anonymous identifier (e.g., `DJ #12`)
- **Submission detail view respects context** — shows the relevant score section (Main or Moonlight) prominently based on the active app context

## Capabilities

### New Capabilities
- `app-context`: App-wide toggle between Standard and Moonlight context, stored in global state; controls which score set is primary throughout the app
- `hidden-names`: App-wide toggle to obscure DJ names with anonymous identifiers to prevent bias during evaluation
- `dj-selection-panel`: Inline side panel within the lineup view that opens when a slot is clicked; displays available DJs with score, genre (visible, not filterable), stage preference, and vibefit (moonlight context); supports drag-and-drop onto lineup slots; replaces the existing modal (`SlotPicker`)
- `dj-selection-filters`: Stage Preference filter control in the DJ selection panel to narrow candidates for a specific slot; genre is shown as an informational column only
- `submission-list-vibefit`: Vibefit column displayed in the submission list when the Moonlight context is active

### Modified Capabilities
- `submission-list`: Default sort changes to Judge Score descending; active app context determines which score column (Main vs. ML) is used as the primary sort; hidden-names mode masks DJ Name column
- `submission-detail`: Active app context determines which score section is shown prominently (Main or Moonlight); hidden-names mode masks DJ Name and Fur Name fields

## Impact

- `App.tsx` / `ProjectContext.ts`: Add `appContext` (`standard` | `moonlight`) and `hiddenNames` (boolean) to global state/context
- `LineupView.tsx`: Replace the `SlotPicker` modal with a persistent side panel (`DJSelectionPanel`) that appears when a slot is active; layout becomes a two-column split (grid + panel)
- `DJSelectionPanel.tsx` (new): Side panel listing available DJs with score, genre (display-only), stage preference filter, and drag-and-drop support onto lineup slots
- `SubmissionList.tsx`: Default sort by score, stage preference filter, vibefit column (moonlight), name masking; genre remains a visible column (no filter)
- `SubmissionDetail.tsx` / `SubmissionDetail-Summary`: Context-aware score emphasis, name masking
- `scoreCalculation.ts`: No changes needed — scores already computed; display logic reads from context
- No breaking changes to CSV import, project store, or lineup builder
