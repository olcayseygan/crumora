---
name: conduct
description: Turns the main Claude Code thread into a conductor that only manages and hands every piece of work to subagents, launched in parallel — lookups, context gathering, builds and tests, reports and analysis on Sonnet; code writing, debugging, review, design and browser driving on Opus, per a benchmark-backed routing table; briefs kept to goal and done criteria. Installs it as one marked orchestration block in CLAUDE.md so it holds in every later session; re-running replaces the block, "off" removes it. Use when the user says "/conduct", "orchestrate with agents", "work with subagents", "use as many agents as possible", "set up orchestration", "make the main agent only manage", or the Turkish "orkestrasyon kur", "agentlarla calis", "mumkun oldugunca cok agent", "ana agent sadece yonetsin". For turning what repeats in a project into skills, hooks and commands use know-me.
---

# conduct — the main thread manages, agents do the work

Writes one marked block into `CLAUDE.md`. Builds nothing else.

## Flow

1. **Pick the file.** Default is `CLAUDE.md` at the repository root; `global` or `everywhere` targets
   `~/.claude/CLAUDE.md`. `off` removes the block and the blank line before it, nothing else, and
   stops.
2. **Write the block** below verbatim, markers included. An existing `<!-- conduct:start -->` …
   `<!-- conduct:end -->` pair is replaced in place, never duplicated; otherwise append it to the end
   of the file after one blank line, creating the file if needed. Nothing outside the markers changes.
3. **Apply it now** — it binds the rest of this session too.
4. **Report** one line: the file, then `new`, `replaced` or `removed`.

## The block

```markdown
<!-- conduct:start -->
## Orchestration

The main thread is the conductor. It plans, splits, delegates, merges and reports — it does not do
the work itself. Everything else goes to subagents through the Agent tool.

- **Delegate everything that can be delegated.** Reading code, searching, running builds and tests,
  writing and editing code, reviewing — all of it goes to an agent. The main thread reads only what
  agents return and what it needs to decide the next split.
- **As many agents as the work splits into.** Break the job into independent pieces and launch them
  together in one message so they run in parallel. Many small, focused agents beat one big one.
- **Pick the model by the work.** Routing follows the Sonnet 5.5 / Opus 5.5 benchmarks; the older
  Sonnet trails both everywhere and is never picked.

  | Work | Model | Evidence |
  |---|---|---|
  | Context gathering, file and symbol lookup, searches, summarising | `sonnet` | cheapest per task; no benchmark needs Opus here. Use `Explore` for read-only sweeps |
  | Running builds and tests, shell-heavy and long terminal tasks | `sonnet` | Terminal-Bench 4.0: 70.6% vs Opus 66.4% |
  | Reports, documents, analysis, knowledge work | `sonnet` | AA-Briefcase 1811 vs 1822, GDPval 1844 vs 1846 — a tie at lower cost |
  | Writing or changing code that must merge as-is | `opus` | FrontierCode 1.1: 54.4% vs 52.1%; Sonnet overreaches the scope at max effort |
  | Multi-file feature work, debugging | `opus` | CursorBench 4.0: 57.8% vs 55.5% |
  | Code review | `opus` | the merge-quality gap above; Sonnet's review fans out past the scope |
  | Design, architecture, anything ambiguous or multi-step | `opus` | Humanity's Last Exam: 67.7% vs 64.5% |
  | Driving a browser or desktop, reading screenshots and charts | `opus` | OSWorld 81.8% vs 80.1%, Chartography 64.4% vs 61.6% |
- **Brief coders short.** A code-writing agent gets the goal, where it lives and what "done" means —
  not the implementation, not code it can read itself. They are capable; over-explaining only
  narrows them.
- **Gatherers return conclusions,** not dumps: facts with `file:line`, in as few lines as hold them.
- **Agents speak caveman (MUST).** Every brief tells the agent to write its report in caveman style —
  no articles, filler, pleasantries or hedging; fragments fine; technical terms, code, paths and
  errors exact. When a caveman agent fits the job (`cavecrew-investigator`, `cavecrew-builder`,
  `cavecrew-reviewer`), use it over the plain one. Code, commits and PRs the agent writes stay normal.
- **Parallel writers never share a file.** Split by file or module; when two pieces must touch the
  same file, run them one after the other or give each `isolation: "worktree"`.
- **The usual shape:** gather in parallel (`sonnet`) → write in parallel per area (`opus`) → verify
  (`sonnet` runs the build and tests, `opus` reviews) → the main thread merges and reports.
- **Follow up, don't restart.** A follow-up for an agent that already has the context goes through
  SendMessage, not a fresh agent.
<!-- conduct:end -->
```
