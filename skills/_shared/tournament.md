# The tournament — shared rules

Loaded by `compose` and `humanize`. Everything here holds in either mode. The skill's own `SKILL.md` carries
only what is specific to its move: how a round produces a challenger, its rubric, its extra red
lines, its table.

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

**The gate runs before the score.** A challenger is not scored until the target's own checks have
been run against it and come back clean — build, type check, linter, and the tests covering the
target, whatever of these the project actually has. Run them; the result is binary:

- **Anything red → the round is lost.** No score, no VS, no argument. The challenger may be repaired
  and the gate re-run **once** inside the same round; a second red ends the round.
- **No runnable check exists** → say so in one line and write `unverified` next to Correctness for
  every version in the run, champion included. "There are no tests here" is a finding to report, not
  a reason to skip the step quietly.

Reading code is not running it. Correctness carries the heaviest weight in the rubric and is the
easiest criterion to award by wishful reading; the gate is the only thing standing between a score
and an opinion.

- **No score without a reason**: half a sentence of justification next to each criterion.
- The rubric **may be tailored to the target before round 1** (for a document rebuild, swap
  "Robustness" for "Fidelity to source"), but **once frozen it does not change**.
- Score by the criterion, **not by authorship**. Newer is not automatically better.
- **Nothing is ever re-scored.** A version is scored once and carries that score forward as
  champion; re-scoring the incumbent every round turns it into a moving target.
- **A measurable claim needs a measurement.** "Faster", "less garbage", "fewer allocations" score
  zero unless there is a number next to them. Unmeasured performance work is the most common way a
  loop convinces itself it is winning.

## 4. VS (head-to-head) — the VS decides the throne

**The head-to-head is the verdict; the total score is narrative and a tie-break, not the
decision.** Ranking two concrete versions against each other is a judgement that holds up; deciding
whether a criterion deserves a 7 or an 8 in the abstract is not. A challenger that wins the VS takes
the throne even if its total came out lower, and one that loses the VS never takes it however high
it scored. The score still earns its place — it drives the work queue, it makes drift visible across
rounds, and it breaks a split VS — but it does not crown anything.

- **Judge blind, in a separate agent — this is the default, not an option.** The two versions go to
  the judging agent as **A** and **B**, in an order chosen without reference to which is champion,
  together with the frozen rubric and the target, and with **no indication of which one is the
  incumbent or who wrote either**. Whoever wrote a version cannot rank it honestly; a frozen rubric
  stops the goalposts moving but does nothing about that. Judge in-line only when no subagent is
  available, and write `judged in-line` on that round's line.
- Go criterion by criterion; for each one state **A or B, and why** — one concrete sentence.
  "Cleaner" without evidence does not count; point at something specific (in this situation X
  happens / this line does Y / this edge sits 3px off).
- Winner: **weighted majority of criteria**. A split decision is settled by the total score, and if
  that is level too, by the champion.
- **Ties go to the champion.** Changing the throne on a tie ships churn that buys nothing.
- **Red line:** a missed spec/contract bullet or a violated project MUST rule **loses the VS
  regardless of score**. Prettier-but-wrong does not win. Each skill adds its own red lines.

## 5. Stopping and applying

The loop ends on **two consecutive challenger losses**, not on the first one. Round quality is
high-variance: one attempt that loses says that attempt was weak, not that there is nothing left to
find. A round lost on the gate counts as a loss like any other, and **the round after a loss must
name a different move** — repeating the losing idea with different padding throws away the second
life.

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
Which version won, how many rounds, how often the throne changed hands, score movement,
and whether the gate ran (and on what) or came back unverified.

## How we did it
The winner's approach and why it won; which idea was salvaged from a losing round.

## Possible mistakes
An honest risk list: untested paths, assumptions, claims measured by eye, bullets taken
on trust. Do not leave it empty — "no risks" is rarely true.

## Rounds
<table — column shape is defined by each skill>
```

One sentence after the table: **why the loop ended** (two consecutive losses — on the gate, on the
VS, or on a red line — or the round cap was reached).
