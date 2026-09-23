---
name: evolve
description: Improves code, an interface or a document in scored generations instead of blank-canvas rematches. Each round breeds several candidates from the best versions of the round before — refining the leader and grafting the runner-up's strongest idea into it — gates every candidate on the project's build, type check, linter and tests (or a clean render), then has one blind judge in a separate agent score the whole pool against a frozen rubric, the carried-forward parents included unlabelled as anchors. The top two go on to breed the next round. The loop climbs as long as the best score keeps rising, stops the first round it does not, and never runs past 10 rounds; then it applies the winner and reports a full analysis with a round-by-round score curve. Use when the user says "/evolve", "evolve this", "keep improving it round by round", "iterate until the score stops rising", "carry the best forward", "hill-climb this", or the Turkish "round round iyilestir", "en iyileri bir sonraki rounda aktar", "puan artmayana kadar devam et", "evrimlestir". For rebuilding a screen from a blank canvas each round use compose; for the interaction flow use humanize; for a fixed rule pass use lint.
---

# evolve — breed the best forward

Take what exists; **breed a few candidates from it**; **gate** them; let a **blind judge score the
whole pool**; carry the **top two** into the next round; repeat while the best score **keeps
rising**. The first round that does not raise it ends the run.

`compose` and `humanize` start every round from a blank canvas and fight one challenger against one
champion. This one is the opposite move: **nothing is thrown away that scored well**. Each round
stands on the shoulders of the last, so the score is a curve, and the curve is the verdict.

**Read `../_shared/tournament.md` first.** Its §1 (setup), §2 (code rubric), §3 (the gate and the
scoring rules) and §6 (final-analysis format) bind this skill. Three things here **override** it:

- §3 *"nothing is ever re-scored"* — here the parents **re-enter every judging pass** as blind
  anchors (§3 below); that is what makes one round's score comparable to the next.
- §4 VS — replaced by the pooled blind scoring in §3 below.
- §5 stopping — replaced by §4 below: stop on the **first** round without an increase, **10 rounds**
  maximum.

---

## 0. Pick the target and the rubric

If the user passed an argument, that is the target (`/evolve the pathfinding cache`). If not, ask
**one question**: which file, function, screen or document.

Pick the rubric by what is being improved, then freeze it with the target (`tournament.md` §1):

| Target | Rubric | Gate | Also run every round |
| --- | --- | --- | --- |
| Code | `tournament.md` §2 | build, type check, linter, tests covering the target | — |
| How an interface looks and reads | `../compose/SKILL.md` §3, its red lines in §5 | clean render, clean console | the alignment audit, `../compose/SKILL.md` §4 |
| How an interface behaves in a person's hands | `../humanize/SKILL.md` §4, its red lines in §5 | clean render, every task completable | the walk, `../humanize/SKILL.md` §3 |
| A document | `tournament.md` §2, tailored before round 1 (e.g. Robustness → Fidelity to source) | whatever renders or validates it | — |

For the two interface rows, also freeze what `compose` / `humanize` freeze in their §0 — the job, the
content set with its stress case, the people and tasks — and load the design skill they name.

## 1. Setup (round 0)

`tournament.md` §1, work folder `<scratchpad>/evolve/<target-slug>/`. Round 0 is the current
version, copied into `r0/`; run the gate on it and have it scored alone by the blind judge (§3) so
the curve has a baseline. **Parents for round 1 = R0.**

If nothing exists yet, round 1 breeds from the frozen target alone and there is no baseline — its
best candidate becomes the first champion.

## 2. The round

Round N has **two parents**: the **leader** (top score of round N-1's pass) and the **runner-up**
(second). Round 1 has only the leader.

**(a) Read the parents' score sheets.** The leader's two lowest-scoring criteria are this round's
work queue; the runner-up's highest-scoring criterion *where it beat the leader* is the idea worth
grafting.

**(b) Breed three candidates**, each in `r<N>/c<k>/`, each starting **from the leader**, each with
**one stated move** written down before touching anything:

1. **Fix** — attacks the leader's weakest criterion.
2. **Fix** — attacks the second weakest, or the weakest from a different angle than candidate 1.
3. **Graft** — carries the runner-up's winning idea into the leader. In round 1, or when the
   runner-up won nothing, this becomes a third fix with a different move.

A candidate that restates a move already tried in an earlier round, with different numbers, is a
wasted candidate — name something new. Candidates may be written in parallel by subagents, each
handed the leader, its move and the frozen target — never the other candidates.

**(c) Gate each candidate** (`tournament.md` §3, with the gate from the table in §0). One repair
attempt; still red → the candidate is out of the pool. All three out → the round has no increase
(§4).

## 3. The judging pass — blind, pooled, anchored

One **separate agent** scores the whole pool in one pass: the surviving candidates **plus both
parents**, shuffled, labelled `A`, `B`, `C`… with no hint which is a parent, which is new, or who
wrote what. It gets the frozen target and the frozen rubric, nothing else. For interfaces it gets
the renders (and for behaviour, the task traces), not the source.

For every version it returns every criterion's **0-10 with one concrete sentence** that points at
something specific (this line does X, this edge sits 3px off, task 2 costs four steps here), the
weighted total, and any **red line** the version crosses. Judge in-line only when no subagent is
available, and write `judged in-line` on that round's line.

- A version over a red line (the rubric's own, plus `tournament.md` §4's missed contract bullet or
  broken project MUST rule) **ranks below everything clean**, whatever its total.
- Rank by total. **Ties go to the parent** — churn that buys nothing is not an increase.
- **Leader of round N** = rank 1, **runner-up** = rank 2 — parent or candidate, whichever scored.
  A parent can carry forward; that is the point.

Scoring the parents again in every pass is deliberate: an LLM judge drifts between calls, so a score
from round 3 cannot be compared with one from round 5. What can be compared is two versions **in the
same pass**. The leader's new score next to its old one also shows the drift — write both down.

## 4. Stopping

After each pass, compare **the best candidate** with **the best parent, in the same pass**:

- **Candidate strictly higher** → the score rose; it is rank 1, so it leads the next round.
- **Not higher** (lower, tied, red-lined, or every candidate failed the gate) → **stop**. The
  best parent is the champion.
- **Round 10 finished** → stop, say "round cap reached", even if the curve is still rising.

Append the round to `rounds.md` (`tournament.md` §1.5) before starting the next one.

Then apply and verify exactly as `tournament.md` §5 steps 1-4. If the champion is R0, **change
nothing** and say so. For an interface, re-render the applied result and look at it once more.

## 5. Final analysis

Format: `tournament.md` §6. This skill's table has one row per round:

| Round | Moves | Gate | Pool (best → worst) | Best parent | Best candidate | Δ | Carried forward |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | current version | green | R0 61 | — | — | — | R0 |
| 1 | fix naming · fix edge cases · fix allocations | 3/3 green | c2 72 · c1 68 · R0 60 · c3 57 | R0 60 | c2 72 | +12 | R1c2, R1c1 |
| 2 | fix lifecycle · fix allocations · graft c1's early return | 2/3 green | c3 79 · R1c2 71 · c1 70 · R1c1 66 | R1c2 71 | c3 79 | +8 | R2c3, R1c2 |
| 3 | fix naming · fix tests · graft R1c2's guard | 3/3 green | R2c3 80 · c1 78 · c3 77 · c2 74 · R1c2 70 | R2c3 80 | c1 78 | −2 | — |

The best parent's score is the one **from that round's pass**, not the one it earned when it was
born. Under **How we did it**, trace the winner's lineage back to R0 — which move each generation
added and which graft survived. Under **Possible mistakes**, name at least: judge drift (the
leader's score across passes), the local-optimum risk of building on one line (the run never tried
a blank canvas — `compose` or `humanize` does), and anything the gate could not check.

The sentence after the table says why the loop ended: **no increase at round N**, or **round cap
reached**.

---

## MUST summary

- Read `../_shared/tournament.md` first; its §1, §2, §3 and §6 bind this skill, §4 and §5 are
  replaced here.
- Freeze the target and pick and freeze the rubric by what is improved, before round 1.
- Three candidates per round, all bred from the leader: two fixes aimed at its weakest criteria, one
  graft of the runner-up's winning idea. Each names one new move.
- Gate every candidate before it is judged; red after one repair is out of the pool.
- One blind judge in a separate agent scores the whole pool in one pass, parents included and
  unlabelled; red lines rank below everything clean; ties go to the parent.
- The top two of the pass carry forward as the next round's leader and runner-up.
- Stop on the first round whose best candidate does not strictly beat the best parent in the same pass;
  10 rounds maximum.
- The repo stays untouched until the champion is decided; then apply, verify, keep the scratchpad.
- Final analysis: five headings plus the per-round table and the lineage, nothing skipped.
