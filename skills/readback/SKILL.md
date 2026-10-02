---
name: readback
description: Proves the request was understood before anyone builds anything — states the outcome rather than paraphrasing the words, marks every gap it had to fill as said, inferred or guessed, names the boundary, argues the strongest rival reading and lists where you would catch a misunderstanding first. Builds nothing, edits nothing, plans nothing. Use when the user says "/readback", "did you understand me", "what did you understand", "tell me back what I asked", "repeat it back", "say it in your own words first", "before you start, tell me what you think I want", or the Turkish equivalents "beni anladin mi", "ne anladin", "anladigini soyle", "baslamadan once ne anladigini yaz". For a fixed rule pass that fixes what it finds use lint, for redesigning an interface use compose.
---

# readback — prove it landed, before anyone builds anything

Hand the request back as consequences the reader can reject line by line — never as a paraphrase.

## Rules

- **Builds nothing (MUST).** No file written, no code, no approach, no step list, no work begun.
  Source is read only far enough to make nouns concrete — the real file, function, column — never far
  enough to solve.
- **Every line is rejectable and adds something the request only implied (MUST)** — an outcome, a
  decision, a boundary, a consequence. The user's own words appear only as evidence, never as the
  claim. The closing correction line is the one exemption.
- **Every claim is marked (MUST):** **said** — traceable to a phrase in the request; **inferred** —
  follows from the context, the repo or an earlier turn; **guessed** — picked with nothing behind it.
  A guess stays a guess however reasonable. When stacked guesses would let two honest readings
  produce different work, say the request is underspecified.
- **The rival reading is argued at its strongest (MUST)**, followed by the one question that
  separates it from yours. Where the request admits one reading, say so; never invent a rival.
- **Ends without a plan (MUST).** No steps, no schedule, no *shall I begin*.
- Shorter than what it checks, one screen at most — except a request too short to hold every
  section, where each section collapses to one line instead. Written in the request's language,
  headings included. No acknowledgement; open on the first claim. A question appears only if its
  answer changes the work, and carries what changes.

**Target:** the instruction just given, or what the argument names — a file, a ticket, a paragraph.
*"The whole conversation"* means the standing instructions, earlier corrections included.

## Output

These headings in this order, each dropped when it has nothing to say:

**The job** — one sentence: the outcome, not the action. If it cannot be made concrete, say
understanding failed.

**Done looks like** — one to three lines: what exists, behaves or reads differently once finished.

| What the request left open | My reading | Level | If it is the other way |
| --- | --- | --- | --- |

Highest consequence first. Past roughly seven forks, stop and say the request is underspecified.

**Not included** — what a reasonable reader might expect here and will not get.

**Rival reading** — the strongest alternative, then the question that separates it from yours.

**Where you would catch me** — one to three concrete observables where a wrong reading shows first.

**Needs an answer** — only questions that change the work, each with what changes.

Close with one line inviting a correction, and nothing after it.
