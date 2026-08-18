---
name: reskin
description: Redesigns an interface from scratch in scored rounds, obsessing over alignment, layout, sizing, spacing, hierarchy, contrast and states. Each round designs a fresh version, renders it, scores it against a frozen design rubric, and fights it head-to-head (VS) against the reigning design; the loop runs until a challenger fails to win on both score and VS, then reports a full analysis plus a round-by-round table. Use when the user says "/reskin", "redesign this screen", "restyle it", "make this UI better", "the layout looks off", "fix the spacing/alignment". For rewriting logic use rewrite; for improving existing code in place use refactor.
---

# reskin — redesign the interface

Design the thing **again, from a blank canvas**; **render it**; **score it**; **fight it** against
the current design; repeat until a fresh attempt stops winning.

Third sibling of **rewrite** (rewrite the code) and **refactor** (improve it in place). This one
judges *what it looks like and how it reads*, and it is ruthless about the boring things — edges that
line up, one spacing scale, sizes that mean something, contrast you can actually read.

**Load the matching design skill first**, if one is available: `frontend-design` for web UI,
`dataviz` for anything with a chart in it, `artifact-design` for a published page. This skill is the
tournament harness; those carry the craft.

---

## 0. Pick the target and pin the content

If the user passed an argument, that is the target (`/reskin the settings panel`). If not, ask
**one question**: which screen, panel or component.

Then pin down three things — all frozen for the whole run:

1. **The job.** What the user is trying to do on this surface, and what must be seen first, second,
   third. Design without a stated reading order is just decoration.
2. **The content set.** Real strings, real numbers, real counts — *plus a stress case*: the longest
   label, the empty state, the biggest number, the 40-item list. Every round is judged on the same
   content, stress case included. A design that only works on "Lorem ipsum" is not a design.
3. **The constraints.** Viewport(s) or window size, existing design tokens/system to obey, platform
   idiom (web, IMGUI, native, terminal), and anything that cannot move.

## 1. Setup (round 0)

1. **Champion = the current design.** Render it and **look at it** as it exists today. If there is no
   current design, there is no Round 0 and the first attempt becomes champion outright.
2. **Freeze the rubric** (§3) and **score the champion now**, with the alignment audit (§4) run
   against it. Its weak criteria are the first things later rounds have to beat.
3. **Work folder:** `<scratchpad>/reskin/<target-slug>/`, one `r<N>/` per round holding the
   source *and* the rendered screenshot. The repo stays **untouched** until the final design wins.
4. **Round log:** `<scratchpad>/reskin/<target-slug>/rounds.md`, one line per round.

## 2. The round loop

**(a) State the design idea.** One sentence, before touching anything: what this round does
*differently* — the layout skeleton, the hierarchy move, the density decision (`two-column split with
the primary action anchored bottom-right, labels above fields`). Rounds that repeat the previous
idea with different padding are wasted rounds.

**(b) Design it from scratch.** Blank canvas, from the job + content set. No copying the current
layout's structure. Every round declares its scales **up front** and then sticks to them:

- **spacing scale** (e.g. 4 · 8 · 12 · 16 · 24 · 32 · 48) — no value outside it, ever;
- **type scale** with weights and line heights;
- **size scale** for controls, icons and containers;
- **radius, border and elevation** steps;
- **palette** with the exact roles each colour plays.

If the project already has tokens, **use them** — inventing a parallel scale is a house-rule
violation, not a design choice.

**(c) Render it and look at it.** MUST. Produce an actual rendered view — screenshot the page, the
window, the component, the scene view. **Never score a design you have not seen as pixels**; judging
from source is how misaligned, overflowing, unreadable layouts get called "clean". Render the stress
content too, and every declared viewport.

**(d) Run the alignment audit** (§4) and walk `references/checklist.md` in full — accessibility,
responsive, mathematical alignment, contrast, dark/light, components, variants. Write the findings
down. Fix what they catch before scoring.

**(e) Score** with the frozen rubric (§3), then **VS** the champion (§5).

**(f) Verdict.** The challenger takes the throne only if it wins **both** the total score **and** the
VS. Otherwise the loop ends.

Hard cap: **6 rounds**.

## 3. Scoring (the rubric)

Six criteria, each **0-10**, weighted total **0-100**:

| Criterion | Weight | What it measures |
| --- | --- | --- |
| Layout & alignment | 25 | Does the grid hold; do edges line up across groups; optical alignment; gutters consistent; nothing drifting by a pixel or two |
| Spacing & sizing | 20 | One spacing scale honoured everywhere; sizes proportional to importance; density fits the task; touch/click targets big enough; no magic numbers |
| Hierarchy & typography | 20 | Does the eye land in the intended order; type scale used with intent; weight and size doing the work instead of colour; measure (line length) readable |
| Colour, contrast & accessibility | 15 | Contrast ratios pass (AA at minimum); colour is never the only signal; focus/keyboard states exist; light and dark both handled if applicable |
| Fit to content & job | 12 | Serves the real content set, stress case included; the primary action is obvious; nothing important below the fold or clipped |
| States & responsiveness | 8 | Hover/active/disabled/focus, empty, loading, error, overflow; behaviour at every declared viewport |

Rules (MUST):

- **No score without a reason**, and the reason names something visible: *"the card's label sits 3px
  off the column edge that everything else shares"*, not *"feels tidy"*.
- The rubric may be tailored **before round 1** (a chart-heavy surface can add "Data legibility"; a
  terminal UI drops responsiveness), then it is **frozen**.
- **Novelty scores nothing.** A striking layout that hides the primary action loses to a plain one
  that works.

## 4. The alignment audit

Run this on every round, champion included. It is a checklist, not a vibe:

- **Shared edges.** List the vertical edges (left/right) and horizontal baselines that elements are
  supposed to share, then verify each one actually shares them. Near-misses are the single most
  common defect in a redesign.
- **Gutter consistency.** Every gap between siblings comes from the spacing scale, and equivalent
  relationships use equivalent gaps (all card gaps equal, all label→field gaps equal).
- **Optical vs. mathematical centring.** Icons, glyphs, arrows and text with descenders often need an
  optical nudge; centring by numbers alone reads as crooked.
- **Icon/text alignment.** Icons sit on the text's optical centre, sized to the type they sit beside.
- **Container padding symmetry.** Left padding equals right padding unless something explicitly
  claims otherwise; top/bottom deliberate, not inherited from a default.
- **Text alignment discipline.** One alignment per column; numbers right-aligned or decimal-aligned;
  no centred paragraphs of body text.
- **Overflow and truncation.** With the stress content: does anything clip, wrap ugly, push a
  neighbour, or blow past its container?
- **Rhythm.** Repeated blocks repeat exactly — same height, same internal padding — unless they
  differ on purpose.

Write the audit result as a short list of hits and misses. A round with unfixed misses may not score
above **7** on Layout & alignment, period.

## 5. VS (head-to-head)

- **Side by side, same content, same viewport**, screenshots next to each other. Compare the stress
  case too — that is where designs actually separate.
- Go criterion by criterion; **A or B, and why**, naming something visible in the render.
- Winner: **weighted majority of criteria**.
- **Ties go to the champion.** A wash is churn, and re-skinning a working surface costs review time
  and user familiarity.
- **Red lines** — automatic VS loss regardless of score:
  - the primary action is harder to find than in the champion,
  - contrast fails AA on any text,
  - the stress content breaks the layout,
  - the project's existing design tokens were ignored in favour of invented ones.
- Delegate judging to a separate agent only if the user explicitly asks.

## 6. Finish and apply

1. **Apply the final design.** If the champion is Round 0, **change nothing** and say so plainly
   ("the current layout survived three redesigns").
2. Re-render the applied result and check it once more — applying a design into the real codebase
   often shifts it (inherited styles, different fonts, real data).
3. **Do not delete** the scratchpad rounds and screenshots; print the path.
4. If the project keeps progress/changelog docs, add a section.

## 7. Final analysis (output format)

The last message carries exactly these five headings:

```
## What we set out to do
The job, the reading order, the content set (including the stress case) and the constraints.

## What we did
Which design won, how many rounds, how often the throne changed hands, score movement.

## How we did it
The winning design's skeleton and scales — layout structure, spacing/type scale,
hierarchy decisions — and which idea from a losing round survived into it.

## Possible mistakes
Honest risks: viewports not rendered, states not built (empty/loading/error), contrast
checked by eye rather than measured, content that may still overflow in the wild,
accessibility beyond contrast left untested.

## Rounds
<table>
```

Table template:

| Round | Design idea | Alignment audit | Score | VS | Champion |
| --- | --- | --- | --- | --- | --- |
| 0 | current layout | 4 misses | 58 | — | R0 |
| 1 | two-column, action anchored | clean | 76 | R1 wins (5-1) | R1 |
| 2 | single column, card grid | 2 misses | 70 | R1 wins (4-2) | R1 |

One sentence after the table: **why the loop ended** (challenger lost on score, on VS, on a red line,
or the round cap was reached).

---

## MUST summary

- Load `frontend-design` / `dataviz` / `artifact-design` first when they apply.
- Freeze the job, the content set (with a stress case) and the constraints before round 1.
- Declare the spacing/type/size/colour scales per round and never step outside them; obey existing
  project tokens.
- **Render it and look at it** — never score a design from source alone.
- Run the alignment audit and `references/checklist.md` every round; unfixed alignment misses cap
  Layout & alignment at 7.
- Ties go to the champion; red lines are an automatic loss.
- 6 rounds maximum.
- Final analysis: five headings plus the table, nothing skipped.
