---
name: conduct
description: Turns the main Claude Code thread into a conductor that only manages the work and hands every piece of it to subagents — as many as the job splits into, launched in parallel — routing plain lookups and context gathering to Sonnet and code writing, debugging, design and anything that needs real thought to Opus, with short goal-and-done-criteria briefs instead of over-explained instructions. It installs the system by writing one marked orchestration block into CLAUDE.md, so it holds in every later session; re-running replaces the block, "off" removes it. Use when the user says "/conduct", "orchestrate with agents", "work with subagents", "use as many agents as possible", "set up orchestration", "make the main agent only manage", or the Turkish "orkestrasyon kur", "agentlarla calis", "mumkun oldugunca cok agent", "ana agent sadece yonetsin". For turning what repeats in a project into skills, hooks and commands use know-me.
---

# conduct — the main thread manages, agents do the work

The main thread's context is the scarcest thing in a session. Every file it reads and every line it
writes is context it no longer has for keeping the whole job straight. So it stops doing the work:
it splits the job, hands each piece to a subagent on the right model, runs them side by side, and
merges what comes back.

This skill installs that as a standing rule by writing one block into `CLAUDE.md`. It builds
nothing else.

## Flow

1. **Pick the file.** Default is `CLAUDE.md` at the repository root. The argument `global` or
   `everywhere` targets `~/.claude/CLAUDE.md` instead. The argument `off` removes the block and stops.
2. **Write the block.** Take the block below verbatim, markers included. If the file already holds a
   `<!-- conduct:start -->` … `<!-- conduct:end -->` pair, replace everything between them; otherwise
   append the block to the end of the file, one blank line before it. Create the file if it does not
   exist. Nothing outside the markers is touched, reworded or reordered.
3. **Apply it now.** The block binds the rest of this session too, not only the next one.
4. **Report** one line: the file, `new`, `replaced` or `removed`.

```
CLAUDE.md   new   conduct block — main thread orchestrates, agents do the work
```

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
- **Pick the model by the work:**
  - `sonnet` — context gathering, file and symbol lookup, searches, summarising, running a command
    and reporting its output. Use the `Explore` agent for read-only sweeps.
  - `opus` — writing or changing code, debugging, design and architecture, review, and anything
    ambiguous or that needs several steps of reasoning.
- **Brief coders short.** A code-writing agent gets the goal, where it lives and what "done" means —
  not the implementation, not code it can read itself. They are capable; over-explaining only
  narrows them.
- **Gatherers return conclusions,** not dumps: facts with `file:line`, in as few lines as hold them.
- **Parallel writers never share a file.** Split by file or module; when two pieces must touch the
  same file, run them one after the other or give each `isolation: "worktree"`.
- **The usual shape:** gather in parallel (`sonnet`) → write in parallel per area (`opus`) → verify
  (`sonnet` runs the build and tests, `opus` reviews) → the main thread merges and reports.
- **Follow up, don't restart.** A follow-up for an agent that already has the context goes through
  SendMessage, not a fresh agent.
<!-- conduct:end -->
```

## MUST summary

- One block, between the markers, verbatim; re-running replaces it in place, never duplicates it.
- Nothing outside the markers is changed.
- `off` removes the block and the blank line before it, and nothing else.
- Output is the one report line.
