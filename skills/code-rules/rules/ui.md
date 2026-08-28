# interaction rules — 14–17, 27, 28

Loaded in addition to `core.md`, never instead of it. A component is judged on types, names, spacing
and idiom as well as on everything here.

Six rules in three groups:

- **14, 15, 16** — one decision split three ways: what happens when a user action travels somewhere
  that can fail. Sort the action into its family first (table below).
- **17** — whatever a unit starts, it stops. No UI prerequisite; a background service leaks the same
  way a component does.
- **27, 28** — what the screen shows while it waits, and whether any of it can be reached without a
  mouse.

Rules 14, 15 and 16 are one decision, split three ways. Before checking any of them, sort each action
in the target into its family, because the same code is a PASS in one family and a FAIL in another:

| The action is… | Family | Rule |
| --- | --- | --- |
| cheap, reversible, high-frequency — like, star, toggle, reorder, mark read | act first, roll back | **14** |
| destructive — delete, revoke, cancel, wipe, transfer, remove a member | hold to confirm | **15** |
| expensive and non-idempotent — pay, submit an order, create, send, register | one intent, one request | **16** |

Getting the family wrong is itself the violation: a like button wrapped in disable-and-spinner is a
rule 14 FAIL, not a rule 16 PASS; an order submit fired optimistically with a rollback is a rule 16
FAIL, not a rule 14 PASS.

Rule 17 stands on its own and applies wherever a listener, timer, subscription or in-flight request
exists — a background service leaks exactly the way a component does.

---

### 14 · Act first, roll back on failure

When a user action has to travel to something that can fail — a POST, a socket, a save — the interface
does **not** sit and wait. It applies the change immediately, sends the request, and if the request
fails it puts the state back exactly as it was and says so out loud.

Like button: the heart fills on click, the count goes up, the POST goes out. `catch` → heart empties,
count returns to the old value, a visible warning appears. Not a spinner on the heart, not a disabled
button, not a five-hundred-millisecond dead interface.

The shape, every time:

1. **Snapshot** the previous state before touching it — the actual old value, not a guess you plan to
   recompute later.
2. **Apply** the new state locally and immediately.
3. **Send** the request.
4. **On failure: restore the snapshot, and tell the user.** Both. A rollback the user never sees is a
   state that changed under their hands for no reason.
5. **Log the failure** with enough context to find it.

This is the one place a `catch` is not a rule 13 violation — it is a real boundary (network, IO) and
it does not swallow anything: the state is restored, the user is told, the error is logged.

FAIL:

- **Silent rollback.** State snaps back, no message. The user retries and blames themselves.
- **Silent failure.** Request dies, local state keeps the optimistic value, and the screen now lies
  about what the server holds.
- **Blocking the interaction** on the round trip — spinner-locked button, disabled input, frozen list
  — for an action that is cheap and reversible.
- **Rollback by recomputation** — `count -= 1` instead of restoring the snapshot. Two failures racing,
  or a value the server changed meanwhile, and the arithmetic drifts.
- **No concurrency rule for repeated clicks.** Toggle twice fast and the two responses land out of
  order; the last intent must win, so cancel the in-flight request, sequence them, or drop a rollback
  whose intent is already superseded.

**Where you wait instead:** an action that is expensive, irreversible or destructive — a payment, a
delete, an order, anything the user cannot undo — is confirmed and awaited, with the result shown
honestly. Optimism is for cheap, reversible, high-frequency actions. How that wait must look is
rule 16; how destruction is confirmed is rule 15.

**Outside the UI the same rule holds:** a local write mirrored to a remote store, a cache updated
ahead of its source, a multi-step operation — each keeps the compensating action next to the forward
one, so a half-applied change never survives.

| Bad | Good |
| --- | --- |
| `await like(id); isLiked.value = true` | `isLiked.value = true` → `await like(id)` → `catch` restores |
| `catch { isLiked.value = false }` | `catch { isLiked.value = wasLiked; count.value = previousCount; showError(…) }` |
| `catch { count.value -= 1 }` | restore the snapshot `previousCount` |
| `<button :disabled="isSending">` on a like | button stays live; rapid clicks cancel the in-flight request |
| `catch (error) { console.log(error) }` and state left optimistic | restore, warn the user, log the error |

**How to check:** find every user action that triggers a request. For each one: does the state change
before the `await` or after it? Is there a snapshot variable? Does the `catch` restore *and* surface?
Grep for `await` immediately followed by a state assignment, for `isLoading`/`disabled` flags on cheap
actions, and for `catch` blocks in request handlers that touch neither the state nor the user.

**FAIL evidence:** `LikeButton.vue:23 — state is set only after await, so the heart lags the click; and
the catch logs without restoring isLiked or telling the user`.

### 15 · Destructive actions

The mirror of rule 14. That rule is for cheap, reversible, high-frequency actions — act first, roll
back on failure. This one is for the actions that end something: delete, revoke, cancel, wipe,
transfer ownership, remove a member. There, speed is the enemy.

Five sub-checks. Each gets its own line in the output.

- **Hold to confirm** — the ring replaces the dialog. A destructive button is **held**, not clicked:
  press and keep pressing for a second or two while a ring or bar fills, release early to cancel.
  A `window.confirm`, or a modal whose only job is "Are you sure?", FAILs — muscle memory clears it
  without reading. The hold needs visible progress, an obvious cancel by releasing, and a keyboard and
  screen-reader path that is equally deliberate (typing the resource name, an explicit second control)
  for anyone who cannot hold a pointer down.
- **Verb labels** — "delete project", never "yes". The control says what it does: `Delete project`,
  `Remove 3 members`, `Cancel subscription`. `Yes`, `OK`, `Confirm`, `Continue` FAIL, because the
  label carries no meaning once the user has stopped reading the sentence above it. The way out is
  named too — `Keep project` beats `Cancel`, which is ambiguous next to "cancel subscription".
- **Off the happy path** — destruction sits away from the primary flow. Not beside `Save`, not a trash
  icon on every row of a list, not the primary-styled button on the screen, and not a hover-only
  secret either — **far, not hidden**. It lives at the end of a detail page, in settings, in the
  danger zone; the everyday flow never passes through it.
- **Red budget** — spend red on destruction only. Red is a budget, and a form-validation message, a
  notification badge, a chart series or a "required field" asterisk spends it on something the user
  can undo. Then, when the real deletion arrives, red means nothing. Warnings and validation take
  amber or neutral with an icon and text; red is reserved for irreversible loss. Colour never carries
  the meaning alone — the label and icon say it too.
- **Danger zone** — bordered, labelled, last. Every destructive action for a resource is collected in
  one block: a red border, a plain heading, one line per action stating exactly what is lost
  (`this deletes the project and its 240 records permanently`), and the block sits at the **bottom** of
  the page. Nobody arrives there by accident.

| Bad | Good |
| --- | --- |
| `if (confirm("Are you sure?")) deleteProject()` | hold-to-confirm control with a filling ring |
| `<button>Yes</button>` / `<button>OK</button>` | `<button>Delete project</button>` |
| trash icon on every row, next to `Edit` | one `Delete project` inside the danger zone |
| primary red `Delete` next to `Save changes` | `Save changes` primary, deletion at the bottom of the page |
| red "This field is required" | amber or neutral validation, red kept for deletion |
| delete button loose in the settings body | bordered danger zone, heading, consequence line, last |

**How to check:** list every destructive action in the target — `delete`, `remove`, `revoke`,
`destroy`, `drop`, `cancel`, `wipe`, `reset`, `transfer`. For each one: is it held or clicked? What
does its label literally say? What sits next to it, and is it styled primary? Then grep the styles for
the red token and check every use is destructive, and grep for `confirm(` and for modals whose
confirm button text is `yes`/`ok`/`confirm`.

**FAIL evidence:** `ProjectSettings.vue:88 — window.confirm("Are you sure?") then an immediate DELETE;
no hold, label is "OK", and the button sits next to Save`.

### 16 · One intent, one request

The third leg of the trio. Rule 14 is for cheap, reversible actions — act first, roll back. Rule 15 is
for destruction — hold. This rule is for the expensive, non-idempotent middle: submit the order, send
the payment, create the account, post the message. There, **one user intent produces exactly one
request**, and the interface, the handler and the wire all enforce it — a double tap that charges a
card twice is not a UI glitch, it is a money bug.

Five sub-checks. Each gets its own line in the output.

- **Disable on the first tap** — the control goes inert synchronously, in the same handler tick that
  fires the request, before any `await`. A button that stays clickable until the promise settles has
  already lost: the second tap lands in the gap. Every path into the action is covered — the click,
  the Enter key in the form, the keyboard shortcut.
- **Spinner in place, width locked** — the pending state lives inside the control: the label yields to
  a spinner while the control keeps its exact size (a `min-width`, or the label kept invisible under
  the spinner). No collapsing button, no layout shift, no full-screen overlay for a single submit.
  The user's eye stays where their finger was.
- **Guard the handler** — the UI alone is never trusted. The handler carries its own in-flight guard:
  a request already flying means the call returns without firing another. And the request itself
  carries an **idempotency key**, generated once when the intent formed and reused on every retry of
  that intent, so even when two requests slip through — a network retry, a race the guard missed —
  the server collapses them into one effect.
- **Land on an ack or an error** — every request terminates visibly. Success is acknowledged — the
  state changes, the page navigates, a confirmation appears. Failure is surfaced as an error that
  says what happened. A timeout converts into an error; nothing is left spinning forever, and nothing
  resolves silently into "did it go through?".
- **Re-enable on the response, not a timer** — the control wakes up only when the response arrives,
  success or error, typically in the `finally`. A `setTimeout` re-enable FAILs from both sides: too
  short re-arms the button while the request still flies, too long punishes a fast round trip. The
  wall clock knows nothing about the request.

| Bad | Good |
| --- | --- |
| `onClick={submit}` still live during the await | `isSubmitting` set synchronously before the request fires |
| button shrinks to spinner width | spinner replaces the label, width locked with `min-width` |
| button disabled, Enter in the form still submits | in-flight guard inside the handler itself |
| retry fires a fresh `POST /orders` body | same idempotency key on every retry of one intent |
| `setTimeout(() => isSubmitting = false, 3000)` | re-enable in the `finally` when the response lands |
| timeout leaves the spinner forever | timeout becomes a visible error and the control wakes |

**How to check:** list every non-idempotent submit in the target — create, pay, send, post, register.
For each one: is the disable set before the first `await`? Does the pending control keep its width?
Does the handler guard re-entry on its own? Is there an idempotency key on the wire, minted per
intent, not per request? Does every path end in a visible ack or error? Then grep for `setTimeout`
near `disabled`/`enabled`/`isSubmitting`, and for `catch`/`finally` blocks that never re-enable.

**FAIL evidence:** `CheckoutForm.vue:57 — submit stays enabled until the await returns, so a double
click sends two POST /orders with no idempotency key; and the catch re-enables but the timeout path
never resolves`.

### 17 · Everything opened is closed

Same family as rule 16's "every request terminates visibly", one level down: whatever a unit starts,
it stops when the unit goes away. A listener nobody removes keeps its whole closure alive, a timer
nobody clears fires into a dead component, and a response that lands after teardown writes state that
no longer exists. None of these announce themselves — they show up as a slow tab, a duplicated
handler after the fourth navigation, or a warning nobody can reproduce.

Every one of these needs a matching teardown in the same file, ideally within a few lines of where it
was opened:

- **`addEventListener` → `removeEventListener`**, with the *same* function reference. A listener
  added with an inline arrow can never be removed; hoist it to a named handler, or use
  `AbortController` and `{ signal }`.
- **`setInterval` → `clearInterval`, `setTimeout` → `clearTimeout`**, `requestAnimationFrame` →
  `cancelAnimationFrame`.
- **Subscriptions → unsubscribe / dispose** — an event bus, a store watcher, an RxJS subscription, a
  websocket, a `ResizeObserver`/`IntersectionObserver`/`MutationObserver` (`.disconnect()`), a
  `matchMedia` listener.
- **In-flight requests → abort on teardown.** An `AbortController` created with the request and
  aborted in the teardown, so a response cannot resolve into a component that is gone. A `then`
  that writes state after unmount is a FAIL even when the framework merely warns about it.
- **Native and unmanaged resources → released** — file handles, sockets, database connections,
  `IDisposable` (`using`), `URL.createObjectURL` → `revokeObjectURL`, Unity `RenderTexture` /
  `Material` instances / `NativeArray`, an OpenCV `VideoCapture`, a `torch` hook.

Where the teardown lives is the framework's answer, not yours: `onUnmounted`/`onScopeDispose` in Vue,
the cleanup function returned from `useEffect` in React, `onDestroy` in Svelte, `OnDisable`/
`OnDestroy` in Unity, `Dispose`/`using` in C#, `with` or `try/finally` in Python, `defer` in Go. A
teardown written into the wrong hook — one that never fires, or fires on every re-render — is the same
FAIL as no teardown.

Two more shapes that count as this rule:

- **The conditional teardown.** Registration happens unconditionally, removal sits behind an `if`, so
  one path leaks. Both sides go together.
- **The re-registration.** A hook that adds a listener runs again on every prop change and never
  removes the previous one; after four updates the handler fires four times. Check the dependency
  list and the teardown together.

| Bad | Good |
| --- | --- |
| `onMounted(() => window.addEventListener("scroll", () => …))` | named handler, `onUnmounted(() => window.removeEventListener("scroll", handleScroll))` |
| `setInterval(poll, POLL_INTERVAL_MS)` with no handle kept | keep the id, `clearInterval(pollTimerId)` on teardown |
| `useEffect(() => { subscribe(onMessage) }, [])` | `return () => unsubscribe(onMessage)` |
| `fetch(url).then(setData)` in a component | `fetch(url, { signal })`, `controller.abort()` on teardown |
| `new ResizeObserver(…)` never disconnected | `observer.disconnect()` on teardown |
| `OnEnable` subscribes, nothing in `OnDisable` | mirror every `+=` with a `-=` in `OnDisable` |

**How to check:** grep the target for `addEventListener`, `setInterval`, `setTimeout`,
`requestAnimationFrame`, `subscribe(`, `\.on(`, `new .*Observer`, `createObjectURL`, `+=` on an event
in C#, `open(` without `with` in Python — and for each hit find its partner in the same file. Then
grep the teardown hooks (`onUnmounted`, `useEffect` returns, `onDestroy`, `OnDisable`, `Dispose`) and
check nothing registered is missing from them. A file with registrations and no teardown hook at all
is the loudest version of this FAIL.

**FAIL evidence:** `useFeed.ts:31 — scroll listener added in onMounted with an inline arrow and never
removed; hoist to handleScroll and remove it in onUnmounted`.

### 27 · Four states, not one

Every view that shows data which arrives over time has **four** states, and most components only
implement the fourth. The missing three are not edge cases — the empty state is the first thing a new
user sees, the error state is what a bad connection produces, and the loading state is the entire
first second of every visit.

The four, each of which needs its own visible treatment:

- **Loading** — the shape of what is coming, not a centred spinner on an empty page. A skeleton that
  matches the final layout means nothing jumps when the data lands. For a list, skeleton rows; for a
  card, a skeleton card. And loading is only shown when the wait is real: an instant cache hit that
  flashes a skeleton for 40ms is worse than no skeleton, so a short delay before showing it is part of
  the state, not a nicety.
- **Empty** — a genuine zero-result state that says which zero it is. "No projects yet" with the
  action that creates one is a different screen from "No projects match *invoice*" with a way to clear
  the filter. A blank area FAILs; so does one message covering both cases.
- **Error** — what failed, and a way forward. A retry control that re-runs the request, the specific
  failure where it is safe to say it, and the state kept so a retry does not lose what the user typed.
  A silently blank list on a 500 is the worst version: it is indistinguishable from empty, and the
  user reads it as "I have nothing".
- **Content** — the actual data, plus **partial** content where it exists: a page that loaded but
  whose sidebar failed shows the page and an error in the sidebar, not a full-page error.

**Two more that count under this rule:**

- **Stale-while-revalidating.** A refresh over existing data does not blank the screen — the old data
  stays, marked as refreshing. Replacing content with a skeleton on every poll is a FAIL.
- **The state machine is exclusive.** `isLoading`, `error` and `data` as three independent booleans
  produce a component that can show a spinner and an error at once, or neither. One discriminated
  status (`"idle" | "loading" | "error" | "ready"`) makes the impossible combinations unrepresentable
  — which is rule 1 arriving in the same place.

**The boundary with rule 14:** this rule is about a view waiting for data it does not have. A cheap,
reversible user action inside an already-loaded view is rule 14 — act first, no spinner. Adding a
loading state to a like button is a rule 14 FAIL, not a rule 27 PASS.

| Bad | Good |
| --- | --- |
| `v-if="items.length"` and nothing else | explicit branches for loading, empty, error, content |
| full-page centred spinner | skeleton in the shape of the content |
| `catch` leaves the list empty | error state with the cause and a retry control |
| one "No results" for both no-data and no-match | separate copy and a separate action for each |
| `isLoading`, `hasError`, `data` as three refs | one `status` union |
| refresh clears the list, then refills it | keep the old data, mark it refreshing |

**How to check:** for every component that fetches or receives async data, count the branches. Fewer
than four is a FAIL unless one is genuinely impossible (say which). Then grep for `isLoading` /
`loading` alongside a separate `error` ref, for `length === 0` with a single message, and for `catch`
blocks in data hooks that set nothing the template reads.

**FAIL evidence:** `ProjectList.vue:18 — renders items or nothing; no skeleton, no empty state, and a
failed fetch is indistinguishable from an empty account`.

### 28 · Reachable without a mouse

Everything an interaction can do with a pointer, it can do with a keyboard and announce to a screen
reader. This is not a separate concern bolted on at the end — most of it is a consequence of using the
right element, which makes it a rule 12 idiom question as much as an access question.

Six sub-checks. Each gets its own line in the output.

- **Semantic elements** — a thing that is clicked is a `<button>`; a thing that navigates is an `<a>`
  with an `href`. A `<div @click>` FAILs, because it takes no focus, ignores Enter and Space, and
  announces nothing. A `role="button"` with a `tabindex` and hand-written key handlers is the
  fallback, not the goal — reach for it only when the native element genuinely cannot be used.
- **Every control has an accessible name** — a `<label>` bound by `for`/`id` (not just placed next to
  it), or `aria-label` on an icon-only control. A placeholder is not a label: it disappears on the
  first keystroke. An icon button with no name is announced as "button".
- **Focus is visible and ordered** — the focus ring is never removed without a replacement of at least
  equal clarity (`:focus-visible`, not `outline: none`), the tab order follows the visual order, and
  no positive `tabindex` values re-order it by hand.
- **Focus is managed across boundaries** — a dialog takes focus on open, traps it while open, returns
  it to the trigger on close, and closes on Escape. A route change moves focus to the new heading. A
  removed element does not leave focus on `<body>`.
- **State is announced, not only drawn** — `aria-expanded`, `aria-checked`, `aria-current`,
  `aria-invalid` alongside the visual treatment; `aria-busy` or a polite live region for rule 27's
  loading state; an `role="alert"` or a live region for rule 14's rollback message and rule 16's
  error, so a failure a sighted user sees is a failure everyone hears. Colour never carries meaning
  alone — this is rule 15's red-budget clause in general form.
- **The pointer-only gesture has a partner** — drag-and-drop, swipe, long-press, hover-reveal and
  right-click menus each need a keyboard-reachable equivalent. Rule 15's hold-to-confirm is the case
  already handled: it explicitly requires a second deliberate path (typing the resource name, an
  explicit control) for anyone who cannot hold a pointer down, and rule 15 governs that control's
  wording and placement.

**Where this rule stops:** it is not a full audit — no contrast ratios computed by hand, no screen
reader transcript, no WCAG conformance claim. It is the set of failures that are visible in the source
and fixable in place. Anything requiring a real audit gets one `NEEDS DECISION` line rather than a
guessed fix.

| Bad | Good |
| --- | --- |
| `<div @click="submit">Send</div>` | `<button @click="submit">Send</button>` |
| `<input placeholder="Email">` | `<label for="email">Email</label><input id="email">` |
| `<button><TrashIcon /></button>` | `<button aria-label="Delete project">…</button>` |
| `outline: none` | `:focus-visible { outline: 2px solid … }` |
| modal opens, focus stays behind it | focus the dialog, trap, restore on close, Escape closes |
| error shown in red text only | `role="alert"` plus an icon and text |
| reorder by drag only | drag, plus move-up/move-down controls or keyboard reordering |

**How to check:** grep the target for `@click` / `onClick` on non-interactive elements (`div`, `span`,
`li`, `img`), for `<input` without a matching `<label for>` or `aria-label`, for `outline: none` and
`outline: 0`, for `tabindex` with a positive number, for icon-only buttons with no text child, and for
`onMouseOver`/`onDrag` handlers with no keyboard counterpart. Then tab through the component in your
head from the top: does every action come up, in a sensible order, with a visible ring?

**FAIL evidence:** `Toolbar.vue:12 — <div class="icon-button" @click="remove"> takes no focus, has no
accessible name, and cannot be triggered by Enter`.
