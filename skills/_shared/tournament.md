# The tournament — shared rules

Loaded by `rewrite`, `sharpen` and `reskin`. Everything here holds for all three. Each skill's own
`SKILL.md` carries only what is specific to its move: how a round produces a challenger, its rubric,
its extra red lines, its table.

---

## 1. Setup invariants (round 0)

1. **Champion = what exists now.** Read it properly, all of it. If nothing exists yet, there is no
   Round 0 and the first attempt becomes champion outright.
2. **Freeze the target.** 3-8 bullets — what it must do, which rules it must obey, what it must not
   break. Fixed for every round; a target that grows mid-run makes every earlier comparison
   worthless. A deliberate behaviour change is written as a bullet *before* round 1, never
   discovered in round 4.
3. **Freeze the rubric** before round 1.
4. **Work folder:** `<scratchpad>/<skill>/<target-slug>/`, one `r<N>/` per round holding that
   round's output. **The repo stays untouched until the final champion is decided.**
5. **Round log:** `<scratchpad>/<skill>/<target-slug>/rounds.md`, one line per finished round (round
   no, what it tried, scores, VS result, champion). If context gets compacted, the state survives
   here.

## 2. The code rubric

Used by `rewrite` and `sharpen`. `reskin` replaces it with its own design rubric.

Five criteria, each **0-10**, weighted total **0-100**:

| Criterion | Weight | What it measures |
| --- | --- | --- |
| Correctness | 30 | Every spec/contract bullet; edge cases; wrong behaviour |
| House-rule fit | 25 | The project's own conventions — `CLAUDE.md`, contributing guide, lint config, surrounding idiom: architecture, single-source files, naming, comment style |
| Simplicity | 20 | Not line count but **concept count**: how many new types, how many indirections, how many rules a reader must hold in their head |
| Robustness | 15 | What breaks outside the happy path; lifecycle and re-entry; allocations; per-frame cost |
| Maintainability | 10 | How many places you touch to add one field; do names state intent; absence of dead flexibility |

## 3. Scoring rules (MUST)

- **No score without a reason**: half a sentence of justification next to each criterion.
- The rubric **may be tailored to the target before round 1** (for a document rebuild, swap
  "Robustness" for "Fidelity to source"), but **once frozen it does not change**.
- Score by the criterion, **not by authorship**. Newer is not automatically better.
- **Nothing is ever re-scored.** A version is scored once and carries that score forward as
  champion; re-scoring the incumbent every round turns it into a moving target.
- **A measurable claim needs a measurement.** "Faster", "less garbage", "fewer allocations" score
  zero unless there is a number next to them. Unmeasured performance work is the most common way a
  loop convinces itself it is winning.

## 4. VS (head-to-head)

- Go criterion by criterion; for each one state **A or B, and why** — one concrete sentence.
  "Cleaner" without evidence does not count; point at something specific (in this situation X
  happens / this line does Y / this edge sits 3px off).
- Winner: **weighted majority of criteria**.
- **Ties go to the champion.** Changing the throne on a tie ships churn that buys nothing.
- **Red line:** a missed spec/contract bullet or a violated project MUST rule **loses the VS
  regardless of score**. Prettier-but-wrong does not win. Each skill adds its own red lines.
- Delegate judging to a separate agent **only if the user explicitly asks**.

## 5. Stopping and applying

Hard cap: **6 rounds**. If a challenger is still winning at round 6, stop, say "round cap reached"
and note it in the table.

When the loop ends:

1. **Apply the final champion to the repo.** If the champion is Round 0, **change nothing** and say
   so plainly ("the existing version survived 3 rounds of challenge").
2. **Verify after applying** — build, console, or a re-render. Applying into the real codebase often
   shifts things. Fix anything red.
3. **Do not delete** the scratchpad rounds; a losing attempt is often worth reading. Print the path.
4. If the work is significant and the repo keeps progress/changelog docs, add a section.

## 6. Final analysis (output format)

The last message carries exactly these five headings — none skipped, nothing extra:

```
## What we set out to do
The frozen target: one paragraph plus bullets.

## What we did
Which version won, how many rounds, how often the throne changed hands, score movement.

## How we did it
The winner's approach and why it won; which idea was salvaged from a losing round.

## Possible mistakes
An honest risk list: untested paths, assumptions, claims measured by eye, bullets taken
on trust. Do not leave it empty — "no risks" is rarely true.

## Rounds
<table — column shape is defined by each skill>
```

One sentence after the table: **why the loop ended** (challenger lost on score, on VS, on a red
line, or the round cap was reached).
