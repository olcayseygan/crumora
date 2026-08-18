---
name: tribunal
description: Puts code on trial before a panel of independent lenses, then makes those lenses argue with each other until they converge on a shared verdict. Each lens reviews blind, every finding is cross-examined by a lens that wants to kill it, conflicts are resolved as explicit trade-offs rather than averaged away, and the result is a ranked findings table with recorded dissent plus a full analysis. Use when the user says "/tribunal", "put this on trial", "audit this code", "red-team this", "review this from every angle", "critique this", "what is actually wrong with this", "is this any good". For a fixed pass/fail rule check use checklist, for rewriting use rewrite, for improving in place use sharpen, for UI use reskin. This skill judges code — for measuring data and writing the result up as a report, use report instead.
---

# tribunal — put it on trial

Read the code through **several independent pairs of eyes**, then put those eyes **in a fight**, and
report only what survives.

Fourth sibling of **rewrite**, **sharpen** and **reskin**. Those three build; this one judges.
Its opposite is **checklist**: fixed rules, PASS or FAIL. This one opens the question instead.
Same house style: rounds, evidence over vibes, an explicit table at the end, and no pretending to be
more certain than the evidence allows.

The two failure modes it exists to prevent:

- **The single-lens review** — one pass, one mindset, and everything outside that mindset is
  invisible. A performance reader never notices the lifecycle bug.
- **The confident hallucination** — a finding that reads beautifully and is simply wrong. Nothing
  ships to the user until another lens has actively tried to kill it.

---

## 0. Pick the target and the panel

If the user passed an argument, that is the target (`/tribunal src/parser.ts`, `/tribunal the working
diff`). If not, ask **one question**: what to review — and default to the uncommitted diff if the
repo has one.

**Read the target completely before opinions start.** Not excerpts. If it is a diff, read the
surrounding code too — a diff that looks fine in isolation and wrong in context is exactly what a
review is for.

Then **pick the panel**: 4-7 lenses, chosen for this target, declared up front and frozen. A default
panel:

| Lens | Hunts for |
| --- | --- |
| **Correctness** | Wrong results, off-by-one, bad state transitions, unhandled inputs, races, edge cases |
| **Lifecycle & robustness** | Init/teardown order, re-entry, null/disposed objects, error paths, partial failure, what happens on the second call |
| **Performance & memory** | Per-frame or per-request cost, allocations and garbage, N+1 patterns, work done repeatedly that could be done once |
| **Design & simplicity** | Concept count, wrong abstraction level, responsibilities in the wrong place, indirection that buys nothing |
| **House rules** | The project's own conventions — `CLAUDE.md`, contributing guide, lint config, surrounding idiom |
| **Maintainability** | What one change costs, naming that lies, duplication that will drift, dead flexibility |
| **Security & trust** | Untrusted input, authority checks, injection, secrets, what a modified client could ask for |
| **Testability** | What cannot be tested without rewriting it, hidden dependencies, missing coverage on the risky path |

Swap lenses to fit: a shader gets *Precision & platform*, a migration gets *Data safety &
reversibility*, a network layer gets *Latency & packet loss*. Say which panel you picked and why.

**Independence is the point (MUST).** Run each lens as its own pass and **write its findings down
before reading the next lens's output**. A lens that starts by reading what the previous one said
just agrees with it — that is one review wearing five hats. If the user explicitly asks for agents,
one lens per agent is the cleanest way to enforce this; **do not delegate unless asked.**

## 1. Round 1 — blind reviews

Each lens produces findings. A finding is **only** a finding if it carries all of:

- **Where** — `file:line`, the specific code, not "the module".
- **What** — one sentence stating the defect.
- **Failure scenario** — concrete inputs or state → the wrong outcome. *"On the second cast in the
  same frame, `_pending` is still set, so the second hit is dropped."* If you cannot write this
  sentence, you do not have a finding, you have a feeling.
- **Severity** — `blocker` (wrong or unsafe, must fix) · `major` (real defect, will bite) ·
  `minor` (should fix, low blast radius) · `nit` (taste; only allowed from the House rules lens, and
  only when the project actually states the rule).
- **Confidence** — how sure, and what would settle it.

Anything that fails this shape gets dropped **before** round 2. Volume is not value; a lens with two
real findings beat a lens with nine soft ones.

## 2. Round 2 — the fight

Now the lenses read each other. Three things happen, in this order:

**(a) Cross-examination.** Every finding is assigned to a *different* lens whose job is to **refute
it** — read the actual code and argue it is wrong, already handled elsewhere, unreachable, or
irrelevant at this scale. Default to refuted when the evidence is thin; a survivor must survive on
evidence, not on nobody bothering.

Each finding ends as one of:

- **CONFIRMED** — the refutation failed; the failure scenario holds.
- **PLAUSIBLE** — cannot be settled from the code alone; state exactly what would settle it (a run, a
  measurement, a question for the author).
- **REFUTED** — killed. It stays in the record with the reason, because "we checked and it's fine" is
  useful information.

**(b) Conflicts.** Where two lenses want opposite things — *cache it* vs. *keep it simple*, *guard it*
vs. *let it fail loudly* — do **not** split the difference. Write the trade-off out: what each side
buys, what it costs, which one this project's own priorities pick, and why. An averaged compromise
usually delivers neither side's benefit.

**(c) Merge.** Fold duplicates raised by several lenses into one finding — and note the multiplicity,
because a defect three lenses found independently is usually the important one.

## 3. Round 3 — convergence

- Rank the survivors: **severity first, confidence second, blast radius third**.
- Reach a **shared verdict** on the target as a whole, one of: *ship it* · *ship it with the
  blockers fixed* · *needs rework* · *wrong approach, rebuild* (in the last case, hand off to
  `rewrite`).
- **Record dissent (MUST).** If a lens still disagrees after the fight, print its objection as a
  named dissent line. Do not manufacture unanimity — a suppressed objection is exactly the one the
  author needed to hear.

**Stop when a round produces no new confirmed findings** (one dry round is enough), or at **3
rounds** of fighting. If new lenses keep finding blockers at the cap, say so — that is itself a
finding about the code.

## 4. Output

**Do not fix anything.** This skill reviews. Offer the fixes as a closing question; apply them only
if the user says yes, and if they do, re-run the affected lens afterwards.

If a `ReportFindings` tool is available in the session, call it **once** with the confirmed findings,
most severe first — and then do not repeat them as prose. Otherwise print the tables below.

### Three layers, three audiences (MUST)

The write-up is delivered in **three consecutive parts**, each written for a different reader, each
readable on its own. A reader who stops after part one must still know what was decided; a reader who
starts at part three must not have to scroll back.

**Part one — anyone.** Plain language, no jargon, no file paths, no `file:line`, no severity labels.
What was looked at, what the verdict is, and what it means in practice — what breaks, for whom, and
whether the thing can go out as it stands. A handful of sentences. If a number belongs here it is a
count or a "one in ten requests", never a profiler figure.

**Part two — people who know the field but not this code.** The ranked findings, what each one costs
if left alone, the trade-offs that had to be decided and which way they went, the dissent, and how
much of the target the review actually covered. Findings table lives here.

**Part three — engineers.** `file:line`, the concrete failure scenario per finding, what the
cross-examination killed and on what evidence, the round table, and the honest limits — paths not
read, behaviour assumed rather than run, claims not measured, PLAUSIBLE findings still open.

Every beat of the review lands in exactly one part. Nothing is said twice in three registers.

### Headings

**Name the headings after what is actually in them** — the subject, the system, the decision. They
follow the shape of this particular review, not a template.

**Banned outright:** "executive summary", "management summary", "yönetim özeti", "easy summary",
"kolay özet", "quick summary", "TL;DR", "overview", "summary of the summary", and any heading whose
whole content is the word *summary* plus an audience name. A heading that announces its own
abstraction level tells the reader nothing about the code. If a part needs a label, label it with its
finding: *"The second cast never lands"*, not *"Technical details"*.

### Visuals

Charts are optional. When one is used, it belongs to the part whose reader can act on it, and only
one idea per chart:

- Part one: a single at-a-glance shape — severity counts, a pass/fail band. No axes that need
  explaining.
- Part two: distribution and comparison — findings by lens, by severity, by subsystem; what the
  rounds killed.
- Part three: mechanism — call flow, state transitions, the timeline of the failing sequence,
  measured numbers with their units.

A chart that would need a paragraph of setup is in the wrong part. Never repeat the same chart across
parts at different resolutions.

Findings table (part two):

| # | Severity | Finding | Where | Raised by | Verdict |
| --- | --- | --- | --- | --- | --- |
| 1 | blocker | second cast in the same frame drops its hit | `CharacterSkills.cs:214` | Correctness, Lifecycle | CONFIRMED |
| 2 | major | `SphereCastAll` allocates every frame | `GameUI.cs:88` | Performance | CONFIRMED |
| 3 | minor | two flags encode one state | `BotPath.cs:41` | Design | PLAUSIBLE — needs a run |
| 4 | — | "leaks on despawn" | `Registry.cs:60` | Lifecycle | REFUTED — deregistered in `OnDestroy` |

Round table (part three):

| Round | What happened | New confirmed | Killed | Open conflicts |
| --- | --- | --- | --- | --- |
| 1 | 6 lenses, blind | 9 raised | — | — |
| 2 | cross-examination | 4 | 5 | 1 (cache vs. simplicity) |
| 3 | second pass on hot paths | 0 | 1 | 0 |

Then, if any: **Dissent —** *Performance still argues finding 3 is a blocker at 60 fps; unmeasured.*

---

## MUST summary

- Read the whole target before forming opinions; read a diff in its surrounding context.
- Declare and freeze the panel; run each lens **blind**, writing findings before reading others.
- A finding without `file:line`, a concrete failure scenario, a severity and a confidence is not a
  finding.
- Every finding gets actively refuted by a different lens; thin evidence dies.
- Conflicts are decided as stated trade-offs, never averaged.
- Refuted findings stay in the record with their reason.
- Record dissent; never fake unanimity.
- Stop after a dry round or 3 fighting rounds.
- Review only — fix only if the user asks.
- Write it up in three parts — anyone, then the informed, then engineers — each standing on its own,
  nothing repeated between them.
- Headings name their own content; generic summary labels are banned. Charts go to the part whose
  reader can act on them, one idea each.
