---
name: humanize
description: Rebuilds a badly designed interface around the person using it, in scored rounds, obsessing over what a human actually goes through — the task flow, how many steps, decisions and screens a job costs, whether the next move is obvious at every step, whether every action answers within 100ms and shows progress past 400ms, whether mistakes are prevented, caught early and undone, what the person has to remember, where their hands and eyes already are, keyboard, touch and screen-reader reach, defaults, first-run, empty, error, slow-network and interrupted paths. Each round drives the real tasks through the rendered interface the way a first-time person would, writing down every step, decision, pointer travel, dead end, latency and recovery cost; rebuilds the interaction from the job rather than the current screens; gates on a clean render with every task completable; scores against a frozen human-interaction rubric; and fights the reigning version head-to-head through a blind judge that sees only the two task traces. Runs until two challengers lose in a row, then reports a full analysis and a round-by-round table. Use when the user says "/humanize", "this UI is terrible", "the UX is bad", "make this usable", "make it feel right", "users get lost here", "too many clicks", "improve the user experience", "make the interaction better", "make it human", or the Turkish "ux'i iyilestir", "kullanici deneyimini iyilestir", "bu tasarim sacma", "olmasi gerektigi gibi yap", "etkilesimi iyilestir", "kullanici burada kayboluyor", "cok tikla gidiyor". For how a screen looks and reads — layout, spacing, alignment — use compose; for the fixed 73-pattern pass use muster; for measuring rendered pixels use gauge.
---

# humanize — rebuild the interface around the person

An interface is judged by **what a person goes through to get their job done** — not by how it looks
in a screenshot. Walk the real tasks **as a person**; count what they cost; **rebuild the
interaction** from the job; walk them again; fight the result against the current version; repeat
until a fresh attempt stops winning.

The tournament skill for behaviour. `compose` judges what the surface looks like and how it reads;
this one judges what happens between the screenshots — the steps, the hesitations, the waits, the
mistakes, and what it costs to get out of one.

Three failure modes it exists to prevent:

- **The screenshot verdict.** A flow judged from a still image. Every real friction — the wait with no
  answer, the error that wipes the form, the button that only appears on hover — lives *between*
  frames, and a still frame shows none of it.
- **The designer's walk.** The author clicks straight through because they already know where
  everything is. The walk is done by someone who knows the **goal**, not the interface.
- **The prettier same flow.** Restyled, re-spaced, re-coloured — and still seven steps, the same dead
  end, the same lost input. A better-looking obstacle is still an obstacle.

**Load the matching design skill first**, if one is available: `frontend-design` for web UI,
`dataviz` for anything with a chart, `artifact-design` for a published page. This skill is the
harness and the walk; those carry the craft.

**Read `../_shared/tournament.md` first** — setup invariants, scoring rules, VS rules,
stopping/applying and the final-analysis format live there. The rubric below **replaces** the shared
code rubric.

---

## 0. Pick the target and freeze the people and the tasks

If the user passed an argument, that is the target (`/humanize the checkout`). If not, ask **one
question**: which screen, flow or component.

**Read the real context, not just the markup.** The parent shell and routes, the store or state
machine behind the flow, the API calls, the validation, the error handling, the permission checks.
Interaction lives in the state, not in the JSX. If the actual obstacle is upstream — an API that forces
three round-trips, a backend that answers every failure with a bare 500, a route that cannot hold
state — **say so before round 1**; no front end can hide a flow the backend forces.

Then freeze three things for the whole run:

1. **The people.** Who uses this, how often (first visit, weekly, forty times a day), on what input
   (mouse, touch, keyboard-heavy, screen reader), in what context (hurried, interrupted, on a
   phone in one hand). Unknown means stated as an assumption and marked **guessed**. A daily expert
   and a first-time visitor want opposite things — a round that does not know which one it serves is
   designing for nobody.
2. **The task set.** Three to seven real tasks, each written as the **person's goal in their own
   words** (`change the delivery address of an order already placed`), with a start state and an
   observable done state, ordered by **frequency × consequence**. Plus the **stress paths**, walked
   against every round:
   - the wrong input — a typo, an invalid value, a duplicate;
   - the first run and the empty state;
   - the slow network and the failing request;
   - the interruption — reload or navigate away mid-task, then come back;
   - the regret — undo the thing just done;
   - the long content — longest name, 40-item list, biggest number.
3. **The constraints.** What cannot move: API contract, data model, platform idiom, existing tokens
   and components, legal or compliance copy. A deliberate behaviour change is written as a bullet
   **now**, never discovered in round 4.

## 1. Setup (round 0)

`tournament.md` §1, work folder `<scratchpad>/humanize/<target-slug>/`, each `r<N>/` holding the source,
`trace.md` and the step screenshots. One addition: **walk every task and stress path through the
current interface (§3) before anything is designed.** Round 0's trace is the baseline every later
number is compared against.

## 2. The round loop

**(a) State the interaction idea.** One sentence, before touching anything: what changes in **how the
person gets the job done** — not how it looks (`edit in place on the row instead of a separate edit
page, save on blur, 5s undo instead of a confirm dialog`). A round whose idea is a restyle of the same
flow is a wasted round.

**(b) Rebuild from the job.** From the people and the task set, not from the current screens. Every
round declares up front, in `r<N>/contract.md`:

- **the flow map** — for each task, the states from start to done;
- **the primary move** — per screen, the one obvious next thing to do;
- **the feedback contract** — what answers each action, where, and within how many ms;
- **the error contract** — what is prevented, what is caught (where and when), what is undone and how;
- **the defaults** — what is prefilled, remembered or inferred so the person does not have to supply it.

Use the project's components and tokens. Visual work goes only as far as the interaction needs it;
the rest is `compose`'s job.

**Behaviour the product depends on is not negotiable (MUST).** Every binding, event, API call,
server-side validation, permission check and analytics event travels through the rebuild. A flow that
got shorter by skipping a validation or a permission is not shorter, it is broken.

**(c) Gate — it renders and every task completes.** MUST. The round must build, render with a clean
console, pass whatever type check, linter and tests the project runs, and **every task in the set must
complete end to end in the rendered interface**, driven with the browser or Electron tools — not
reasoned about from source. A task that cannot be finished loses the round. One repair attempt, then
the round ends.

**(d) Walk it** (§3) and go through `references/interaction.md` in full. Write the trace and the misses
down. Fix what the checklist catches before scoring.

**(e) Score** with the frozen rubric (§4), then **VS** the champion (§5) — **blind, in a separate
agent**, traces only.

**(f) Verdict.** The challenger takes the throne if it **passed the gate and won the VS**; the total is
the work queue and the tie-break, not the verdict. **Two consecutive losses** end the loop
(`tournament.md` §5), and the round after a loss must bring a different interaction idea.

## 3. The walk

Drive each task through the render **as the person frozen in §0** — knowing the goal, not the
interface. Never skip a step because you already know where the button is; never scroll straight to
a control the person would have to hunt for. Launch the project the way it already runs — the `run`
skill covers it — and use Playwright or the Electron tools to act.

**Per step**, one row in `trace.md`:

| # | Person wants | Sees | Does | Interface answers | ms |
| --- | --- | --- | --- | --- | --- |
| 3 | save the new address | form, no visible save | scrolls, finds "Submit" below the fold | spinner, button still clickable | 1840 |

and the four **cognitive-walkthrough questions**, each answered yes or no:

1. **Will they try the right thing?** Does the goal lead them to this step at all?
2. **Will they see the control?** Visible now — not behind hover, a menu, a scroll or a mode.
3. **Will they connect it to the goal?** Its label and look say what it does, in the person's words.
4. **Will they see it worked?** The answer shows up where they are already looking.

Every **no** is a friction point, written with its step number and the question it failed.

**Per task**, the totals — taken from the run, never estimated:

- **steps** — distinct actions: click, tap, key chord, field typed, scroll to find something;
- **decisions** — points with more than one plausible move where the person has to choose;
- **context switches** — page changes, modals, tabs, windows;
- **recall load** — things the person must carry from one screen to another: an ID, a value read
  earlier, a rule stated two pages back;
- **pointer travel** — summed px between consecutive targets on desktop; on a phone, targets outside
  the thumb zone;
- **feedback latency** — the worst ms from action to visible response, measured with
  `performance.now()` around the action or a trace, never read off screenshots;
- **dead ends** — states whose only way forward is back;
- **error cost** — on the stress paths, steps to recover and whether anything typed was lost;
- **unguarded irreversibles** — destructive actions with neither undo nor a confirmation.

The stress paths are walked as tasks too: wrong input, empty first run, throttled network, aborted
request (`page.route` abort), reload mid-task, undo, **keyboard only**, and a narrow touch viewport.

## 4. Scoring (the human-interaction rubric)

Replaces `tournament.md` §2. Six criteria, each **0-10**, weighted total **0-100**; the shared scoring
rules (§3 there) still apply.

| Criterion | Weight | What it measures |
| --- | --- | --- |
| Task efficiency | 20 | Steps, decisions, context switches and travel for each task against the round 0 trace; the most frequent task is the cheapest; no step exists for the interface's sake rather than the person's — re-entering known data, confirming the obvious, visiting a page to press one button |
| Clarity of the next move | 20 | Walkthrough questions answer yes; one primary move per screen; labels in the person's words and buttons named for their result; things look like what they do; nothing needed hides behind hover, a menu or a mode; location, selection and mode always visible |
| Error prevention & recovery | 20 | Constraints and defaults stop mistakes before they happen; validation on blur, next to the field, saying what to do; nothing typed is ever lost to an error, back or reload; reversible actions execute with a 5s undo instead of a confirm; truly irreversible ones confirm by naming the object and the consequence |
| Feedback & system status | 15 | Every press answers visibly under 100ms; work past 400ms shows progress where the action happened; long work says what is happening and can be left or cancelled; no double submit; success confirmed where the eye already is; state changes announced to assistive technology |
| Reach & inclusiveness | 15 | Every task completes keyboard-only in task order with a visible focus ring; shortcuts for the daily expert, discoverable; touch targets ≥ 44px inside thumb reach; screen reader completes every task; 200% zoom and 360px still complete; reduced motion respected; nothing by colour alone; text at AA |
| Memory & cognitive load | 10 | Recognition over recall; nothing carried between screens; smart defaults and remembered choices; few options per decision, long lists searchable; progressive disclosure that the frequent task never needs to open; an interrupted task resumes; same action, same name, same place everywhere |

Two rules on top of the shared ones:

- **No score without a reason, and the reason cites the trace** — a task, a step number and a number:
  *"task 2 went 11 steps → 4, but step 3 now asks the person to choose between two save buttons"*, not
  *"feels smoother"*.
- **Fewer steps is not automatically better.** A step removed by hiding an option, guessing silently or
  merging two decisions into one unclear control is counted against Clarity and Error recovery, not
  for Efficiency.

Caps, from `references/interaction.md`: a task not completable keyboard-only holds Reach at **≤ 5**;
any unfixed miss in the Errors section holds Error prevention & recovery at **≤ 6**.

## 5. VS (head-to-head)

`tournament.md` §4. The judging agent receives, for **A** and **B**: the frozen people, the task set,
the rubric, and each version's `trace.md` with its step screenshots and totals. **Not** the source,
**not** which one is the incumbent, **not** the round numbers. Every criterion verdict names a task and
a step: a judge who cannot point at the step where one version made the person hesitate has not
judged it.

**Red lines** — automatic VS loss regardless of score:

- a task in the set cannot be completed, or a stress path loses typed input the champion kept;
- the most frequent task costs more steps or more decisions than in the champion;
- an irreversible action lost its undo or its confirmation;
- the keyboard-only path breaks, or the focus ring disappears anywhere on it;
- any text fails AA contrast;
- a validation, permission check, API call, binding or analytics event was dropped;
- the project's existing tokens or components were ignored in favour of invented ones.

## 6. Finish and apply

`tournament.md` §5, with one addition: **walk the whole task set again on the applied result**, stress
paths included. Real data, real fonts and a real network move timings and break flows that worked in
isolation.

## 7. Final analysis

Format: `tournament.md` §6. This skill's table:

| Round | Interaction idea | Gate | Top task steps | Friction points | Score | VS | Champion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | current flow | clean | 11 | 9 | 52 | — | R0 |
| 1 | edit in place, undo instead of confirm | clean | 4 | 2 | 78 | R1 wins (5-1) | R1 |
| 2 | three-step wizard | task 3 not completable | — | — | — | — | R1 |
| 3 | command palette first | clean | 3 | 4 | 71 | R1 wins (4-2) | R1 |

Under **How we did it**, give the winner's flow map with before → after steps, decisions and worst
latency for every task, its feedback and error contracts, and which idea from a losing round survived
into it. Under **Possible mistakes**, always say that **the walk is a proxy for a real person, not a
usability test** — then name the people that were guessed, tasks outside the set, network conditions
and devices not simulated, and timings taken on a dev build.

---

## MUST summary

- Read `../_shared/tournament.md` before round 1; its rules bind this skill.
- Load `frontend-design` / `dataviz` / `artifact-design` first when they apply.
- Read the flow's real context — state, API, validation, permissions — and say so if the obstacle is
  upstream.
- Freeze the people, the task set with its stress paths, and the constraints before round 1.
- Walk every task in round 0 before designing anything; that trace is the baseline.
- Each round states one interaction idea and declares its flow map, primary moves, feedback contract,
  error contract and defaults.
- **Drive every task through the render as the person** — never judge a flow from source or a still
  frame. A round with a task that cannot be completed, a failed render or console errors is lost after
  one repair attempt.
- Every step gets the four walkthrough questions; every task gets its totals from the run, latency
  measured, never estimated.
- Carry every validation, permission check, API call and binding through the rebuild; dropping one is
  an automatic loss.
- Judge the VS blind in a separate agent — two traces, A and B, incumbent unnamed; the VS decides the
  throne, the score is the queue and the tie-break.
- Ties go to the champion; red lines are an automatic loss. The loop ends on two consecutive losses,
  and 6 rounds maximum.
- Final analysis: five headings plus the table, and the proxy caveat is never dropped.
