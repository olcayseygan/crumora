# reforge

Three [Claude Code](https://claude.com/claude-code) skills that turn *"let me try that again"* into a
tournament: **do the work, score it, fight it against the previous version, repeat until nothing
beats the champion** — then hand back an honest post-mortem and a round-by-round table.

| Skill | Move | Answers |
| --- | --- | --- |
| **`re-make`** | throws the code away and rebuilds it from a blank file | *is a different design better?* |
| **`re-master`** | keeps the code and sharpens it with reviewable diffs | *how good can **this** design get?* |
| **`re-design`** | redesigns the interface and judges the rendered pixels | *does it actually look and read right?* |

Redoing something "to see if it comes out better" usually ends in a vibe-based verdict: the new one
*feels* cleaner, so it ships. These skills replace the vibe with a frozen rubric, head-to-head
rounds, an incumbent that only loses when it is genuinely beaten, and a written analysis at the end.

---

## The shape they share

```
Round 0   what exists now                    →  champion
Round 1   a new attempt                      →  score + VS champion  →  winner takes the throne
Round 2   another attempt                    →  score + VS champion  →  winner takes the throne
...
          first challenger that fails        →  loop ends
```

- **Spec first.** The target is pinned in a few bullets and never grows mid-run — a moving target
  makes every earlier comparison worthless.
- **Rubric frozen.** Weighted criteria, agreed before round 1, never edited afterwards.
- **Nothing is re-scored.** A score is earned once and carried forward, so the incumbent can't drift.
- **The throne is defended.** A challenger must win *both* the score *and* the head-to-head. Ties go
  to the champion. Spec misses and house-rule violations lose regardless of how pretty the result is.
- **The repo stays clean** until the final champion is decided, and only then is it applied and
  verified.
- **Six rounds, hard cap.**

## `re-make` — rebuild it

Each round starts from a blank file and the spec, never from the existing code, and must try a
*genuinely different* approach: different data structure, different split of responsibility,
different axis of simplification.

| Criterion | Weight |
| --- | --- |
| Correctness | 30 |
| House-rule fit | 25 |
| Simplicity — concept count, not line count | 20 |
| Robustness | 15 |
| Maintainability | 10 |

```
/re-make GameUI cast ring
/re-make src/parser.ts
```

## `re-master` — sharpen it

Same tournament, opposite move: every round starts from the champion's actual code and produces a
diff a reviewer could approve.

- Each round **names the weakness it attacks** — the lowest-scoring criterion, worst first. No round
  begins with "let me clean this up a bit".
- **No scope creep.** Adding capability is not improving.
- **A diff touching more than ~60% of the target is a rewrite in disguise** — it says so and hands
  off to `re-make`.
- **Regression check:** Correctness may never drop; no other criterion may drop more than a point.
- Taking the throne needs **+2 score, a VS win and a clean regression check** — all three, so
  diminishing returns end the loop instead of dragging it on.
- **Change cost is judged in the VS:** a +4 that rewrites 200 lines loses to a +3 that moves 20.
- **Measurable claims need measurements.** "Faster" with no number scores zero.

```
/re-master src/parser.ts
/re-master the reconcile loop
```

## `re-design` — redesign it

The pixel-level sibling: redesigns a surface from a blank canvas and obsesses over the boring things
that actually decide whether a UI reads — edges that line up, one spacing scale, sizes that mean
something, contrast you can read.

| Criterion | Weight |
| --- | --- |
| Layout & alignment | 25 |
| Spacing & sizing | 20 |
| Hierarchy & typography | 20 |
| Colour, contrast & accessibility | 15 |
| Fit to content & job | 12 |
| States & responsiveness | 8 |

- **The content set is frozen up front — including a stress case**: the longest label, the empty
  state, the biggest number, the 40-item list. A design that only works on Lorem ipsum is not a
  design.
- **Every round declares its scales** (spacing, type, size, radius, palette) and never steps outside
  them; existing project tokens win over invented ones.
- **Render it and look at it.** Scoring a layout from source is how misaligned, overflowing screens
  get called "clean".
- **An alignment audit runs every round** — shared edges, gutter consistency, optical vs.
  mathematical centring, icon/text alignment, padding symmetry, overflow, rhythm. Unfixed misses cap
  the alignment score at 7.
- **Red lines** (automatic loss): the primary action got harder to find, contrast fails AA, the
  stress content breaks the layout, or the project's design tokens were ignored.
- Loads `frontend-design` / `dataviz` / `artifact-design` first when they apply — that is where the
  craft lives; this skill is the harness.

```
/re-design the settings panel
/re-design the match HUD
```

## What you get at the end

Five headings, always:

- **What we set out to do** — the spec / contract / design job
- **What we did** — which version won, how many rounds, how often the throne changed hands
- **How we did it** — the winner's approach and why it won
- **Possible mistakes** — an honest risk list (untested paths, assumptions, unmeasured claims)
- **Rounds** — the summary table

```
| Round | Approach            | Score | VS              | Champion |
| ----- | ------------------- | ----- | --------------- | -------- |
| 0     | existing code       | 68    | —               | R0       |
| 1     | single-pass buffer  | 74    | R1 wins (3-2)   | R1       |
| 2     | event-driven        | 71    | R1 wins (4-1)   | R1       |
```

…followed by one sentence on **why the loop ended**.

## Install

```bash
git clone https://github.com/olcayseygan/reforge.git
cp -r reforge/skills/* ~/.claude/skills/
```

On Windows (PowerShell):

```powershell
git clone https://github.com/olcayseygan/reforge.git
Copy-Item -Recurse reforge\skills\* "$env:USERPROFILE\.claude\skills\"
```

Restart Claude Code so the skill list is picked up. Copy them into `.claude/skills/` inside a repo
instead if you only want them for that project. They are independent — take one, take all three.

## Why bother

- An attempt that loses is **information**, not wasted work: you now know the current version is
  defensible, and the analysis says exactly why.
- The incumbent advantage (ties go to the champion) keeps churn out of the repo.
- A frozen rubric stops the goalposts drifting toward whatever the newest attempt happens to be good
  at — which is what "it feels better" usually means.

## License

MIT — see [LICENSE](LICENSE).
