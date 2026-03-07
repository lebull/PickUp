## Context

The app currently loads submissions from a CSV and displays them in a list/detail layout. Scores are already computed (Main and ML) via `scoreCalculation.ts`. The `ProjectContext` holds project and submission state but has no concept of a viewing context (Standard vs. Moonlight) or privacy settings. The `SubmissionList` sorts by score but defaults to Main score and doesn't surface genre or stage-preference filters. DJ names are always visible.

This change introduces two orthogonal cross-cutting concerns that affect many components:
1. **App context** (Standard | Moonlight) — which score set is primary
2. **Hidden Names** — whether DJ identity is obscured

Both are ephemeral UI preferences (not persisted to the project) and should live in a global React context available to all components.

## Goals / Non-Goals

**Goals:**
- Add a persistent app-level context toggle (Standard / Moonlight) that changes score display across the whole app
- Add a hidden-names toggle that replaces DJ names with anonymous identifiers
- Replace the `SlotPicker` modal with an inline side panel in the lineup view; the panel supports drag-and-drop of DJs onto lineup slots
- Display genre as a visible column in the DJ selection panel and submission list (not filterable — genre values are too varied to classify reliably)
- Add a stage-preference filter to the DJ selection panel so coordinators can narrow candidates for a specific slot
- Display Vibefit as a column in the DJ selection panel and submission list when Moonlight context is active
- Default sort in the submission list and DJ selection panel should be by the active context's score, descending

**Non-Goals:**
- Persisting app context or hidden-names preference to IndexedDB / the project file
- Changing the lineup builder slot assignment behavior based on app context
- Changing how scores are calculated (only display/sort changes)
- Supporting more than two contexts (Standard and Moonlight are sufficient)
- Filtering submissions by genre (genre values span too many micro-categories to map cleanly; genre is shown for reference only)

## Decisions

### 1. App context and hidden-names as a new top-level React context

**Decision:** Create a new `AppPreferencesContext` (separate from `ProjectContext`) that holds `appContext: 'standard' | 'moonlight'` and `hiddenNames: boolean`, with setters for each.

**Rationale:** These are UI preferences, not project data. Keeping them separate from `ProjectContext` avoids coupling preferences to a project lifecycle and makes them available even outside a project workspace (e.g., a future project list view).

**Alternative considered:** Adding to `ProjectContext` — rejected because preferences don't belong in project state and would be lost/reset on project change.

### 2. Anonymous identifier strategy for hidden names

**Decision:** When `hiddenNames` is true, replace DJ Name and Fur Name with `DJ #N` where N is the submission's 0-based index + 1 in the original (unsorted) array.

**Rationale:** A stable index (not sort-order dependent) ensures the same submission always gets the same anonymous label within a session, enabling cross-referencing without revealing identity.

**Alternative considered:** Using submission number from CSV — rejected because it may itself be identifiable or out of expected range.

### 3. DJ selection as an inline side panel with drag-and-drop, not a modal

**Decision:** When a user clicks a lineup slot, the existing `SlotPicker` modal is replaced by a `DJSelectionPanel` that renders as a side panel alongside the lineup grid inside `LineupView`. The panel lists available DJs and supports HTML5 drag-and-drop: dragging a DJ card from the panel and dropping it on a slot cell assigns the DJ. Clicking a DJ card in the panel also assigns them (for pointer/touch users who prefer not to drag). The panel closes when a slot is filled or when the user clicks away.

**Rationale:** A persistent side panel keeps the lineup grid visible while browsing candidates, allowing coordinators to compare DJs against the already-filled slots without losing context. Drag-and-drop is a natural affordance for filling a grid of slots.

**Alternative considered:** Keeping the modal (`SlotPicker`) — rejected because it occludes the lineup grid, making it impossible to see the rest of the lineup while selecting.

### 4. Genre visible but not filterable in the DJ selection panel and submission list

**Decision:** Genre is displayed as an informational column in both the DJ selection panel and the main submission list, but there are no filter controls for it. Stage Preference remains the only slot-relevant filter.

**Rationale:** Genre values in the CSV are free-text and span many micro-categories (e.g., "Psytrance / Darkpsy", "Electro House / Big Room"). Building a reliable filter would require normalisation or taxonomy work that is out of scope. Showing the raw genre string gives coordinators useful signal without implying a structured classification.

**Alternative considered:** Multi-select genre filter — rejected because coordinators cannot reliably predict which genre strings appear and the filter would be noisy and hard to use.

### 5. Stage-preference filter as local state in DJSelectionPanel (and SubmissionList)

**Decision:** Filter state (`selectedStages`) lives in `DJSelectionPanel` component state (and optionally in `SubmissionsView`/`SubmissionList`), not in global context.

**Rationale:** Filters are ephemeral to the current list browsing session and do not need to be shared across components.

### 6. Vibefit column visibility gated on app context

**Decision:** The Vibefit column is only rendered when `appContext === 'moonlight'`. The value is read directly from the submission's `j3Vibefit` field (already parsed from the CSV). This applies in both the submission list and the DJ selection panel.

**Rationale:** Vibefit is a Moonlight-specific metric and adds noise in Standard context. Keeping the column hidden in Standard context avoids confusion.

### 7. App context controls primary sort column default

**Decision:** When `appContext` changes, the submission list and DJ selection panel reset the primary sort column to the score column matching the new context (Main Score for standard, ML Score for moonlight). The user can still override manually.

**Rationale:** If a user switches to Moonlight context, they almost certainly want to see Moonlight scores first. An automatic default is more useful than requiring manual re-sort.

## Risks / Trade-offs

- **Risk:** Anonymous ID (`DJ #N`) is index-based and will shift if the underlying submissions array is re-ordered. → **Mitigation:** Always index against the original unparsed order; document that IDs are session-stable, not persistent.
- **Risk:** Switching app context resets the sort column, which may surprise a user mid-session. → **Mitigation:** Only reset when the context toggle changes, not on other state updates. Consider a visual indicator of the context change.
- **Trade-off:** Not persisting hidden-names state means it resets on page reload — acceptable since it's a session-level privacy measure. If persistence is later desired, it can be added to `localStorage`.
