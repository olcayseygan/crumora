# Writing a box somebody can tick

One rule underneath all of the others: **a box is a claim about the artefact, and the person ticking
it must be able to be wrong.** If there is no way to fail it, it is decoration.

---

## The five tests

Run every box through these. A box that fails one gets rewritten or cut — see the kill pass in
`SKILL.md` §4.

1. **State, not instruction.** It reads as a condition that is already true, in the present tense.
   Ticking it asserts something about what is on screen, not about what someone intends to do.
2. **One thing.** No `and`, no `also`, no second clause carrying its own verb. Two things joined into
   one line produce a half-tick nobody can record.
3. **One place.** The reader knows where to look to answer it — a screen, a file, a control, a
   computed number. If answering means auditing the whole product, it is a section heading, not a box.
4. **Falsifiable by two people.** Two reviewers looking at the same artefact reach the same answer.
   Where the source gave a threshold, the threshold is in the line; that is usually what makes this
   test pass.
5. **Not universally true.** If every project that ever shipped would tick it, it carries no
   information and costs the checklist credibility.

## Good and bad

| ✗ Cut or rewrite | ✓ Ships |
| --- | --- |
| Use good spacing | Every gap between siblings comes from the declared spacing scale |
| Make it accessible | Every interactive element has a visible focus ring |
| Handle errors properly | The error message says what went wrong and what to do next |
| Consider mobile users | Every hover-only action has a tap equivalent |
| Add loading states | The loading placeholder takes the same size as the loaded content |
| Respect the user's time | A response to a user action appears within 400 ms |
| Show validation and keep the data safe | Errors appear after the field loses focus · The typed data survives a failed submit |
| Buttons should be clear | The primary button's label names its result: "Save changes", not "Save" |
| The design is consistent | Colour, spacing and radius come from tokens; no one-off hex in the component |

The right-hand column is the same knowledge; what changed is that each line now names the place to
look and the answer that counts as a pass.

## Grammar

- **Present tense, affirmative.** *"The counter pauses on hover"*, not *"Do not let the counter run
  during hover"*. A negation makes a tick ambiguous — did they tick because it is absent, or because
  they read past the *not*?
- **Concrete subject.** Name the thing: *the toast*, *the primary button*, *the empty state*. A box
  whose subject is "the app" is a section, not a check.
- **Keep the source's numbers verbatim.** 400 ms, 4.5:1, 44×44, 12 columns, three levels. If the
  source implies a number without stating one, either find it or leave the number out — do not invent
  a threshold and lend it the source's authority.
- **Length: one line.** If it needs a second line to be understood, the entry's tagline should be
  carrying that context instead.

## How many per entry

Two to five. Below two, the entry was not worth a card of its own and belongs merged into its
neighbour. Above five, one of two things is true: the entry is really several entries and should be
split, or the tail of the list is padding that will be skimmed and ticked blind.

The order inside an entry is the order someone would actually check them in — the thing you see first
at the top, the thing you only find by testing at the bottom.

## Interpretation, and saying so

Sources come in two shapes and they produce two different kinds of box:

- The source **states the rule** — a style guide, a lint rule, a spec clause. The box is that rule in
  checkable form. Keep its words where they work.
- The source **names a subject and a symptom** — a pattern library with a title and one line of
  copy, a talk, a set of review comments. The boxes underneath are yours, derived from the title.

The second kind is legitimate and often the most useful output the skill produces. What is not
legitimate is letting it pass as the first. Say which one happened, in the closing message and in the
page footer, in one sentence: *the entries are the source's, the checks under them are an
interpretation of each entry, not quoted from it.*

Where the two mix — some entries quoted, some derived — mark the derived ones on the card rather than
disclaiming the whole page.
