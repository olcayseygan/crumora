---
name: evolve
description: Improves code, an interface or a document in scored generations instead of blank-canvas rematches. Each round breeds candidates from the top two versions of the round before, gates every candidate on the project's build, type check, linter and tests, and for an interface also a clean render, then one blind judge in a separate agent scores the pool on a frozen rubric, the parents included unlabelled as anchors. Stops the first round the best score does not rise, never runs past 6 rounds, then applies the winner and reports a full analysis with a round-by-round score curve. Use when the user says "/evolve", "evolve this", "keep improving it round by round", "iterate until the score stops rising", "carry the best forward", "hill-climb this", or the Turkish "round round iyilestir", "en iyileri bir sonraki rounda aktar", "puan artmayana kadar devam et", "evrimlestir". For rebuilding a screen from a blank canvas each round use compose; for the interaction flow use humanize; for a fixed rule pass use lint.
---

# evolve — breed the best forward

Breed candidates from the best versions so far, gate them, let a blind judge score the whole pool,
carry the top two forward. The first round that does not raise the best score ends the run.

**Read `../_shared/tournament.md` first.** It defines the loop and binds this skill — gate, parallel
builders, one blind pooled judge, red lines, pre-crown check, apply and verify — except for these
overrides:

- **§1** — R0 is also gated and scored alone by the judge as the curve's baseline (§1 below).
- **§4.1-§4.2 ideas** — candidates are bred from the leader (§2 below), not built from fresh ideas.
- **§4.4 pool** — both parents, leader and runner-up, sit in the pool as anchors, not one champion.
- **§4.6-§4.8 throne** — ranks 1 and 2 carry forward; the best candidate must strictly beat the best
  parent of the same pass (§3-§4 below).
- **§5 cap** — **6 rounds**; the end sentence reads **no increase at round N** or **round 6
  reached**.

## 0. Target and rubric

The argument is the target (`/evolve the pathfinding cache`); without one, ask one question: which
file, function, screen or document. Pick the rubric by what is improved and freeze it with the
target (`tournament.md` §1):

| Target | Rubric | Gate: `tournament.md` §3, plus | Pre-crown check (`tournament.md` §4.7) |
| --- | --- | --- | --- |
| Code | `tournament.md` §2 | — | — |
| How an interface looks and reads | `../compose/SKILL.md` §3, its red lines in §5 | `../compose/SKILL.md` §2(c) | the alignment audit (`../compose/SKILL.md` §4) and `../compose/references/checklist.md`, with the Layout cap of compose §4 |
| How an interface behaves in a person's hands | `../humanize/SKILL.md` §4, its red lines in §5 | `../humanize/SKILL.md` §2(c), then the walk (`../humanize/SKILL.md` §3) whose traces the judge reads | `../humanize/references/interaction.md`, with the caps of humanize §4 |
| A document | `tournament.md` §2, tailored before round 1 | whatever renders or validates it | — |

For the interface rows, also freeze what `compose` / `humanize` freeze in their §0, render at the
round's viewports (`tournament.md` §4.3) and load the design skill they name. Their red lines are
written against "the champion"; here read **the best parent in the same pass** for it. Every parent,
leader or runner-up, went through the pre-crown check before it was carried and stays capped by its
findings.

## 1. Round 0

Work folder `<scratchpad>/evolve/<target-slug>/`. R0 is the current version in `r0/`, gated and
scored alone by the blind judge (§3) as the curve's baseline. If nothing exists yet, there is no R0: round 1 builds
three fresh candidates from the frozen target, as `tournament.md` §1.1 and §4.1-§4.2, judged with no
parent in the pool and no stop comparison. Down the ranking (§4.7 there), the first candidate to
survive its pre-crown check is crowned leader and the next survivor becomes runner-up; leader and
parent comparisons start at round 2. None survives → stop, nothing applied.

## 2. The round

Parents of round N: the **leader** (rank 1 of the previous pass) and the **runner-up** (rank 2).
Round 1 has only R0 (or no parent at all, §1).

Breed **three candidates** in `r<N>/c<k>/`, all from the leader, each with one move written down
before any edit: two fixes aimed at the leader's weakest criteria, and one graft of the runner-up's
idea where it beat the leader (a third fix when there is none). No move already tried in an earlier
round. Builders run in parallel as in `tournament.md` §4.2, each handed the leader and its own move
instead of a fresh idea.

Gate each candidate (the table's gate column, `tournament.md` §3). All out → no increase (§4).

## 3. The judging pass

`tournament.md` §4.4-§4.6, with the surviving candidates **plus both parents** in the pool, no hint
which is a parent. Ties go to the parent. Before ranks 1 and 2 are fixed, each candidate in line for
either goes through the row's pre-crown check (§4.7 there), highest-ranked first; its caps re-rank it,
and the check moves down the pool until both places hold checked versions. Ranks 1 and 2 become the
next leader and runner-up, parent or candidate.

Write the leader's new score beside its old one; the gap is the judge's drift.

## 4. Stopping

Compare the best candidate with the best parent **in the same pass**:

- Strictly higher → the score rose; next round.
- Not higher (lower, tied, red-lined, every candidate pulled back by the pre-crown check, all gated out) → stop; the
  best parent is champion.
- Round 6 finished → stop, even if still rising.

Append each round to `rounds.md` before the next: round, moves, gate, the pass's ranking with
scores, pre-crown check, carried forward. Then apply and verify as `tournament.md` §5 steps 1-4; a
champion of R0 changes nothing, and say so.

## 5. Final analysis

`tournament.md` §6, with one row per round:

| Round | Moves | Gate | Pool (best → worst) | Best parent | Best candidate | Pre-crown check | Δ | Carried forward |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

A parent's score is the one from that round's pass. **How we did it** traces the winner's lineage
back to R0 — the move each generation added, which graft survived. **Possible mistakes** names at
least judge drift, the local optimum of building on one line (no blank-canvas run — `compose` or
`humanize` does that), and whatever the gate could not check. The sentence after the table: **no
increase at round N**, or **round 6 reached**.
