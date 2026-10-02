---
name: lint
description: Checks code against a fixed rule set at three depths — lite, full, ultra — and fixes every violation in place instead of writing a review. Covers naming, spacing, comments, literals and hardcoded secrets, types, duplication, idiom, defensive guards and swallowed exceptions, resource teardown, dead code, hidden mutation, error messages, flag parameters, floating promises, injected clocks, SOLID, single entry, tests, dependency direction, and SQL/shell/HTML/path injection. Output is the edit list only — no review report, no PASS/FAIL tables. Use when the user says "/lint", "/lint lite", "/lint ultra", "check this against the rules", "does this follow the rules", "checklist review", "check the naming", "is this SOLID", "any magic numbers", "check the spacing", "is this pythonic", "too many null checks", "is this leaking", "is this injectable", or the Turkish "kurallara uyuyor mu", "kontrol et". For a UX pattern pass over an interface use muster; for redesigning an interface use compose.
---

# lint — the rule gate

A fixed rule set. Every rule that fails is **fixed** in place, not written up: the skill hands back a
diff, not a review. Rules are named, never numbered — the name prints next to the edit it produced.

## Levels

**lite**, **full**, **ultra**. **full is the default.**

- **lite** — `names`, `verbs`, `nouns`, `booleans`, `literals`, `comments`, `spacing`.
- **full** — lite plus `types`, `repetition`, `idiom`, `guards`, `teardown`, `dead-code`, `mutation`,
  `errors`, `flags`, `floating`, `clock`.
- **ultra** — full plus `solid`, `single-entry`, `tests`, `direction`. It touches files the target did
  not name; those come back as `OUT OF TARGET` unless the user pointed at the directory.
- **The floor runs at every level, lite included:** `injection`, and the secrets clause of `literals`.
  Nothing switches either off.

**The level is the only dial.** No running one rule on its own, no dropping one rule out of a level.

The level word goes anywhere in the invocation: `/lint`, `/lint lite`, `/lint ultra src/parser.ts`,
`/lint the diff ultra`.

## Level resolution

First match wins: the level word in the invocation; the `CRUMORA_LINT_LEVEL` environment variable; the
nearest **`.lint.md`**, walking up from the working directory to the repository root; then `full`.
`.lint.md` has one format:

```
level   lite
```

Nothing else in it is honoured; a line trying to switch a single rule off gets one line saying it was
ignored. `off` (in either place) silences only the SessionStart hook; `/lint` then runs at `full`.

## Target

The argument is the target — `/lint src/parser.ts`, `/lint the diff`. No argument means the uncommitted
diff; if the tree is clean, ask **one question**. For a diff, read the surrounding file too.

Every rule the level enables is checked against **every file in the target**. A rule you did not check
is not clean: check it, or say in one line that you could not and why.

## Rules

**Always load `rules/core.md`** — every rule, tagged with the level that first enables it. Never rename
a rule: the output and every cross-reference address it by name.

**`idiom` loads per language** (not at lite): Python → `rules/idiom/python.md`; JavaScript, TypeScript,
Vue, React → `rules/idiom/typescript.md`; C#, Unity → `rules/idiom/csharp.md`; C → `rules/idiom/c.md`;
C++ → `rules/idiom/cpp.md`. A `.h` shared between C and C++ is judged by the language of the
translation unit that includes it; C compiled as C++ is judged by `c.md`, with one line saying so. For a
language with no file, apply `idiom` from `core.md` and say in one line that idiom was judged without a
reference.

## When two rules disagree

- **`guards` beats `idiom`.** `?.` and `??` outside a real IO, user or third-party boundary are deleted,
  and the `&&` chain `idiom` objected to goes with them rather than being rewritten.
- **`injection` beats `guards`.** Never delete an input check without establishing the value is
  trusted; when you cannot, it is a `NEEDS DECISION`.
- **`teardown` beats `guards`.** A teardown, and the `finally`, `using` or `with` releasing a resource,
  is not a defensive guard.
- **`dead-code` beats `comments`.** Commented-out code is deleted as dead code.

Everywhere else the rule that removes code beats the rule that rewrites it; when both remove, the one
earlier in the fix order wins. A hardcoded secret is never an edit: `literals` yields and it is a
`NEEDS DECISION`.

## Violation (MUST)

A violation has the **rule** by name, the **where** as `file:line`, the **what** in one sentence, and the
**fix** as the concrete replacement written into the code. No rule name or no `file:line`, no violation.

Before touching anything, re-check every FAIL. One that does not survive is dropped — not fixed, not
mentioned. **`injection` is the exception:** an input you cannot prove trusted stays a `NEEDS DECISION`.

## Scope budget

Count the surviving FAILs before editing. At **full and ultra**, up to **20 edits or 8 files** is fixed
outright. At **lite**, up to **40 edits or 16 files**.

Past the budget, print the count and the breakdown by rule in one or two lines, then ask **one
question**: fix everything, drop to a shallower level, or narrow to a file or a directory. If the
tree was clean at the start, say in the same question that edits will be committed one rule at a time.
The question is about *how much*, never about *whether*.

## Fix it — do not ask (MUST)

Every surviving FAIL is fixed in place, immediately. Running the skill *is* the yes. Smallest edit that
clears the rule — no drive-by refactor, no reach outside the target, nothing from a level above the one
asked for.

**Fix order** (a level switches phases off, never reorders them):

1. **delete and move** — `dead-code` first, then `repetition`, `single-entry`, `direction`, `solid`
2. **correctness** — `guards`, `injection`, `floating`, `teardown`, `clock`, `mutation`, `errors`
3. **shape** — `idiom`, `types`, `flags`
4. **surface** — `names`, `verbs`, `nouns`, `booleans`, `literals`, `comments`, `spacing`
5. **cover** — `tests`, written against the final names and shape

After the edits, **re-run every rule a fix touched.**

Exactly two kinds of finding stay unfixed, each in one line. **`NEEDS DECISION`**: the fix turns on
something only the user knows — which duplicate is the real one, what a magic string means, what the
missing test asserts, where a secret should come from, whether a value crossing into a query is
trusted, which way to break a cycle. Ask that one question in the line; do not guess. **`OUT OF
TARGET`**: the violation's real home is a file the user did not point at.

## Prove the code still works (MUST)

After the last edit run what the project already has: **type check or compile**, then the **linter** if
a config exists, then **tests** — the whole suite if fast, otherwise the files touching the target. A
lite run with no edits skips this and says so. Do not install tooling the project lacks; nothing to run
means one line saying so.

- **Green** — print the edit list and stop.
- **Red, obvious cause** (a missed call site after a rename, an import left by a deletion) — fix it as
  part of the edit and re-run.
- **Red, cause not obvious** — revert that one edit, keep the rest, report `NEEDS DECISION` with the
  error.
- **Red from a deleted guard** — keep the deletion and report `NEEDS DECISION`, not "reverted".

## Commits

Default: **no commits**; the edits sit in the working tree.

The one exception is the case the budget flagged — tree clean at the start, user chose to fix
everything past the threshold. Then **one commit per rule**, in fix order. The message follows the
repository's own convention, read from its recent `git log`, with the rule name as the scope.

Never amend, never rebase, never touch a commit the user made.

## Output — the edits, nothing else

**No report.** No rule table, no findings table, no verdict, no `ReportFindings` call, no closing
question, no rules that passed. The header names the level; then one line per edit — `file:line`, rule
name, what changed; then the verification line; then the unfixed ones:

```
lint · full

parser.ts:44        types       parse now returns ParseResult
service.ts:12       names       cfg -> configuration
orders.ts:14        guards      swallowing catch deleted
search.py:29        injection   query parameterised

tsc --noEmit + vitest: green

NEEDS DECISION   config.ts:4       literals    hardcoded API key — which env var should this read from?
OUT OF TARGET    api/client.ts:9   dead-code   the last call site lives outside the target
```

If every rule the level enables passed, say exactly that in one line, naming the level.
