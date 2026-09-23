# Claude Code file formats

What `know-me` writes, and where. Project scope is `<repo>/.claude/`; personal scope is `~/.claude/`
and is written only on request. A project file with the same name as a personal one wins.

## Skill — `.claude/skills/<name>/SKILL.md`

```markdown
---
name: <name>                       # must equal the folder name; lowercase, hyphens
description: <what it does>. Use when the user says "<phrase>", "<phrase>", or "<phrase in their language>".
allowed-tools: Read, Grep, Bash    # optional; omit to inherit
---

# <name> — <one line>

<procedure with the project's real commands, paths and thresholds>
```

- The description is the only part loaded every session; it decides whether the skill triggers.
  Lead with the job, then the trigger phrases — the ones actually found in the transcripts.
- Reference files and scripts sit next to `SKILL.md` and are linked by relative path; they are read
  only when the skill runs.
- Add `disable-model-invocation: true` when the skill must only ever run on `/name`, never on its own.

## Slash command — `.claude/commands/<name>.md`

```markdown
---
description: <shown in the / menu>
argument-hint: <version> [--dry]   # optional
allowed-tools: Bash(git tag:*), Bash(npm version:*)   # optional; needed for ! lines
---

<the instruction, as the person types it, with the real commands>

Target: $ARGUMENTS
```

- `$ARGUMENTS` is everything after the command; `$1`, `$2` are positional.
- A line `` !`git status --short` `` runs before the prompt is sent and inlines its output; it needs
  a matching `Bash(...)` entry in `allowed-tools`.
- `@path/to/file` inlines a file.
- Sub-folders namespace the command: `commands/db/migrate.md` is `/db:migrate`.
- Never reuse a built-in name: `help`, `clear`, `compact`, `config`, `init`, `review`, `memory`,
  `model`, `permissions`, `hooks`, `agents`, `mcp`, `plugin`, `resume`, `cost`, `status`, `doctor`,
  `login`, `logout`, `bug`, `add-dir`, `vim`, `terminal-setup`, `export`, `context`.

## Subagent — `.claude/agents/<name>.md`

```markdown
---
name: <name>                        # must equal the file name without .md
description: <when the main thread should delegate to it — concrete triggers>
tools: Read, Grep, Glob             # comma list; omit to inherit every tool
model: haiku                        # sonnet | opus | haiku | inherit; omit to inherit
---

<system prompt: the job, the procedure, and the output contract — what it returns, in what shape, how short>
```

- It starts with an empty context: the prompt must carry everything the task needs.
- Read-only jobs get read-only tools. A reviewer that can `Edit` is a builder.
- The output contract is the point: the main thread pays for every line it returns.

## Hook — `.claude/settings.json` + `.claude/hooks/<name>.<ext>`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/format-cs.js\"", "timeout": 30 }
        ]
      }
    ]
  }
}
```

Merge into the existing `hooks` object: append to the event's array, never replace it.

| Event | Fires | `matcher` | Exit `2` does |
| --- | --- | --- | --- |
| `PreToolUse` | before a tool runs | tool name regex | blocks the call; stderr goes to the model |
| `PostToolUse` | after a tool succeeds | tool name regex | stderr goes to the model so it fixes the result |
| `UserPromptSubmit` | on each prompt | — | blocks the prompt; stdout on exit `0` is added as context |
| `Stop` / `SubagentStop` | when the turn would end | — | keeps it going; stderr says why |
| `SessionStart` | start, resume, clear, compact | `startup` \| `resume` \| `clear` \| `compact` | stdout on exit `0` is added as context |
| `PreCompact` | before compaction | `manual` \| `auto` | — |
| `Notification` | on a permission prompt or idle | — | — |
| `SessionEnd` | on exit | — | — |

Payload arrives as JSON on stdin. Always present: `session_id`, `transcript_path`, `cwd`,
`hook_event_name`. Tool events add `tool_name` and `tool_input` (`file_path`, `command`, `content`,
…); `PostToolUse` adds `tool_response`; `UserPromptSubmit` adds `prompt`.

- Exit `0` passes. Exit `2` blocks or feeds back, per the table. Any other code is a non-blocking
  error shown to the user only.
- `$CLAUDE_PROJECT_DIR` is the repo root; use it so the hook works from any cwd.
- A `PreToolUse` or `PostToolUse` hook filters on `tool_input.file_path` itself — the matcher only
  sees the tool name. Exit `0` fast for files it does not own.
- Test it before registering:
  `echo '{"hook_event_name":"PostToolUse","tool_name":"Edit","tool_input":{"file_path":"src/a.cs"},"cwd":"."}' | node .claude/hooks/format-cs.js; echo $?`

## Prompt — `CLAUDE.md`

- `<repo>/CLAUDE.md` is loaded every session and checked in; `<repo>/CLAUDE.local.md` is personal
  and git-ignored; a `CLAUDE.md` in a sub-folder loads when files there are touched.
- One fact per line, under the heading it belongs to. Imperative, specific, checkable:
  *"Run `npm run test:unit` — `npm test` also starts the e2e suite"*, not *"write good tests"*.
- It costs context every session: a line earns its place only if the model would get it wrong
  without it.

## Permissions — `.claude/settings.json`

Only when a generated command or hook needs it, and only the narrowest pattern:

```json
{ "permissions": { "allow": ["Bash(dotnet format:*)"] } }
```
