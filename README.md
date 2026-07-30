# reforge

A [Claude Code](https://claude.com/claude-code) skill that **rebuilds your work from scratch,
scores it, and fights it against the previous version** — round after round — until nothing can beat
the reigning champion.

Rewriting something "to see if it comes out better" usually ends with a vibe-based verdict: the new
one *feels* cleaner, so it ships. `re-make` replaces the vibe with a tournament — a frozen rubric,
head-to-head rounds, an incumbent that only loses when it is actually beaten, and a written
post-mortem at the end.

---

## How it works

```
Round 0   existing code                          →  champion
Round 1   rewritten from scratch, approach A     →  score + VS champion  →  winner takes the throne
Round 2   rewritten from scratch, approach B     →  score + VS champion  →  winner takes the throne
...
          first challenger that fails            →  loop ends
```

1. **Spec first.** The target is pinned down in 3-8 bullets. The spec never changes mid-run — a
   growing target makes the comparison meaningless.
2. **Rubric frozen.** Five weighted criteria, agreed before round 1, never edited afterwards.
3. **From scratch, every time.** No block-copying the current implementation, and every round has to
   try a *genuinely different* approach — a different data structure, a different split of
   responsibility, a different axis of simplification.
4. **Score, then fight.** The challenger is scored against the rubric, then compared to the champion
   criterion by criterion with a concrete reason per criterion.
5. **The throne is defended.** A challenger must win **both** the total score **and** the
   head-to-head. Ties go to the champion. A spec miss or a house-rule violation is an automatic loss,
   however pretty the code is.
6. **The repo stays clean** until the final champion is decided, and only then is it applied and
   verified.

Hard cap: 6 rounds.

## The rubric

| Criterion | Weight | What it measures |
| --- | --- | --- |
| Correctness | 30 | Every spec bullet, edge cases, wrong behaviour |
| House-rule fit | 25 | The project's own conventions — `CLAUDE.md`, contributing guide, lint config, surrounding idiom |
| Simplicity | 20 | Not line count but **concept count**: new types, indirections, rules a reader must hold in their head |
| Robustness | 15 | What breaks outside the happy path; lifecycle, re-entry, allocations, per-frame cost |
| Maintainability | 10 | How many places you touch to add one field; do names state intent |

The rubric can be tailored to the target *before* round 1 — swap "Robustness" for "Fidelity to
source" when remaking a document — but once frozen it stays frozen.

## What you get at the end

Five headings, always:

- **What we set out to do** — the spec
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

Copy the skill into your personal skills folder:

```bash
git clone https://github.com/olcayseygan/reforge.git
cp -r reforge/skills/re-make ~/.claude/skills/
```

On Windows (PowerShell):

```powershell
git clone https://github.com/olcayseygan/reforge.git
Copy-Item -Recurse reforge\skills\re-make "$env:USERPROFILE\.claude\skills\"
```

Restart Claude Code so the skill list is picked up. Drop it in `.claude/skills/` inside a repo
instead if you only want it for that project.

## Usage

```
/re-make GameUI cast ring
/re-make src/parser.ts
/re-make
```

With no argument it asks what to remake. It also triggers on plain requests like *"rewrite this from
scratch and tell me which one is better"*.

## Why bother

- A rewrite that loses is **information**, not wasted work — you now know the current design is
  defensible, and the analysis says why.
- The incumbent advantage (ties go to the champion) keeps churn out of the repo.
- The frozen rubric stops the goalposts from drifting toward whatever the newest attempt happens to
  be good at.

## License

MIT — see [LICENSE](LICENSE).
