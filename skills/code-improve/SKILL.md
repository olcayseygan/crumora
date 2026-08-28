---
name: code-improve
description: Improves a piece of work in scored rounds and proves the improvement by fighting each attempt head-to-head against the version it wants to replace. Two modes on one tournament - in place, where every round attacks the champion's weakest criterion with a reviewable diff, and from scratch, where every round rebuilds the target from a blank file on a deliberately different approach and no code is copied. Every challenger runs the project's build, type check, linter and tests before it is scored at all, and the head-to-head is judged blind in a separate agent that is not told which version is the incumbent. Rounds run until two challengers lose in a row, then a full analysis plus a round-by-round table is reported, and the mode switches mid-run when the honest answer changes - a diff past ~60% of the target is a rewrite in disguise, and a rebuild that only confirms the existing design hands back to the in-place mode. Use when the user says "/code-improve", "improve this", "refactor this and compare", "polish this until it stops getting better", "refine it round by round", "rewrite this from scratch", "remake it", "try a different approach and see which is better", or the Turkish equivalents "iyilestir", "bastan yaz", "elden gecir". For judging code without changing it use code-audit, for a fixed rule pass that fixes what it finds use code-rules, for redesigning an interface use ui-redesign.
---

# code-improve — improve it, and prove it improved

Do the work **again**; **score** it; **fight** it against the version it wants to replace; the winner
takes the throne; repeat until a challenger loses; finish with an **analysis and a table**.

The goal is never "polish it a bit" — it is to **measure whether the new version is actually better**,
against a rubric frozen before the first round.

**Read `../_shared/tournament.md` first** — setup invariants, the code rubric, scoring rules, VS
rules, stopping/applying and the final-analysis format all live there and are not repeated below.

Siblings: **ui-redesign** runs the same tournament on an interface and judges the rendered pixels;
**code-audit** builds nothing and judges what is already there; **code-rules** checks fixed rules and
fixes what fails.

---

## 0. Which mode

One tournament, two moves. They differ only in where each round starts:

| | **in place** (default) | **from scratch** |
| --- | --- | --- |
| Starting point | the champion's actual code | a blank file and the spec |
| Round output | a **reviewable diff** | a whole new version |
| Question it answers | "how good can *this* design get?" | "is a different design better?" |
| Ends when | two diffs in a row stop being worth their cost | two fresh attempts in a row stop winning |

**Pick the mode from the request, not from a question.**

- `--in-place`, "improve", "refactor", "polish", "tidy", "make this faster" → in place.
- `--from-scratch`, "rewrite", "from scratch", "start over", "remake", "try a different approach" →
  from scratch.
- Nothing either way → **in place**, and say in one line which mode is running.

**The mode switches mid-run when the honest answer changes**, and the switch is announced with its
reason:

- In place → from scratch when a round's diff touches more than **~60% of the target**, or when the
  weakness queue keeps pointing at the design itself rather than at the code. Grinding polish onto
  the wrong design is this skill's worst failure mode.
- From scratch → in place when two rounds in a row lose to the existing version on structure and the
  remaining gap is execution, not design. Rebuilding what was already right is the other one.

A switch keeps the champion, the rubric and the round count. It does not reset the tournament.

---

## 1. Pick the target

If the user passed an argument, that is the target (`/code-improve src/parser.ts`,
`/code-improve GameUI cast ring --from-scratch`). If not, ask **one question**: what should be
improved. A target can be a file, a class, a function, a system, or a document.

Then freeze the target of `tournament.md` §1.2, in the shape the mode needs:

- **In place — a behaviour contract**, phrased as a fence: 3-8 bullets of what must stay true no
  matter what changes. Anything not in it is fair game; anything in it is a regression if broken.
- **From scratch — a spec**: what this code must do, which rules it must obey, what it must not
  break.

A mode switch converts one into the other rather than writing a second one.

## 2. Setup (round 0)

`tournament.md` §1, work folder `<scratchpad>/code-improve/<target-slug>/`, each round kept in
`r<N>/` — its **diff and full file** in place mode, its **own whole file** from scratch.

Two things that hold in both modes:

- **Gate the champion, then score it.** Run the project's checks against the code as it stands
  before touching anything — if the baseline is already red, every later gate result means something
  different, and you need to know that in round 0 rather than blaming round 2 for it. That score is
  Round 0's line in the table.
- **The scores are the work queue.** Lowest-scoring criteria first — in place that queue picks the
  weakness each round attacks; from scratch it picks the axis each new attempt tries to beat.

## 3. The round loop

**(a) Name the move.** One sentence, before any code is written.

- In place: which criterion is being attacked and what specifically is wrong — `Robustness 5 — the
  buffer is reallocated every frame, and a despawn mid-iteration throws`. No round starts with "let
  me clean this up a bit".
- From scratch: which **different approach** this round tries — different data structure, different
  split of responsibility, different axis of simplification. Writing the same idea twice wastes the
  round.

**(b) Do the work.**

- In place: start from the champion's code and **edit it**. The output must read as a diff a reviewer
  could approve. **No scope creep** — adding capability is not improving; if the fix needs new
  behaviour, it belongs in the contract, agreed before the round. A diff past ~60% of the target is
  the mode switch in §0, not a bigger diff.
- From scratch: write a new version **without looking at the champion's code**, working from the
  spec. No block-copying from the existing implementation.

**(c) Run the gate, then score.** The gate first (`tournament.md` §3) — build, type check, linter
and the tests covering the target, actually executed against the challenger. Red ends the round; one
repair attempt is allowed. Nothing is scored before the gate is green, and a run with no runnable
check says so out loud and carries `unverified` on Correctness for every version.

Then score the challenger against the frozen rubric (`tournament.md` §2-3). The champion keeps the
score it earned. The score is the work queue and the tie-break, not the verdict — the VS is
(`tournament.md` §4).

**(d) VS.** Head-to-head against the champion, criterion by criterion, **judged blind in a separate
agent** that gets A and B without being told which is the incumbent (`tournament.md` §4). In place,
one criterion exists here that is never in the rubric: **change cost** — *how much churn bought that
improvement?* A big win that rewrites 200 lines loses to a smaller one that moves 20. Diff size,
review effort and blast radius all count, and change cost is the tie-breaker on a split criterion
count.

In place adds two **red lines** — an automatic VS loss whichever way the criteria fall:

- the champion wins **Correctness** in the head-to-head,
- the champion wins **Robustness** and the round did not set out to trade it. Trading robustness for
  prettiness is not an improvement, it is a preference.

**(e) Verdict.** The challenger takes the throne if it **passed the gate and won the VS** — in
either mode, and regardless of which way the totals fell. A challenger that loses does **not** end
the loop on its own; the loop ends on **two consecutive losses** (`tournament.md` §5), and the round
after a loss must attack a different weakness or try a different approach.

## 4. Stopping

The loop ends on **any** of these — say which one happened:

- **two challengers lost in a row** (§3e) — on the gate, on the VS, or on a red line,
- every criterion sits at **9 or 10** and the remaining gaps are taste, not quality,
- **6 rounds** — the shared hard cap.

Then apply and verify per `tournament.md` §5. The repo stays untouched until the final champion is
decided.

## 5. Final analysis

Format: `tournament.md` §6. The table carries the mode of each round, because a run can hold both:

| Round | Mode | Move | Diff | Gate | Score (Δ) | VS | Champion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | — | existing code | — | green | 61 | — | R0 |
| 1 | in place | Robustness 5 — per-frame realloc | +12 −9 | green | 71 (+10) | R1 wins (4-1) | R1 |
| 2 | in place | Simplicity 6 — two state flags | +40 −31 | red — 2 tests | — | — | R1 |
| 3 | from scratch | single-pass buffer | whole file | green | 74 (+3) | R1 wins (3-2, cost) | R1 |

Under **How we did it**, go round by round: which weakness or approach each round took, what the fix
was, what the failed rounds taught, and — if the mode switched — what made the switch honest. Name
what the gate actually ran, and say plainly if there was nothing to run. For a
from-scratch winner, name its data structure and split of responsibility, and which idea was salvaged
from a losing round.

---

## MUST summary

- Read `../_shared/tournament.md` before round 1; its rules bind this skill.
- Pick the mode from the request, default to in place, and say which one is running.
- Switch modes when a diff passes ~60% or a rebuild keeps losing on design — announce it, keep the
  champion.
- Freeze the contract (in place) or the spec (from scratch) and the rubric before round 1; nothing is
  re-scored.
- Run the gate before scoring anything; a red gate loses the round after one repair attempt, and a
  target with no runnable check is reported as `unverified`, never skipped quietly.
- Judge the VS blind in a separate agent — A and B, incumbent unnamed.
- In place: edit, never rewrite; no scope creep; the champion winning Correctness, or winning
  Robustness in a round that did not set out to trade it, is an automatic loss.
- From scratch: no copying, and every round tries a deliberately different approach.
- The VS decides the throne in both modes; the score is the work queue and the tie-break.
- Change cost is judged in the VS; measurable claims need numbers.
- Ties go to the champion. The loop ends on two consecutive losses, and 6 rounds maximum.
- The repo stays untouched until the final champion is decided, then it is applied and verified.
- Final analysis: five headings plus the table, nothing skipped.
