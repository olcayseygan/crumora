# Overlays — anything that opens over the page

### modal-hierarchy — Modal Hierarchy
1. One question picks the surface: does it block the user? Yes, a modal. No, choose by context.
2. A modal has a full scrim and one centred decision, reserved for critical or destructive choices — never a routine, non-blocking action.
3. A bottom sheet slides from the bottom edge with a drag handle and snap points.
4. A drawer is edge-anchored, slides from the side and dims only the area it covers.
5. A popover anchors to its trigger and stays small and contextual (~200px).
6. Navigation lives in an edge drawer, never buried inside a blocking overlay.

### bottom-sheets — Bottom Sheets
1. Menus and primary actions anchor to the bottom; the top-right is a thumb dead zone.
2. The underlying page stays visible behind the sheet.
3. Snap points exist for half-open and full-height resting positions, with drag-to-dismiss on a downward gesture.
4. The background is dimmed with a scrim and body scroll is locked while the sheet is open.

### dropdown-design — Dropdown Design
1. The trigger has a 48px touch target, a visible caret icon and a real hover state — not a 30px low-contrast target.
2. The menu flips upward when there is no room below and never clips off-screen.
3. Keyboard works: arrows move the highlight, Enter selects, Esc closes.
4. A search field appears past ~10 items.
5. The open animation runs ~150ms — 50ms feels instant and cheap, 500ms feels sluggish, and zero transition is not an option.

### context-menu — Context Menu
1. The menu measures the available space before opening: it flips up with no room below, mirrors left with no room right, stays anchored to the cursor and inside the viewport.
2. Actions group by intent with dividers, and Delete sits isolated at the bottom in red.
3. An invisible safe triangle runs from the cursor to the submenu so diagonal movement does not close it.
4. Arrows navigate and letters jump to actions.
5. Escape closes one level, not the whole menu.
6. Mobile long press opens a bottom sheet with the same actions; right-click is never the only path.

### tooltip-design — Tooltip Design
1. A 300ms delay precedes a hover tooltip.
2. An arrow anchors it to its trigger.
3. It flips to the opposite side near a viewport edge instead of being clipped.
4. It is dismissible everywhere: mouse leave, Escape, focus out, tap outside.
5. Copy is capped around 300px wide and held to one sentence.

### toast-notifications — Toast Notifications
1. Anchored bottom-right on desktop and to the top edge on mobile — never screen centre, never blocking content or clicks.
2. Timing by kind: routine info ~4s, warnings ~7s, critical errors stay until acknowledged; a toast carrying undo stays at least as long as the undo window.
3. The dismiss timer pauses on hover.
4. At most 3 are visible; the newest enters at the bottom, older ones float up and out, the rest queue.
5. Dismissal is available: a close button on desktop, swipe on mobile, and a pausable countdown.
6. Type is carried by colour plus icon plus a left accent border — never colour alone, since ~8% of men have a colour vision deficiency.

### notification-system — Notification System
1. Four surfaces, one per severity: toast for low priority, banner for degraded service, modal for a blocking error, badge for a passive unread count.
2. A toast auto-dismisses and carries an undo affordance, staying at least as long as the undo window.
3. A banner stays until it is cleared; a modal blocks until the user acts; a badge is passive.
4. Alerts are never all routed to the loudest surface.
5. Modals are never queued or stacked; low-priority toasts stack and breathe.

### accordion-disclosure — Accordion Disclosure
1. `height: auto` cannot animate: use `display: grid` with `grid-template-rows` from `0fr` to `1fr`, or measure `scrollHeight` and animate to a pixel value.
2. The chevron rotation and the panel height run off one shared timing curve — ~10 frames of lag reads as broken.
3. Single vs multi is a content decision: an accordion opens one panel at a time for sequential steps, a disclosure lets many stay open for FAQ lists.
4. The header is a real `<button>`, not a `<div>`, with `aria-expanded` and `aria-controls` wired, Enter and Space toggling, and a visible focus ring.
5. Expanding an item near the bottom anchors the tapped header so the list does not jump, and the revealed content staggers in.

### tabs-system — Tabs System
1. The active indicator slides, never teleports: spring-driven, timed to the content fade, slow in and fast out.
2. Overflow scrolls horizontally with edge fades and desktop chevrons — it never wraps to a second line.
3. Keyboard works: arrows move between tabs, Home goes first, End goes last, Tab exits to the next focusable group.
4. The focus ring and the active state use different colours.
5. The content transition fades out, pauses ~80ms and fades in, with panel heights matched so nothing shifts.
6. Mobile uses a segmented control under 5 tabs and a bottom sheet at 5 or more — never a shrunken desktop tab bar.
