---
name: codify
description: Checks code against a fixed rule set and fixes every violation in place instead of writing a review. Covers types, naming, duplication, SOLID, single entry, tests, magic numbers and hardcoded secrets, blank-line spacing, idiom, defensive guards and swallowed exceptions, resource teardown, dead code, hidden mutation, error messages, comments, flag parameters, floating promises, injected clocks, SQL/shell/HTML/path injection, and dependency direction. Output is the edit list only — no review report, no PASS/FAIL tables. Use when the user says "/codify", "check this against the rules", "does this follow the rules", "checklist review", "check the naming", "is this SOLID", "any magic numbers", "check the spacing", "is this pythonic", "too many null checks", "is this leaking", "is this injectable", or the Turkish "kurallara uyuyor mu", "kontrol et". For turning a source into a checklist somebody ticks use muster; for redesigning an interface use redesign.
---

# codify — the rule gate

A fixed rule set. Each rule is checked, and each one that fails is **fixed**, not written up. It hands back a diff, not a review.

Three failure modes it exists to prevent: the **vibe review** ("looks good, maybe rename that" — no
rule cited, nothing verifiable); the **rule that was never checked** (reading for bugs, never grepping
for untyped signatures, then acting as if the rule were clean); the **review that ends in a question**
(a page of findings and a "shall I apply these?" — the violations were known, the edit is the answer).

---

## 0. Target

The user's argument is the target (`/codify src/parser.ts`, `/codify the diff`). With no argument,
the uncommitted diff; if the tree is clean, ask **one question**.

**Read the whole target first** — for a diff, the surrounding file too, because rule 3 (duplication)
and rule 5 (single entry) are invisible in changed lines alone.

Every rule is checked against **every file in the target**. A rule you did not look for is not
silently clean — check it, or say in one line that you could not and why.

## 1. Which rules apply

**Always load `rules/core.md`** — rules 1–13 and 17–26. Numbering is global and stable; never
renumber, because rules cross-reference each other by number and so does the output. 14–16 are retired
and never reused.

**Rule 12 (idiomatic) loads per language.** Name each file's language first, then read only what you
need:

| Language | File |
| --- | --- |
| Python | `rules/idiom/python.md` |
| JavaScript / TypeScript, Vue, React | `rules/idiom/typescript.md` |
| C#, Unity | `rules/idiom/csharp.md` |

For a language with no file, apply rule 12 from its statement in `core.md` and say in one line that
you judged idiom without a reference.

## 2. Project overrides

If the repository root holds a **`.codify.md`**, read it before checking anything — some of these
rules are house style, and a team that disagrees with one will stop running the skill entirely rather
than argue with it every run.

One directive per line: keyword, rule number, and a reason that is required.

```
disable 11   house style: blank lines separate paragraphs inside long test bodies
relax 2      idx, ok and db are established here
```

- **`disable N`** — not checked, produces no edits.
- **`relax N`** — checked, but the exceptions named in the reason are accepted.
- **A directive with no reason is not honoured** — the reason is the whole point, and its absence
  usually means someone silenced a rule they lost an argument with.
- Anything else is ignored; an unknown rule number gets one line saying so.

**Rule 25 (untrusted input) can be disabled, but never silently** — if it is off, say so on its own
line, every run. Every disabled or relaxed rule is listed once after the edits:
`overrides   11 disabled, 2 relaxed (.codify.md)`.

Arguments beat the file: `--only 13,25`, `--skip 11` apply to that run alone.

## 3. When two rules disagree

**The lower rule number wins**, except:

- **13 beats 12.** `?.` and `??` read as idiomatic and as defensive guards. At a real IO/user/
  third-party boundary keep them; anywhere else delete, and the `&&` chain rule 12 objected to is
  deleted with them rather than rewritten into optional chaining.
- **25 beats 13.** Validation at an untrusted boundary is where rule 13 says a guard belongs. Never
  delete an input check to satisfy 13 without establishing the value is trusted; when you cannot, it
  is a `NEEDS DECISION`.
- **17 beats 13.** A teardown, and the `finally`/`using`/`with` that releases a resource, is not a
  defensive guard.
- **18 beats 21.** Commented-out code is deleted as dead code, not evaluated as a comment.
- **10 yields on secrets.** A hardcoded key, token, password or connection string is not fixed by
  naming it — see rule 10's secrets clause; it is a `NEEDS DECISION`.

## 4. Violation shape (MUST)

All four, the first three in your head and the fourth in the code: **rule** by number; **where** as
`file:line`, not "the module"; **what**, one sentence; **fix**, the concrete replacement actually
written in — for a naming rule, the new name applied.

No rule number, no violation. No `file:line`, no violation. Nothing vague ever becomes an edit.

## 5. Verify before fixing (MUST)

Before touching anything, re-read the code behind **every** FAIL and try to kill it: is that `any`
actually inferred from a typed source? Is that "duplicate" one rule in two places, or two rules that
happen to match today? Is `data` really a boolean? A FAIL that does not survive is dropped, never
fixed, and never mentioned — it produced no edit, so it produces no line.

**Rule 25 is the exception.** An input you cannot prove is trusted stays a `NEEDS DECISION`; a false
positive there costs a sentence, a false negative costs a breach.

## 6. Scope budget

Count the surviving FAILs before editing:

- **Up to 20 edits, or up to 8 files** — fix them all, no question.
- **Beyond either** — print the count and the breakdown by rule in one or two lines, then ask **one
  question**: fix everything, or narrow to a rule, a file, a directory. If the tree was clean at the
  start, say in the same question that edits will be committed one rule at a time.

A budget question is about *how much*, never about *whether*.

## 7. Fix it — do not ask (MUST)

**Every FAIL that survives the kill pass gets fixed, in place, immediately.** No "shall I apply
these?", no closing question. Running the skill *is* the yes. Smallest edit that clears the rule and
nothing else — no drive-by refactor, no rename the rules did not demand, no reach outside the target.

**Fix in this order, not rule-number order**, because a cosmetic fix on code about to be split is work
done twice:

1. **Delete and move** — 18, 3, 5, 26, 4. Dead code first, so you never fix a violation in code that
   was not going to exist.
2. **Correctness** — 13, 25, 23, 17, 24, 19, 20.
3. **Shape** — 12, 1, 22. Idiom rewrites change expressions; typing settles afterwards.
4. **Surface** — 2, 7, 8, 9, 10, 21, 11. Names, constants, comments and spacing, because every earlier
   phase moves lines and rule 11 judges the final layout.
5. **Cover** — 6. The missing test is written last, against the final names and the final shape;
   written any earlier, the four phases above would break it and it would be rewritten twice. It is
   also what section 8's run then exercises.

All twenty-three rules appear in those five phases. After the edits, **re-run every rule a fix
touched**: a fix that clears rule 13 and breaks rule 11 is not done.

Exactly two kinds of finding are left unfixed, both named out loud:

- **`NEEDS DECISION`** — the fix turns on something only the user knows: which duplicate is the real
  one, what a magic string means, what the missing test asserts, where a secret should come from,
  whether a value crossing into a query is trusted, which way to break a cycle. Ask that one question
  in its line; do not guess.
- **`OUT OF TARGET`** — the violation's real home is a file the user did not point at. One line.

"I would rather not touch that" is neither.

## 8. Prove the code still works (MUST)

This skill renames symbols, deletes guards and changes signatures across many files at once, so after
the last edit run whatever the project already has: **type check / compile** (`tsc --noEmit`, `mypy`,
`pyright`, `dotnet build`, `cargo check`), then **lint** if a config exists, then **tests** — the
whole suite if fast, otherwise the files touching the target.

- **Green** — print the edit list and stop.
- **Red, cause obvious** — fix and re-run. A missed call site after a rename, an import left by a
  deletion: part of the edit, not a new finding.
- **Red, fix not obvious** — **revert that specific edit**, leave the rest, report `NEEDS DECISION`
  with the error.
- **Nothing to run** — say so in one line. Silence is not green, and do not install tooling the
  project does not have.

Rule 13 interacts here: deleting a defensive guard can turn a silent wrong result into a loud crash,
which is the point. When that shows up in the test run the line reads `NEEDS DECISION`, not
"reverted".

## 9. Commits

Default: **no commits.** The edits sit in the working tree.

The one exception is the case section 6 flagged — tree clean at the start, user chose to fix
everything, edit count past the threshold. Then **one commit per rule**, in section 7's order, so any
one can be reverted alone:

```
codify(13): delete swallowing catches in orders and invoices
```

Never amend, never rebase, never touch a commit the user made. If the tree was dirty at the start
there are no commits at all.

## 10. Output — the edits, nothing else

**No report.** No rule table, no findings table, no verdict, no `ReportFindings` call, no "here is
what I found". One line per edit — `file:line`, rule number, what changed — then the verification
line, then the overrides line if there were any, then the unfixed ones:

```
parser.ts:44         1   parse now returns ParseResult
service.ts:12        2   cfg -> configuration
orders.ts:14        13   swallowing catch deleted
useFeed.ts:31       17   scroll listener removed on unmount
loader.py:57        20   ValueError now names the path and the actual shape
search.py:29        25   query parameterised

tsc --noEmit + vitest: green
overrides   11 disabled, 2 relaxed (.codify.md)

NEEDS DECISION   config.ts:4       10   hardcoded API key — which env var should this read from?
NEEDS DECISION   report.py:88      25   report_name reaches the shell — where does it come from?
OUT OF TARGET    api/client.ts:9   18   the last call site lives outside the target
```

Nothing else. No praise, no summary paragraph, no "want me to also…", no rules that passed — a rule
that passed produced no edit. If every rule passed, say exactly that in one line.
