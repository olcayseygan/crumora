---
name: lint
description: Checks code against a fixed rule set at three depths — lite, full, ultra — and fixes every violation in place instead of writing a review. Covers naming, spacing, comments, literals and hardcoded secrets, types, duplication, idiom, defensive guards and swallowed exceptions, resource teardown, dead code, hidden mutation, error messages, flag parameters, floating promises, injected clocks, SOLID, single entry, tests, dependency direction, and SQL/shell/HTML/path injection. Output is the edit list only — no review report, no PASS/FAIL tables. Use when the user says "/lint", "/lint lite", "/lint ultra", "check this against the rules", "does this follow the rules", "checklist review", "check the naming", "is this SOLID", "any magic numbers", "check the spacing", "is this pythonic", "too many null checks", "is this leaking", "is this injectable", or the Turkish "kurallara uyuyor mu", "kontrol et". For turning a source into a checklist somebody ticks use muster; for redesigning an interface use compose.
---

# lint — the rule gate

A fixed rule set. Each rule is checked, and each one that fails is **fixed**, not written up. It hands
back a diff, not a review.

Three failure modes it exists to prevent. The **vibe review** — "looks good, maybe rename that" —
cites no rule and verifies nothing. The **rule that was never checked** reads for bugs, never greps
for untyped signatures, then acts as if the rule came back clean. The **review that ends in a
question** delivers a page of findings and a "shall I apply these?", when the violations were already
known and the edit was the answer.

Rules are named, never numbered. A rule is `guards` or `teardown` or `injection`, and that name is
what prints next to the edit it produced, so nothing has to be looked up.

---

## Levels

Three depths, exactly as the caveman modes work: **lite**, **full**, **ultra**. The level says how far
down the gate cuts, and **full is the default** when none is given.

**lite** is the surface pass: `names`, `verbs`, `nouns`, `booleans`, `literals`, `comments`, `spacing`.
Nothing here changes behaviour and nothing needs a second file open, so it is cheap enough to run on a
single file mid-work.

**full** is lite plus everything that touches how the code behaves inside its own file: `types`,
`repetition`, `idiom`, `guards`, `teardown`, `dead-code`, `mutation`, `errors`, `flags`, `floating`,
`clock`. This level deletes guards, changes signatures and greps the repository, so it is the one that
needs the verification run at the end.

**ultra** is full plus the architecture: `solid`, `single-entry`, `tests`, `direction`. It moves code
between files, inverts dependencies and writes the missing test. Expect it to touch files the target
did not name — those come back as `OUT OF TARGET` unless the user pointed at the directory.

**The floor runs at every level, lite included:** `injection`, and the secrets clause of `literals`.
Neither is ever skipped for being cheap, and nothing switches either one off.

**The level is the only dial.** There is no way to run one rule on its own, and no way to drop one rule
out of a level — a preset you can edit rule by rule is not a preset. Pick a depth and take what it
holds; to check less, go down a level, and to check more, go up.

The level word goes anywhere in the invocation: `/lint`, `/lint lite`, `/lint ultra src/parser.ts`,
`/lint the diff ultra`.

## Target

The user's argument is the target — `/lint src/parser.ts`, `/lint the diff`. With no argument the
target is the uncommitted diff, and if the tree is clean, ask **one question**.

**Read the whole target first.** For a diff that means the surrounding file too, because `repetition`
and `single-entry` are invisible in changed lines alone.

Every rule the level enables is checked against **every file in the target**. A rule you did not look
for is not silently clean, so either check it or say in one line that you could not and why.

## Which rules apply

**Always load `rules/core.md`.** It holds every rule, each tagged with the level that first enables
it. Never rename one: the output addresses every rule by name, and so does every cross-reference
between rules.

**`idiom` loads per language.** Name each file's language first, then read only what you need: Python
takes `rules/idiom/python.md`; JavaScript, TypeScript, Vue and React take `rules/idiom/typescript.md`;
C# and Unity take `rules/idiom/csharp.md`; C takes `rules/idiom/c.md`; C++ takes `rules/idiom/cpp.md`.
C and C++ are separate files on purpose — the ownership advice for one is wrong for the other — so a
`.h` shared between them is judged by the language of the translation unit that includes it, and a file
that is C compiled as C++ is judged by `c.md` with one line saying so. For a language with no file,
apply `idiom` from its statement in `core.md` and say in one line that you judged idiom without a
reference. At lite `idiom` is off, so none of these load.

## Project default level

If the repository root holds a **`.lint.md`**, read it before checking anything. It carries one thing,
the depth the project runs at when the invocation names none:

```
level   lite
```

That is the whole file. Nothing else in it is honoured, and a line trying to switch a single rule off
gets one line saying it was ignored — the answer to a rule a team disagrees with is a shallower level
or an argument with the rule, not a config line that quietly guts a preset.

**The invocation beats the file.** A level word on the command wins over `level` in `.lint.md`, and
`lite` written there does not stop `/lint ultra` from running everything.

## When two rules disagree

Four named pairs settle themselves, and everything else falls to one general rule.

**`guards` beats `idiom`**, because `?.` and `??` read as idiomatic and as defensive guards at once. At
a real IO, user or third-party boundary keep them; anywhere else delete them, and the `&&` chain
`idiom` objected to is deleted with them rather than rewritten into optional chaining.

**`injection` beats `guards`**, because validation at an untrusted boundary is exactly where `guards`
says a guard belongs. Never delete an input check to satisfy `guards` without establishing the value is
trusted; when you cannot, it is a `NEEDS DECISION`.

**`teardown` beats `guards`**, because a teardown — and the `finally`, `using` or `with` that releases
a resource — is not a defensive guard.

**`dead-code` beats `comments`**, because commented-out code is deleted as dead code rather than
evaluated as a comment.

Everywhere else, **the rule that removes code wins over the rule that rewrites it**, and when both
remove, the one that comes first in the fix order below wins. The one thing that never becomes an edit
is a secret: a hardcoded key, token, password or connection string is not fixed by naming it, so
`literals` yields and it is reported as a `NEEDS DECISION`.

## Violation shape (MUST)

A violation carries four things, the first three in your head and the fourth in the code: the **rule**
by name, the **where** as `file:line` rather than "the module", the **what** in one sentence, and the
**fix** as the concrete replacement actually written in — for a naming rule, the new name applied.

No rule name, no violation. No `file:line`, no violation. Nothing vague ever becomes an edit.

## Verify before fixing (MUST)

Before touching anything, re-read the code behind **every** FAIL and try to kill it. Is that `any`
actually inferred from a typed source? Is that "duplicate" one rule in two places, or two rules that
happen to match today? Is `data` really a boolean? A FAIL that does not survive is dropped, never
fixed and never mentioned — it produced no edit, so it produces no line.

**`injection` is the exception.** An input you cannot prove is trusted stays a `NEEDS DECISION`; a
false positive there costs a sentence, a false negative costs a breach.

## Scope budget

Count the surviving FAILs before editing. At **full and ultra**, up to **20 edits or 8 files** is fixed
outright, no question. At **lite** the budget doubles to **40 edits or 16 files**, because a rename and
a blank line are not decisions.

**Past the budget**, print the count and the breakdown by rule in one or two lines, then ask **one
question**: fix everything, drop to a shallower level, or narrow to a rule, a file, a directory. If the
tree was clean at the start, say in the same question that edits will be committed one rule at a time.

A budget question is about *how much*, never about *whether*.

## Fix it — do not ask (MUST)

**Every FAIL that survives the kill pass gets fixed, in place, immediately.** No "shall I apply
these?", no closing question. Running the skill *is* the yes. Smallest edit that clears the rule and
nothing else — no drive-by refactor, no rename the rules did not demand, no reach outside the target,
and nothing from a level above the one that was asked for.

**Fix in this order, not the order the rules are written**, because a cosmetic fix on code about to be
split is work done twice. First **delete and move** — `dead-code`, `repetition`, `single-entry`,
`direction`, `solid` — dead code first, so you never fix a violation in code that was not going to
exist. Then **correctness** — `guards`, `injection`, `floating`, `teardown`, `clock`, `mutation`,
`errors`. Then **shape** — `idiom`, `types`, `flags` — since idiom rewrites change expressions and
typing settles afterwards. Then **surface** — `names`, `verbs`, `nouns`, `booleans`, `literals`,
`comments`, `spacing` — because every earlier phase moves lines and `spacing` judges the final layout.
Last, **cover** — `tests`: the missing test is written against the final names and the final shape,
since written any earlier the four phases above would break it and it would be rewritten twice, and it
is also what the verification run then exercises.

Every rule appears in those five phases; a level simply switches some of them off. At lite only the
surface phase and `injection` have anything to do. After the edits, **re-run every rule a fix touched**
— a fix that clears `guards` and breaks `spacing` is not done.

Exactly two kinds of finding are left unfixed, both named out loud. **`NEEDS DECISION`** is where the
fix turns on something only the user knows: which duplicate is the real one, what a magic string
means, what the missing test asserts, where a secret should come from, whether a value crossing into a
query is trusted, which way to break a cycle. Ask that one question in its line; do not guess. **`OUT
OF TARGET`** is where the violation's real home is a file the user did not point at, and it gets one
line. "I would rather not touch that" is neither.

## Prove the code still works (MUST)

At full and ultra this skill renames symbols, deletes guards and changes signatures across many files
at once, and even lite renames, so after the last edit run whatever the project already has: **type
check or compile** (`tsc --noEmit`, `mypy`, `pyright`, `dotnet build`, `cargo check`), then the
**linter** if a config exists, then **tests** — the whole suite if fast, otherwise the files touching
the target. A lite run that produced no edits at all skips this and says so.

**Green** means print the edit list and stop. **Red with an obvious cause** means fix and re-run: a
missed call site after a rename or an import left by a deletion is part of the edit, not a new
finding. **Red where the fix is not obvious** means **revert that specific edit**, leave the rest, and
report `NEEDS DECISION` with the error. **Nothing to run** means say so in one line — silence is not
green, and do not install tooling the project does not have.

`guards` interacts here, because deleting a defensive guard can turn a silent wrong result into a loud
crash, which is the point. When that shows up in the test run the line reads `NEEDS DECISION`, not
"reverted".

## Commits

Default: **no commits.** The edits sit in the working tree.

The one exception is the case the budget flagged — tree clean at the start, user chose to fix
everything, edit count past the threshold. Then **one commit per rule**, in the fix order above, so any
one can be reverted alone:

```
lint(guards): delete swallowing catches in orders and invoices
```

Never amend, never rebase, never touch a commit the user made. If the tree was dirty at the start
there are no commits at all.

## Output — the edits, nothing else

**No report.** No rule table, no findings table, no verdict, no `ReportFindings` call, no "here is
what I found". The header line names the level and nothing more. Then one line per edit — `file:line`,
rule name, what changed — then the verification line, then the unfixed ones:

```
lint · full

parser.ts:44        types       parse now returns ParseResult
service.ts:12       names       cfg -> configuration
orders.ts:14        guards      swallowing catch deleted
useFeed.ts:31       teardown    scroll listener removed on unmount
loader.py:57        errors      ValueError now names the path and the actual shape
search.py:29        injection   query parameterised

tsc --noEmit + vitest: green

NEEDS DECISION   config.ts:4       literals    hardcoded API key — which env var should this read from?
NEEDS DECISION   report.py:88      injection   report_name reaches the shell — where does it come from?
OUT OF TARGET    api/client.ts:9   dead-code   the last call site lives outside the target
```

Nothing else. No praise, no summary paragraph, no "want me to also…", no rules that passed — a rule
that passed produced no edit. If every rule the level enables passed, say exactly that in one line,
naming the level.
