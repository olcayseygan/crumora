# Per-round interaction checklist

Walk this on **every round, champion included**, right after the walk (§3). Each box is answered by
**driving the render** as the person frozen in §0 — never from the source, never from a still frame.
Any unticked box is a miss, named in `trace.md` with the task and step where it showed; the caps below
are hard.

Numbers here match the ones `muster` ships — 100ms press feedback, 400ms before progress shows, blur
validation, 800ms autosave debounce, a 5s undo window, 44px targets — so the two skills never argue.

## Flow
- [ ] The most frequent task is the shortest path from where the person lands.
- [ ] No step exists for the interface's sake: re-entering data the system already has, confirming
      the obvious, opening a page to press one button, choosing something that has one sane answer.
- [ ] Every screen has **one** primary move, and it is the first thing the eye lands on.
- [ ] No dead end: every state — empty, error, success, no results — offers a forward move.
- [ ] Back and Escape always work and return the person to where they were **with state intact**:
      scroll position, filters, selection, typed input.
- [ ] On the web, reload and a shared link restore the same state; the URL carries what matters.
- [ ] Multi-step flows show where the person is and how much is left, and stepping back loses nothing.

## Clarity
- [ ] What is clickable looks clickable, and what is not does not — no underlined plain text, no
      buttons indistinguishable from labels.
- [ ] Labels use the person's words, not the database's; buttons are named for their result
      (`Save address`, not `OK` or `Submit`).
- [ ] Icon-only controls are limited to universally read icons; every other one carries a label.
- [ ] Nothing the task needs is hover-only; every hover path has a touch and a keyboard equivalent.
- [ ] Current location, current selection and current mode are visible at every step.
- [ ] Destructive actions never sit next to routine ones and never wear the primary style.
- [ ] The same action has the same name, place and look on every screen of the flow.

## Feedback
- [ ] Every press answers visibly within **100ms** — a pressed state at least.
- [ ] Work past **400ms** shows progress **where the action happened**, not in a far corner.
- [ ] Work lasting several seconds says what is happening and lets the person cancel or leave and come
      back to the result.
- [ ] A control in flight cannot be submitted twice, and does not jump in width while it waits.
- [ ] Success is confirmed where the eye already is; a toast alone in a corner is not confirmation.
- [ ] State changes are announced to assistive technology (`role="status"`, `aria-live`).
- [ ] An optimistic update that fails rolls back visibly and says so.

## Errors
- [ ] Constraints prevent invalid input before it is typed: the right input type, min/max, impossible
      options disabled **with the reason shown**.
- [ ] Fields validate on blur — not on the first keystroke, not only on submit — and the message sits
      next to the field and says what to do, not what went wrong in the system's terms.
- [ ] A failed submit moves focus to the first error; a long form also lists the errors at the top.
- [ ] Nothing typed is lost to a validation error, a failed request, Back or a reload — drafts survive;
      autosave debounces on ~800ms of silence.
- [ ] A failed request offers retry in place and keeps everything the person entered.
- [ ] A reversible action executes immediately with a **5s** undo; only a truly irreversible one asks
      for confirmation, naming the object and the consequence, and a high-stakes one asks the person
      to type the name.
- [ ] An empty state says why it is empty and offers the first action.

**Cap:** unfixed misses here hold Error prevention & recovery at **≤ 6**.

## Memory & load
- [ ] Recognition over recall: the person picks from what is shown rather than typing codes, IDs or
      names from memory.
- [ ] Anything needed on a later screen is shown there, not expected to be remembered.
- [ ] Known values are prefilled and the last choice is remembered where repeating it is likely.
- [ ] Each decision point offers few options; long lists are searchable, grouped or ordered by use.
- [ ] Advanced options sit behind one clear disclosure that the frequent task never needs to open.
- [ ] An interrupted task — navigate away, reload, close — resumes where it stopped.

## Reach
- [ ] **Every task completes keyboard-only**: focus order follows the task order, the focus ring is
      visible, Enter submits, Escape closes overlays, focus returns to the trigger when one closes.
- [ ] The daily expert has shortcuts for the frequent actions, and they are discoverable in a tooltip,
      a menu or a help overlay.
- [ ] Touch targets are **≥ 44×44px**, primary actions sit within thumb reach on a phone, and no task
      requires a precise drag without an alternative.
- [ ] A screen reader can complete every task: controls have names, states and changes are announced.
- [ ] At **200% zoom** and at **360px** width every task still completes.
- [ ] `prefers-reduced-motion` is respected, and motion is never the only feedback.
- [ ] Nothing is signalled by colour alone; text meets AA contrast.

**Cap:** a task that cannot be completed keyboard-only holds Reach & inclusiveness at **≤ 5**.
