---
name: rewrite
description: Rebuilds a piece of work from scratch, scores it, and pits it head-to-head (VS) against the previous version. Runs in rounds; each round challenges the reigning champion, and the loop continues until a challenger fails to win on both score and VS. Ends with a full analysis plus a round-by-round summary table. Use when the user says "/rewrite", "rewrite this from scratch", "remake it", "redo this from scratch", "rewrite it and compare", "try a different approach and see which is better". For improving existing code in place use sharpen; for redesigning an interface use reskin.
---
# rewrite — rebuild it from scratch

Do the work **once more, from scratch**; **score** it; **fight** it against the previous version;
the winner takes the throne; repeat until a challenger loses; finish with an **analysis and a table**.

The goal is not "polish it a bit" — it is to **measure whether rewriting it a different way is
actually better**. That is why copy-paste between rounds is banned and every verdict comes from a
rubric frozen before the first round.

Siblings, same tournament, different move: **sharpen** improves the existing code in place with
reviewable diffs; **reskin** redesigns an interface and judges the pixels; **tribunal** builds
nothing and judges what is already there. If the honest answer here turns out to be *"the design is
fine, it just needs sharpening"*, hand off to `sharpen`.

**Read `../_shared/tournament.md` first** — setup invariants, the code rubric, scoring rules, VS
rules, stopping/applying and the final-analysis format all live there and are not repeated below.

---

## 0. Pick the target

If the user passed an argument, that is the target (`/rewrite GameUI cast ring`). If not, ask **one
question**: what should be remade. A target can be a file, a class, a function, a system, or a
document.

Then write the **spec** — the frozen target of `tournament.md` §1.2: what this code must do, which
rules it must obey, what it must not break.

## 1. Setup (round 0)

`tournament.md` §1, with the work folder at `<scratchpad>/rewrite/<target-slug>/` and each round's
version kept as its **own whole file** in `r<N>/`.

## 2. The round loop

Every round is these four steps:

**(a) Write from scratch.** Without looking at the champion's code — working from the spec — write a
new version. No block-copying from the existing implementation. Each round must deliberately try a
**different approach** (different data structure, different split of responsibility, different axis
of simplification); writing the same idea twice wastes the round. State the round's approach in one
sentence *before* writing the code.

**(b) Score.** Score the challenger against the frozen rubric (`tournament.md` §2-3). The champion
keeps the score it earned.

**(c) VS.** Fight challenger against champion criterion by criterion (`tournament.md` §4).

**(d) Verdict.** If the challenger wins **both the total score and the VS**, it becomes the new
champion and another round starts. If it loses either one, **the loop ends**.

## 3. Scoring, VS, applying

All shared: rubric `tournament.md` §2, scoring rules §3, VS §4, stopping and applying §5. No extra
rules of its own — a rewrite's only red line is the shared one.

## 4. Final analysis

Format: `tournament.md` §6. This skill's table:

| Round | Approach | Score | VS | Champion |
| --- | --- | --- | --- | --- |
| 0 | existing code | 68 | — | R0 |
| 1 | single-pass buffer | 74 | R1 wins (3-2) | R1 |
| 2 | event-driven | 71 | R1 wins (4-1) | R1 |

Under **How we did it**, name the winner's data structure and split of responsibility, and which
idea was salvaged from a losing round.

---

## MUST summary

- Read `../_shared/tournament.md` before round 1; its rules bind this skill.
- Write from scratch, no copying; every round tries a different approach.
- The spec and rubric freeze before round 1; nothing is re-scored.
- Taking the throne needs **both** the score and the VS. Ties go to the champion.
- The repo stays untouched until the final champion is decided, then it is applied and verified.
- 6 rounds maximum.
- Final analysis: five headings plus the table, nothing skipped.
