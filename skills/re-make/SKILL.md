---
name: re-make
description: Rebuilds a piece of work from scratch, scores it, and pits it head-to-head (VS) against the previous version. Runs in rounds; each round challenges the reigning champion, and the loop continues until a challenger fails to win on both score and VS. Ends with a full analysis plus a round-by-round summary table. Use when the user says "/re-make", "redo this from scratch", "rewrite it and compare", "try a different approach and see which is better". For improving existing code in place use re-master; for redesigning an interface use re-design.
---

# re-make

Do the work **once more, from scratch**; **score** it; **fight** it against the previous version;
the winner takes the throne; repeat until a challenger loses; finish with an **analysis and a table**.

The goal is not "polish it a bit" — it is to **measure whether rewriting it a different way is
actually better**. That is why copy-paste between rounds is banned and every verdict comes from a
rubric frozen before the first round.

Siblings, same tournament, different move: **re-master** improves the existing code in place with
reviewable diffs; **re-design** redesigns an interface and judges the pixels; **re-view** builds
nothing and judges what is already there. If the honest answer here turns out to be *"the design is
fine, it just needs sharpening"*, hand off to `re-master`.

---

## 0. Pick the target

If the user passed an argument, that is the target (`/re-make GameUI cast ring`). If not, ask **one
question**: what should be remade. A target can be a file, a class, a function, a system, or a
document.

Once the target is clear, **write the spec** (3-8 bullets: what this code must do, which rules it
must obey, what it must not break). The spec is **fixed for every round** — growing the target
mid-run makes the comparison meaningless.

## 1. Setup (round 0)

1. **Champion = what exists now.** Take the target's current code as-is; that is "Round 0 /
   incumbent". If nothing exists yet, there is no Round 0 and the first version written becomes
   champion outright.
2. **Open a work folder:** `<scratchpad>/re-make/<target-slug>/`. Each round's output lives in
   `r<N>/` as its **own file**. The repo stays **untouched** until the final champion is decided.
3. **Round log:** `<scratchpad>/re-make/<target-slug>/rounds.md`. Append one line per finished round
   (round no, approach summary, scores, VS result, champion). If context gets compacted, the state
   survives here.
4. **Freeze the rubric** (§3). It is written before round 1 and **never changed after**.

## 2. The round loop

Every round is these four steps:

**(a) Write from scratch.** Without looking at the champion's code — working from the spec — write a
new version. No block-copying from the existing implementation. Each round must deliberately try a
**different approach** (different data structure, different split of responsibility, different axis
of simplification); writing the same idea twice wastes the round. State the round's approach in one
sentence *before* writing the code.

**(b) Score.** Score the challenger against the rubric (§3). **The champion is never re-scored** —
it gets its score once, in round 1, and keeps it; re-scoring the incumbent every round turns it into
a moving target.

**(c) VS.** Fight challenger against champion **criterion by criterion** (§4).

**(d) Verdict.** If the challenger wins **both the total score and the VS**, it becomes the new
champion and another round starts. If it loses either one, **the loop ends**.

Safety brake: **6 rounds maximum**. If a challenger is still winning at round 6, stop, note it in
the table, and say "round cap reached" — looping forever burns the user's time.

## 3. Scoring (the rubric)

Five criteria, each **0-10**, weighted total **0-100**:

| Criterion | Weight | What it measures |
| --- | --- | --- |
| Correctness | 30 | Does it satisfy every spec bullet; edge cases; wrong behaviour |
| House-rule fit | 25 | The project's own conventions — `CLAUDE.md`, contributing guide, lint config, surrounding idiom: architecture, single-source files, naming, comment style |
| Simplicity | 20 | Not line count but **concept count**: how many new types, how many indirections, how many rules a reader must hold in their head |
| Robustness | 15 | What breaks outside the happy path; lifecycle and re-entry; allocations; per-frame cost |
| Maintainability | 10 | How many places you touch to add one field; do names state intent; absence of dead flexibility |

Rules (MUST):

- **No score without a reason**: half a sentence of justification next to each criterion.
- The rubric **may be tailored to the target before round 1** (e.g. for a document remake, swap
  "Robustness" for "Fidelity to source"), but **once frozen it does not change**.
- Score by the criterion, **not by authorship**. Newer is not automatically better.

## 4. VS (head-to-head)

- Go criterion by criterion; for each one state **A or B, and why** — one sentence of reasoning.
  "Cleaner" without evidence does not count; point at a concrete difference (in this situation X
  happens / this line does Y).
- Winner: **weighted majority of criteria**.
- **Ties go to the champion.** Changing the throne on a tie means shipping a change that buys
  nothing.
- **Red line:** if the challenger misses a spec bullet or violates a project MUST rule, it **loses
  the VS regardless of score**. Prettier-but-wrong does not win.
- If the user explicitly asks for it, VS judging can be delegated to a separate agent; **do not
  delegate unless asked**.

## 5. Finish and apply

When the loop ends:

1. **Apply the final champion to the repo.** If the champion is Round 0, **change nothing** and say
   so plainly ("the existing version survived 3 rounds of challenge").
2. After applying, verify the build / console output and fix anything red — a remake must not leave
   the repo broken.
3. **Do not delete** the scratchpad round files; the user may want to see a losing version. Print
   the path.
4. If the work is significant, add a section to the repo's progress/changelog docs if that
   convention exists.

## 6. Final analysis (output format)

The last message carries exactly these five headings:

```
## What we set out to do
The spec: one paragraph plus bullets.

## What we did
Which version won, how many rounds it took, how many times the throne changed hands.

## How we did it
The winner's approach: which data structure / split of responsibility, why it won, which
idea was salvaged from a losing round.

## Possible mistakes
An honest risk list: untested paths, assumptions, unmeasured performance claims, spec
bullets not met. Do not leave it empty — "no risks" is rarely true.

## Rounds
<table>
```

Table template:

| Round | Approach | Score | VS | Champion |
| --- | --- | --- | --- | --- |
| 0 | existing code | 68 | — | R0 |
| 1 | single-pass buffer | 74 | R1 wins (3-2) | R1 |
| 2 | event-driven | 71 | R1 wins (4-1) | R1 |

One sentence after the table: **why the loop ended** (challenger lost on score, on VS, on both, or
the round cap was reached).

---

## MUST summary

- Write from scratch, no copying; every round tries a different approach.
- The rubric freezes before round 1; the champion is never re-scored.
- Ties go to the champion; a spec or project-rule violation is an automatic loss.
- The repo stays untouched until the final champion is decided, then it is applied and verified.
- 6 rounds maximum.
- Final analysis: five headings plus the table, nothing skipped.
