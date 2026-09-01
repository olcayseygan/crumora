# Feedback — waiting, failing, undoing

Eleven patterns. Cite a violation as `slug#n`.

---

### loading-states-system — Loading States System
*Applies when:* the target waits on anything before it can render.
1. Under ~300ms nothing is shown at all; a loading state is never flashed for a sub-300ms response.
2. A skeleton is used when the content shape is known and the wait exceeds ~300ms — not on every fetch regardless of shape or duration.
3. A spinner fits a short wait of unknown duration, under ~3s; a full-page spinner never covers a long or open-ended load.
4. A progress bar belongs to waits over ~3s where the percentage is known.
5. A reversible action — like, save, bookmark — applies instantly, syncs in the background and rolls back only on failure.

### skeleton-loading — Skeleton Loading
*Applies when:* the target renders a placeholder while content loads.
1. A skeleton previews the shape of the incoming content; a spinner says only that something is happening.
2. Skeleton dimensions match the real content — a layout jump on load is worse than a spinner.
3. A shimmer sweep is required: a static skeleton reads as broken, an animated one as in progress.
4. Skeletons hold under ~2 seconds before partial content appears.
5. No skeleton for a sub-300ms load, and spinners and skeletons never mix in the same view.
6. A user-initiated action — posting, liking — skips the loading state and renders optimistically.

### optimistic-ui — Optimistic UI
*Applies when:* the target updates state behind a network call.
1. The UI updates instantly and the server syncs in the background; nothing blocks on the response.
2. Anything under 400ms reads as instant, and a spinner past that makes the action feel broken.
3. The UI rolls back cleanly the moment the request fails.
4. This is for reversible, low-stakes actions: likes, toggles, favourites, list reordering.
5. Never for payments, transfers or anything unsafe to undo, and no charge, booking or confirmation is shown before the server clears it.

### behind-the-button — Behind the Button
*Applies when:* a button in the target triggers a write, a purchase or a multi-table change.
1. Client-side validation costs 0 network calls and runs for speed.
2. The server re-runs every check, stricter than the client.
3. Related writes — order, items, inventory, payment — are wrapped in one transaction so a failure rolls back.
4. The UI repaints with server truth, not guessed local values, and prices and totals are recomputed server-side from the source of truth.
5. No client-sent value is trusted, price included.
6. Optimistic UI is for cheap reversible actions only; a payment earns its spinner.

### error-states — Error States
*Applies when:* the target can fail in front of the user.
1. The surface matches severity: validation inline, a lost connection as a banner or toast, a blocking failure as a modal — never a full-screen modal for minor validation.
2. Every error has an exit; there is no dead-end OK button.
3. A recovery is offered: Retry, a support link, or expandable technical detail.
4. Copy is written for humans — never a raw code like "Error 500" with no guidance.
5. Field-level validation stays small, inline and specific, anchored to its input.

### autosave-ux — Autosave
*Applies when:* the target saves without an explicit save action.
1. Writes debounce on ~800ms of silence, with the timer resetting on each key — never a write per keystroke.
2. Status is one of typing, saving, saved, offline, error, updated in real time.
3. Offline edits queue locally and replay oldest-first on reconnect.
4. "Saved" is never shown when the write did not reach the server.
5. Concurrent edits merge or warn; last-write-wins silently loses data across tabs.
6. A tab close with unsaved work is intercepted with `beforeunload`.

### undo-ux — Undo UX
*Applies when:* the target performs an action a user might regret.
1. The action executes immediately, then a time-limited undo appears with a visible countdown — 5 seconds is the window.
2. Deletes are soft, with a recovery window (30 days in trash) before a permanent purge; nothing hard-deletes from the database on click.
3. Cmd+Z navigates the undo stack; a delayed send holds 10 seconds.
4. Heavy friction is reserved for genuinely irreversible actions — not an "Are you sure?" on every destructive one.
5. The undo window is never too short for a realistic reaction.

### destructive-actions — Destructive Actions
*Applies when:* the target can delete, revoke or destroy something.
1. A hold-to-confirm ring fills over ~300ms of held press.
2. Red is reserved exclusively for destructive actions — not logout, not badges, not alerts, or delete stops looking dangerous.
3. The action names itself on the button: "Delete project" / "Keep project", never a generic "Are you sure?".
4. The destructive button never sits where the confirm button usually sits.
5. Deletion lives in a bordered, labelled danger zone at the bottom of the page.
6. An irreversible deletion gets a cancellable cooldown — 14 days to cancel, for example.

### disabled-buttons — Disabled Buttons
*Applies when:* the target disables a control.
1. A disabled button drops out of the tab order and its pointer events are dead.
2. A greyed-out label lands near 1.9:1 and fails the 4.5:1 threshold.
3. The button stays enabled and validates on click instead.
4. On failure it flags the blocking fields and moves focus to the first one.
5. An async action uses a busy state — spinner plus `aria-busy` — not a disabled state, and never greys out mid-request, which drops focus.
6. The blocker is named in reachable text, never in a tooltip.

### peak-end-rule — Peak-End Rule
*Applies when:* the target is a flow with a beginning and an end — onboarding, checkout, setup.
1. People remember the most intense moment and the final one, not the average: one delight outweighs five neutral steps.
2. A deliberate peak is engineered partway through the flow.
3. The last screen celebrates success instead of ending on a flat confirmation.
4. The final interaction of every flow is audited, because it weighs heaviest.
5. Effort is never spread evenly while the finish is neglected, and a flow never ends on friction, an error or a cold dead-end.

### zeigarnik-effect — Zeigarnik Effect
*Applies when:* the target shows progress toward a goal the user wants.
1. The mind holds unfinished tasks in active memory and drops completed ones immediately.
2. A meter at 80% creates return pressure; 100% removes the reason to return, so not every loop is closed.
3. Onboarding deliberately leaves one box unchecked, and the remaining percentage stays salient.
4. The open loop only works for an outcome the user genuinely wants — progress is never manufactured on an unrequested task.
