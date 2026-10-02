---
name: muster
description: Makes an interface pass muster against the 73 UX patterns of designmotionhq.com/patterns — bundled offline, every threshold kept verbatim — and fixes each violation in place instead of writing a review. Covers focus, hover on touch, stacking, tokens, grid, radius, dark mode, contrast, motion timing, loading, optimistic UI, errors, autosave, undo, destructive actions, overlays, forms and validation, microcopy, tables, pagination, filters, search, charts, empty states, navigation, settings, drag and swipe, live cursors. Output is the edit list only — no report, no PASS/FAIL table. Use when the user says "/muster", "apply the design patterns", "check this UI against the patterns", "make this screen pass", "does this follow the UX rules", "fix the UX here", "designmotion patterns", or the Turkish "patternleri uygula", "arayuzu kurallara uydur", "ux kurallarina gore duzelt". For a code-quality rule pass use lint; for redesigning a screen from scratch in scored rounds use compose.
---

# muster — the UX pattern gate

Seventy-three patterns from <https://designmotionhq.com/patterns>, held in `patterns/`. Each one that
applies to the target is checked, and each rule that fails is **fixed** in place. The output is a
diff, not a review.

## 0. Target

The user argument is the target (`/muster src/components/Table.tsx`, `/muster the checkout screen`).
With no argument, the uncommitted diff; if the tree is clean, ask **one question**. For a diff, read
the surrounding component too.

A design file or screenshot is a valid target; the fixes land in the code that renders it, and
anything with no code to edit is a `NEEDS DECISION`.

## 1. Which patterns fire

**Walk `patterns/index.md` end to end before reading any rules.** A pattern fires when its Trigger
subject exists in the target — the subject, not the framework: a `<div role="switch">` fires
`toggle-anatomy`. The fired list is the run. Load **only** the files whose patterns fired.
`focus-states` fires on nearly every target; a run that skipped it is unfinished.

## 2. Project overrides

If the repository root holds a **`.muster.md`**, read it before checking anything. One directive per
line: keyword, pattern slug (optionally `slug#n` for a single rule), and a required reason.

```
disable landing-page-skeleton   this is an internal tool, there is no marketing page
relax   dark-mode#1             brand ships a true-black OLED theme on purpose
```

- **`disable`** — not checked, produces no edits.
- **`relax`** — checked, but the exception named in the reason is accepted.
- A directive with no reason is not honoured. An unknown slug gets one line saying so.

**`color-accessibility` and `focus-states` are never disabled or relaxed** — not by the file, not by
an argument. They always run, even under `--only`; a directive or `--skip` aimed at either gets one
line saying it is ignored. Every
disabled or relaxed pattern is listed once after the edits:
`overrides   landing-page-skeleton disabled, dark-mode#1 relaxed (.muster.md)`.

Arguments beat the file: `--only toast-notifications` and `--skip golden-ratio` apply to
that run alone.

## 3. When two patterns disagree

- **Accessibility beats aesthetics.** `color-accessibility` and `focus-states` beat
  `visual-hierarchy`, `dark-mode`, `perfect-card` and every other surface pattern.
- **Reachability beats decoration.** `hover-trap` beats `card-hover-anatomy`.
- **Safety beats speed.** `behind-the-button` beats `optimistic-ui` and `doherty-threshold`: a payment
  or an irreversible write waits for the server.
- **Recoverability beats friction.** `undo-ux` beats `destructive-actions` for anything reversible;
  `destructive-actions` wins only where the action truly cannot be undone.
- **The existing scale beats the derived one.** `design-tokens` and `design-system-kit` beat
  `golden-ratio` and `border-radius` — never a second scale next to the project one.
- **Specific beats general on the same element.** `card-hover-anatomy` beats `perfect-card` on hover
  (the card never scales); `perfect-card` beats `border-radius` and `visual-hierarchy` on a card;
  `dropdown-design` beats `animation-timing` and `hover-trap` on a dropdown (150ms, 48px);
  `star-rating` beats `animation-timing` on star stagger; `password-field-ux` beats
  `form-validation-timing` (checklist live while typing); `bulk-actions` and `undo-ux#3` (10s) beat
  the 5s default of `undo-ux#1`; `golden-ratio` beats `design-tokens#3` and `grid-system#2` only when
  the project declares a golden scale.
- **Fit before form.** `loading-states-system` picks the loading pattern before `skeleton-loading`
  applies; `modal-hierarchy` picks the surface before `bottom-sheets`, `dropdown-design` or
  `tooltip-design` apply.

## 4. Violation shape (MUST)

Every violation names its rule as `slug#n` and its place as `file:line`; missing either, it is not a
violation. Its fix is the concrete replacement written into the code.

**Numbers are the rule.** Where a pattern states a value — 300ms, 4.5:1, 44px, 800ms, 8px, 3 toasts —
that value goes into the code. Never rounded, never swapped for a value the project happened to use
unless a token defines it.

## 5. Verify before fixing (MUST)

Before touching anything, re-read the code behind **every** violation and try to kill it. A violation
that does not survive is dropped, never fixed, never mentioned.

**`color-accessibility` is the exception.** A contrast pair you cannot compute stays a
`NEEDS DECISION` rather than being assumed to pass.

## 6. Scope budget

Count the surviving violations before editing:

- **Up to 20 edits, or up to 8 files** — fix them all, no question.
- **Beyond either** — print the count and the breakdown by pattern in one or two lines, then ask
  **one question**: fix everything, or narrow to a pattern, a file, a screen. If the tree was clean at
  the start, say in the same question that edits will be committed one pattern at a time.

## 7. Fix it — do not ask (MUST)

**Every violation that survives section 5 gets fixed, in place, immediately.** No "shall I apply
these?", no closing question. Smallest edit that clears the rule — no drive-by restyle, no reach
outside the target.

**Fix order:**

1. **Wrong mechanics** — `z-index-mastery`, `accordion-disclosure#1`, `hover-trap`, `otp-input#1`,
   `pagination#1`, `scroll-driven-animations`, `behind-the-button`.
2. **Reach and access** — `focus-states`, `color-accessibility`, `disabled-buttons`,
   `form-field-states`, `swipe-actions#5`, `dropdown-design#1`, `hover-trap#6`.
3. **State and safety** — `error-states`, `empty-states`, `loading-states-system`, `optimistic-ui`,
   `autosave-ux`, `undo-ux`, `destructive-actions`, `form-validation-timing`.
4. **Structure** — `modal-hierarchy`, `navigation-patterns`, `stepper-wizard`, `landing-page-skeleton`,
   `proximity-rule`, `gestalt-laws`, `serial-position`, `data-table`, `settings-system`.
5. **Surface and motion** — `design-tokens`, `design-system-kit`, `grid-system`, `golden-ratio`,
   `border-radius`, `dark-mode`, `shadow-elevation`, `depth-layers`, `gradient-design`,
   `icon-design-rules`, `visual-hierarchy`, `von-restorff`, `perfect-card`, `card-hover-anatomy`,
   `animation-timing`, `easing-curves`, `doherty-threshold`, `skeleton-loading`, and the remaining
   component patterns. Tokens land before the values that reference them.
6. **Words** — `microcopy`, and the copy clauses of `empty-states`, `error-states`,
   `bulk-actions#3`, `search-experience-system#1`, `landing-page-skeleton#5`.

After the edits, **re-check every pattern a fix touched**.

Exactly two kinds of finding are left unfixed, both named out loud:

- **`NEEDS DECISION`** — the fix turns on something only the user knows. Ask that one question in its
  line; do not guess.
- **`OUT OF TARGET`** — the violation's real home is a file the user did not point at: a token file, a
  shared component, a global stylesheet. One line.

## 8. Prove it still renders (MUST)

After the last edit run whatever the project already has: **type check / compile**, then **lint** if a
config exists, then **tests** — the whole suite if fast, otherwise the files touching the target.

If the project can be run, **render the target and confirm the fixed states are real**; the `run`
skill covers launching it. Console errors count as red.

- **Green** — print the edit list and stop.
- **Red, cause obvious** — fix and re-run; part of the edit, not a new finding.
- **Red, fix not obvious** — **revert that specific edit**, leave the rest, report `NEEDS DECISION`
  with the error.
- **Nothing to run** — say so in one line. Do not install tooling the project does not have.

## 9. Commits

Default: **no commits.** The edits sit in the working tree.

The one exception is the case section 6 flagged — tree clean at the start, user chose to fix
everything, edit count past the threshold. Then **one commit per pattern**, in section 7 order. The
message follows the repo's own convention (read recent `git log`), with the pattern slug as scope.

Never amend, never rebase, never touch a commit the user made. If the tree was dirty at the start
there are no commits at all.

## 10. Output — the edits, nothing else

**No report.** No pattern table, no findings table, no verdict, no `ReportFindings` call. One line per
edit — `file:line`, `slug#n`, what changed — then the counts line, then the verification line, then
the overrides line if there were any, then the unfixed ones:

```
Button.tsx:31            focus-states#2           outline: none replaced with a 2px ring at 2px offset
CardGrid.css:12          hover-trap#4             hover styles gated behind @media (hover: hover)
Toast.tsx:18             toast-notifications#4    visible toasts capped at 3, rest queue

patterns   19 fired, 5 violated
tsc --noEmit + vitest: green; rendered at /boards, no console errors
overrides  landing-page-skeleton disabled (.muster.md)

NEEDS DECISION   Hero.tsx:14       color-accessibility#1  caption sits on a photo — what is the intended backdrop?
OUT OF TARGET    ui/tokens.css:3   design-tokens#1        spacing-16 is literal here, outside the target
```

Nothing else — no summary, no follow-up offer, no patterns that passed. If every fired pattern
passed, say exactly that in one line with the two counts.
