---
name: compose
description: Recomposes and re-lays-out an interface from scratch in scored rounds, obsessing over grouping, layout, alignment, sizing, spacing, hierarchy, contrast and states. Each round designs three fresh versions in parallel, renders each clean with no console errors, then one blind judge in a separate agent scores them with the reigning design on a frozen rubric, not told which is the incumbent; the best that beats the champion and survives the alignment audit and checklist takes the throne. Stops the first round no challenger takes it, at 4 rounds at most, then reports a full analysis and a round-by-round table. Use when the user says "/compose", "compose this screen", "redesign this screen", "restyle it", "relayout this page", "rearrange this screen", "make this UI better", "the layout looks off", "fix the spacing/alignment". For checking code against a fixed rule set use lint; for how the flow behaves in a person's hands — steps, feedback, errors, recovery — use humanize.
---

# compose — compose the interface

Design the interface **again, from a blank canvas**, three ways at once; **render them**; let a
blind judge **rank them** against the current design; repeat until no fresh attempt beats it.

**Load the matching design skill first**, if one is available: `frontend-design` for web UI,
`dataviz` for anything with a chart in it, `artifact-design` for a published page.

**Read `../_shared/tournament.md` first** — it defines the loop and binds this skill. The rubric
below **replaces** the shared code rubric.

---

## 0. Pick the target and pin the content

If the user passed an argument, that is the target (`/compose the settings panel`). If not, ask
**one question**: which screen, panel or component.

Read the parent shell, routed wrapper, grid/breakpoint config and the children that take real space,
not just the file. If the parent shell is the actual bottleneck, **say so before round 1**.

Freeze for the whole run:

1. **The job** — what the user does on this surface, and what must be seen first, second, third.
2. **The content set** — real strings, numbers and counts, **plus a stress case**: longest label,
   empty state, biggest number, 40-item list. Every round is judged on the same content.
3. **The constraints** — viewport(s) it actually runs on (stated as an assumption if unknown; for
   web, ~360px, ~768px and ~1440px), existing design tokens/system, platform idiom, anything that
   cannot move.

## 1. Setup (round 0)

`tournament.md` §1, work folder `<scratchpad>/compose/<target-slug>/`, each `r<N>/c<k>/` holding
the source *and* the rendered screenshots. Render the current design and run the pre-crown check
(§2e) on it — its misses cap the champion.

## 2. The challenger

The round itself — three ideas, parallel builders, one blind judge, crowning — is `tournament.md` §4.
What each challenger is:

**(a) A design idea** in one sentence — a different skeleton, grouping or hierarchy, not a restyle.

**(b) Designed from scratch** from the job and content set, not from the current layout's
structure. Each challenger declares its spacing, type, size, radius/border/elevation and colour scales up
front and stays inside them. Existing project tokens are used, never paralleled.

**Behaviour carries over (MUST).** Props, events, `ref`s, slots, conditionals and store wiring move
with the markup; check every moved subtree still has them.

**(c) Rendered and looked at — the gate (MUST).** Never judge a design not seen as pixels. Render
the stress content at the round's viewports (`tournament.md` §4.3). The gate itself is
`tournament.md` §3.

**(d) Judged** with the frozen rubric (§3) and red lines (§5): the judge gets every version's
screenshots, same content and viewports, incumbent not named.

**(e) Pre-crown check** — only on challengers that beat the champion, highest-ranked first
(`tournament.md` §4.7): the alignment audit (§4) and `references/checklist.md` in full, answered from
its renders. Their misses cap its score before it can take the throne.

## 3. Scoring (the design rubric)

Replaces `tournament.md` §2. Six criteria, each **0-10**, weighted total **0-100**; the shared
scoring rules (§3 there) still apply.

| Criterion | Weight | What it measures |
| --- | --- | --- |
| Layout, grouping & alignment | 25 | Related things sit together and unrelated things are separated, matching the task's mental model; no orphan control stranded from what it controls; the grid holds; edges line up across groups; optical alignment; gutters consistent; nothing drifting by a pixel or two |
| Spacing & sizing | 20 | One spacing scale honoured everywhere; each region's size matches its importance and content volume; no dead zones and no crammed regions; touch/click targets big enough; no magic numbers |
| Hierarchy & typography | 20 | Does the eye land in the intended order; prime real estate goes to the primary work area; DOM order matches visual order; type scale used with intent; weight and size doing the work instead of colour; measure (line length) readable |
| Colour, contrast & accessibility | 15 | Contrast ratios pass (AA at minimum); colour is never the only signal; focus/keyboard states exist; light and dark both handled if applicable |
| Fit to content, job & ergonomics | 12 | Serves the real content set, stress case included; the primary action is obvious; frequent controls sit near where the eye and pointer already are; destructive actions are not adjacent to routine ones; nothing important below the fold or clipped |
| States & responsiveness | 8 | Hover/active/disabled/focus, empty, loading, error, overflow; sane reflow/wrap/collapse at every rendered viewport; no horizontal overflow; priority content survives the smallest supported size |

On top of the shared rules, every score's reason names something **visible** in the render.

## 4. The alignment audit

Runs on round 0 and on each challenger up for the throne, with `references/checklist.md`, as the pre-crown
check (`tournament.md` §4.7). Write the result as a short list of hits and misses:

- shared edges and baselines
- gutter consistency, equal gaps for equivalent relationships
- optical vs. mathematical centring
- icon/text alignment
- container padding symmetry
- text alignment per column, numeric alignment
- overflow and truncation with the stress content
- rhythm of repeated blocks
- structural soundness — right layout primitives, survives content-length changes

Any miss holds Layout, grouping & alignment at **≤ 7**.

## 5. Judging and red lines

`tournament.md` §4.4, every version side by side, same content, same viewports, stress case
included. Every criterion verdict names something visible in the render.

**Red lines** — rank below every clean version regardless of score:

- the primary action is harder to find than in the champion,
- contrast fails AA on any text,
- the stress content breaks the layout,
- the project's existing design tokens were ignored in favour of invented ones,
- a binding, event or state was lost in the restructure.

## 6. Finish and apply

`tournament.md` §5 — the applied result re-rendered at every declared viewport with the full stress
set.

## 7. Final analysis

Format: `tournament.md` §6. This skill's table:

| Round | Design ideas (c1 · c2 · c3) | Render | Pool (best → worst) | Pre-crown check | Champion |
| --- | --- | --- | --- | --- | --- |
| 0 | current layout | clean | — | 4 misses (Layout ≤ 7) | R0 |
| 1 | `<idea>` · `<idea>` · `<idea>` | c3 console errors | 1c1 76 · R0 58 · 1c2 55 | clean | 1c1 |
| 2 | `<idea>` · `<idea>` · `<idea>` | clean | 1c1 78 · 2c2 74 · 2c1 70 · 2c3 61 | — | 1c1 |

Under **How we did it**, give the winner's skeleton and scales, and which idea from a losing
challenger survived into it. Under **Possible mistakes**, name what the apply-time render found, states not built,
contrast checked by eye, and what would need a bigger change than this loop allows.
