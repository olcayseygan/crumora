# Interaction — input, reach, navigation, presence

Seven patterns. Cite a violation as `slug#n`.

---

### focus-states — Focus States
*Applies when:* the target has anything focusable — and it always does.
1. The focus ring is 2px thick with a 2px offset and is visible on both light and dark backgrounds.
2. `outline: none` is never set without a visible replacement ring.
3. `:focus-visible` distinguishes keyboard from mouse.
4. Focus follows DOM order; content is never reordered with CSS while the DOM drifts from the visual order.
5. A skip link is the first focusable element and stays invisible until focused.
6. A modal traps Tab and wraps it, Escape closes it and returns focus to the element that opened it; focus never leaks to the background page and is never dropped on close.

### hover-trap — Hover Trap
*Applies when:* the target attaches behaviour to hover.
1. Touch has no hover, and a simulated first tap becomes a sticky hover that freezes the revealed actions until a tap elsewhere.
2. Primary actions are never hidden behind hover; hover surfaces extras only.
3. A hover-only action also lives in the card, behind a swipe, or in a bottom sheet.
4. Hover styles are gated with `@media (hover: hover)`, never user-agent sniffing.
5. `pointer: coarse` pairs with it to enlarge controls for a thumb.
6. The hit area pads to 44px while the visible glyph stays ~20px.

### swipe-actions — Swipe Actions
*Applies when:* a row or card in the target responds to a swipe.
1. Swipe is invisible without an affordance: the action peeks on the first scroll, plus an onboarding nudge.
2. A destructive swipe needs friction — a full swipe that instantly deletes is a data-loss bug; a partial swipe reveals a button and a tap (or full swipe plus undo toast) commits.
3. Every swipe action pairs with an undo window.
4. Colour codes by consequence — neutral on surface tones, destructive on red — with the same mapping in every list.
5. Swipe is never the only path: a long-press menu or a detail-view button is the visible fallback.
6. No more than two actions per side, and left/right semantics stay consistent app-wide.

### drag-and-drop — Drag and Drop
*Applies when:* the target moves an item by dragging.
1. Pickup is confirmed by three cues together: a slight scale-up, a deeper shadow, a small tilt.
2. Drop zones are revealed before release, with valid target slots shown as dashed outlines during the drag.
3. An insertion line slots between items; a filled highlight lands inside a whole column.
4. Structured surfaces snap to the nearest valid slot; free positioning is only for canvases where any coordinate is valid.
5. Every drop pairs with a short undo toast (~5 seconds) — a wrong drop is never permanent.

### navigation-patterns — Navigation Patterns
*Applies when:* the target has a nav, a shell or more than one destination.
1. Mobile uses bottom tabs for 3-5 top destinations, always visible.
2. Desktop uses a persistent sidebar for 5 or more sections.
3. A hamburger drops engagement ~40% on mobile and ~56% on desktop; primary navigation is never hidden in one.
4. A command palette is an accelerator, never the only path to a feature.
5. Breadcrumbs appear only when the hierarchy is deeper than 2 levels, never on a flat structure.

### settings-system — Settings System
*Applies when:* the target has a settings, preferences or account screen.
1. The apply model matches the blast radius: a light toggle commits instantly with a saved confirmation, an identity field requires an explicit Save/Cancel.
2. Settings group by task, not by org structure or schema order.
3. Search exists.
4. Changed values carry a modified indicator and a per-setting reset.
5. Destructive actions sit at the bottom behind a visual wall, and an irreversible delete is gated by typing the exact resource name.
6. Advanced options collapse behind an expandable section rather than being buried in nested menus.

### live-cursors — Live Cursors
*Applies when:* the target shows other people present in real time.
1. The server streams ~10 positions per second while the screen redraws at 60fps, so positions are interpolated between ticks rather than rendered raw.
2. A user colour derives from a stable hash of their ID, never randomly per session, so the same person keeps their colour across sessions.
3. The avatar stack shows three faces and then a +5 overflow counter.
4. Selecting an element locks it instantly, outlined in the editor colour with a colour badge, and two users never edit the same element at once.
5. Follow mode binds the viewport to another user pans and zooms.
