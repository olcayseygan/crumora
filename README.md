# crumora

> This repo is also a [Claude Code](https://claude.com/claude-code) marketplace named `olcayseygan` —
> take all seven with one command: `claude plugin install crumora@olcayseygan`.

Seven [Claude Code](https://claude.com/claude-code) skills that turn *"let me try that again"* into a
tournament: **do the work, score it, fight it against the previous version, repeat until nothing
beats the champion** — then hand back an honest post-mortem and a round-by-round table.

| Skill | Move | Answers |
| --- | --- | --- |
| **`compose`** | recomposes the interface and judges the rendered pixels | *does it actually look and read right?* |
| **`humanize`** | rebuilds the interaction and judges the walked tasks | *can a person actually get the job done?* |
| **`lint`** | checks the code against a fixed rule set and edits until it passes | *does it pass, rule by rule?* |
| **`gauge`** | measures the rendered pixels — type, colour, geometry — and edits until they pass | *do the fonts, colours and edges measure up?* |
| **`data-report`** | leaves the code alone; measures the data and writes it up | *what do the numbers actually say?* |
| **`muster`** | checks the interface against 73 UX patterns and edits until it passes | *does this screen pass muster?* |
| **`readback`** | starts nothing; hands the request back as consequences | *did I understand what you asked?* |

Each name says what it acts on and what it does to it: `compose` and `humanize` build, `lint`, `gauge` and
`muster` judge and then repair — printing edits instead of prose, one against the code, one against
the rendered pixels and one against the interface's behaviour — and `data-report` and `readback` write it down. What `compose` and `humanize` add is the
tournament around the work: every attempt is scored, fought against the version it wants to replace, and thrown
away if it doesn't win.

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

`compose` and `humanize` read their rulebook from a separate file —
[`skills/_shared/tournament.md`](skills/_shared/tournament.md) — holding the setup invariants, the
rubric, the scoring and VS rules, the stop-and-apply steps and the final-analysis format. Each one's
own `SKILL.md` carries only what is specific to its move.

`lint`, `gauge`, `data-report`, `muster` and `readback` are the odd ones out: none of them produces
a version to score. In `lint`, `gauge` and `muster` the fight happens between a rule and a violation that
has to survive an attempt to kill it; in `data-report` between a claim and the data that has to back
it; in `readback` between a reading of the request and the rival reading that wants to replace it.
The discipline is identical — nothing reaches you until something tried to kill it.

## `compose` — rebuild the interface

The pixel-level one: recomposes a surface from a blank canvas and obsesses over the boring things
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
/compose the settings panel
/compose the match HUD
```

## `humanize` — rebuild the interaction around the person

The behaviour one: `compose` judges what a surface looks like, this judges **what a person goes
through to get the job done** — the steps, the hesitations, the waits, the mistakes, and what it costs
to get out of one. A better-looking obstacle is still an obstacle.

| Criterion | Weight |
| --- | --- |
| Task efficiency | 20 |
| Clarity of the next move | 20 |
| Error prevention & recovery | 20 |
| Feedback & system status | 15 |
| Reach & inclusiveness | 15 |
| Memory & cognitive load | 10 |

- **The people and the tasks are frozen up front** — who uses it, how often, on what input; three to
  seven tasks written as the person's goal; plus stress paths walked every round: wrong input, empty
  first run, slow and failing network, reload mid-task, undo, keyboard only, narrow touch viewport.
- **Every task is walked through the render as the person** — knowing the goal, not the interface.
  Each step answers the four cognitive-walkthrough questions; each task totals steps, decisions,
  context switches, recall load, pointer travel, measured latency, dead ends and recovery cost.
- **Round 0 is walked before anything is designed**, so every later number has a baseline.
- **Each round rebuilds the interaction, not the paint** — one stated idea, then a flow map, a primary
  move per screen, a feedback contract, an error contract and the defaults.
- **The gate is a clean render with every task completable** end to end; a task that cannot be
  finished loses the round.
- **The blind judge sees two traces**, not the source — and every verdict names a task and a step.
- **Red lines** (automatic loss): a task cannot be completed or typed input is lost, the most frequent
  task got more expensive, an irreversible action lost its undo or confirmation, the keyboard path
  broke, text fails AA, or a validation, permission check or binding was dropped.
- The final analysis always says it: **the walk is a proxy for a real person, not a usability test.**

```
/humanize the checkout
/humanize bu tasarim sacma, kullanici burada kayboluyor
```

## `lint` — check it against the rules and fix what fails

The gate. **A rule set known in advance, and every violation fixed in place instead of written up** —
the output is the edit list, not a report.

- **Three levels, the way the caveman modes work — `lite`, `full`, `ultra`, default `full`.** `lite`
  is the surface pass (`names`, `verbs`, `nouns`, `booleans`, `literals`, `comments`, `spacing`);
  `full` adds everything behavioural (`types`, `repetition`, `idiom`, `guards`, `teardown`,
  `dead-code`, `mutation`, `errors`, `flags`, `floating`, `clock`); `ultra` adds the architecture
  (`solid`, `single-entry`, `tests`, `direction`).
- **The level is the only dial.** No running one rule alone, no dropping one out of a level — a preset
  you can edit rule by rule is not a preset. To check less, go down a level; to check more, go up.
- **Rules are named, never numbered.** The name is what prints next to the edit it produced. `idiom`
  loads per language from `rules/idiom/` — Python, JavaScript/TypeScript, C#/Unity, C, C++.
- **Every rule the level enables, against every file.** A rule that was not looked for is not silently
  clean — it is checked, or one line says why it could not be.
- **`.lint.md` at the repo root sets the default depth** with a single `level lite` line, and nothing
  else. The invocation still wins over it.
- **`injection` is the floor: it runs at every level, lite included**, together with the secrets clause
  of `literals`. Nothing switches either one off.
- **It ends in a diff, not a question.** One line per edit, then the verification line, then whatever
  genuinely needed your decision.
- **It answers to plain speech**, not only to the slash command — *"check this against the rules"*,
  *"is this SOLID"*, *"too many null checks"*, *"kurallara uyuyor mu"*.

```
/lint src/parser.ts
/lint lite
/lint ultra the diff
```

### Always on

Installed as a plugin, `lint` also runs a `SessionStart` hook — `src/hooks/lint-activate.js` — that
prints the active level and the gate that comes with it into every session, including after a
compaction. Nothing is checked and nothing is edited: it is the writing standard, so the code arrives
already past the gate instead of being fixed afterwards. The rule text itself stays in
`rules/core.md` and is read only when you actually run the skill, so the per-session cost is a dozen
lines rather than five hundred.

The level resolves the same way the skill resolves it — `CRUMORA_LINT_LEVEL` first, then a
`level lite` line in `.lint.md` at the repository root, then `full`. Setting either to **`off`**
silences the block entirely and leaves `/lint` working as normal.

```
level   off
```

## `gauge` — measure the rendered interface and fix what misses

The measurement gate. **The per-round checklist `compose` walks, pulled out and run on its own** —
every answer taken from the render and written down as a number, every miss fixed in place.

- **Nothing is checked before the target is on screen.** The project is launched, the target is
  screenshotted at each viewport and each mode, tabbed through, and measured with
  `getBoundingClientRect()` and computed colours. A coordinate read out of the stylesheet is not a
  measurement, and a target that cannot be rendered stops the run in one line rather than being
  guessed at.
- **No number, no violation.** "Feels cramped" never becomes an edit; a 22px gap in a 4/8/16/24 scale
  does. Shared edges differ by 0px, not 1-2px. Contrast pairs are computed and printed, not eyeballed.
- **Fonts are counted, not felt.** `type` lists every family that actually rendered — at most two plus
  a monospace — and states why the pair works: different structure, comparable x-height. Then the
  scale (a stray 15px is a stray 15px), at most three weights and none of them synthesised, line
  heights that track the size, a 45-75 character measure, tracking that follows size, and one render
  with the web font blocked to prove the fallback is real.
- **Colours are judged as a set.** `contrast` asks whether a pair can be read; `palette` asks whether
  the set makes sense — one neutral ramp at one hue, one leading accent, semantic colours that mean
  one thing each, ramps that are perceptually even in OKLCH rather than nudged by eye, saturation
  climbing toward the small elements, gradients with no grey dead zone, and a declared categorical set
  for charts.
- **Three levels, like `lint` — `lite`, `full`, `ultra`, default `full`.** `lite` is what one
  screenshot answers (`access`, `type`, `palette`, `contrast`, `alignment`); `full` adds what needs
  re-rendering (`responsive`, `theme`, `states`) — 360/768/1440, both colour modes, every state a
  component has; `ultra` adds the component system (`reuse`, `variants`).
- **The floor runs at every level:** keyboard reach with a visible focus ring, and body text at AA.
  Those two can never be disabled; everything else in `access` and `contrast` relaxes only clause by
  clause, with a reason.
- **`.gauge.md` at the repo root disables or relaxes a rule** — with a reason, which is the whole
  point. Light-only product, kiosk build at a fixed size, brand-signed optical nudges.
- **It ends in a diff, not a question.** One line per edit carrying the measurement, then the render
  line, then the verification line, then whatever genuinely needed your decision.

```
/gauge the settings panel
/gauge lite src/components/Board.tsx
/gauge do these fonts and colours go together
/gauge ultra the diff
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

## `muster` — make the interface pass

The UX gate. Seventy-three patterns from
[designmotionhq.com/patterns](https://designmotionhq.com/patterns) ship inside the skill, every
threshold kept verbatim, and each one that applies to the screen in front of you is checked and
fixed in place. `lint` gates the code; this gates the interface.

- **The pattern decides what fires, not the vibe.** A trigger index is walked end to end before any
  rule is read — a pattern fires when its subject exists in the target. Sixty of the seventy-three
  not firing on one component is normal; deciding that without walking the index is not.
- **Numbers are the rule.** 300ms tooltip delay, 4.5:1 body contrast, 44px hit area, 800ms autosave
  debounce, 2px focus ring at 2px offset, 3 visible toasts, `#121212` not `#000000`, y-axis at zero.
  The value goes into the code as stated, never rounded to something that felt close.
- **Every violation cites `slug#n` and `file:line`.** No pattern number, no violation. No line
  number, no violation. *"Feels cramped"* never becomes an edit; `proximity-rule#3` with both gaps
  named does.
- **Nothing is fixed until it survives a kill attempt.** Is that `outline: none` already replaced
  three lines down? Is the empty state rendered by the parent? A violation that doesn't survive is
  dropped and never mentioned — it produced no edit, so it produces no line.
- **It fixes, it doesn't ask.** Running the skill is the yes. Wrong mechanics first, then reach and
  access, then the missing states, then structure, then surface and motion, then the words — because
  a shadow tuned on a card about to be restructured is work done twice.
- **Then it looks at it.** Type check, lint, tests, and where the project can be run, the target is
  rendered and the fixed states are confirmed: the ring appears on Tab, the sheet locks body scroll,
  the skeleton matches the loaded size.
- **Two things are left unfixed, both named**: a `NEEDS DECISION` where only you know the answer
  (how long the undo window should be, what the empty state should invite) and an `OUT OF TARGET`
  where the real home is a file you didn't point at.
- **Disagreements have a fixed order**: accessibility beats aesthetics, reachability beats
  decoration, safety beats speed, recoverability beats friction, the project's own scale beats a
  derived one. A `.muster.md` at the repo root can disable or relax a pattern — with a reason, which
  is required, and never silently for contrast or focus.

```
/muster src/components/BoardCard.tsx
/muster the checkout screen
/muster --only toast-notifications,focus-states
```

## `readback` — check it landed

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
/readback
/readback the whole conversation
/readback docs/ticket-482.md
```

## What you get at the end

When a run is a tournament — `compose` or `humanize` — it closes with five headings, always:

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
— so the skills show up as `crumora:lint`, `crumora:compose`, `crumora:data-report` and
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

The one thing this route does not carry is the `SessionStart` hook, so `lint` still runs on demand but
its always-on writing standard does not load. That hook lives in the plugin manifest; if you want it
without the plugin, copy `src/hooks/lint-activate.js` somewhere and register it yourself under
`SessionStart` in `settings.json`.

#### Pick a scope first

| Scope | Where it goes | Use it when |
| --- | --- | --- |
| **Personal** | `~/.claude/skills/` (Windows: `%USERPROFILE%\.claude\skills\`) | You want these in **every** project on your machine. Recommended. |
| **Project** | `<repo>/.claude/skills/` | You want them only in one repo — and committed, so your teammates get them too. |

Both work at the same time; if a name exists in both, the project copy wins.

#### Install all seven

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

`lint`, `gauge`, `data-report`, `muster` and `readback` are fully independent — take one on its own,
copying the whole folder (`lint` and `gauge` carry their `rules/`, `muster` its `patterns/`):

```bash
cp -r crumora/skills/lint ~/.claude/skills/
```

`compose` and `humanize` read the shared rulebook, so they need `_shared/` next to them:

```bash
cp -r crumora/skills/compose crumora/skills/_shared ~/.claude/skills/
cp -r crumora/skills/humanize crumora/skills/_shared ~/.claude/skills/
```

#### What it should look like afterwards

```
~/.claude/skills/
├── _shared/tournament.md      ← shared rulebook, not a skill
├── compose/
│   ├── SKILL.md
│   └── references/
├── humanize/
│   ├── SKILL.md
│   └── references/interaction.md
├── lint/
│   ├── SKILL.md
│   └── rules/
│       ├── core.md
│       └── idiom/
├── gauge/
│   ├── SKILL.md
│   └── rules/core.md
├── readback/SKILL.md
├── muster/
│   ├── SKILL.md
│   └── patterns/
└── data-report/
    ├── SKILL.md
    ├── references/
    └── scripts/
```

The folder name and the `name:` field in the file's front matter must match, and the file must stay
named `SKILL.md`. Don't strip the `---` front matter block at the top — that is what makes it a skill
rather than a note. `data-report`, `compose` and `humanize` carry `references/` (and `data-report` a
`scripts/`), `lint` and `gauge` carry `rules/` and `muster` carries `patterns/` — copy the whole
folder, not just the one file. `_shared/` holds no `SKILL.md` and is not a skill; it is the rulebook `compose` and `humanize` read
at the start of a run.

#### Verify

**Restart Claude Code** — the skill list is read at session start, so a freshly copied skill will not
appear in a running session. Then type `/` and look for `compose`,
`humanize`, `lint`, `gauge`, `data-report`, `muster`, `readback`, or just ask *"which skills do you have?"*.

#### Update

```bash
cd crumora && git pull
cp -r skills/* ~/.claude/skills/
```

Restart afterwards, same reason.

#### Uninstall

Delete the folder — `rm -rf ~/.claude/skills/lint`. Nothing else is touched; skills leave no state
behind.

#### Troubleshooting

- **The slash command doesn't show up.** You didn't restart, or the file is at
  `~/.claude/skills/SKILL.md` instead of `~/.claude/skills/<name>/SKILL.md`.
- **It's listed but never triggers on its own.** Invoke it explicitly with `/lint …`. The
  description is what makes Claude reach for it unprompted; if you edited it, keep the trigger
  phrases in there.
- **You already have a skill with one of these names.** Rename the folder *and* the `name:` field to
  match, e.g. `lint-gate`.

## Why bother

- An attempt that loses is **information**, not wasted work: you now know the current version is
  defensible, and the analysis says exactly why.
- The incumbent advantage (ties go to the champion) keeps churn out of the repo.
- A frozen rubric stops the goalposts drifting toward whatever the newest attempt happens to be good
  at — which is what "it feels better" usually means.

## License

MIT — see [LICENSE](LICENSE).
