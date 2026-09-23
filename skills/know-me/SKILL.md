---
name: know-me
description: Learns how you and this project actually work — from the repo, its build and test commands, its CI, its git history, its CLAUDE.md and memory, and the prompts you have typed into Claude Code in this project before — and turns what repeats into the project's own Claude Code setup - skills, slash commands, subagents, hooks and the CLAUDE.md prompt. Every artifact cites the evidence that earned it; nothing is generated for a need that has not shown up yet, nothing duplicates what is already installed, and every hook is run against a real payload before it is handed over. Output is the file list only — one line per artifact with its evidence. Use when the user says "/know-me", "set up claude for this project", "generate skills for this repo", "make commands and hooks for this project", "what should I automate here", "build my .claude folder", "learn how I work", or the Turkish "beni tani", "projeyi tani", "bu proje icin skill hook command agent olustur", "claude kurulumunu yap". For checking code against a rule set use lint; for proving a request was understood use readback.
---

# know-me — turn what repeats into the project's own setup

A good colleague does not arrive with a toolbox. They watch for a week, notice that you run the same
four commands before every commit, that you correct the same mistake every third day, that one kind
of question always sends you digging through the same folder — and only then build the thing that
removes it.

This skill is that week, compressed. It reads **how this project and this person actually work**,
finds what repeats, and writes the Claude Code setup that removes the repetition: skills, slash
commands, subagents, hooks and the always-on prompt in `CLAUDE.md`. The house discipline holds —
nothing reaches you until something tried to kill it. Here the fight is between a proposed artifact
and the question *"did this ever actually happen?"*

The three failure modes it exists to prevent:

- **The starter kit** — a `.claude/` folder full of generic `/review`, `/test`, `/explain` commands
  that would look the same in any repo. They cost context every session and are used never. An
  artifact that could have been written without reading this project was not earned by it.
- **The wished-for workflow** — a command for the release process the project does not have yet, a
  hook for the formatter nobody installed. Generated scaffolding for a future that may not come is
  the same slop in a new folder.
- **The unrun hook** — a hook that looks right and fails on the first real payload, blocking every
  edit in the session, or passes silently and checks nothing. A hook is code that runs without
  asking; it is tested like code.

---

## Invariants

- **Evidence or nothing (MUST).** Every artifact names the evidence that earned it — a file and line,
  a commit range, a transcript count, a CLAUDE.md rule. An artifact whose evidence line would read
  *"generally useful"* is not written.
- **Repetition is the bar.** A workflow earns an artifact when it shows up **three or more times** —
  in the prompts typed here, in the git history, in the CI steps — or when it is written down as a
  standing rule in `CLAUDE.md` or memory. Once is an anecdote. Twice is a coincidence you mention in
  the closing lines, not a file.
- **Nothing that already exists (MUST).** Before proposing, list what is installed: the project's
  `.claude/`, the personal `~/.claude/` skills, commands and agents, installed plugins, and the
  built-in commands. A proposal that overlaps one of them is dropped or folded into it — never a
  second copy under a new name.
- **Reads are private, writes are project-scoped.** Transcripts and memory are read to learn, never
  quoted into an artifact. No secret, token, path under the home directory, customer name or pasted
  content from a transcript lands in a generated file. Artifacts go to the project's `.claude/` and
  `CLAUDE.md`; the personal `~/.claude/` is written only when the user asks for it.
- **Existing files are merged, not replaced (MUST).** `settings.json` is parsed, the new hooks are
  added beside the existing ones, and it is written back valid. `CLAUDE.md` gains lines; nothing the
  user wrote is reworded or removed. An existing skill, command or agent with the same name is read
  and left alone — the collision is reported.
- **Every hook is run before it is handed over (MUST).** Fed a real payload for its event, once with
  input that should pass and once with input that should trip it, and both exit codes checked. A hook
  that was not run is not shipped.
- **The project's own rules apply to what is generated.** Commit conventions, language, code style,
  the lint gate — a generated hook script is held to the same standard as any other code in the repo.
- **One stop before writing.** Hooks run on their own and commands change how a team works, so the
  inventory is shown once and confirmed with one yes before any file is written. After the yes, no
  more questions.
- **Fewest artifacts that cover it.** Ten repeated needs rarely need ten files. Merge what shares a
  trigger; prefer one line in `CLAUDE.md` over a skill when a sentence does the job.

## Pick the right kind

Each need gets the lightest kind that removes it. The file formats are in
[`references/formats.md`](references/formats.md) — read it before writing the first file.

| Kind | Earns it when | Not when |
| --- | --- | --- |
| **`CLAUDE.md` line** | A fact or rule the model keeps getting wrong or keeps being told: the test command, the folder that is generated, the convention that got corrected | It is already in `CLAUDE.md`, or the code states it plainly |
| **Hook** | The rule is mechanical and checkable by a script with no judgement — a formatter after every edit, a forbidden path, a generated file that must not be hand-edited, a command that must never run | The check needs judgement; a hook that guesses blocks good work |
| **Slash command** | The user types the same multi-line instruction by hand, starting it on purpose — a release checklist, a ticket-to-branch routine, a report they ask for weekly | The model should pick it up on its own from plain speech — that is a skill |
| **Skill** | A multi-step procedure with its own knowledge that should trigger from plain speech, often with reference files or scripts next to it | It fits in one paragraph — that is a command or a `CLAUDE.md` line |
| **Subagent** | A recurring task that reads far more than it returns — a sweep of logs, a cross-module search, a review pass — so its reading belongs outside the main context; or a task that needs a narrower tool set | It needs the conversation's context to do the job, or it is done in two tool calls |

Where two kinds fit, take the lighter one: `CLAUDE.md` line → hook → command → skill → subagent.

## Flow

### 1. Pin the scope

Default scope is the repository the session was started in, all five kinds. An argument narrows it:
*"just hooks"*, *"only commands"*, *"the backend folder"*. The scope is pinned once and never grows
mid-run.

### 2. Take the inventory of what exists

List, with one line each: the project's `CLAUDE.md` files at every level, `.claude/settings.json` and
`settings.local.json` with their hooks and permissions, `.claude/skills`, `.claude/commands`,
`.claude/agents`, the personal `~/.claude/` equivalents, the installed plugins and their skills, and
the memory index. This is the list every proposal is checked against in step 5.

### 3. Read the project

Only far enough to find what repeats — this is not an audit.

- **The build surface.** Package manifests and their scripts, Makefiles, task runners, `justfile`,
  CI workflows, Dockerfiles, pre-commit config. What runs before a merge is what the project already
  considers mandatory — the strongest candidate for a hook or a `CLAUDE.md` line.
- **The shape.** Languages, top-level folders, generated and vendored folders, the test layout, the
  config files that must not be hand-edited.
- **The history.** `git log` over the last few hundred commits: the message convention actually used,
  the files that change together, the fix that keeps coming back, the revert pattern.
- **The written rules.** `CLAUDE.md`, `CONTRIBUTING`, lint configs, memory files. A rule that is
  written down but not enforced is a hook candidate; a rule enforced but not written down is a
  `CLAUDE.md` candidate.

### 4. Read how the person works

The prompts typed into Claude Code in this project are the best evidence of what repeats, and the
only evidence of what gets corrected.

- Transcripts live under `~/.claude/projects/<project-slug>/*.jsonl`, the slug being the absolute
  project path with every non-alphanumeric character replaced by `-`. Read the user turns only —
  entries whose `type` is `user` and whose content is text the person typed, not tool results.
- Cluster them by intent, not by wording: *"run the tests and fix what fails"* and *"testleri kos,
  kirilani duzelt"* are one cluster. Count each cluster.
- Mark the **corrections** separately — *"no, not like that"*, *"I told you"*, *"again"*, *"yine"*,
  *"dedim ya"*. A correction that repeats is the most valuable signal in the whole run: it is either
  a `CLAUDE.md` line or a hook.
- No transcripts, or too few to count? Say so in one line and work from the repo alone. Never invent
  a habit to fill the gap.

### 5. Propose, then kill

Write each candidate as one row: kind, name, what it does, evidence, count. Then run the kill pass —
each candidate survives only if all hold:

- The evidence is real, specific to this project, and meets the repetition bar.
- Nothing in the step 2 inventory already does it.
- It is the lightest kind that removes the need.
- It could not be merged into another surviving candidate.
- Its name says what it does, in the project's language, and collides with no built-in command.

Everything else goes. Candidates that fell short only on count are kept for the closing lines as
*"seen twice — worth watching"*, not written.

### 6. The stop

Print the surviving inventory as one table and ask one question: write these? The user can strike
rows; struck rows are gone for the rest of the run. No second question after the answer.

| Kind | Name | Does | Evidence |
| --- | --- | --- | --- |
| hook | `PostToolUse` Edit\|Write → `dotnet format` | formats every edited `.cs` file | CI step `format --verify-no-changes` failed in 7 of the last 40 runs |
| command | `/release` | bumps the version, writes the changelog, tags | typed by hand 5 times, 3 of them in Turkish |
| CLAUDE.md | "never edit `Library/`" | stops edits to generated Unity files | corrected 4 times across 3 sessions |

### 7. Write

Write each artifact in the format from `references/formats.md`, in the project's language for
names and descriptions. Each one:

- **Skill and command descriptions** lead with what it does, then the phrases that trigger it —
  including the exact phrasings found in the transcripts, in whatever language they were typed.
- **Skill and command bodies** carry the procedure as the person actually does it, with the real
  commands, paths and thresholds from step 3 — not placeholders.
- **Subagents** get the narrowest tool list that does the job and an output contract: what they
  return, how short, in what shape.
- **Hook scripts** live in `.claude/hooks/`, are written in whatever runtime the project already
  has, read their payload from stdin, and exit `2` with a message that names the file and the rule
  when they block.
- **`CLAUDE.md` lines** go under the heading they belong to, one fact per line, matching the file's
  existing voice.

### 8. Verify (MUST)

- Every JSON file parses; every front matter block parses and its `name` matches its folder or file.
- Every hook runs twice against a hand-built payload for its event — pass case exits `0`, trip case
  exits `2` with the expected message — and finishes inside its timeout.
- Every command and skill name is unique across project, personal and plugin scope.
- `git diff --stat` shows only the files in the confirmed inventory.

A red check is fixed and re-run, not reported and left.

## Output

One line per file written, then the verification line, then at most three lines of what was seen but
not built. No report, no feature tour, no per-artifact essay.

```
.claude/hooks/format-cs.js           new   PostToolUse Edit|Write — dotnet format on edited .cs   [CI format step, 7/40 red]
.claude/settings.json                edit  +1 hook, existing 2 kept
.claude/commands/release.md          new   /release — version, changelog, tag                    [typed 5x]
.claude/agents/log-sweeper.md        new   reads build logs, returns first real error + file:line [asked 6x, avg 40 files read]
CLAUDE.md                            edit  +2 lines under "Code Style"                           [corrected 4x, 3x]

verified: 2 JSON parsed, 3 front matter parsed, hook pass=0 trip=2 in 0.4s, no name collisions, diff = 5 files
seen twice — worth watching: "benchmark the parser" (2x), "update the screenshots" (2x)
```

Close with nothing after the last line. Restarting Claude Code to load new skills and agents is
mentioned only if any were written.

---

## MUST summary

- Every artifact cites real, project-specific evidence; nothing generic, nothing for a need that has not appeared.
- The bar is three occurrences or a standing written rule; twice is reported, not built.
- The installed setup is inventoried first; no overlap with project, personal, plugin or built-in artifacts.
- The lightest kind wins: CLAUDE.md line, then hook, command, skill, subagent.
- Transcripts and memory are read to learn, never quoted; no secret or personal content reaches a generated file.
- Existing files are merged, never replaced; collisions are reported, not overwritten.
- One confirmation before writing, none after.
- Every hook is run with a pass and a trip payload; every JSON and front matter block is parsed.
- Output is the file list with evidence, the verification line and at most three watch-list lines.
