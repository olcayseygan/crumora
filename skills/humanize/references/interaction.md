# Pre-crown interaction checklist

Walk on round 0 and on each **challenger up for the throne**, highest-ranked first (`tournament.md` §4.7),
after the walk (§3), by driving the render as the person frozen in §0. Any unticked box is a miss,
named in `trace.md` with its task and step; the caps are hard. Numbers match `muster`'s.

## Flow
- [ ] The most frequent task is the shortest path from where the person lands.
- [ ] No step exists for the interface's sake.
- [ ] One primary move per screen, the first thing the eye lands on.
- [ ] No dead end: empty, error, success and no-results states each offer a forward move.
- [ ] Back and Escape return the person with state intact — scroll, filters, selection, typed input.
- [ ] On the web, reload and a shared link restore the same state.
- [ ] Multi-step flows show position and what is left; stepping back loses nothing.

## Clarity
- [ ] Clickable looks clickable; nothing else does.
- [ ] Labels in the person's words; buttons named for their result.
- [ ] Icon-only controls only for universally read icons.
- [ ] Nothing the task needs is hover-only.
- [ ] Location, selection and mode visible at every step.
- [ ] Destructive actions never beside routine ones, never in the primary style.
- [ ] Same action, same name, place and look across the flow.

## Feedback
- [ ] Every press answers visibly within **100ms**.
- [ ] Work past **~300ms** shows progress where the action happened; nothing flashes for less.
- [ ] Multi-second work says what is happening and can be cancelled or left and returned to.
- [ ] No double submit; controls do not jump in width while in flight.
- [ ] Success confirmed where the eye already is — a corner toast alone does not count.
- [ ] State changes announced to assistive technology.
- [ ] A failed optimistic update rolls back visibly and says so.

## Errors
- [ ] Constraints prevent invalid input; impossible options disabled **with the reason shown**; submit
      buttons stay enabled and validate on click (`muster` disabled-buttons#3).
- [ ] Validation on blur, message next to the field, saying what to do.
- [ ] A failed submit focuses the first error; a long form also lists errors at the top.
- [ ] Nothing typed is lost to a validation error, failed request, Back or reload; autosave debounces
      on ~800ms of silence.
- [ ] A failed request offers retry in place and keeps the input.
- [ ] Reversible actions execute immediately with an undo — window per `muster` undo-ux: **5s**
      default, **10s** for bulk or delayed send; only truly irreversible ones confirm,
      naming object and consequence; high-stakes ones require typing the name.
- [ ] Empty states say why and offer the first action.

**Cap:** misses here hold Error prevention & recovery at **≤ 6**.

## Memory & load
- [ ] Recognition over recall — pick from what is shown, no codes or IDs from memory.
- [ ] Anything needed on a later screen is shown there.
- [ ] Known values prefilled; last choice remembered where repeating is likely.
- [ ] Few options per decision; long lists searchable, grouped or ordered by use.
- [ ] Advanced options behind one disclosure the frequent task never opens.
- [ ] An interrupted task resumes where it stopped.

## Reach
- [ ] **Every task completes keyboard-only**: focus order follows task order, visible focus ring,
      Enter submits, Escape closes overlays, focus returns to the trigger.
- [ ] Discoverable shortcuts for the daily expert's frequent actions.
- [ ] Touch targets **≥ 44×44px**, primary actions in thumb reach, no precise drag without an
      alternative.
- [ ] A screen reader completes every task.
- [ ] At **200% zoom** and **360px** width every task still completes.
- [ ] `prefers-reduced-motion` respected; motion never the only feedback.
- [ ] Nothing signalled by colour alone; text meets AA.

**Cap:** a task that cannot be completed keyboard-only holds Reach & inclusiveness at **≤ 5**.
