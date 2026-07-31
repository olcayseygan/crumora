---
name: refactor
description: Improves existing work in scored rounds instead of rewriting it. Each round attacks the champion's weakest criterion with a reviewable diff, scores the result, and fights it head-to-head (VS) against the current champion; the loop runs until a challenger fails to beat it on both score and VS, then reports a full analysis plus a round-by-round table. Use when the user says "/refactor", "refactor this and compare", "make this better", "polish this", "sharpen it", "refine it", "optimize it", "improve it until it can't be improved". For throwing the code away and starting over, use rewrite instead.
---

# refactor — sharpen it in place

Take what exists and **sharpen it, round after round**, until another pass stops being worth it.

Sibling of **rewrite**. Same tournament, opposite move:

| | rewrite | refactor |
| --- | --- | --- |
| Starting point | blank file, spec only | the champion's actual code |
| Round output | a whole new version | a **reviewable diff** |
| Question it answers | "is a different design better?" | "how good can *this* design get?" |
| Ends when | a fresh attempt stops winning | a diff stops being worth its cost |

If mid-run the honest answer becomes *"this needs to be thrown away, not patched"*, **stop and say
so**, then recommend `rewrite`. Grinding polish onto the wrong design is the failure mode this skill
has to avoid.

---

## 0. Pick the target

If the user passed an argument, that is the target (`/refactor src/parser.ts`). If not, ask **one
question**: what should be improved.

Then write the **behaviour contract** — 3-8 bullets of what must stay true no matter what changes.
This is not a wish list, it is a fence. Anything not in it is fair game to change; anything in it is
a regression if broken.

If the run is *meant* to change behaviour (fixing a known bug, tightening a limit), write that as an
explicit bullet before round 1. Silent behaviour changes discovered in round 4 poison every earlier
comparison.

## 1. Setup (round 0)

1. **Champion = the current code.** Read it properly, all of it.
2. **Freeze the rubric** (§3) and **score the champion now**. That score is Round 0's line in the
   table and the bar everything else has to clear.
3. The rubric scores immediately produce the **work queue**: the lowest-scoring criteria, worst
   first. That queue drives round order — it stops the loop from repainting whatever is already good.
4. **Work folder:** `<scratchpad>/refactor/<target-slug>/`. Each round keeps its diff and full file
   in `r<N>/`. The repo stays **untouched** until the final champion is decided.
5. **Round log:** `<scratchpad>/refactor/<target-slug>/rounds.md`, one line per finished round. If
   context gets compacted, the state survives here.

## 2. The round loop

Every round is these five steps:

**(a) Name the weakness.** One sentence: which criterion is being attacked and what specifically is
wrong (`Robustness 5 — the buffer is reallocated every frame, and a despawn mid-iteration throws`).
No round starts with "let me clean this up a bit".

**(b) Improve in place.** Start from the champion's code and **edit it**. The output must read as a
diff a reviewer could approve. Two hard limits:

- **No scope creep.** Adding capability is not improving. If the fix needs new behaviour, it belongs
  in the contract, agreed before the round.
- **If the diff touches more than ~60% of the target, it is a rewrite wearing a diff's clothes** —
  say so out loud, and either narrow it or hand off to `rewrite`.

**(c) Score + regression check.** Score the challenger with the frozen rubric. Then check it against
the champion **criterion by criterion**:

- Any drop in **Correctness** → **automatic loss**, no discussion.
- Any other criterion dropping more than **1 point** → automatic loss. Trading robustness for
  prettiness is not an improvement, it is a preference.

**(d) VS.** Head-to-head against the champion (§4).

**(e) Verdict.** The challenger takes the throne only if **all three** hold:

1. total score is at least **+2** over the champion (below that it is noise, not progress),
2. it wins the VS,
3. it survived the regression check.

Otherwise the champion holds and **the loop ends**. When a challenger wins, it carries **its own
score forward** as the champion's score — nothing is ever re-scored.

## 3. Scoring (the rubric)

Five criteria, each **0-10**, weighted total **0-100**:

| Criterion | Weight | What it measures |
| --- | --- | --- |
| Correctness | 30 | Every contract bullet, edge cases, wrong behaviour |
| House-rule fit | 25 | The project's own conventions — `CLAUDE.md`, contributing guide, lint config, surrounding idiom |
| Simplicity | 20 | Not line count but **concept count**: new types, indirections, rules a reader must hold in their head |
| Robustness | 15 | What breaks outside the happy path; lifecycle, re-entry, allocations, per-frame cost |
| Maintainability | 10 | How many places you touch to add one field; do names state intent |

Rules (MUST):

- **No score without a reason**: half a sentence of justification per criterion.
- The rubric **may be tailored to the target before round 1** (swap "Robustness" for "Fidelity to
  source" on a document), but **once frozen it does not change**.
- **A measurable claim needs a measurement.** "Faster", "less garbage", "fewer allocations" score
  zero points unless there is a number next to them. Unmeasured performance work is the most common
  way an improvement loop convinces itself it is winning.

## 4. VS (head-to-head)

- Go criterion by criterion; **A or B, and why**, one concrete sentence each. Point at the diff, not
  at a feeling.
- Then judge **change cost**, which exists only here and not in the rubric: *how much churn bought
  those points?* A +4 that rewrites 200 lines loses to a +3 that moves 20. Diff size, review effort
  and blast radius all count.
- Winner: **weighted majority of criteria**, with change cost as the tie-breaker.
- **Ties go to the champion.** Shipping a wash is pure churn.
- **Red line:** a broken contract bullet or a violated project MUST rule loses the VS regardless of
  score.
- Delegate judging to a separate agent only if the user explicitly asks.

## 5. Stopping

The loop ends on **any** of these — say which one happened:

- a challenger failed the verdict (§2e),
- every criterion sits at **9 or 10** and the remaining gaps are taste, not quality,
- the target turned out to need a rewrite (hand off to `rewrite`),
- **6 rounds** — the hard cap.

Then:

1. **Apply the final champion to the repo.** If the champion is still Round 0, **change nothing** and
   say so plainly ("three rounds of improvements all failed to clear the bar").
2. Verify the build / console output after applying and fix anything red.
3. **Do not delete** the scratchpad rounds; print the path — a rejected diff is often worth reading.
4. If the work is significant, add a section to the project's progress/changelog docs if that
   convention exists.

## 6. Final analysis (output format)

The last message carries exactly these five headings:

```
## What we set out to do
The behaviour contract and which weaknesses the run was aiming at.

## What we did
Which version won, how many rounds, how often the throne changed hands, total score
movement (e.g. 61 → 78).

## How we did it
Round by round: which weakness each diff attacked and what the fix actually was.
Name the rounds that failed and what they taught.

## Possible mistakes
An honest risk list: untested paths, assumptions, claims measured by eye, contract
bullets taken on trust. Do not leave it empty — "no risks" is rarely true.

## Rounds
<table>
```

Table template:

| Round | Weakness attacked | Diff | Score (Δ) | VS | Champion |
| --- | --- | --- | --- | --- | --- |
| 0 | — | — | 61 | — | R0 |
| 1 | Robustness 5 — per-frame realloc | +12 −9 | 71 (+10) | R1 wins (4-1) | R1 |
| 2 | Simplicity 6 — two state flags | +40 −31 | 73 (+2) | R1 wins (3-2, cost) | R1 |

One sentence after the table: **why the loop ended**, using the §5 wording.

---

## MUST summary

- Improve in place; a >60% diff is a rewrite — declare it and hand off to `rewrite`.
- No scope creep; behaviour changes go in the contract *before* the round.
- Rubric freezes before round 1; a winner carries its own score forward, nothing is re-scored.
- Correctness may never drop; no other criterion may drop more than 1.
- Taking the throne needs **+2 score, a VS win, and a clean regression check** — all three.
- Change cost is judged in the VS; measurable claims need numbers.
- Ties go to the champion. 6 rounds maximum.
- Final analysis: five headings plus the table, nothing skipped.
