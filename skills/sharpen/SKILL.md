---
name: sharpen
description: Sharpens existing work in scored rounds instead of rewriting it. Each round attacks the champion's weakest criterion with a reviewable diff, scores the result, and fights it head-to-head (VS) against the current champion; the loop runs until a challenger fails to beat it on both score and VS, then reports a full analysis plus a round-by-round table. Use when the user says "/sharpen", "sharpen this", "refactor this and compare", "improve it until it can't be improved", "polish this until it stops getting better", "refine it round by round". This runs up to six scored rounds — for a single one-shot cleanup, plain editing is cheaper. For throwing the code away and starting over, use rewrite instead.
---
# sharpen — improve it in place

Take what exists and **sharpen it, round after round**, until another pass stops being worth it.

Sibling of **rewrite**. Same tournament, opposite move:

| | rewrite | sharpen |
| --- | --- | --- |
| Starting point | blank file, spec only | the champion's actual code |
| Round output | a whole new version | a **reviewable diff** |
| Question it answers | "is a different design better?" | "how good can *this* design get?" |
| Ends when | a fresh attempt stops winning | a diff stops being worth its cost |

If mid-run the honest answer becomes *"this needs to be thrown away, not patched"*, **stop and say
so**, then recommend `rewrite`. Grinding polish onto the wrong design is the failure mode this skill
has to avoid.

**Read `../_shared/tournament.md` first** — setup invariants, the code rubric, scoring rules, VS
rules, stopping/applying and the final-analysis format all live there and are not repeated below.

---

## 0. Pick the target

If the user passed an argument, that is the target (`/sharpen src/parser.ts`). If not, ask **one
question**: what should be improved.

Then write the **behaviour contract** — the frozen target of `tournament.md` §1.2, phrased as a
fence: 3-8 bullets of what must stay true no matter what changes. Anything not in it is fair game;
anything in it is a regression if broken.

## 1. Setup (round 0)

`tournament.md` §1, work folder `<scratchpad>/sharpen/<target-slug>/`, each round keeping its **diff
and full file** in `r<N>/`. Two additions specific to this skill:

- **Score the champion now.** That score is Round 0's line in the table and the bar everything else
  has to clear.
- **The scores are the work queue.** Lowest-scoring criteria first — that queue drives round order
  and stops the loop from repainting whatever is already good.

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

**(c) Score + regression check.** Score the challenger with the frozen rubric, then check it against
the champion criterion by criterion:

- Any drop in **Correctness** → **automatic loss**, no discussion.
- Any other criterion dropping more than **1 point** → automatic loss. Trading robustness for
  prettiness is not an improvement, it is a preference.

**(d) VS.** Head-to-head against the champion (§3).

**(e) Verdict.** The challenger takes the throne only if **all three** hold:

1. total score is at least **+2** over the champion (below that it is noise, not progress),
2. it wins the VS,
3. it survived the regression check.

Otherwise the champion holds and **the loop ends**.

## 3. VS — the change-cost addition

`tournament.md` §4, plus one criterion that exists only here and never in the rubric: **change
cost** — *how much churn bought those points?* A +4 that rewrites 200 lines loses to a +3 that moves
20. Diff size, review effort and blast radius all count, and change cost is the tie-breaker on a
split criterion count.

## 4. Stopping

The loop ends on **any** of these — say which one happened:

- a challenger failed the verdict (§2e),
- every criterion sits at **9 or 10** and the remaining gaps are taste, not quality,
- the target turned out to need a rewrite (hand off to `rewrite`),
- **6 rounds** — the shared hard cap.

Then apply and verify per `tournament.md` §5.

## 5. Final analysis

Format: `tournament.md` §6. This skill's table:

| Round | Weakness attacked | Diff | Score (Δ) | VS | Champion |
| --- | --- | --- | --- | --- | --- |
| 0 | — | — | 61 | — | R0 |
| 1 | Robustness 5 — per-frame realloc | +12 −9 | 71 (+10) | R1 wins (4-1) | R1 |
| 2 | Simplicity 6 — two state flags | +40 −31 | 73 (+2) | R1 wins (3-2, cost) | R1 |

Under **How we did it**, go round by round: which weakness each diff attacked, what the fix was, and
what the failed rounds taught.

---

## MUST summary

- Read `../_shared/tournament.md` before round 1; its rules bind this skill.
- Improve in place; a >60% diff is a rewrite — declare it and hand off to `rewrite`.
- No scope creep; behaviour changes go in the contract *before* the round.
- Correctness may never drop; no other criterion may drop more than 1.
- Taking the throne needs **+2 score, a VS win, and a clean regression check** — all three.
- Change cost is judged in the VS; measurable claims need numbers.
- Ties go to the champion. 6 rounds maximum.
- Final analysis: five headings plus the table, nothing skipped.
