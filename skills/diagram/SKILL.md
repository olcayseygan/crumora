---
name: diagram
description: Draws a diagram that explains how something works, in the library the user names — Mermaid by default, otherwise Graphviz, D2 or PlantUML. One question per diagram, at most ten nodes, every branch labelled, and anything bigger split into an overview plus linked detail diagrams instead of one unreadable wall. Use when the user says "/diagram", "draw this", "diagram this flow", "show me how this works", "flowchart", "sequence diagram", "state machine", "architecture diagram", "visualise this process", or the Turkish equivalents "diyagram ciz", "akis semasi", "sema ciz", "gorsellestir". For measuring data use report, for judging code use tribunal, for charts of numbers use dataviz.
---

# diagram — draw the process, not the box list

Draw **one picture that answers one question** about how something works, in the library the user
asked for. A reader who never saw the code should be able to follow the process from the diagram plus
a few lines of prose.

Seventh sibling of **rewrite**, **sharpen**, **reskin**, **tribunal**, **report** and **specify**. Same
house discipline — draw what is actually there, state the limits, never invent a step to make the
picture tidy — but the artefact is a diagram.

The three failure modes it exists to prevent:

- **The wall** — forty nodes, every one connected, nobody reads it. A diagram that needs zooming has
  already failed; it should have been three diagrams.
- **The box list** — the bullet points redrawn as rectangles in a line. It carries no branch, no
  actor, no failure path, so it says nothing the sentence above it didn't.
- **The invented step** — a box drawn because the flow looked incomplete without it. The reader now
  believes in code that does not exist.

---

## Invariants

- **One diagram = one question (MUST).** The title *is* the question, answered: *"How a request
  becomes a rendered frame"*. If you cannot write that title, you do not know what you are drawing.
- **Ten nodes, fifteen edges — hard cap (MUST).** Over the cap, split (see *Splitting*). Never shrink
  a diagram by deleting a real branch; that is lying, not simplifying.
- **Every branch edge is labelled.** A decision with unlabelled arrows is a coin toss. `yes` / `no`,
  `cache hit` / `miss`, `>= 3 attempts`. Non-branch edges get a verb only when it adds something.
- **Nodes are things, edges are actions.** Node text is a noun phrase (`token store`, `pending
  queue`), edge text is a verb or a condition. A node reading *"then we validate and store it"* is
  two nodes.
- **Draw only what you verified (MUST).** Read the code, the config, the log — the same rule as
  `report`: the name is a hint, the content is the evidence. Anything you could not confirm is either
  left out or drawn dashed and listed under *Not verified*.
- **Failure paths are part of the process.** Timeout, retry, rejection, empty state. A happy-path-only
  diagram is the one that gets believed and then contradicted by production.
- **No decoration.** No colour, no icons, no shape games unless they carry meaning — and if they do,
  a one-line legend goes under the diagram. Default shapes for everything else.
- **One library per answer.** The one the user named; **Mermaid** when they named none. Don't mix, and
  don't silently switch because a construct is awkward — say it is awkward and pick the nearest shape.
- **Syntax gets validated before delivery (MUST).** A diagram that does not render is worth less than
  no diagram. See *Validate*.
- **Language follows the user.** Node and edge labels in the language they are speaking; identifiers
  from the code stay verbatim.

## Pick the type

Pick from the **question**, not from habit. Most things get drawn as a flowchart because that is the
default in people's heads, and half of them read better as something else.

| The question | Type |
| --- | --- |
| What happens, in what order, with which branches? | **flowchart** |
| Who talks to whom, over time? (2+ actors, messages) | **sequence** |
| What states can *one thing* be in, and what moves it? | **state** |
| What are the pieces and how do they connect? (no time) | **component / graph** |
| What data is stored and how does it relate? | **ER / class** |

Two signals that you picked wrong: a flowchart whose boxes keep naming *who* does the step — that is
a sequence; a flowchart whose boxes are adjectives (`idle`, `loading`, `failed`) — that is a state
machine.

## Splitting

Over the cap, do **not** shrink the font. Split, in this order of preference:

1. **By level.** One overview where every node is a stage, then one detail diagram per stage that
   needs it. The overview node and the detail title carry the **same name** — that is the only link
   the reader has.
2. **By path.** Happy path in one diagram, error and retry handling in another.
3. **By actor.** One diagram per participant when a sequence gets crowded.

Rules for split sets: three or four diagrams, not nine. Every detail diagram states which overview
node it expands, in its title. No node appears in two detail diagrams — a shared step belongs in the
overview.

## Flow

### 1. Pin the question

One sentence: *what will the reader be able to do after seeing this?* Plus who reads it — a new
teammate, a reviewer, an executive. That decides the level of detail, and nothing else does.

If different readings lead to different diagrams, ask. Otherwise state the assumption and draw.

### 2. Collect the truth

Read the source. Write down, in plain text before drawing anything: the steps in order, the actors,
every branch with its condition, every failure path, where the process starts and where it ends.

This list is the diagram. If it is wrong, a beautiful rendering makes it worse.

### 3. Choose type and check the budget

Count the nodes on the list. Over ten → decide the split now, before writing a line of syntax.

### 4. Write it

Target library, minimum syntax, no theming. Node ids short and meaningful (`auth`, not `n1`).
Consistent direction — top-down for processes, left-right for pipelines — and the same one across a
split set. Syntax minimums per library: `references/libraries.md`.

### 5. Validate

- **Mermaid** — render it. In an Artifact it renders natively (```mermaid fence, or
  `<pre class="mermaid">`); otherwise `npx -y @mermaid-js/mermaid-cli -i d.mmd -o d.svg`.
- **Graphviz** — `dot -Tsvg d.dot -o d.svg`.
- **D2** — `d2 d.d2 d.svg`.
- **PlantUML** — `plantuml d.puml`.

No renderer available: say so, and re-read the syntax by hand against the reference instead of
claiming it renders.

### 6. Deliver

Per diagram, exactly this and nothing more:

1. **Title** — the question, answered.
2. **The diagram.**
3. **The walkthrough** — 2 to 5 lines that follow the arrows in order and name what the picture
   cannot: why a branch exists, what the condition really compares, what the box is called in the
   code (`file:line` when it helps). Not a caption; not a re-reading of the labels.

Then, only when there is something to say: a one-line **legend** if any shape or colour was
meaningful, and **Not verified** — every dashed edge and every assumption, one line each.

Where it goes: inline in the chat by default; to a file when the user asks or the set has more than
two diagrams; to an Artifact when they want to look at it in a browser.

Close with one line — what was drawn, in which library, how many diagrams. Do not narrate the
diagram again in prose.

---

## MUST summary

- One question per diagram, and the title is that question.
- Ten nodes and fifteen edges, hard cap — over it, split into an overview plus named detail diagrams.
- Every branch edge labelled; nodes are nouns, edges are verbs.
- Only verified steps are drawn solid; unverified ones are dashed and listed, or left out.
- Failure paths are drawn, not trimmed for tidiness.
- No decoration without meaning, and meaning gets a legend.
- One library per answer — the one the user named, Mermaid by default.
- The syntax is rendered and confirmed before it is handed over.
- Every diagram ships with a 2-5 line walkthrough that says what the picture can't.
