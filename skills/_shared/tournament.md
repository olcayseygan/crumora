# The tournament — shared rules

Loaded by `compose`, `humanize` and `evolve`. This file is the one definition of the loop; everything
here holds in each of them unless the skill says it overrides a section. The skill's own `SKILL.md`
carries only what is specific to its move: how a challenger is built, its rubric, its pre-crown
check, its extra red lines, its table.

`evolve` overrides these defaults: R0 is also gated and scored alone as a baseline, challengers are
bred from the leader instead of built from fresh ideas, both parents (leader and runner-up) sit in the pool as anchors, the top two carry forward
instead of one champion, the stop compares the best candidate with the best parent, and the cap is
6 rounds.

---

## 1. Setup invariants (round 0)

1. **Champion = what exists now.** If nothing exists yet, there is no Round 0; round 1's
   highest-ranked challenger that survives its pre-crown check becomes champion outright.
2. **Freeze the target.** 3-8 bullets — what it must do, which rules it must obey, what it must not
   break. Fixed for every round. A deliberate behaviour change is written as a bullet *before*
   round 1.
3. **Freeze the rubric** before round 1.
4. **Work folder:** `<scratchpad>/<skill>/<target-slug>/`, one `r<N>/` per round with one `c<k>/`
   per challenger. **The repo stays untouched until the final champion is decided.**
5. **Round log:** `<scratchpad>/<skill>/<target-slug>/rounds.md`, one line per finished round
   (round no, the ideas tried, gate results, the pass's ranking with totals, pre-crown check,
   champion).
6. **Round 0 runs the skill's pre-crown check on the current version** (§4.7), if the skill has one —
   its findings cap the champion in every pass until it is dethroned.

## 2. The code rubric

The default rubric when the target is code. `compose` and `humanize` each replace it with their own
rubric.

Five criteria, each **0-10**, weighted total **0-100**:

| Criterion | Weight | What it measures |
| --- | --- | --- |
| Correctness | 30 | Every spec/contract bullet; edge cases; wrong behaviour |
| House-rule fit | 25 | The project's own conventions — `CLAUDE.md`, contributing guide, lint config, surrounding idiom: architecture, single-source files, naming, comment style |
| Simplicity | 20 | Not line count but **concept count**: how many new types, how many indirections, how many rules a reader must hold in their head |
| Robustness | 15 | What breaks outside the happy path; lifecycle and re-entry; allocations; per-frame cost |
| Maintainability | 10 | How many places you touch to add one field; do names state intent; absence of dead flexibility |

## 3. The gate, then the scoring rules (MUST)

**The gate runs before the score.** This is the one gate definition; each skill points here and adds
only its extras. A challenger is not judged until it has passed:

- the project's build, type check, linter and the tests covering the target, wherever they exist;
- for an interface, also a clean render with **zero console errors** (warnings do not fail).

Outcome:

- **Red → one repair and re-run.** Still red → that challenger leaves the round unjudged; the others
  go on. All red → no challenger beats the champion this round (§5).
- **No runnable check exists** → say so in one line and write `unverified` in the score sheet for
  every version in the run, champion included.

Scoring rules:

- **No score without a reason**: half a sentence next to each criterion.
- The rubric **may be tailored to the target before round 1** (for a document rebuild, swap
  "Robustness" for "Fidelity to source"), but **once frozen it does not change**.
- Score by the criterion, **not by authorship**.
- **Only scores from the same pass compare.** The champion is re-judged in every pass as an
  unlabelled anchor; a judge drifts between calls, so no total carries from one pass to the next.
- **A measurable claim needs a measurement.** "Faster", "fewer allocations" score zero without a
  number next to them.

## 4. The round — three challengers, one blind judge

1. **Three ideas.** Before anything is built, write down three ideas, one sentence each — distinct
   from each other and from every idea already in the round log.
2. **Build in parallel.** One subagent per idea writes its challenger in `r<N>/c<k>/`. Each is handed
   the frozen target and rubric, the champion, the round log and its own idea — never the other
   challengers. Each runs the gate (§3) on its own challenger, repair included.
3. **Render scope (interfaces).** A round renders at the **narrowest and the widest declared
   viewport** (just the one, if only one is declared), with the stress content. Every declared
   viewport and the full stress set are checked only at apply (§5).
4. **One blind judge.** One **separate agent** gets the gated challengers **plus the champion**,
   shuffled and labelled `A`, `B`, `C`… with **no hint which is the incumbent or who wrote what**,
   together with the frozen target and rubric — for interfaces the renders (and the skill's traces),
   not the source. Per version: every criterion 0-10 with one concrete sentence pointing at something
   specific, the weighted total, any red line crossed. Judge in-line only when no subagent is
   available, and write `judged in-line` on that round's line.
5. **Red lines.** A missed spec/contract bullet or a violated project MUST rule is a red line; each
   skill adds its own. A version over a red line ranks below everything clean. Red lines worded
   against the champion are checked by the main thread after unblinding, from the judge's notes.
6. **Rank** by total. A challenger beats the champion only with a **strictly higher total in the
   same pass** and no red line. **Ties go to the champion.**
7. **Pre-crown check, down the ranking.** The highest-ranked challenger that beats the champion goes
   through the skill's pre-crown check, if it has one. Its caps lower that challenger's criterion
   scores in the pass; if the capped total no longer beats the champion's (itself capped by its own
   check, §1.6), the next challenger that beat the champion is checked, and so on. The round has no
   winner only when none survives. Every check's findings go into the round log and feed the next
   round's ideas.
8. **Crown** the first challenger that still beats the champion after its check; its pre-crown
   findings now cap it.

## 5. Stopping and applying

The loop ends on **the first round in which no challenger takes the throne** — all gated out, none
ahead of the champion, a red line, or the pre-crown check pulling every one of them back.

Hard cap: **4 rounds**. If a challenger still takes the throne at round 4, stop, say "round cap
reached" and note it in the table.

When the loop ends:

1. **Apply the final champion to the repo.** If the champion is Round 0, **change nothing** and say
   so plainly ("the existing version survived round 1").
2. **Verify after applying** — build, tests, console; for an interface, render **every declared
   viewport with the full stress set**. A regression found here is fixed in place once and verified
   again; if it is still there, it is reported under **Possible mistakes**.
3. **Do not delete** the scratchpad rounds. Print the path.
4. If the work is significant and the repo keeps progress/changelog docs, add a section.

## 6. Final analysis (output format)

The last message carries exactly these five headings — none skipped, nothing extra:

```
## What we set out to do
The frozen target: one paragraph plus bullets.

## What we did
Which version won, how many rounds, how often the throne changed hands, score movement,
and whether the gate ran (and on what) or came back unverified.

## How we did it
The winner's approach and why it won; which idea was salvaged from a losing challenger.

## Possible mistakes
An honest risk list: untested paths, assumptions, claims measured by eye, bullets taken
on trust, anything the apply-time check found and could not fix. Never empty.

## Rounds
<table — column shape is defined by each skill>
```

One sentence after the table: **why the loop ended** (no challenger took the throne at round N — on
the gate, the judge, a red line or the pre-crown check — or the round cap was reached).
