# crumora

> This repo is also a [Claude Code](https://claude.com/claude-code) marketplace named `olcayseygan` —
> take all eight with one command: `claude plugin install crumora@olcayseygan`.

Eight [Claude Code](https://claude.com/claude-code) skills that turn *"let me try that again"* into a
tournament: **do the work, score it, fight it against the previous version, repeat until nothing
beats the champion** — then hand back an honest post-mortem and a round-by-round table.

| Skill | Move | Answers |
| --- | --- | --- |
| **`rewrite`** | throws the code away and rebuilds it from a blank file | *is a different design better?* |
| **`sharpen`** | keeps the code and improves it with reviewable diffs | *how good can **this** design get?* |
| **`reskin`** | redesigns the interface and judges the rendered pixels | *does it actually look and read right?* |
| **`tribunal`** | builds nothing; a panel of lenses reads it, then fights | *what is actually wrong with it?* |
| **`checklist`** | builds nothing; checks the code against fifteen fixed rules | *does it pass, rule by rule?* |
| **`report`** | leaves the code alone; measures the data and writes it up | *what do the numbers actually say?* |
| **`specify`** | touches nothing; turns a need text into testable requirements | *what exactly did they ask for?* |
| **`diagram`** | writes no code; draws the process in the library you name | *how does this actually work?* |

Each name is the move it makes: `rewrite` and `sharpen` and `reskin` build, `tribunal` and
`checklist` judge, `report` and `specify` and `diagram` write it down. What these skills add is the
tournament around them: every attempt is scored, fought against the version it wants to replace, and
thrown away if it doesn't win.

The two judges are deliberately not the same skill. `tribunal` **opens** the question — several
lenses hunt for whatever is wrong, then argue. `checklist` **closes** it — fifteen rules fixed in
advance, each ending in PASS or FAIL. If you want the open critique, ask for the tribunal; if you
want a gate, ask for the checklist.

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

`rewrite`, `sharpen` and `reskin` share one written rulebook —
[`skills/_shared/tournament.md`](skills/_shared/tournament.md) — holding the setup invariants, the
code rubric, the scoring and VS rules, the stop-and-apply steps and the final-analysis format. Each
skill's own `SKILL.md` carries only what is specific to its move, so the three cannot quietly drift
apart.

`tribunal`, `checklist`, `report`, `specify` and `diagram` are the odd ones out: none of them
produces a version to score. In `tribunal` the fight happens between *lenses* instead of versions; in
`checklist` between a rule and a violation that has to survive an attempt to kill it; in `report` it happens
between a claim and the data that has to back it; in `specify` between a sentence and a tester who
has to be able to fail it; in `diagram` between the picture and a node budget that forces a split
rather than a wall. The discipline is identical — nothing reaches you until something tried to kill
it.

## `rewrite` — rebuild it

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
/rewrite GameUI cast ring
/rewrite src/parser.ts
```

## `sharpen` — improve it in place

Same tournament, opposite move: every round starts from the champion's actual code and produces a
diff a reviewer could approve.

- Each round **names the weakness it attacks** — the lowest-scoring criterion, worst first. No round
  begins with "let me clean this up a bit".
- **No scope creep.** Adding capability is not improving.
- **A diff touching more than ~60% of the target is a rewrite in disguise** — it says so and hands
  off to `rewrite`.
- **Regression check:** Correctness may never drop; no other criterion may drop more than a point.
- Taking the throne needs **+2 score, a VS win and a clean regression check** — all three, so
  diminishing returns end the loop instead of dragging it on.
- **Change cost is judged in the VS:** a +4 that rewrites 200 lines loses to a +3 that moves 20.
- **Measurable claims need measurements.** "Faster" with no number scores zero.

```
/sharpen src/parser.ts
/sharpen the reconcile loop
```

## `reskin` — redesign it

The pixel-level sibling: redesigns a surface from a blank canvas and obsesses over the boring things
that actually decide whether a UI reads — edges that line up, one spacing scale, sizes that mean
something, contrast you can read.

| Criterion | Weight |
| --- | --- |
| Layout, grouping & alignment | 25 |
| Spacing & sizing | 20 |
| Hierarchy & typography | 20 |
| Colour, contrast & accessibility | 15 |
| Fit to content, job & ergonomics | 12 |
| States & responsiveness | 8 |

- **The real context is read first** — parent shell, routed wrapper, grid config, the children that
  take up space. If the parent shell is the actual problem, it says so instead of looping: a boxed-in
  child cannot beat its box.
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
- **Bindings survive every move.** Props, events, `ref`s, slots and conditionals travel with the
  markup they belong to; a layout win that drops a listener is a regression, not a round.
- **Red lines** (automatic loss): the primary action got harder to find, contrast fails AA, the
  stress content breaks the layout, the project's design tokens were ignored, or a binding was lost
  in the restructure.
- Loads `frontend-design` / `dataviz` / `artifact-design` first when they apply — that is where the
  craft lives; this skill is the harness.

```
/reskin the settings panel
/reskin the match HUD
```

## `tribunal` — put it on trial

No rewriting, no diffs, no pixels: a panel of 4-7 **lenses** reads the code, then argues.

- **Blind first.** Each lens reviews on its own and writes its findings down *before* reading the
  others. A lens that starts by reading the previous one just agrees with it — that is one review
  wearing five hats.
- **A finding needs `file:line`, a concrete failure scenario, a severity and a confidence.** *"On the
  second cast in the same frame `_pending` is still set, so the second hit is dropped."* No scenario,
  no finding.
- **Then the fight.** Every finding is handed to a *different* lens whose job is to **refute** it.
  Survivors are `CONFIRMED`, unsettled ones `PLAUSIBLE` (with what would settle them), the rest
  `REFUTED` — and refuted findings stay in the report with their reason, because "we checked and it's
  fine" is worth knowing.
- **Conflicts are decided, not averaged.** *Cache it* vs. *keep it simple* gets written out as a
  trade-off with a winner; a split difference usually delivers neither side's benefit.
- **Dissent is recorded.** If a lens still disagrees at the end, its objection is printed by name.
  Manufactured unanimity hides the one comment the author needed.
- Default panel: Correctness · Lifecycle & robustness · Performance & memory · Design & simplicity ·
  House rules · Maintainability · Security & trust · Testability — swapped to fit the target.
- It **reviews only**; fixes happen only if you ask.

```
/tribunal src/parser.ts
/tribunal the working diff
```

## `checklist` — check it against the rules

The fixed-rule sibling of `tribunal`. `tribunal` opens the question and hunts for whatever is wrong;
`checklist` closes it — **fifteen rules, known in advance, each ending in PASS or FAIL.**

1. **Types everywhere** — no `any`, no implicit `any`, no untyped bag standing in for a shape. In
   Python that means `typing` containers over bare builtins, `NDArray[np.float64]` with the shape and
   axis meaning written down rather than a bare `np.ndarray`, and `Path` wherever a path travels —
   never a `str`.
2. **Names mean something** — spelled out, no `cfg`, `mgr`, `tmp`, `idx`, no single letters.
3. **No repetition** — the same logic never lives in two places.
4. **SOLID** — SRP, OCP, LSP, ISP and DIP each get their own verdict line.
5. **Single entry** — one public way into a unit; no parallel path that drifts.
6. **Test driven** — a test that asserts behaviour and actually fails without the change.
7. **Function names are verbs** — `calculateTotal`, not `totalCalculation`.
8. **Variable names are nouns** — `activeUser`, not `getUser`.
9. **Booleans are prefixed** — `is`, `has`, `can`, `should`, `was`. `active` fails, `isActive` passes.
10. **No magic numbers or strings** — `0.15` becomes `VAT_RATE`, `"pending"` becomes `OrderStatus.Pending`.
11. **Blank lines separate blocks, never code** — no blank line between statements inside a body; a
    run that wants one is a function waiting to be extracted. One blank line after every `if`, `for`,
    `while`, `switch` or `try` block, none before it, and never two in a row.
12. **Idiomatic for the language** — comprehensions and `pathlib` in Python, `map`/`?.`/`await` in
    JS, `computed` and props/emits in Vue, LINQ and pattern matching in C#. Whatever the language
    already ships, the code uses instead of hand-rolling it — without tipping over into clever.
13. **No defensive guards** — no null check on a value that should never be null, no `catch` that
    swallows, no fallback default hiding a missing one. Let it throw so the real bug surfaces; a log
    that rethrows is the most you get. Guards live only at real IO, hardware and user boundaries.
14. **Act first, roll back on failure** — a like button fills on click, then posts; if the request
    fails the exact previous state comes back and the user is told. No spinner-locked buttons on
    cheap actions, no silent rollback, no state left lying about what the server holds.
15. **Destructive actions** — five sub-checks, each with its own verdict: **hold to confirm** (the
    ring replaces the dialog), **verb labels** ("delete project", never "yes"), **off the happy
    path** (far from `Save`, not a trash icon per row), **red budget** (red is spent on destruction
    only, never on form validation), **danger zone** (bordered, labelled, last on the page).

- **A rule you didn't check is `NOT CHECKED`, never PASS.** A short checklist is a checklist that was
  not run, so all fifteen rows print every time, including the clean ones.
- **A finding needs its rule number, `file:line`, the violation and the concrete fix** — for a naming
  rule that means writing the new name out.
- **Every FAIL is attacked before it is printed.** Is that `any` actually inferred from a typed
  source? Is that "duplicate" one rule in two places or two rules that match today? The ones that
  don't survive are dropped, with the reason.
- **The verdict is mechanical**: every rule PASS ships, one FAIL doesn't — followed by what could not
  be checked from source alone.
- It **reviews only**; fixes happen only if you ask.

```
/checklist src/parser.ts
/checklist the working diff
```

## `report` — measure it

The one that never touches code: it answers a question **with numbers**, then delivers a dated,
self-contained single-file HTML report an executive and an engineer can read the same copy of.

- **Read-only, always.** Source data and the project's runtime code come out unchanged; intermediates
  live in the scratchpad, never in your repo.
- **The name is a hint, the content is the evidence.** A column called `duration_ms` holding seconds,
  a file named `run-30fps-high` recorded at another setting — every field and file is opened and
  confirmed before it is allowed into the report.
- **Confounds are never presented as results.** Sample count, duration, volume and version drift get
  normalised; whatever can't be normalised is written out in Notes rather than quietly averaged in.
- **One primary metric** that isolates the question, plus at most two or three supporting ones —
  stated along with what it normalises and what it is blind to. Sample counts are always visible and
  no claim rests on a single sample.
- **A decision study owes you a recommendation** — which option, under which condition, resting on
  which number. A descriptive one gets a conclusion and no box.
- **The file is self-contained and verified so**: charts embedded as base64, no external `link`,
  `script src` or remote image, and it survives print-to-PDF without splitting a chart in half.
- Report language follows the language you are speaking, not the skill's.

```
/report compare the two tuning runs in data/
/report what happened to p99 latency last week
```

## `diagram` — draw it

The one that writes no code and measures nothing: it answers *how does this work?* with a picture, in
the library you name — **Mermaid** by default, otherwise Graphviz, D2 or PlantUML.

- **One question per diagram, and the title is that question.** *"How a request becomes a rendered
  frame"*. If that sentence can't be written, the diagram doesn't know what it is for.
- **Ten nodes, fifteen edges — hard cap.** Over it, the answer splits into an overview plus named
  detail diagrams instead of one wall nobody reads. Branches are never deleted to fit; that is lying,
  not simplifying.
- **The type comes from the question, not from habit.** Boxes that keep naming *who* does the step
  are a sequence diagram; boxes that are adjectives (`idle`, `loading`, `failed`) are a state machine.
- **Only verified steps get drawn.** Same rule as `report` — anything unconfirmed is dashed and
  listed under *Not verified*, never quietly boxed in to complete the picture.
- **Failure paths are part of the process**: timeout, retry, rejection, empty state. Happy-path-only
  diagrams are the ones that get believed and then contradicted by production.
- **Every branch edge is labelled**, no decoration without meaning, and the syntax is actually
  rendered before it reaches you.
- Every diagram ships with a 2-5 line walkthrough that says what the picture can't — why a branch
  exists, what a condition really compares, what the box is called in the code.

```
/diagram the auth flow in src/api/
/diagram this state machine as graphviz
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

`report` writes the same five into the document instead of the chat: Objective is *what we set out to
do*, Findings and Conclusion are *what we found*, Method is *how we found it*, and Notes & Caveats is
*possible mistakes* — the section most reports quietly drop.

## Installation

Two ways: **as a plugin** (one command, updates itself) or **by copying the skill folders** (nothing
to register, easy to edit). Pick one — installing both gives you two copies of every skill.

### Option 1 — as a plugin (recommended)

This repo is a Claude Code marketplace named `olcayseygan`, holding a single plugin called `crumora`
— so the skills show up as `crumora:rewrite`, `crumora:tribunal`, `crumora:report` and so on.
In Claude Code:

```
/plugin marketplace add olcayseygan/crumora
/plugin install crumora@olcayseygan
```

Or from the terminal:

```bash
claude plugin marketplace add olcayseygan/crumora
claude plugin install crumora@olcayseygan
```

The `/plugin` UI works too: **Marketplaces → Add**, paste `https://github.com/olcayseygan/crumora`,
then install **crumora** from the Plugins tab.

Updating later:

```bash
claude plugin marketplace update olcayseygan
```

Removing it:

```bash
claude plugin uninstall crumora
claude plugin marketplace remove olcayseygan
```

### Option 2 — copy the skill folders

A skill is just a folder with a `SKILL.md` in it. Installing one means putting that folder where
Claude Code looks — there is nothing to build, register or configure.

#### Pick a scope first

| Scope | Where it goes | Use it when |
| --- | --- | --- |
| **Personal** | `~/.claude/skills/` (Windows: `%USERPROFILE%\.claude\skills\`) | You want these in **every** project on your machine. Recommended. |
| **Project** | `<repo>/.claude/skills/` | You want them only in one repo — and committed, so your teammates get them too. |

Both work at the same time; if a name exists in both, the project copy wins.

#### Install all eight

```bash
git clone https://github.com/olcayseygan/crumora.git crumora
mkdir -p ~/.claude/skills
cp -r crumora/skills/* ~/.claude/skills/
```

Windows (PowerShell):

```powershell
git clone https://github.com/olcayseygan/crumora.git crumora
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills" | Out-Null
Copy-Item -Recurse -Force crumora\skills\* "$env:USERPROFILE\.claude\skills\"
```

For the project scope instead, swap the destination for `.claude/skills/` inside your repo and commit
it.

#### Install just one

`tribunal`, `checklist`, `report`, `specify` and `diagram` are fully independent — take one on its
own:

```bash
cp -r crumora/skills/tribunal ~/.claude/skills/
```

`rewrite`, `sharpen` and `reskin` read the shared rulebook, so they need `_shared/` next to them:

```bash
cp -r crumora/skills/sharpen crumora/skills/_shared ~/.claude/skills/
```

#### What it should look like afterwards

```
~/.claude/skills/
├── _shared/tournament.md      ← shared rulebook, not a skill
├── rewrite/SKILL.md
├── sharpen/SKILL.md
├── reskin/
│   ├── SKILL.md
│   └── references/
├── tribunal/SKILL.md
├── checklist/SKILL.md
├── specify/SKILL.md
├── diagram/
│   ├── SKILL.md
│   └── references/
└── report/
    ├── SKILL.md
    ├── references/
    └── scripts/
```

The folder name and the `name:` field in the file's front matter must match, and the file must stay
named `SKILL.md`. Don't strip the `---` front matter block at the top — that is what makes it a skill
rather than a note. `report`, `diagram` and `reskin` carry `references/` (and `report` a `scripts/`)
alongside their `SKILL.md` — copy the whole folder, not just the one file. `_shared/` holds no
`SKILL.md` and is not a skill; it is the rulebook `rewrite`, `sharpen` and `reskin` read at the start
of a run.

#### Verify

**Restart Claude Code** — the skill list is read at session start, so a freshly copied skill will not
appear in a running session. Then type `/` and look for `rewrite`, `sharpen`, `reskin`, `tribunal`,
`checklist`, `report`, `specify`, `diagram`, or just ask *"which skills do you have?"*.

#### Update

```bash
cd crumora && git pull
cp -r skills/* ~/.claude/skills/
```

Restart afterwards, same reason.

#### Uninstall

Delete the folder — `rm -rf ~/.claude/skills/tribunal`. Nothing else is touched; skills leave no state
behind.

#### Troubleshooting

- **The slash command doesn't show up.** You didn't restart, or the file is at
  `~/.claude/skills/SKILL.md` instead of `~/.claude/skills/<name>/SKILL.md`.
- **It's listed but never triggers on its own.** Invoke it explicitly with `/tribunal …`. The
  description is what makes Claude reach for it unprompted; if you edited it, keep the trigger
  phrases in there.
- **You already have a skill with one of these names.** Rename the folder *and* the `name:` field to
  match, e.g. `tribunal-panel`.

## Why bother

- An attempt that loses is **information**, not wasted work: you now know the current version is
  defensible, and the analysis says exactly why.
- The incumbent advantage (ties go to the champion) keeps churn out of the repo.
- A frozen rubric stops the goalposts drifting toward whatever the newest attempt happens to be good
  at — which is what "it feels better" usually means.

## License

MIT — see [LICENSE](LICENSE).
