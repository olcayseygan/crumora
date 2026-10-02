---
name: humanize
description: Rebuilds an interface's interaction around the person in scored rounds. Each round walks the tasks through the render as a first-time person, rebuilds the flow three ways in parallel, gates each on every task completing, and a blind judge ranks them against the champion from their task traces, the frozen people, tasks and rubric; the best that beats the champion and survives the interaction checklist takes the throne. Stops when none does, 4 rounds max. Use when the user says "/humanize", "this UI is terrible", "the UX is bad", "make this usable", "make it feel right", "users get lost here", "too many clicks", "improve the user experience", "make the interaction better", "make it human", or the Turkish "ux'i iyilestir", "kullanici deneyimini iyilestir", "bu tasarim sacma", "olmasi gerektigi gibi yap", "etkilesimi iyilestir", "kullanici burada kayboluyor", "cok tikla gidiyor". For how a screen looks and reads use compose; for the fixed 73-pattern pass use muster; for measuring rendered pixels use gauge.
---

# humanize — rebuild the interface around the person

The tournament skill for behaviour: it judges what a person goes through to get the job done — steps,
hesitations, waits, mistakes, recovery — not how the surface looks (that is `compose`).

**Load the matching design skill first**, if available: `frontend-design` for web UI, `dataviz` for
charts, `artifact-design` for a published page.

**Read `../_shared/tournament.md` first** — it defines the loop and binds this skill; the rubric
below **replaces** its code rubric.

---

## 0. Pick the target and freeze the people and the tasks

Target = the argument (`/humanize the checkout`); none → ask **one question**: which screen, flow or
component.

Read the flow's real context — routes, state, API calls, validation, error handling, permissions — not
just the markup. If the real obstacle is upstream (API, backend errors, routing), **say so before
round 1**.

Freeze for the whole run:

1. **The people.** Who, how often (first visit / weekly / daily), on what input (mouse, touch,
   keyboard, screen reader), in what context. Unknown → stated as an assumption, marked **guessed**.
2. **The task set.** Three to seven real tasks, each the **person's goal in their own words**, with a
   start state and an observable done state, ordered by **frequency × consequence**. Plus the **stress
   paths**, walked by every challenger at the round's viewports (`tournament.md` §4.3):
   - wrong input — typo, invalid value, duplicate;
   - first run and empty state;
   - throttled network and aborted request (`page.route` abort);
   - interruption — reload or navigate away mid-task, then come back;
   - regret — undo the thing just done;
   - long content — longest name, 40-item list, biggest number;
   - keyboard only;
   - narrow touch viewport.
3. **The constraints.** What cannot move: API contract, data model, platform idiom, existing tokens
   and components, legal or compliance copy.

## 1. Setup (round 0)

`tournament.md` §1, work folder `<scratchpad>/humanize/<target-slug>/`, each `r<N>/c<k>/` holding the
source, `trace.md` and the step screenshots. **Walk every task and stress path through the current
interface (§3) before anything is designed** — round 0's trace is the baseline — and run
`references/interaction.md` on it; its misses cap the champion.

## 2. The challenger

The round itself — three ideas, parallel builders, one blind judge, crowning — is `tournament.md` §4.
What each challenger is:

**(a) An interaction idea** — one sentence: what changes in **how the person gets the job done**. A
restyle of the same flow is not an idea.

**(b) Rebuilt from the job** — from the people and the task set, not the current screens. Declare in
`r<N>/c<k>/contract.md`:

- **flow map** — per task, the states from start to done;
- **primary move** — per screen, the one obvious next thing;
- **feedback contract** — what answers each action, where, within how many ms;
- **error contract** — what is prevented, caught (where, when), undone (how);
- **defaults** — what is prefilled, remembered or inferred.

Use the project's components and tokens; visual work only as far as the interaction needs.

**Behaviour the product depends on is not negotiable (MUST).** Every binding, event, API call,
server-side validation, permission check and analytics event travels through the rebuild.

**(c) Gate (MUST)** — `tournament.md` §3, plus **every task in the set completes end to end in the
rendered interface**, driven with the browser or Electron tools, not reasoned from source. A task that
cannot be finished takes the challenger out of the round. With no runnable check, `unverified` goes on the score sheet.

**(d) Walked** (§3) — every challenger; the champion's trace is the one from the round it won.

**(e) Judged** (§4 rubric, §5 judge inputs and red lines).

**(f) Pre-crown check** — only on challengers that beat the champion, highest-ranked first
(`tournament.md` §4.7): `references/interaction.md` in full, driven through the render. Its caps (§4) apply before it can take the throne.

## 3. The walk

Drive each task through the render **as the person frozen in §0** — knowing the goal, not the
interface; no shortcuts from knowing where things are. Launch the project the way it already runs
(`run` skill) and act with Playwright or the Electron tools.

**Per step**, one row in `trace.md`:

| # | Person wants | Sees | Does | Interface answers | ms |
| --- | --- | --- | --- | --- | --- |

plus the four cognitive-walkthrough questions, yes or no: will they try the right thing, will they see
the control, will they connect it to the goal, will they see it worked. Every **no** is a friction
point, logged with its step number and the question it failed.

**Per task**, totals taken from the run, never estimated:

- **steps** — clicks, taps, key chords, fields typed, scrolls to find something;
- **decisions** — points with more than one plausible move;
- **context switches** — page changes, modals, tabs, windows;
- **recall load** — things carried from one screen to another;
- **pointer travel** — summed px between consecutive targets on desktop; on a phone, targets outside
  the thumb zone;
- **feedback latency** — worst ms from action to visible response, measured with `performance.now()`
  or a trace, never off screenshots;
- **dead ends** — states whose only way forward is back;
- **error cost** — on stress paths, steps to recover and whether typed input was lost;
- **unguarded irreversibles** — destructive actions with neither undo nor confirmation.

The §0 stress paths are walked as tasks too.

## 4. Scoring (the human-interaction rubric)

Replaces `tournament.md` §2. Six criteria, each **0-10**, weighted total **0-100**; the shared scoring
rules (§3 there) still apply.

| Criterion | Weight | What it measures |
| --- | --- | --- |
| Task efficiency | 20 | Steps, decisions, context switches and travel for each task against the round 0 trace; the most frequent task is the cheapest; no step exists for the interface's sake rather than the person's — re-entering known data, confirming the obvious, visiting a page to press one button |
| Clarity of the next move | 20 | Walkthrough questions answer yes; one primary move per screen; labels in the person's words and buttons named for their result; things look like what they do; nothing needed hides behind hover, a menu or a mode; location, selection and mode always visible |
| Error prevention & recovery | 20 | Constraints and defaults stop mistakes before they happen; validation on blur, next to the field, saying what to do; nothing typed is ever lost to an error, back or reload; reversible actions execute with an undo instead of a confirm, window per `muster` undo-ux (5s default, 10s for bulk or delayed send); truly irreversible ones confirm by naming the object and the consequence |
| Feedback & system status | 15 | Every press answers visibly under 100ms; work past ~300ms shows progress where the action happened; long work says what is happening and can be left or cancelled; no double submit; success confirmed where the eye already is; state changes announced to assistive technology |
| Reach & inclusiveness | 15 | Every task completes keyboard-only in task order with a visible focus ring; shortcuts for the daily expert, discoverable; touch targets ≥ 44px inside thumb reach; screen reader completes every task; 200% zoom and 360px still complete; reduced motion respected; nothing by colour alone; text at AA |
| Memory & cognitive load | 10 | Recognition over recall; nothing carried between screens; smart defaults and remembered choices; few options per decision, long lists searchable; progressive disclosure that the frequent task never needs to open; an interrupted task resumes; same action, same name, same place everywhere |

On top of the shared rules:

- **Every reason cites the trace** — a task, a step number and a number.
- **Fewer steps is not automatically better.** A step removed by hiding an option, guessing silently or
  merging two decisions into one unclear control counts against Clarity and Error recovery, not for
  Efficiency.

Caps, from `references/interaction.md`, applied at the pre-crown check: a task not completable
keyboard-only holds Reach at **≤ 5**; any miss in the Errors section holds Error prevention &
recovery at **≤ 6**.

## 5. Judging and red lines

`tournament.md` §4.4. The judge receives the frozen people, the task set, the rubric, and for every
version (`A`, `B`, `C`…) its `trace.md` with its step screenshots and totals. **Not** the source,
**not** which is the incumbent, **not** the round numbers. Every criterion verdict names a task and a
step.

**Red lines** — rank below every clean version regardless of score:

- a task in the set cannot be completed, or a stress path loses typed input the champion kept;
- the most frequent task costs more steps or more decisions than in the champion;
- an irreversible action lost its undo or its confirmation;
- the keyboard-only path breaks, or the focus ring disappears anywhere on it;
- any text fails AA contrast;
- a validation, permission check, API call, binding or analytics event was dropped;
- the project's existing tokens or components were ignored in favour of invented ones.

## 6. Finish and apply

`tournament.md` §5 — the apply-time check is **the whole task set walked again on the applied
result**, stress paths included, at every declared viewport.

## 7. Final analysis

Format: `tournament.md` §6. This skill's table:

| Round | Interaction ideas (c1 · c2 · c3) | Gate | Pool (best → worst) | Top challenger: top task steps / friction points | Pre-crown check | Champion |
| --- | --- | --- | --- | --- | --- | --- |

Under **How we did it**: the winner's flow map with before → after steps, decisions and worst latency
per task, its feedback and error contracts, and which idea from a losing challenger survived. Under
**Possible mistakes**: always state that **the walk is a proxy for a real person, not a usability
test**, then name guessed people, tasks outside the set, network conditions and devices not
simulated, and timings taken on a dev build.
