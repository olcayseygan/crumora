---
name: muster
description: Makes an interface pass muster against the 73 UX patterns of designmotionhq.com/patterns — bundled offline, every threshold kept verbatim — and fixes each violation in place instead of writing a review. Covers focus rings, hover on touch, z-index and stacking, tokens and scales, grid, radius, dark mode, contrast, shadows and depth, motion timing and easing, the 400ms threshold, loading and skeletons, optimistic UI, errors, autosave, undo, destructive actions, disabled buttons, modals, sheets, dropdowns, context menus, tooltips, toasts, tabs, accordions, forms, validation timing, masking, passwords, OTP, sliders, toggles, ratings, colour and date pickers, uploads, inline editing, microcopy, tables, bulk actions, pagination, filters, search, command palettes, charts, empty states, navigation, settings, drag and drop, swipes, live cursors, and the psychology patterns behind them. Output is the edit list only — no report, no PASS/FAIL table. Use when the user says "/muster", "apply the design patterns", "check this UI against the patterns", "make this screen pass", "does this follow the UX rules", "fix the UX here", "designmotion patterns", or the Turkish "patternleri uygula", "arayuzu kurallara uydur", "ux kurallarina gore duzelt". For a code-quality rule pass use lint; for redesigning a screen from scratch in scored rounds use redesign.
---

# muster — the UX pattern gate

Seventy-three patterns, taken from <https://designmotionhq.com/patterns> and held in
`patterns/`. Each one that applies to the interface in front of you is checked, and each rule that
fails is **fixed**, not written up. It hands back a diff, not a review.

Sibling of **lint**, which gates the code. This one gates the interface: the same shape of run, a
different rule set — thresholds, states, timings and affordances rather than types and naming.

Three failure modes it exists to prevent:

- **The vibe critique.** "The spacing feels off, maybe soften the shadows" — no pattern cited, no
  number, nothing anyone can verify or refuse.
- **The pattern nobody checked.** Reading a component for bugs, never looking for the focus ring,
  then acting as if `focus-states` were clean. A pattern you did not look for is not passing.
- **The review that ends in a question.** A page of findings and a "shall I apply these?". The
  violations were known; the edit is the answer.

---

## 0. Target

The user argument is the target (`/muster src/components/Table.tsx`, `/muster the checkout screen`).
With no argument, the uncommitted diff; if the tree is clean, ask **one question**.

**Read the whole target first**, and for a diff the surrounding component too — a missing focus ring,
a hover-only action or a stacking-context bug is invisible in changed lines alone.

The target is the interface: markup, styles, component code, and the state and timing behind them. A
design file or screenshot is a legitimate target too; the fixes then land in the code that renders it,
and anything with no code to edit is a `NEEDS DECISION`.

## 1. Which patterns fire

**Walk `patterns/index.md` end to end before reading any rules.** Its Trigger column is the whole
filter: a pattern fires when its subject exists in the target. Write down the fired list — it is the
run.

- Eyeballing is the failure this step exists to prevent. Sixty of the seventy-three not firing is a
  normal result for one component; deciding that without walking the index is not.
- Load **only** the files whose patterns fired. Eight files exist so that a run reads two or three.
- `focus-states` fires on anything focusable, so it fires on nearly every target. Treat a run that
  skipped it as unfinished.
- A pattern fires on the **subject**, not the framework. A `<div role="switch">` fires
  `toggle-anatomy`; a headless library styled in the target fires the patterns of whatever it renders.
- Report the two counts in the closing line: patterns fired, patterns violated. Nothing else about the
  ones that passed.

## 2. Project overrides

If the repository root holds a **`.muster.md`**, read it before checking anything. Some of these
patterns are house style, and a team that disagrees with one will stop running the skill entirely
rather than argue with it every run.

One directive per line: keyword, pattern slug (optionally `slug#n` for a single rule), and a reason
that is required.

```
disable landing-page-skeleton   this is an internal tool, there is no marketing page
relax   dark-mode#1             brand ships a true-black OLED theme on purpose
disable animation-timing#4      no attention-grabbing motion anywhere, by policy
```

- **`disable`** — not checked, produces no edits.
- **`relax`** — checked, but the exception named in the reason is accepted.
- **A directive with no reason is not honoured.** The reason is the whole point, and its absence
  usually means someone silenced a pattern they lost an argument with.
- An unknown slug gets one line saying so.

**`color-accessibility` and `focus-states` can be disabled, but never silently** — if either is off,
say so on its own line, every run. Every disabled or relaxed pattern is listed once after the edits:
`overrides   landing-page-skeleton disabled, dark-mode#1 relaxed (.muster.md)`.

Arguments beat the file: `--only toast-notifications,focus-states` and `--skip golden-ratio` apply to
that run alone.

## 3. When two patterns disagree

- **Accessibility beats aesthetics.** `color-accessibility` and `focus-states` beat
  `visual-hierarchy`, `dark-mode`, `perfect-card` and every other surface pattern. A ring that spoils
  the composition stays; the composition changes around it.
- **Reachability beats decoration.** `hover-trap` beats `card-hover-anatomy` — a hover reveal is
  redesigned to keep the primary action reachable on touch, never kept because it looks good.
- **Safety beats speed.** `behind-the-button` beats `optimistic-ui` and `doherty-threshold`. A payment
  or an irreversible write waits for the server, however slow that feels.
- **Recoverability beats friction.** `undo-ux` beats `destructive-actions` for anything reversible:
  execute and offer undo rather than adding a confirm dialog. `destructive-actions` wins only where
  the action truly cannot be undone.
- **The existing scale beats the derived one.** `design-tokens` and `design-system-kit` beat
  `golden-ratio` and `border-radius` — never introduce a second scale next to the project one.
- **Fit beats the checklist.** `loading-states-system` decides which loading pattern applies before
  `skeleton-loading` says how to build it; `modal-hierarchy` picks the surface before
  `bottom-sheets`, `dropdown-design` or `tooltip-design` say how it behaves.

## 4. Violation shape (MUST)

All four, the first three in your head and the fourth in the code: the **pattern rule** as `slug#n`;
**where** as `file:line`, not "the card"; **what**, one sentence; **fix**, the concrete replacement
actually written in — the ring, the duration, the state, the token.

No `slug#n`, no violation. No `file:line`, no violation. "Feels cramped" never becomes an edit;
`proximity-rule#3` with the two gaps named does.

**Numbers are the rule.** Where a pattern states 300ms, 4.5:1, 44px, 800ms, 8px, 3 toasts — that value
goes into the code. Never round it to something that felt close, never substitute a value the project
happened to already use unless a token defines it.

## 5. Verify before fixing (MUST)

Before touching anything, re-read the code behind **every** violation and try to kill it: is that
`outline: none` already replaced by a ring three lines down? Is that hover reveal already duplicated
in a bottom sheet? Is the 200ms entrance coming from a token that also feeds the exit? Is the
"missing" empty state rendered by the parent? A violation that does not survive is dropped, never
fixed, and never mentioned — it produced no edit, so it produces no line.

**`color-accessibility` is the exception.** A contrast pair you cannot compute stays a
`NEEDS DECISION` rather than being assumed to pass.

## 6. Scope budget

Count the surviving violations before editing:

- **Up to 20 edits, or up to 8 files** — fix them all, no question.
- **Beyond either** — print the count and the breakdown by pattern in one or two lines, then ask
  **one question**: fix everything, or narrow to a pattern, a file, a screen. If the tree was clean at
  the start, say in the same question that edits will be committed one pattern at a time.

A budget question is about *how much*, never about *whether*.

## 7. Fix it — do not ask (MUST)

**Every violation that survives the kill pass gets fixed, in place, immediately.** No "shall I apply
these?", no closing question. Running the skill *is* the yes. Smallest edit that clears the rule and
nothing else — no drive-by restyle, no palette change the patterns did not demand, no reach outside
the target.

**Fix in this order**, because a shadow tuned on a card about to be restructured is work done twice:

1. **Wrong mechanics** — `z-index-mastery`, `accordion-disclosure#1`, `hover-trap`, `otp-input#1`,
   `pagination#1`, `scroll-driven-animations`, `behind-the-button`. Code that cannot work as written
   is replaced before anything is tuned on top of it.
2. **Reach and access** — `focus-states`, `color-accessibility`, `disabled-buttons`,
   `form-field-states`, `swipe-actions#5`, `dropdown-design#1`, `hover-trap#6`. Keyboard, contrast,
   touch targets and second signals.
3. **State and safety** — `error-states`, `empty-states`, `loading-states-system`, `optimistic-ui`,
   `autosave-ux`, `undo-ux`, `destructive-actions`, `form-validation-timing`. The states the interface
   was missing entirely.
4. **Structure** — `modal-hierarchy`, `navigation-patterns`, `stepper-wizard`, `landing-page-skeleton`,
   `proximity-rule`, `gestalt-laws`, `serial-position`, `data-table`, `settings-system`. What sits
   where.
5. **Surface and motion** — `design-tokens`, `design-system-kit`, `grid-system`, `golden-ratio`,
   `border-radius`, `dark-mode`, `shadow-elevation`, `depth-layers`, `gradient-design`,
   `icon-design-rules`, `visual-hierarchy`, `von-restorff`, `perfect-card`, `card-hover-anatomy`,
   `animation-timing`, `easing-curves`, `doherty-threshold`, `skeleton-loading`, and the remaining
   component patterns. Tokens land before the values that reference them.
6. **Words** — `microcopy`, and the copy clauses of `empty-states`, `error-states`,
   `bulk-actions#3`, `search-experience-system#1`, `landing-page-skeleton#5`. Written last, against
   the final structure.

After the edits, **re-check every pattern a fix touched**: a fix that clears `visual-hierarchy` and
breaks `color-accessibility` is not done, and phase 5 routinely does exactly that.

Exactly two kinds of finding are left unfixed, both named out loud:

- **`NEEDS DECISION`** — the fix turns on something only the user knows: how long the undo window
  should be for this product, what the danger zone deletes, which plan the pricing page is supposed to
  push, what the empty state should invite, which of two brand accents is the real one, what a
  contrast pair resolves to when the background is an image. Ask that one question in its line; do not
  guess.
- **`OUT OF TARGET`** — the violation real home is a file the user did not point at: a token file, a
  shared `Button`, a global stylesheet. One line.

"I would rather not touch that" is neither.

## 8. Prove it still renders (MUST)

This skill moves markup, rewrites styles and changes component state across several files at once, so
after the last edit run whatever the project already has: **type check / compile**, then **lint** if a
config exists, then **tests** — the whole suite if fast, otherwise the files touching the target.

Then look at it. If the project can be run — a dev server, a story, a test page — **render the target
and confirm the fixed states are real**: the focus ring appears on Tab, the toast dismisses, the
skeleton matches the loaded size, the sheet locks body scroll. The `run` skill covers launching it.
Console errors count as red.

- **Green** — print the edit list and stop.
- **Red, cause obvious** — fix and re-run. A stale import after a component split, a token renamed in
  one file and not the other: part of the edit, not a new finding.
- **Red, fix not obvious** — **revert that specific edit**, leave the rest, report `NEEDS DECISION`
  with the error.
- **Nothing to run** — say so in one line. Silence is not green, and do not install tooling the
  project does not have.

## 9. Commits

Default: **no commits.** The edits sit in the working tree.

The one exception is the case section 6 flagged — tree clean at the start, user chose to fix
everything, edit count past the threshold. Then **one commit per pattern**, in section 7 order, so any
one can be reverted alone:

```
muster(focus-states): gorunur odak halkasi geri eklendi
```

Never amend, never rebase, never touch a commit the user made. If the tree was dirty at the start
there are no commits at all.

## 10. Output — the edits, nothing else

**No report.** No pattern table, no findings table, no verdict, no `ReportFindings` call, no "here is
what I found". One line per edit — `file:line`, `slug#n`, what changed — then the counts line, then
the verification line, then the overrides line if there were any, then the unfixed ones:

```
Button.tsx:31            focus-states#2           outline: none replaced with a 2px ring at 2px offset
Button.tsx:44            disabled-buttons#3       submit stays enabled, validates on click
CardGrid.css:12          hover-trap#4             hover styles gated behind @media (hover: hover)
CardGrid.css:20          card-hover-anatomy#1     lift now 8px over 200ms ease-out
Toast.tsx:18             toast-notifications#4    visible toasts capped at 3, rest queue
Toast.tsx:27             toast-notifications#3    dismiss timer pauses on hover
theme.css:8              dark-mode#1              background #000 -> #121212
Filters.tsx:52           filter-chips#3           result count updates on the same frame as the tap
EmptyList.tsx:9          empty-states#3           "Try refreshing" replaced with "Create your first board"

patterns   19 fired, 7 violated
tsc --noEmit + vitest: green; rendered at /boards, no console errors
overrides  landing-page-skeleton disabled (.muster.md)

NEEDS DECISION   BoardRow.tsx:70   undo-ux#1              delete is immediate — how long should the undo window be?
NEEDS DECISION   Hero.tsx:14       color-accessibility#1  caption sits on a photo — what is the intended backdrop?
OUT OF TARGET    ui/tokens.css:3   design-tokens#1        spacing-16 is literal here, outside the target
```

Nothing else. No praise, no summary paragraph, no "want me to also…", no patterns that passed — a
pattern that passed produced no edit. If every fired pattern passed, say exactly that in one line
with the two counts.
