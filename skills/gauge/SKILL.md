---
name: gauge
description: Measures a rendered interface against a fixed checklist (type, colour, accessibility, viewports, alignment, contrast, themes, components) and fixes every violation in place. Every answer comes from the render as written-down numbers, never from the stylesheet or eyeballing. Output is the edit list only. Use when the user says "/gauge", "measure this screen", "check the alignment", "are the gaps on the scale", "check the fonts", "do these fonts go together", "check the font pairing", "too many fonts", "check the colours", "do these colours match", "is the palette consistent", "check the contrast", "check dark mode", "is this accessible", "does this reflow", "check the focus rings", "audit this UI", or the Turkish "olc", "fontlar uyumlu mu", "yazi tipi kontrol", "renkler uyumlu mu", "renk paleti kontrol", "hizalamayi kontrol et", "kontrast kontrol", "karanlik mod kontrol", "erisilebilir mi". For code rules use lint; for the 73 UX patterns use muster; for redesigning a screen in scored rounds use compose.
---

# gauge — the measurement gate

A fixed checklist, answered **from the render**. Every fail is **fixed**, not written up. It hands back
a diff, not a review.

## Levels

**lite**, **full**, **ultra**, as in **lint**; **full is the default**.

- **lite** — one viewport: `access`, `type`, `palette`, `contrast`, `alignment`. Re-renders at that
  viewport are part of lite (web font blocked, reduced motion, greyscale, 200% zoom); clauses tagged
  `· full` in `rules/core.md` wait for full.
- **full** — lite plus other viewports, modes and states: `responsive`, `theme`, `states`.
- **ultra** — full plus the component system: `reuse`, `variants`. Touches files the target did not
  name; those come back as `OUT OF TARGET` unless the user pointed at the directory.

**The floor runs at every level:** `access#1` (keyboard and focus ring), `access#4` (never colour
alone), `contrast#2` (text) and `contrast#3` (control boundaries and focus rings). No override disables
or relaxes any of them.

**No running one rule alone.** The level picks the rules; `.gauge.md` may disable or relax non-floor
rules and clauses. The level word goes anywhere in the invocation: `/gauge lite`,
`/gauge ultra src/Board.tsx`.

## Target

The argument is the target. With none, the uncommitted diff; if the tree is clean, ask **one
question**. Read the whole target first, and for a diff the parent shell too (grid, breakpoint config,
layout wrapper).

## Render first (MUST)

**Nothing is checked before the target is on screen.** Launch it the way the project already runs (the
`run` skill covers this), then screenshot, tab, hover and measure the live render.

**Measurements come from the render:** a coordinate is `getBoundingClientRect()`, a gap is the
difference of two measured edges, a ratio is computed from the two resolved colours, a target size is
the measured box. The source is read to locate tokens, components and declared scales, never to stand
in for a measurement.

If the target genuinely cannot be rendered, say so in **one line** and stop; point to `lint` or
`muster`. Never guess a number.

## Which rules apply

**Always load `rules/core.md`** — every rule, threshold and level tag. Never rename a rule: the output
addresses rules by name.

A rule with no subject in the target (`variants` on a lone leaf component, `theme` on a surface that is
one-mode by policy) does not fire. Say so in the `notes` line; a rule you did not look for is not
silently clean.

## Project overrides

If the repository root holds a **`.gauge.md`**, read it before measuring. One directive per line:
keyword, rule name (or `rule#clause`), and a required reason.

```
relax   theme            the product ships light-only, there is no dark surface
disable responsive       this is a fixed-size kiosk build at 1920x1080
```

- **`disable`** — not measured, no edits.
- **`relax`** — measured, but the exception named in the reason is accepted.
- **A directive with no reason is not honoured.**
- **The floor clauses (`access#1`, `access#4`, `contrast#2`, `contrast#3`) can be neither disabled
  nor relaxed.** Other `access` and `contrast` clauses (the 44px target included) relax clause by
  clause; neither rule is disabled whole, and any relaxation of either is printed on its own line
  every run.

Every disabled or relaxed rule is listed once after the edits: `overrides   theme relaxed (.gauge.md)`.

## When two rules disagree

- **`access` and `contrast` beat everything.**
- **`alignment` beats `reuse`** — a shared component that breaks the scale is fixed at the component
  with a variant, never left with a stray gap. This variant fix is allowed at any level.
- **`reuse` beats `variants`** — collapse the duplicate first, then decide variant axes.
- **`theme` beats `palette` and `contrast` on ordering only** — move the colour to a semantic token
  first, then judge and measure on the token, in both modes.
- **`contrast` beats `palette`** — the palette is re-derived around the readable value.
- **`type` beats `alignment`** — the type scale settles before the rhythm.
- **`reuse` beats `type` and `palette`** — a face or colour the project already tokenised wins; never a
  second scale beside the existing one.
- Otherwise, **the rule that removes an element wins over the rule that restyles it.**

## Violation shape (MUST)

Rule by name, `file:line`, the measurement (the numbers, the ratio, the viewport), and the fix written
in. **No number, no violation** — "feels cramped" never becomes an edit; a 22px gap in a 4/8/16/24 scale
does.

## Verify before fixing (MUST)

Re-measure **every** fail and try to kill it before touching anything. A fail that does not survive is
dropped and never mentioned.

**`contrast` is the exception:** a pair you cannot compute (text on a photo, gradient, video) stays a
`NEEDS DECISION`, never an assumed pass.

## Scope budget

At **full and ultra**, up to **20 edits or 8 files** is fixed outright. At **lite**, **40 edits or 16
files**.

**Past the budget**, print the count and the breakdown by rule in one or two lines, then ask **one
question**: fix everything, drop a level, or narrow to a file or directory. If the tree was clean at
the start, say in the same question that edits will be committed one rule at a time. A budget question
is about *how much*, never *whether*.

## Fix it — do not ask (MUST)

**Every surviving fail is fixed in place, immediately.** No "shall I apply these?". Smallest edit that
clears the rule — no drive-by restyle, no reach outside the target, nothing from a level above the one
asked for (the one exception: the `alignment`-over-`reuse` variant fix).

**Fix order:**

1. **Structure** — `reuse`, `variants`.
2. **Reach** — `access`.
3. **Colour** — `theme`, then `palette`, then `contrast`.
4. **Type** — `type`.
5. **Geometry** — `alignment`, then `responsive`.
6. **States** — `states`.

After the edits, re-render and re-measure every rule a fix touched; a fix that clears `contrast` and
breaks `theme` is not done.

Exactly two kinds of finding stay unfixed, both named out loud:

- **`NEEDS DECISION`** — the fix turns on something only the user knows: what a contrast pair resolves
  to over an image, what the empty state should invite, which duplicate component is the real one,
  whether a stray offset is a deliberate optical correction. Ask that one question in its line.
- **`OUT OF TARGET`** — the violation's real home is a file the user did not point at (token file,
  shared `Button`, grid config). One line.

## Prove it still renders (MUST)

After the last edit run what the project already has: **type check or compile**, the **linter** if
configured, then **tests** (whole suite if fast, else the files touching the target). Then **render
again and re-measure the fixed checks** at every viewport and mode rendered at this level. Console
errors count as red.

- **Green** — print the edit list and stop.
- **Red, cause obvious** — fix and re-run; part of the edit, not a new finding.
- **Red, fix not obvious** — **revert that edit**, keep the rest, report `NEEDS DECISION` with the
  error.

## Commits

Default: **no commits.** The one exception is the case the budget flagged — tree clean at the start,
user chose to fix everything, edit count past the threshold. Then **one commit per rule**, in fix
order. The message follows the repo's own convention (read recent `git log`), with the rule name as
scope.

Never amend, never rebase, never touch a commit the user made. Tree dirty at the start: no commits.

## Output — the edits, nothing else

**No report.** No checklist or findings table, no verdict, no `ReportFindings` call. A header naming
the level, one line per edit (`file:line`, rule, measurement and change), then the render line, the
verification line, the overrides line if any, one `notes` line for what the rules ask to state
(pairing reason, measured lists, what was searched and found, rules that did not fire, clauses that
could not be measured, accepted passes), then the unfixed ones:

```
gauge · full

Button.tsx:31        access      outline: none -> 2px ring at 2px offset, visible on Tab
CardGrid.css:20      alignment   card gaps 22/24/24 -> 24 throughout, scale is 4/8/16/24
theme.css:31         contrast    body text 3.9:1 -> 7.1:1 on surface, both modes

rendered   360 / 768 / 1440, light + dark, 24 screenshots
tsc --noEmit + vitest: green; no console errors
overrides  alignment#7 relaxed (.gauge.md)
notes      Inter + Source Serif: sans body vs serif display; gaps 8/16/24; variants: no siblings

NEEDS DECISION   Hero.tsx:14      contrast   caption sits on a photo — what is the intended backdrop?
OUT OF TARGET    ui/tokens.css:3  theme      the dark palette is literal here, outside the target
```

Nothing beyond these lines — no praise, no summary, no "want me to also…", no passed rules. If every rule the level
enables passed, say exactly that in one line, naming the level.
