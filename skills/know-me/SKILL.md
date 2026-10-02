---
name: know-me
description: Learns how you and this project work — repo, build, CI, git history, CLAUDE.md, memory and the prompts you typed into Claude Code here — and turns what repeats into the project's own Claude Code setup - skills, slash commands, subagents, hooks and CLAUDE.md lines. Every artifact cites its evidence; nothing for a need not yet seen, nothing duplicating what is installed, every hook run against a real payload. Output is one line per file with its evidence, a verification line, at most three watch-list lines and a restart note when skills or agents were written. Use when the user says "/know-me", "set up claude for this project", "generate skills for this repo", "make commands and hooks for this project", "what should I automate here", "build my .claude folder", "learn how I work", or the Turkish "beni tani", "projeyi tani", "bu proje icin skill hook command agent olustur", "claude kurulumunu yap". For checking code against a rule set use lint; for proving a request was understood use readback.
---

# know-me — turn what repeats into the project's own setup

Read how this project and this person work, find what repeats, and write the Claude Code setup that
removes it: skills, slash commands, subagents, hooks and `CLAUDE.md` lines. File formats, paths and
hook payloads are in [`references/formats.md`](references/formats.md) — read it before writing the
first file.

## Invariants

- **Evidence or nothing (MUST).** Every artifact names the evidence that earned it — a file and line,
  a commit range, a transcript count, a CLAUDE.md rule. No generic starter-kit artifact, nothing for
  a workflow the project does not have yet.
- **Repetition is the bar.** Three or more occurrences — in the prompts typed here, the git history,
  the CI steps — or a standing written rule in `CLAUDE.md` or memory. Twice goes on the watch list,
  not into a file.
- **Nothing that already exists (MUST).** Inventory first: the project's `CLAUDE.md` files and
  `.claude/` (settings, hooks, permissions, skills, commands, agents), the personal `~/.claude/`
  equivalents, installed plugins and their skills, the memory index, built-in commands. An overlap is
  dropped or folded in, never copied under a new name.
- **Reads are private, writes are project-scoped.** Nothing from transcripts or memory is quoted
  into an artifact, except that trigger phrases in a description may use the user's own wording as
  typed. No secret, token, home-directory path or customer name lands in a generated file. Writes go
  to the project's `.claude/` and `CLAUDE.md`; `~/.claude/` only when the user asks.
- **Existing files are merged, not replaced (MUST).** `settings.json` is parsed, hooks added beside
  the existing ones, written back valid. `CLAUDE.md` gains lines; nothing the user wrote is reworded
  or removed. An existing skill, command or agent with the same name is left alone, the collision
  reported, and no new file takes that name.
- **Every hook is run before it is handed over (MUST).** Real payload for its event, once with input
  that should pass and, where exit `2` blocks or feeds back, once with input that should trip it.
- **Generated code follows the project's own rules** — commit conventions, language, style, lint.
- **One stop before writing.** The inventory is confirmed with one yes before any file is written;
  the user may strike rows. No questions after the yes.
- **Lightest kind, fewest files.** `CLAUDE.md` line → hook → command → skill → subagent; take the
  lightest that removes the need, and merge candidates that share a trigger.

## Kinds

| Kind | Fits | Not when |
| --- | --- | --- |
| `CLAUDE.md` line | a fact or rule the model keeps getting wrong or being told | already written, or the code states it |
| Hook | a mechanical rule a script checks with no judgement | the check needs judgement |
| Slash command | a multi-line instruction the user starts on purpose | it should trigger from plain speech |
| Skill | a multi-step procedure that triggers from plain speech | it fits in a paragraph |
| Subagent | a recurring task that reads far more than it returns, or needs a narrower tool set | it needs the conversation's context |

## Flow

1. **Scope.** Default: the session's repository, all five kinds. An argument narrows it (*"just
   hooks"*, a folder). Pinned once, never grows.
2. **Inventory** what exists, one line each.
3. **Read the project** — build surface, CI, layout, git history, written rules — only far enough to
   find what repeats.
4. **Read the person's prompts** in this project's transcripts (path and entry shape in
   `references/formats.md`). Count by intent, across languages. Count corrections separately — a
   repeated correction is the strongest signal. Too few transcripts: say so in one line and work from
   the repo; never invent a habit.
5. **Propose and kill.** Each candidate: kind, name, what it does, evidence, count. Drop any that
   breaks an invariant or can merge into another. Names in the project's language, no collision with
   a built-in command. Short only on count → watch list.
6. **The stop.** One table, one question: write these?

   | Kind | Name | Does | Evidence |
   | --- | --- | --- | --- |

7. **Write** each artifact in its format, with the project's real commands, paths and thresholds —
   no placeholders. Subagents get the narrowest tool list and an output contract, in the
   report style the project's `CLAUDE.md` sets, if it sets one. Hook scripts go in
   `.claude/hooks/`, use a runtime the project already has, read the payload from stdin, and exit
   `2` with a message naming the file and the rule when they block.
8. **Verify (MUST).** Every JSON and front matter block parses; each `name` matches its folder or
   file. Every hook runs on a real payload for its event inside its timeout: pass case
   exits `0`; where exit `2` blocks or feeds back (`formats.md` table), a trip case exits `2` with
   the expected message; on other events its output is checked. Every command and skill name is
   unique across project, personal and plugin scope. `git diff --stat` shows only the confirmed
   files. A red check is fixed and re-run.

## Output

One line per file written, then the verification line, then at most three watch-list lines. Nothing
else, except a restart note when skills or agents were written.

```
<path>    new|edit   <what it is>    [<evidence>]
verified: <JSON parsed>, <front matter parsed>, hook <name> pass=0 trip=2 | output ok, no name collisions, diff = <n> files
seen twice — worth watching: "<need>" (2x)
```
