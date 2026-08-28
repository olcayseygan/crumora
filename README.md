# crumora

> This repo is also a [Claude Code](https://claude.com/claude-code) marketplace named `olcayseygan` —
> take all six with one command: `claude plugin install crumora@olcayseygan`.

Six [Claude Code](https://claude.com/claude-code) skills that turn *"let me try that again"* into a
tournament: **do the work, score it, fight it against the previous version, repeat until nothing
beats the champion** — then hand back an honest post-mortem and a round-by-round table.

| Skill | Move | Answers |
| --- | --- | --- |
| **`code-improve`** | improves the code in scored rounds — in place, or rebuilt from scratch | *is the new version actually better?* |
| **`ui-redesign`** | redesigns the interface and judges the rendered pixels | *does it actually look and read right?* |
| **`code-audit`** | builds nothing; a panel of lenses reads the code, then fights | *what is actually wrong with it?* |
| **`code-rules`** | checks the code against a fixed rule set and edits until it passes | *does it pass, rule by rule?* |
| **`data-report`** | leaves the code alone; measures the data and writes it up | *what do the numbers actually say?* |
| **`request-readback`** | starts nothing; hands the request back as consequences | *did I understand what you asked?* |

Each name says what it acts on and what it does to it: `code-improve` and `ui-redesign` build,
`code-audit` judges, `code-rules` judges and then repairs — printing edits instead of prose — and
`data-report` and `request-readback` write it down. What these skills add is the tournament around
them: every attempt is scored, fought against the version it
wants to replace, and thrown away if it doesn't win.

The two judges are deliberately not the same skill. `code-audit` **opens** the question — several
lenses hunt for whatever is wrong, then argue, and hand you a report. `code-rules` **closes** it —
the rules are fixed in advance, and instead of a report it hands you the edits that make the code
pass them. If you want the open critique, ask for the audit; if you want a gate that repairs what it
catches, ask for the rules.

Redoing something "to see if it comes out better" usually ends in a vibe-based verdict: the new one
*feels* cleaner, so it ships. These skills replace the vibe with a frozen rubric, head-to-head
rounds, an incumbent that only loses when it is genuinely beaten, and a written analysis at the end.

---

## The shape they share

```
Round 0   what exists now                    →  champion
Round 1   a new attempt   →  gate  →  score  →  blind VS champion  →  winner takes the throne
Round 2   another attempt →  gate  →  score  →  blind VS champion  →  winner takes the throne
...
          two challengers lose in a row      →  loop ends
```

- **Spec first.** The target is pinned in a few bullets and never grows mid-run — a moving target
  makes every earlier comparison worthless.
- **Rubric frozen.** Weighted criteria, agreed before round 1, never edited afterwards.
- **Nothing is re-scored.** A score is earned once and carried forward, so the incumbent can't drift.
- **The gate runs before the score.** Build, type check, linter, the tests covering the target — or
  for a design, a clean render with a clean console. Red loses the round outright, before anything is
  judged. Correctness is the heaviest criterion in the rubric and the easiest one to award by
  wishful reading; running the checks is what stops that.
- **The head-to-head is judged blind, in a separate agent.** Two versions labelled A and B, order
  chosen without reference to which is champion, and the judge is never told which one is the
  incumbent or who wrote either. Whoever wrote a version cannot rank it honestly.
- **The VS decides the throne, not the total.** Comparing two concrete versions is a judgement that
  holds up; deciding whether a criterion deserves a 7 or an 8 in the abstract is not. The score
  drives the work queue, shows drift across rounds and breaks a split VS — it doesn't crown
  anything. Ties go to the champion, and spec misses or house-rule violations lose regardless of how
  pretty the result is.
- **One loss doesn't end it.** Round quality is high-variance, so the loop runs until **two
  challengers lose in a row** — and the round after a loss has to try a different move.
- **The repo stays clean** until the final champion is decided, and only then is it applied and
  verified.
- **Six rounds, hard cap.**

`code-improve` and `ui-redesign` share one written rulebook —
[`skills/_shared/tournament.md`](skills/_shared/tournament.md) — holding the setup invariants, the
code rubric, the scoring and VS rules, the stop-and-apply steps and the final-analysis format. Each
skill's own `SKILL.md` carries only what is specific to its move, so the two cannot quietly drift
apart.

`code-audit`, `code-rules`, `data-report` and `request-readback` are the odd ones out: none of them
produces a version to score. In `code-audit` the fight happens between *lenses* instead of versions;
in `code-rules` between a rule and a violation that has to survive an attempt to kill it; in
`data-report` between a claim and the data that has to back it; in `request-readback` between a
reading of the request and the rival reading that wants to replace it. The discipline is identical —
nothing reaches you until something tried to kill it.

## `code-improve` — improve it, and prove it improved

One tournament, two moves. **In place** (the default) starts every round from the champion's actual
code and produces a diff a reviewer could approve. **From scratch** starts every round from a blank
file and the spec, and has to try a *genuinely different* approach — different data structure,
different split of responsibility, different axis of simplification.

| | in place | from scratch |
| --- | --- | --- |
| Starting point | the champion's actual code | blank file, spec only |
| Round output | a **reviewable diff** | a whole new version |
| Question it answers | "how good can *this* design get?" | "is a different design better?" |
| Ends when | two diffs in a row stop being worth their cost | two fresh attempts in a row stop winning |

| Criterion | Weight |
| --- | --- |
| Correctness | 30 |
| House-rule fit | 25 |
| Simplicity — concept count, not line count | 20 |
| Robustness | 15 |
| Maintainability | 10 |

- **The mode comes from your words, not from a question.** "improve", "refactor", "polish" run in
  place; "rewrite", "from scratch", "start over" rebuild. Nothing either way means in place, said out
  loud in one line.
- **The mode switches mid-run when the honest answer changes** — a diff past ~60% of the target is a
  rewrite wearing a diff's clothes, and a rebuild that keeps losing on structure means the design was
  already right and only the execution needed work. The switch is announced with its reason and keeps
  the champion, the rubric and the round count.
- **Each round names its move first** — the lowest-scoring criterion it attacks, or the different
  approach it tries. No round begins with "let me clean this up a bit".
- **No scope creep.** Adding capability is not improving.
- **The gate runs first, every round.** The project's build, type check, linter and the tests
  covering the target are executed against the challenger before it is scored at all. Red loses the
  round after one repair attempt; a target with no runnable check is reported as `unverified` rather
  than waved through.
- **Taking the throne needs a clean gate and a VS win** — in both modes. In place adds two red
  lines: the champion winning Correctness in the head-to-head, or winning Robustness in a round that
  never set out to trade it.
- **Change cost is judged in the VS:** a big win that rewrites 200 lines loses to a smaller one that
  moves 20.
- **Measurable claims need measurements.** "Faster" with no number scores zero.

```
/code-improve src/parser.ts
/code-improve the reconcile loop
/code-improve GameUI cast ring --from-scratch
```

## `ui-redesign` — redesign the interface

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
- **Render it and look at it — that is the gate.** Scoring a layout from source is how misaligned,
  overflowing screens get called "clean". A round that fails to render, or renders with errors in
  the console, loses outright after one repair attempt; nothing is scored off a warning's
  screenshot.
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
/ui-redesign the settings panel
/ui-redesign the match HUD
```

## `code-audit` — put it on trial

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
/code-audit src/parser.ts
/code-audit the working diff
```

## `code-rules` — check it against the rules and fix what fails

The fixed-rule sibling of `code-audit`. `code-audit` opens the question and hunts for whatever is
wrong; `code-rules` closes it — **a rule set known in advance, and every violation fixed in place instead of
written up.**

The rules split into two sets, loaded from files next to the skill so a run only reads what the
target needs:

**Core — `rules/core.md`, rules 1–13 and 18–26.** Every file, whether it renders anything or not.

- **1 · Types everywhere** — no `any`, no implicit `any`, no untyped bag standing in for a shape.
- **2 · Names mean something** — spelled out, no `cfg`, `mgr`, `tmp`, `idx`, no single letters.
- **3 · No repetition** — the same logic never lives in two places.
- **4 · SOLID** — SRP, OCP, LSP, ISP and DIP each judged on their own.
- **5 · Single entry** — one public way into a unit; no parallel path that drifts.
- **6 · Test driven** — a test that asserts behaviour and actually fails without the change.
- **7 · Function names are verbs** — `calculateTotal`, not `totalCalculation`.
- **8 · Variable names are nouns** — `activeUser`, not `getUser`.
- **9 · Booleans are prefixed** — `is`, `has`, `can`, `should`, `was`.
- **10 · No magic numbers or strings** — `0.15` becomes `VAT_RATE`. A hardcoded key, token or
  connection string is *not* fixed by naming it; that one is a `NEEDS DECISION`.
- **11 · Blank lines separate blocks, never code** — none between statements, one after every control
  block, never two in a row.
- **12 · Idiomatic for the language** — loaded per language from `rules/idiom/python.md`,
  `typescript.md` or `csharp.md`, so a Python run never reads the C# file.
- **13 · No defensive guards** — no null check on a value that should never be null, no `catch` that
  swallows. Guards live only at real IO, hardware and user boundaries.
- **18 · No dead code** — unused exports, unused imports, commented-out blocks, unreachable branches,
  a feature flag one side of which never runs. The fix is deletion.
- **19 · No hidden mutation** — no rewriting an argument in place, no module-level state written from
  something that reads as a calculation, no mutable default argument.
- **20 · Errors carry what broke** — `"invalid input"` crashes as hard as a useful exception and says
  nothing. The offending value goes in the message; the specific exception type over the base one.
- **21 · Comments say why, not what** — a comment restating the line above it drifts and starts lying.
- **22 · No flag parameters** — `render(item, true, false)` is two functions glued together.
- **23 · No floating promises** — an async call nobody awaits or catches loses the error entirely.
- **24 · Time, randomness and identity come from outside** — `new Date()`, `Math.random()`, `uuid4()`
  inside logic make that logic untestable and unreproducible.
- **25 · Untrusted input is never interpolated** — into SQL, a shell, a path, HTML, a template or a
  redirect. Passed as data, never assembled into the sentence.
- **26 · Dependencies point one way** — no cycles, no domain code importing the UI or the ORM, no
  layer skipped.

**Interaction — `rules/ui.md`, rules 14–17, 27 and 28.** Loaded *in addition* when the target holds a
component, an interaction handler, a request fired from user code, or anything with a listener, timer
or subscription:

- **14 · Act first, roll back on failure** — a like fills on click, then posts; a failure brings the
  exact previous state back and says so.
- **15 · Destructive actions** — hold to confirm, verb labels, off the happy path, red spent on
  destruction only, gathered in a bordered danger zone.
- **16 · One intent, one request** — synchronous disable, in-place spinner with the width locked, an
  idempotency key minted per intent, land on an ack or an error, re-enable on the response.
- **17 · Everything opened is closed** — listeners, timers, subscriptions, observers and in-flight
  requests torn down when the component or service goes away.
- **27 · Four states, not one** — loading, empty and error implemented alongside content, not after
  the bug report.
- **28 · Reachable without a mouse** — keyboard path, accessible name, visible focus, announced state.

Rules 14, 15 and 16 are one decision split three ways, so each action is first sorted into its
family — cheap and reversible, destructive, or expensive and non-idempotent. Sorting it wrong is
itself the violation: a like button wrapped in disable-and-spinner is a rule 14 FAIL, not a rule 16
PASS.

And around the rules:

- **The project gets a say.** A `.code-rules.md` at the repo root can `disable` or `relax` a rule —
  but only with a written reason, and every override is listed in the output. `--only 13,25` and
  `--skip 11` do the same for one run.
- **Conflicts are decided in advance.** Lower rule number wins, except for the named pairs: 13 beats
  12 on `?.`, 14 beats 13 on the rollback `catch`, 25 beats 13 on input validation, 18 beats 21 on
  commented-out code.
- **Every FAIL is attacked before it is fixed.** The ones that don't survive are dropped and never
  mentioned — except rule 25, where an input you cannot prove is trusted stays as a `NEEDS DECISION`.
- **Fixes run structure first, spacing last** — delete and move, then correctness, then interaction,
  then shape, then names and layout. A rename applied to a function about to be split is work done
  twice.
- **Past 20 edits or 8 files it asks one question** — fix everything or narrow it. That is about *how
  much*, never about *whether*.
- **It runs the type checker and the tests afterwards.** Red with an obvious cause gets fixed; red
  with an unclear cause reverts that one edit and becomes a `NEEDS DECISION`. Nothing to run is said
  in one line, never treated as green.
- **`--ui` runs the interaction rules alone**, `--core` the core set alone — and either way the set
  that was not run gets one line saying so, never silence.
- It **gives you no report.** No PASS/FAIL table, no findings table, no verdict — one line per edit
  (`orders.ts:60 · 10 · 0.15 -> VAT_RATE`), the verification line, the overrides line, and the
  leftovers. The review is the diff.

```
/code-rules src/parser.ts
/code-rules the working diff
/code-rules --ui ProjectSettings.vue
```

## `data-report` — measure it

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
/data-report compare the two tuning runs in data/
/data-report what happened to p99 latency last week
```

## `request-readback` — check it landed

The one that starts nothing. A clearance is read back before the aircraft moves; this hands your
request back in a form you can reject, so the misunderstanding surfaces before the work does.

- **It builds, edits and plans nothing.** Source is opened only far enough to make the nouns concrete
  — the real file, the real function — never far enough to solve. The moment it starts deciding
  *how*, it has left the skill.
- **Never a paraphrase.** A wrong reading survives synonym-swapping perfectly, every word still
  present, so restating proves nothing. It answers in consequences instead: the outcome, what *done*
  looks like, what changes if the reading is wrong.
- **Every line must be rejectable.** A line you cannot disagree with — *"you want the code to work"* —
  carries no information and gets cut. Four lines that can be wrong beat a page that can't.
- **Every gap is marked** `said`, `inferred` or `guessed`, and a guess is never promoted by being
  reasonable. Enough stacked guesses and the honest finding is printed: the request is underspecified.
- **The forks are shown with their other branch** — what the request left open, which way it would go,
  and what the opposite choice would produce. That column is where a wrong reading becomes visible.
- **The strongest rival reading gets argued**, never strawmanned, followed by the one question that
  separates it from the chosen one.
- **It closes with falsifiers**, not with a plan: one to three concrete places you would catch the
  misunderstanding first. What happens next is your move, not its.
- Shorter than the thing it checks, and written in the language you asked in.

```
/request-readback
/request-readback the whole conversation
/request-readback docs/ticket-482.md
```

## What you get at the end

Five headings, always:

- **What we set out to do** — the spec / contract / design job
- **What we did** — which version won, how many rounds, how often the throne changed hands, what
  the gate ran
- **How we did it** — the winner's approach and why it won
- **Possible mistakes** — an honest risk list (untested paths, assumptions, unmeasured claims)
- **Rounds** — the summary table

```
| Round | Approach            | Gate         | Score | VS            | Champion |
| ----- | ------------------- | ------------ | ----- | ------------- | -------- |
| 0     | existing code       | green        | 68    | —             | R0       |
| 1     | single-pass buffer  | green        | 74    | R1 wins (3-2) | R1       |
| 2     | event-driven        | red — 1 test | —     | —             | R1       |
| 3     | flat array + index  | green        | 71    | R1 wins (4-1) | R1       |
```

…followed by one sentence on **why the loop ended**.

`data-report` writes the same five into the document instead of the chat: Objective is *what we set out to
do*, Findings and Conclusion are *what we found*, Method is *how we found it*, and Notes & Caveats is
*possible mistakes* — the section most reports quietly drop.

## Installation

Two ways: **as a plugin** (one command, updates itself) or **by copying the skill folders** (nothing
to register, easy to edit). Pick one — installing both gives you two copies of every skill.

### Option 1 — as a plugin (recommended)

This repo is a Claude Code marketplace named `olcayseygan`, holding a single plugin called `crumora`
— so the skills show up as `crumora:code-improve`, `crumora:code-audit`, `crumora:data-report` and
so on.
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

#### Install all six

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

`code-audit`, `code-rules`, `data-report` and `request-readback` are fully independent — take one on
its own, copying the whole folder (`code-rules` carries its `rules/`):

```bash
cp -r crumora/skills/code-audit ~/.claude/skills/
```

`code-improve` and `ui-redesign` read the shared rulebook, so they need `_shared/` next to them:

```bash
cp -r crumora/skills/code-improve crumora/skills/_shared ~/.claude/skills/
```

#### What it should look like afterwards

```
~/.claude/skills/
├── _shared/tournament.md      ← shared rulebook, not a skill
├── code-improve/SKILL.md
├── ui-redesign/
│   ├── SKILL.md
│   └── references/
├── code-audit/SKILL.md
├── code-rules/
│   ├── SKILL.md
│   └── rules/
│       ├── core.md
│       ├── ui.md
│       └── idiom/
├── request-readback/SKILL.md
└── data-report/
    ├── SKILL.md
    ├── references/
    └── scripts/
```

The folder name and the `name:` field in the file's front matter must match, and the file must stay
named `SKILL.md`. Don't strip the `---` front matter block at the top — that is what makes it a skill
rather than a note. `data-report` and `ui-redesign` carry `references/` (and `data-report` a
`scripts/`), and `code-rules` carries `rules/` — copy the whole folder, not just the one file. `_shared/` holds no `SKILL.md` and is not a skill; it is the rulebook `code-improve` and
`ui-redesign` read at the start of a run.

#### Verify

**Restart Claude Code** — the skill list is read at session start, so a freshly copied skill will not
appear in a running session. Then type `/` and look for `code-improve`, `ui-redesign`, `code-audit`,
`code-rules`, `data-report`, `request-readback`, or just ask *"which skills do you have?"*.

#### Update

```bash
cd crumora && git pull
cp -r skills/* ~/.claude/skills/
```

Restart afterwards, same reason.

#### Uninstall

Delete the folder — `rm -rf ~/.claude/skills/code-audit`. Nothing else is touched; skills leave no state
behind.

#### Troubleshooting

- **The slash command doesn't show up.** You didn't restart, or the file is at
  `~/.claude/skills/SKILL.md` instead of `~/.claude/skills/<name>/SKILL.md`.
- **It's listed but never triggers on its own.** Invoke it explicitly with `/code-audit …`. The
  description is what makes Claude reach for it unprompted; if you edited it, keep the trigger
  phrases in there.
- **You already have a skill with one of these names.** Rename the folder *and* the `name:` field to
  match, e.g. `code-audit-panel`.

## Why bother

- An attempt that loses is **information**, not wasted work: you now know the current version is
  defensible, and the analysis says exactly why.
- The incumbent advantage (ties go to the champion) keeps churn out of the repo.
- A frozen rubric stops the goalposts drifting toward whatever the newest attempt happens to be good
  at — which is what "it feels better" usually means.

## License

MIT — see [LICENSE](LICENSE).
