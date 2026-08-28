---
name: code-rules
description: Checks code against a fixed rule set and fixes every violation in place instead of writing a review. Core rules cover types everywhere, meaningful unabbreviated names, no duplication, SOLID, one entry point, test-driven, verb function names, noun variable names, boolean names prefixed with is/has/can, no magic numbers or strings or hardcoded secrets, no blank lines between statements, idiomatic use of the language and framework in hand, no defensive null checks or swallowed exceptions, no dead code, no hidden mutation, exceptions that name what broke, comments that say why rather than what, no boolean flag parameters, no unawaited promises, injected clocks and randomness, no untrusted input interpolated into SQL or shell or HTML or paths, and dependencies that point one way with no cycles. Interaction rules add optimistic updates that roll back visibly, destructive actions that are held not clicked, expensive submits that fire one request per intent, listeners and timers and subscriptions torn down, loading and empty and error states alongside content, and everything reachable by keyboard and screen reader. Every rule is checked against every file, every violation that survives a kill pass is fixed without asking first, and the only thing printed is the list of edits made plus anything that genuinely needed the user's decision — no review report, no PASS/FAIL tables. Use when the user says "/code-rules", "check this against the rules", "does this follow the rules", "checklist review", "check the naming", "is this SOLID", "any magic numbers", "check the spacing", "is this pythonic", "too many null checks", "optimistic update", "is this delete button safe", "double submit", "is this leaking", "is this injectable", "check the loading state", "is this accessible", or the Turkish equivalents "kurallara uyuyor mu", "kontrol et". For an open-ended multi-perspective critique use code-audit; for improving code in scored rounds use code-improve.
---

# code-rules — the rule gate

A fixed rule set. Each rule is checked, and each one that fails is **fixed**, not written up.

Sibling of **code-audit**, and deliberately the opposite of it. `code-audit` opens the question —
several lenses hunt for whatever is wrong. `code-rules` closes it: the rules are fixed, known in advance, and
the code is edited until it passes them. It does not hand back a review — it hands back a diff.

The three failure modes it exists to prevent:

- **The vibe review** — "looks good, maybe rename that". No rule cited, nothing verifiable, nothing
  the author can argue with or act on.
- **The rule that was never checked** — the reviewer reads for bugs, never actually greps for
  untyped signatures, and leaves a rule untested while acting as if it were clean.
- **The review that ends in a question** — a page of findings and a "shall I apply these?". The
  violations were known; the edit is the answer.

---

## 0. Target

If the user passed an argument, that is the target (`/code-rules src/parser.ts`, `/code-rules the diff`). If
not, default to the uncommitted diff; if the tree is clean, ask **one question**.

**Read the whole target first.** For a diff, read the surrounding file too — rule 3 (duplication) and
rule 5 (single entry) are invisible when you only see the changed lines.

Every rule in the loaded set is checked against **every file in the target**. A rule you did not
actually look for is not silently clean — either check it, or say in one line that you could not and
why.

---

## 1. Which rules apply

The rules split into two sets, and the numbering is global and stable — do not renumber, because the
rules cross-reference each other by number and so does the output. The numbers are not contiguous
within a set; that is the cost of keeping them stable as rules were added.

| Set | Rules | File |
| --- | --- | --- |
| **core** | 1–13, 18–26 | `rules/core.md` |
| **interaction** | 14–17, 27, 28 | `rules/ui.md` |

**Decide from the target, not from a question.** Load `rules/core.md` always. Then load
`rules/ui.md` as well when the target contains anything a user touches:

- a component or view file — `.vue`, `.jsx`, `.tsx`, `.svelte`, `.razor`, a Unity `MonoBehaviour`
  with UI wiring;
- a handler bound to an interaction — `@click`, `onClick`, `onSubmit`, `v-on`, `addEventListener`;
- a request fired from user code — `fetch`, `axios`, `await api.…`, a mutation, a form post;
- anything with a listener, timer, subscription or observer in it (rule 17 has no UI prerequisite —
  a long-lived service leaks the same way a component does).

The two sets overlap rather than compete. A Vue component is judged on types and names *and* on its
optimistic updates; loading the interaction set never switches the core set off.

**Ask only when the target is genuinely mixed and large** — part backend, part UI, and wide enough
that the user probably meant one half. One question, two options, then proceed.

**`--ui` runs the interaction set alone**, and `--core` the core set alone. A request that asks only
for the interaction pass — "check the UI rules", "is this delete button safe", "does this roll back",
"is this leaking", "can you tab to it" — is the same thing said in words. Rule numbers stay global:
14, 15, 16, 17, 27 and 28 here as everywhere else. In a one-set run, three things get one line each
when they come up:

- **The set that was not run is not silently clean.** Untyped signatures, abbreviated names,
  swallowed catches or a value interpolated into a query sitting in the same file get one line saying
  the other set covers them — said specifically for a rule 25 shape, because that is a security
  finding in an unrun set.
- **Rule 14's rollback `catch` is a rule 13 exception**, not a violation, in case the full pass runs
  afterwards.
- **Rule 15 owns the keyboard path for a destructive control** — rule 28 never adds a second, easier
  route around the hold.

In a `--ui` run only phase 3 of the fix order in section 7 applies, so the six rules run in numeric
order — except that 28's fixes land after 27's, since adding an error branch creates a control that
then needs a name and a focus path.

**Rule 12 (idiomatic) loads per language.** Name the language of each file first, then read only the
file you need:

| Language | File |
| --- | --- |
| Python | `rules/idiom/python.md` |
| JavaScript / TypeScript, Vue, React | `rules/idiom/typescript.md` |
| C#, Unity | `rules/idiom/csharp.md` |

For a language with no file here, apply rule 12 from its statement in `core.md` and say in one line
that you judged idiom without a reference.

---

## 2. Project overrides

Some of these rules are house style, and a team that disagrees with one will stop running the skill
entirely rather than argue with it every time. So the project gets a say. If the repository root holds
a **`.code-rules.md`**, read it before checking anything.

The format is one directive per line — a keyword, a rule number, and a reason that is required, not
optional:

```
disable 11   house style: blank lines separate paragraphs inside long test bodies
disable 6    no test framework in this repo yet — see #204
relax 2      idx, ok and db are established here
relax 21     generated API clients keep their @param blocks
```

- **`disable N`** — the rule is not checked and produces no edits.
- **`relax N`** — the rule is checked, but the named exceptions in the reason are accepted.
- Anything else in the file is ignored. An unknown rule number gets one line saying so.
- A directive with no reason is **not honoured** — the reason is the whole point, and its absence
  usually means someone silenced a rule they had lost an argument with.

**Rule 25 (untrusted input) can be disabled, but never silently.** If it is off, say so on its own
line in the output, every run.

Every disabled or relaxed rule is listed once in the output, after the edits:

```
overrides   11 disabled, 2 relaxed (.code-rules.md)
```

Command-line arguments beat the file: `/code-rules src/ --only 13,25` or `--skip 11` applies to that
run alone.

---

## 3. When two rules disagree

**The lower rule number wins**, unless the pair is named below. The rules were written at different
times and a fix that clears one can walk straight into another.

The exceptions, all in one place:

- **13 beats 12.** `?.` and `??` read as idiomatic modern JS and as defensive guards. Rule 13
  decides: at a real IO/user/third-party boundary, keep them; anywhere else the fix is deletion, and
  the `&&` chain rule 12 objected to is deleted with it rather than rewritten into optional chaining.
- **14 beats 13.** The `catch` in an optimistic update is not a swallowed exception — it restores the
  snapshot, tells the user and logs. It passes.
- **16 beats 14.** A disabled control and an in-place spinner on an expensive, non-idempotent submit
  is correct, not a blocked interaction.
- **14 beats 27.** A cheap reversible action inside a loaded view gets no loading state; rule 27 is
  about a view waiting for data it does not have yet.
- **25 beats 13.** Validation at an untrusted boundary is not a defensive guard — it is where rule 13
  says a guard belongs. Never delete an input check to satisfy 13 without establishing the value is
  trusted, and when you cannot establish it, it is a `NEEDS DECISION`.
- **15 beats 28.** For a destructive control, rule 15's second deliberate path is the keyboard path;
  do not add a plain `<button>` alternative that bypasses the hold.
- **18 beats 21.** Commented-out code is deleted as dead code, not evaluated as a comment.
- **10 yields on secrets.** A hardcoded key, token, password or connection string is not fixed by
  giving it a constant name — see rule 10's secrets clause; it becomes a `NEEDS DECISION`.

---

## 4. Violation shape (MUST)

A violation is only a violation when it carries all four — the first three stay in your head, the
fourth lands in the code:

- **Rule** — which rule, by number.
- **Where** — `file:line`. Not "the module".
- **What** — one sentence naming the violation.
- **Fix** — the concrete replacement, written into the code. For a naming rule that means the new
  name, actually applied.

No rule number, no violation. No `file:line`, no violation. "Consider maybe tidying this" is not a
violation, and nothing vague ever becomes an edit.

---

## 5. Verify before fixing (MUST)

Before touching anything, re-read the code behind **every** FAIL and try to kill it: is that `any`
actually inferred from a typed source? Is that "duplicate" one rule in two places, or two rules that
happen to match today? Is `data` really a boolean? A FAIL that does not survive this pass is dropped
and never fixed, and it is never mentioned — a violation that was not real produced no edit, so it
produces no line.

**Rule 25 is the exception.** An input you cannot prove is trusted stays as a `NEEDS DECISION` rather
than being dropped; the asymmetry is deliberate, because a false positive there costs a sentence and a
false negative costs a breach.

---

## 6. Scope budget

The edit list is only useful if a human can read it. Count the surviving FAILs before editing:

- **Up to 20 edits, or up to 8 files** — fix them all, no question.
- **Beyond either threshold** — print the count and the breakdown by rule in one or two lines, then
  ask **one question**: fix everything, or narrow to a subset (a rule, a file, a directory). If the
  working tree was clean when the run started, say in the same question that the edits will be
  committed one rule at a time, so the diff is reviewable rule by rule.

A budget question is not the forbidden "shall I apply these?" — it is about *how much*, never about
*whether*.

---

## 7. Fix it — do not ask (MUST)

**Every FAIL that survives the kill pass gets fixed, in place, immediately.** No "shall I apply
these?", no closing question, no waiting for a yes. Running the skill *is* the yes.

Smallest edit that clears the rule and nothing else — no drive-by refactor, no rename the rule set
did not demand, no reach outside the target.

**Fix in this order, not in rule-number order.** Structure moves first, surface last, because a
cosmetic fix applied to code that is about to be split is work done twice: rename a function, then
extract half of it, and the name you chose is now wrong.

1. **Delete and move** — 18, 3, 5, 26, 4. Deleting dead code before anything else means you never fix
   a violation in code that was not going to exist.
2. **Correctness** — 13, 25, 23, 24, 19, 20. The rules where the current behaviour is wrong, not just
   untidy.
3. **Interaction** — 14, 15, 16, 17, 27, 28.
4. **Shape** — 12, 1, 22. Idiom rewrites change expressions; typing and signatures settle afterwards.
5. **Surface** — 2, 7, 8, 9, 10, 21, 11. Names, constants, comments, and spacing last of all, because
   every earlier phase moves lines around and rule 11 has to judge the final layout.

After the edits, **re-run every rule the fix touched** against the new code: a fix that clears rule 13
and breaks rule 11 is not done.

Exactly two kinds of finding are left unfixed, and both are named out loud:

- **`NEEDS DECISION`** — the fix turns on something only the user knows: which of two duplicated
  implementations is the real one, what a magic string actually means, what the missing test is
  supposed to assert, where a hardcoded secret should come from, whether a value crossing into a query
  is trusted, which way a cyclic dependency should be broken. Ask that one question in its line; do
  not guess.
- **`OUT OF TARGET`** — the violation's real home is a file the user did not point at. One line,
  then leave it.

"I would rather not touch that" is neither of them.

---

## 8. Prove the code still works (MUST)

A rule pass that leaves the project broken is worse than no pass at all, and this skill renames
symbols, deletes guards and changes signatures across many files at once. So after the last edit,
run whatever the project already has, in this order:

1. **Type check / compile** — `tsc --noEmit`, `mypy`, `pyright`, `dotnet build`, `cargo check`,
   whatever the repo is configured for.
2. **Lint**, if a config exists.
3. **Tests** — the whole suite if it is fast, otherwise the files touching the target.

Then:

- **Green** — print the edit list and stop.
- **Red, and the cause is obvious** — fix it and re-run. A missed call site after a rename, an
  import left behind by a deletion; these are part of the edit, not a new finding.
- **Red, and the fix is not obvious** — **revert that specific edit**, leave the rest, and report it
  as `NEEDS DECISION` with the error.
- **No type checker, no tests, nothing to run** — say so in one line. Do not treat silence as green,
  and do not install tooling the project does not have.

Rule 13 has a specific interaction here: deleting a defensive guard can turn a silent wrong result
into a loud crash, which is the point. When that shows up in the test run, the line reads
`NEEDS DECISION`, not "reverted".

---

## 9. Commits

Default: **no commits.** The edits sit in the working tree and the user decides.

The one exception is the case the scope budget already flagged — the working tree was clean at the
start, the user chose to fix everything, and the edit count is past the threshold. Then commit **one
commit per rule**, in the fix order of section 7, so each commit is a single rule's worth of change
and any one of them can be reverted alone:

```
code-rules(13): delete swallowing catches in orders and invoices
code-rules(2): expand abbreviated names in service and parser
```

Never amend, never rebase, never touch a commit the user made. If the tree was dirty at the start,
there are no commits at all — mixing the user's uncommitted work into a rule commit is worse than no
commit.

---

## 10. Output — the edits, nothing else

**No report.** No rule table, no findings table, no verdict section, no `ReportFindings` call, no
"here is what I found". The check happens; only its result on disk is shown.

What gets printed is one short list of what changed, one line per edit — `file:line`, rule number,
what changed:

```
parser.ts:44         1   parse now returns ParseResult
service.ts:12        2   cfg -> configuration
user.ts:8            9   active -> isActive
orders.ts:60        10   0.15 -> VAT_RATE
orders.ts:14        13   swallowing catch deleted
LikeButton.vue:23   14   state set before the request, snapshot restored on failure
useFeed.ts:31       17   scroll listener removed on unmount
api/client.ts:9     18   unused export deleted
normalize.py:22     19   argument copied instead of mutated in place
loader.py:57        20   ValueError now names the path and the actual shape
report.ts:34        22   generate(data, true) -> generateSummary(data)
editor.ts:71        23   saveDraft now awaited
search.py:29        25   query parameterised
ProjectList.vue:18  27   skeleton, empty and error branches added
Toolbar.vue:12      28   div@click -> button with aria-label
```

Then the verification line, and the overrides line if there were any:

```
tsc --noEmit + vitest: green
overrides   11 disabled, 2 relaxed (.code-rules.md)
```

Then, only if there are any, the ones that were not fixed — one line each, with the question or the
reason:

```
NEEDS DECISION   orders.ts:60           6   discount test: is 0.15 applied at the threshold or above it?
NEEDS DECISION   config.ts:4           10   hardcoded API key — which env var should this read from?
NEEDS DECISION   report.py:88          25   report_name reaches the shell — where does it come from?
OUT OF TARGET    CheckoutForm.vue:61   16   idempotency key belongs in api/client.ts
```

Nothing else. No praise, no summary paragraph, no "want me to also…", no rules that passed — a rule
that passed produced no edit, and an edit list is what the user asked for. If every rule passed and
nothing needed changing, say exactly that in one line.

---

## MUST summary

- Read the whole target — a diff in its surrounding file — before judging.
- Read `.code-rules.md` if it exists; honour only directives that carry a reason, and report what was
  disabled.
- Load `rules/core.md` always; load `rules/ui.md` when the target touches interaction, requests, or
  anything with a listener, timer or subscription; load the one idiom file that matches the language.
- Check every rule in the loaded set against every file; a rule you could not check gets one line
  saying so.
- Every violation carries rule number, `file:line`, the violation, and the concrete fix.
- Try to kill every FAIL before fixing it; drop the ones that do not survive, silently — except rule
  25, where an unproven input stays as a `NEEDS DECISION`.
- Past the scope budget, ask one question about how much — never about whether.
- Fix every surviving FAIL in place, without asking, in the phase order of section 7 — structure
  first, spacing last.
- Re-run every rule a fix touched; a fix that breaks another rule is not done.
- Run the type checker and the tests afterwards; revert what breaks unexplainably, report it.
- Commit one per rule only in the case section 9 names; otherwise leave the tree alone.
- Leave only `NEEDS DECISION` and `OUT OF TARGET`, and name both in one line each.
- Print the edit list, the verification line, the overrides line, and nothing else — no rule table, no
  findings table, no verdict, no `ReportFindings` call.
