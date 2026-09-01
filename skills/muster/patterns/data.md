# Data — lists, tables, search, charts

Eight patterns. Cite a violation as `slug#n`.

---

### data-table — Data Table
*Applies when:* the target renders rows and columns of records.
1. Sort is tri-state — ascending, descending, original — because a binary sort loses the natural order permanently.
2. Numeric columns are right-aligned with tabular figures so every digit sits on the same grid; proportional left-aligned digits jitter.
3. The header stays sticky on vertical scroll, the first column freezes on horizontal scroll, and the frozen areas carry a subtle shadow.
4. Density is a token, not a guess: row heights 36 / 48 / 60px switched by one control, with zebra stripes collapsing to a single hairline as rows compact.
5. The whole row is the selection target — full tint, accent left bar and checkbox — because a checkbox-only hit area is easy to miss.
6. Select-all morphs empty -> indeterminate dash -> checked to signal partial selection.

### bulk-actions — Bulk Actions
*Applies when:* the target lets a user act on many rows at once.
1. The header checkbox has three states — empty, partial, checked — and the indeterminate dash is mandatory.
2. The partial state resolves to select-all, never to clear.
3. Affordances name the exact number: "Select all 247 matching", not a vague "all", and the count updates live as filters change.
4. Selection lives in application state, not the DOM, so it survives paging via stored IDs.
5. Shift-click selects a range.
6. A destructive bulk action skips the confirmation modal: it echoes the count, executes immediately, and offers a 10-second undo with a draining countdown ring.

### pagination — Pagination
*Applies when:* the target pages, loads more, or scrolls infinitely through records.
1. Offset pagination drifts when rows insert or delete, producing duplicates and skips; cursor pagination anchors to specific rows and is used where rows change.
2. Three patterns exist: numbered for jumping to any page, load-more for on-demand, infinite scroll for continuous.
3. Page links truncate to first, last, current and immediate neighbours with an ellipsis — never hundreds of numbered links.
4. The page number lives in the URL (`?page=500`) so a refresh survives and a link is shareable.
5. Scroll position is restored on return from a detail view; infinite scroll never resets to the top.

### filter-chips — Filter Chips
*Applies when:* the target filters a result set from a row of chips or toggles.
1. Three visual states per chip: idle (surface + border), active (filled + check), disabled (dimmed, no results) — active never looks like idle.
2. The logic reads OR within a group to widen and AND across groups to narrow.
3. The result count updates on the same frame as the tap, never after.
4. A single clear-all reset is paired with the live count.
5. Overflow stays in one horizontal scrolling row with a right-edge fade — never a multi-row wall pushing results off screen.
6. Active filters pin in a sticky summary bar at the top.

### search-experience-system — Search Experience System
*Applies when:* the target has a search field.
1. Placeholder copy is the first onboarding — descriptive, never a bare "Search".
2. Recent searches load on focus for a single-tap refill.
3. Autocomplete ranks by clicks, never alphabetically, and suggestions carry category badges.
4. Three sharp results beat ten noisy ones.
5. The flow is keyboard-driven — arrows, Enter, Escape — with the focus ring visible at every step.
6. Zero results is a recovery path with popular searches, category jumps or alternate spellings, never a dead end.

### command-palette — Command Palette
*Applies when:* the target has a Cmd+K style launcher.
1. Matching is a fuzzy subsequence, not an exact substring: "stg" surfaces Settings, Storage and Staging.
2. Results group into labelled sections — Recent, Actions, Pages.
3. Everything is keyboard-driven: arrows move the highlight, Enter runs, Esc closes.
4. It never opens to a blank void — recent and suggested commands prefill before any typing.
5. An async command shows an inline spinner and keeps the palette open rather than freezing the screen.
6. Nested commands carry breadcrumbs, and Esc walks back exactly one level.

### charts-that-lie — Charts That Lie
*Applies when:* the target draws a chart.
1. A bar chart y-axis starts at zero, no exceptions — truncating turns a +4% change into a fake +400%.
2. The chart type answers the question: bars compare values, lines show change over time.
3. A pie chart falls apart past ~5 slices.
4. The aspect ratio puts the average slope near 45 degrees for an honest read.
5. Data-ink is maximised: gridlines, drop shadows, 3D skew and boxed legends go, and lines are labelled directly.
6. One hero colour spotlights the series that matters, and the scale — categorical, sequential or diverging — fits the data type.
7. The title states the takeaway, not the metric.

### empty-states — Empty States
*Applies when:* any list, table or result set in the target can come back with nothing.
1. Four kinds of empty each get their own copy and action: first run, no results, error, filtered-out.
2. An illustration or icon makes the screen read as intentional, not broken.
3. One clear primary CTA points at the next real step — not a generic "Try refreshing".
4. The first-run moment carries a ghost preview of what will be there.
5. Never a bare "No data" or a blank body, and never cold log-file copy like "ERROR 404 — Result set empty.".
