# Claude Code file formats

Project scope is `<repo>/.claude/`; personal scope is `~/.claude/`. On a name clash the project file
shadows the personal one; generated names never clash.

## Transcripts — read only

`~/.claude/projects/<project-slug>/*.jsonl`, the slug being the absolute project path with every
non-alphanumeric character replaced by `-`. The person's prompts are entries whose `type` is `user`
and whose content is text they typed — not tool results, which also arrive as `user` entries.

## Skill — `.claude/skills/<name>/SKILL.md`

```markdown
---
name: <name>                       # must equal the folder name; lowercase, hyphens
description: <what it does>. Use when the user says "<phrase>", "<phrase>".
allowed-tools: Read, Grep, Bash    # optional; omit to inherit
---

<body>
```

- Only the description is loaded every session; it decides whether the skill triggers.
- Reference files and scripts sit next to `SKILL.md`, linked by relative path, read only when the
  skill runs.
- `disable-model-invocation: true` makes it run only on `/name`.

## Slash command — `.claude/commands/<name>.md`

```markdown
---
description: <shown in the / menu>
argument-hint: <version> [--dry]   # optional
allowed-tools: Bash(git tag:*), Bash(npm version:*)   # optional; needed for ! lines
---

<the instruction>

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
description: <when the main thread should delegate to it>
tools: Read, Grep, Glob             # comma list; omit to inherit every tool
model: sonnet                       # sonnet | opus | haiku | inherit; omit to inherit
---

<system prompt: the job and the output contract>
```

- It starts with an empty context: the prompt must carry everything the task needs.

## Hook — `.claude/settings.json` + `.claude/hooks/<name>.<ext>`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/<name>.js\"", "timeout": 30 }
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
- The matcher only sees the tool name; the hook filters on `tool_input.file_path` itself and exits
  `0` fast for files it does not own.
- Test before registering:
  `echo '{"hook_event_name":"PostToolUse","tool_name":"Edit","tool_input":{"file_path":"src/a.cs"},"cwd":"."}' | node .claude/hooks/<name>.js; echo $?`

## Prompt — `CLAUDE.md`

- `<repo>/CLAUDE.md` is loaded every session and checked in; `<repo>/CLAUDE.local.md` is personal
  and git-ignored; a `CLAUDE.md` in a sub-folder loads when files there are touched.
- One fact per line, under the heading it belongs to, in the file's existing voice.

## Permissions — `.claude/settings.json`

Only when a generated command or hook needs it, narrowest pattern:

```json
{ "permissions": { "allow": ["Bash(<cmd>:*)"] } }
```
