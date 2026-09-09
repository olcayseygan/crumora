---
name: gauge
description: Measures a rendered interface against a fixed checklist and fixes every violation in place instead of writing a review. Every answer comes from the render and from numbers written down — coordinates, gaps, font sizes and weights, colour values, contrast ratios, target sizes, viewports — never from reading the source and never from eyeballing. Covers font pairing and how many families actually rendered, the type scale, weights and synthesised bold, line height, the 45-75 character measure, tracking and font fallbacks; colour harmony — how many colours rendered, one neutral ramp, one leading accent, semantic colours meaning one thing, perceptually even ramps, saturation hierarchy, gradients and chart colour sets; keyboard reach and focus rings, accessible names, semantics, colour-alone signals, alt text, 44px targets, reduced motion, 200% zoom; narrow/mid/wide viewports, reflow and stress content; shared edges at 0px, one spacing scale, equal gaps, symmetric padding, baseline rhythm, numeric alignment; 4.5:1 and 3:1 contrast in every state; both dark and light mode from semantic tokens; component reuse over redrawn one-offs, full state sets, and one component per job with bounded variants. Output is the edit list only — no report, no PASS/FAIL table. Use when the user says "/gauge", "measure this screen", "check the alignment", "are the gaps on the scale", "check the fonts", "do these fonts go together", "check the font pairing", "too many fonts", "check the colours", "do these colours match", "is the palette consistent", "check the contrast", "check dark mode", "is this accessible", "does this reflow", "check the focus rings", "audit this UI", or the Turkish "olc", "fontlar uyumlu mu", "yazi tipi kontrol", "renkler uyumlu mu", "renk paleti kontrol", "hizalamayi kontrol et", "kontrast kontrol", "karanlik mod kontrol", "erisilebilir mi". For a code-quality rule pass use lint; for the 73 UX patterns use muster; for redesigning a screen from scratch in scored rounds use redesign.
---

# gauge — the measurement gate

A fixed checklist, answered **from the render**. Each check is measured, and each one that fails is
**fixed**, not written up. It hands back a diff, not a review.

Sibling of **lint**, which gates the code from the source, and of **muster**, which gates the
interface against named UX patterns. This one gates what the pixels actually do: coordinates, gaps,
typefaces, colour values, ratios, sizes, viewports and modes. It is the checklist `redesign` walks every round, run on its own
against an interface that already exists.

Three failure modes it exists to prevent:

- **The eyeballed pass.** "Alignment looks fine, the fonts go together, contrast seems OK" — no
  coordinate listed, no family counted, no ratio computed, nothing anyone can verify or refuse.
- **The check answered from the source.** `gap: var(--space-4)` in the stylesheet says nothing about
  the gap on screen once a margin collapses, a flex child shrinks or a breakpoint fires. A check
  answered without a render is not answered.
- **The review that ends in a question.** A page of findings and a "shall I apply these?". The
  violations were known; the edit is the answer.

Rules are named, never numbered. A rule is `alignment` or `contrast` or `theme`, and that name is what
prints next to the edit it produced.

---

## Levels

Three depths, exactly as **lint** works: **lite**, **full**, **ultra**, and **full is the default**
when none is given.

**lite** is what one screenshot at one viewport answers: `access`, `type`, `palette`, `contrast`,
`alignment`. Reach, typography, colour, ratios and geometry on the surface in front of you.

**full** is lite plus everything that needs the target rendered more than once: `responsive`,
`theme`, `states`. Three viewports, both modes, and every state a component can be in.

**ultra** is full plus the component-system rules: `reuse`, `variants`. It searches the project's
component library, collapses duplicates and moves one-offs onto real components, so it touches files
the target did not name — those come back as `OUT OF TARGET` unless the user pointed at the directory.

**The floor runs at every level, lite included:** the keyboard and focus-ring clauses of `access`, and
the AA clause of `contrast`. Neither is skipped, and nothing switches either one off.

**The level is the only dial.** No way to run one rule alone, no way to drop one out of a level. The
level word goes anywhere in the invocation: `/gauge`, `/gauge lite`, `/gauge ultra src/Board.tsx`.

## Target

The user's argument is the target — `/gauge the settings panel`, `/gauge src/Board.tsx`. With no
argument the target is the uncommitted diff, and if the tree is clean, ask **one question**.

**Read the whole target first**, and for a diff the parent shell too — the grid, the breakpoint config
and the layout wrapper decide most of what `alignment` and `responsive` measure, and none of it shows
in changed lines.

## Render first (MUST)

**Nothing is checked before the target is on screen.** Launch it the way the project already runs — a
dev server, a story, a test page; the `run` skill covers launching it — then drive it with the
browser or Electron tools: screenshot each viewport and each mode, tab through it, hover and focus
what `states` asks for, and read computed geometry with `browser_evaluate` rather than inferring it
from CSS.

**Measurements come from the render, not the source.** A coordinate is `getBoundingClientRect()`, a
gap is the difference between two measured edges, a contrast ratio is computed from the two resolved
colours, a target size is the measured box.

If the target genuinely cannot be rendered — no way to run it, no environment, a design file with no
code behind it — say so in **one line** and stop. A gauge run without a render is not a shallower run,
it is a different skill; use `lint` or `muster` instead. Never guess a number to fill a box.

## Which rules apply

**Always load `rules/core.md`.** It holds every rule and every threshold, each tagged with the level
that first enables it. Never rename one: the output addresses rules by name.

A rule with no subject in the target does not fire — `variants` on a single leaf component with no
sibling, `theme` on a surface the project renders in one mode by policy. Write that down in one line;
a rule you did not look for is not silently clean.

## Project overrides

If the repository root holds a **`.gauge.md`**, read it before measuring anything. One directive per
line: keyword, rule name (optionally `rule#clause` for a single clause), and a reason that is
required.

```
relax   theme            the product ships light-only, there is no dark surface
relax   alignment#7      the icon nudges are the brand's, signed off
disable responsive       this is a fixed-size kiosk build at 1920x1080
```

- **`disable`** — not measured, produces no edits.
- **`relax`** — measured, but the exception named in the reason is accepted.
- **A directive with no reason is not honoured.** Its absence usually means a rule someone lost an
  argument with.
- **`access` and `contrast` can be relaxed clause by clause but never disabled whole**, and any
  relaxation of either is printed on its own line every run.

Every disabled or relaxed rule is listed once after the edits:
`overrides   theme relaxed (.gauge.md)`.

## When two rules disagree

- **`access` and `contrast` beat everything.** A focus ring that spoils the composition stays and the
  composition changes around it; a colour that fails AA loses to the ratio, whatever the brand says.
- **`alignment` beats `reuse`.** A shared component whose padding breaks the scale on this surface is
  fixed at the component with a variant, never by leaving a stray gap in place.
- **`reuse` beats `variants`.** Collapse the duplicate first; decide the variant axes on what is left.
- **`theme` beats `palette` and `contrast` on ordering only.** Move the colour to a semantic token
  first, then judge the set and measure the ratio on the token — a hex tuned to pass in light mode is
  measured again in dark.
- **`contrast` beats `palette`.** A ramp step or an accent that reads well as a set but fails a ratio
  loses the argument; the palette is re-derived around the readable value, never the other way.
- **`type` beats `alignment`.** The line-height rhythm is measured against the type scale, so the
  scale is settled first and the rhythm follows it.
- **`reuse` beats `type` and `palette`.** A face or a colour the project already tokenised wins over a
  better one introduced here; a second scale next to the existing one is never the fix.
- Everywhere else, **the rule that removes an element wins over the rule that restyles it.**

## Violation shape (MUST)

Four things, the first three in your head and the fourth in the code: the **rule** by name, the
**where** as `file:line` rather than "the card", the **measurement** — the two numbers, the ratio, the
viewport — and the **fix** as the concrete replacement actually written in.

No rule name, no violation. No `file:line`, no violation. **No number, no violation** — "feels
cramped" never becomes an edit; a 22px gap in a 4/8/16/24 scale does.

## Verify before fixing (MUST)

Before touching anything, re-measure **every** fail and try to kill it. Is that 1px offset a subpixel
artefact of the screenshot scale rather than the layout? Is that "missing" focus ring drawn by a
parent's `:focus-within`? Is that gap the declared scale plus a border you counted twice? Is the
empty state rendered by the parent? A fail that does not survive is dropped, never fixed and never
mentioned — it produced no edit, so it produces no line.

**`contrast` is the exception.** A pair you cannot compute — text on a photo, a gradient, a video —
stays a `NEEDS DECISION` rather than being assumed to pass.

## Scope budget

Count the surviving fails before editing. At **full and ultra**, up to **20 edits or 8 files** is
fixed outright, no question. At **lite** the budget doubles to **40 edits or 16 files**.

**Past the budget**, print the count and the breakdown by rule in one or two lines, then ask **one
question**: fix everything, drop to a shallower level, or narrow to a rule, a file, a screen. If the
tree was clean at the start, say in the same question that edits will be committed one rule at a time.

A budget question is about *how much*, never about *whether*.

## Fix it — do not ask (MUST)

**Every fail that survives the kill pass gets fixed, in place, immediately.** No "shall I apply
these?", no closing question. Running the skill *is* the yes. Smallest edit that clears the rule and
nothing else — no drive-by restyle, no palette change the checklist did not demand, no reach outside
the target, and nothing from a level above the one that was asked for.

**Fix in this order**, because a gap tuned on a block about to be replaced is work done twice:

1. **Structure and reuse** — `reuse`, `variants`. The one-off `<div>` becomes the component and the
   duplicate collapses before anything is measured on top of it.
2. **Reach** — `access`. Keyboard order, focus rings, accessible names, semantics, target sizes,
   reduced motion, zoom.
3. **Colour** — `theme`, then `palette`, then `contrast`. Semantic tokens land first, the set is
   collapsed onto one ramp and one leading accent, ratios are fixed on the tokens, and both modes are
   measured again afterwards.
4. **Type** — `type`. Families, scale, weights, line heights and measure, before anything is measured
   against them.
5. **Geometry** — `alignment`, then `responsive`. Shared edges, the spacing scale, padding and
   baseline rhythm settle before the reflow is judged at every viewport.
6. **States** — `states`. Every state's own reach, colour and geometry, measured last against the
   final surface.

After the edits, **re-render and re-measure every rule a fix touched**. A fix that clears `contrast`
and breaks `theme` is not done, and phase 3 routinely does exactly that.

Exactly two kinds of finding are left unfixed, both named out loud:

- **`NEEDS DECISION`** — the fix turns on something only the user knows: what a contrast pair
  resolves to over an image, which of two brand accents is the real one, which of three rendered
  families is the intended one, what the empty state should invite, which duplicate component is the
  real one, whether a stray offset is a deliberate optical correction. Ask that one question in its line; do not guess.
- **`OUT OF TARGET`** — the violation's real home is a file the user did not point at: a token file, a
  shared `Button`, the grid config. One line.

"I would rather not touch that" is neither.

## Prove it still renders (MUST)

This skill moves markup, rewrites tokens and changes component state across several files at once, so
after the last edit run whatever the project already has: **type check or compile**, then the
**linter** if a config exists, then **tests** — the whole suite if fast, otherwise the files touching
the target.

Then **render it again and re-measure the fixed checks** at every viewport and both modes: the ring
appears on Tab, the gap is on the scale, the rendered family list is down to two, the ratio computes
past 4.5:1, nothing overflows at 360px.
Console errors count as red.

- **Green** — print the edit list and stop.
- **Red, cause obvious** — fix and re-run. A stale import after a component split is part of the edit,
  not a new finding.
- **Red, fix not obvious** — **revert that specific edit**, leave the rest, report `NEEDS DECISION`
  with the error.
- **Nothing to render** — impossible here; the render is mandatory, so that case stopped the run
  before it started.

## Commits

Default: **no commits.** The edits sit in the working tree.

The one exception is the case the budget flagged — tree clean at the start, user chose to fix
everything, edit count past the threshold. Then **one commit per rule**, in the fix order above, so
any one can be reverted alone:

```
gauge(contrast): govde metni AA esigine cikarildi
```

Never amend, never rebase, never touch a commit the user made. If the tree was dirty at the start
there are no commits at all.

## Output — the edits, nothing else

**No report.** No checklist table, no findings table, no verdict, no `ReportFindings` call, no "here
is what I found". The header line names the level and nothing more. Then one line per edit —
`file:line`, rule name, the measurement and what changed — then the render line, the verification
line, the overrides line if there were any, then the unfixed ones:

```
gauge · full

Button.tsx:31        access      outline: none -> 2px ring at 2px offset, visible on Tab
IconButton.tsx:12    access      icon-only button given aria-label "Kaydet"
Row.tsx:44           access      tap target 28x28 -> 44x44
type.css:6           type        3 families rendered -> 2, Lato folded into Inter
type.css:19          type        heading 23px -> 24px, scale is 12/14/16/20/24/32
type.css:24          type        synthesised bold replaced with the shipped 600 weight
Article.css:11       type        body measure 104ch at 1440 -> max-width: 68ch
palette.css:9        palette     11 greys -> one 6-step neutral ramp, even in OKLCH
palette.css:22       palette     second accent dropped, danger red no longer used decoratively
CardGrid.css:20      alignment   card gaps 22/24/24 -> 24 throughout, scale is 4/8/16/24
Panel.css:8          alignment   padding 24/24/24/16 -> 24 on all four sides
theme.css:14         theme       #4a4a4a literal -> var(--on-surface-muted), defined per mode
theme.css:31         contrast    body text 3.9:1 -> 7.1:1 on surface, both modes
Table.tsx:60         alignment   amount column decimal-aligned, one alignment per column
List.css:5           responsive  40-item list overflowed at 360px -> scroll container
Chip.tsx:18          states      hover state added, disabled no longer the only cue

rendered   360 / 768 / 1440, light + dark, 24 screenshots
tsc --noEmit + vitest: green; no console errors
overrides  alignment#7 relaxed (.gauge.md)

NEEDS DECISION   Hero.tsx:14      contrast   caption sits on a photo — what is the intended backdrop?
NEEDS DECISION   Board.tsx:88     variants   two Card implementations — which one survives?
NEEDS DECISION   brand.css:2      palette    two brand accents ship — which one is primary?
OUT OF TARGET    ui/tokens.css:3  theme      the dark palette is literal here, outside the target
```

Nothing else. No praise, no summary paragraph, no "want me to also…", no rules that passed — a rule
that passed produced no edit. If every rule the level enables passed, say exactly that in one line,
naming the level.
