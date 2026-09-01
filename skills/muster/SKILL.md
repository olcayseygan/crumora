---
name: muster
description: Turns a body of practice into a checklist somebody can actually tick. It pulls every entry out of a source — a pattern library, a style guide, a spec, a talk, a team's review habits, a codebase's own conventions — rewrites each one as a binary pass/fail line, and ships the result as a single self-contained HTML checklist that remembers what was ticked. Enumeration is counted, not eyeballed: the source's entry count and the checklist's entry count must match, and anything deliberately left out is named. Use when the user says "/muster", "turn this into a checklist", "make a checklist out of this page", "extract all the patterns from this", "list everything here as checks", "codify our review rules", "give me a QA list for this", or the Turkish equivalents "checklist yap", "kontrol listesi cikar", "buradaki tum X'leri cikart", "maddelere dok", "kurallara dok". For a fixed rule pass that fixes what it finds use codify, for measuring data and writing it up use data-report.
---

# muster — gather every one, then make each one pass

Two jobs in the word, and the skill does both. **Muster** the entries: fetch the source and count
them out, all of them. Then make each one something the work can **pass muster** against: a line that
is either true of the artefact in front of you or it isn't.

Sibling of **codify**, which owns a rule set someone else already wrote down and fixed in advance.
This one *produces* the rule set — from a source that has the knowledge but not the form — and hands
it back as a page you tick, not a diff. `codify` closes a gate; `muster` builds one.

The two failure modes it exists to prevent:

- **The silent drop.** The source lists 73 entries; the checklist ships 41. Summarising is the
  default failure of extraction and it is invisible to whoever reads the result — nothing on the page
  says what is missing, so the gap is discovered later, by the bug it let through.
- **The unfalsifiable box.** *"Use good spacing."* *"Make it accessible."* A box nobody can tick
  honestly is worse than no box: it converts a real check into a feeling and then gives it a
  checkmark. A checklist is judged by its weakest line, not its longest section.

---

## Invariants

- **Enumerate before you write (MUST).** The complete list of entries exists — counted, written
  down — before a single check is drafted. No check is written while the list is still growing.
- **The counts must agree.** Entries in the source, entries on the page. A mismatch is a bug, not
  rounding. If an entry is deliberately excluded, it is named in the delivery message.
- **Every box is a state, not an instruction.** Written as the passing condition, present tense, so
  ticking it is a claim about the artefact — *"errors appear after the field loses focus"* — never a
  task — *"show errors on blur"*. A checklist of instructions is a backlog wearing a costume.
- **Every box is answerable by looking at one thing.** One place to check, one yes or no, and two
  people looking at the same screen give the same answer.
- **Nothing invented is passed off as sourced (MUST).** Where the source gives a title and a tagline
  and *you* supplied the checks underneath, that is interpretation — say so in the delivery message
  and on the page itself. The reader is entitled to know which lines they can take up with the
  source and which are yours.
- **The source's own grouping and order survive.** Do not invent a taxonomy the source does not
  have, do not alphabetise a list that was ordered by argument.
- **Language follows the user.** Checks are written in the language they are speaking. Proper names
  of entries keep their original spelling — a pattern called *Doherty Threshold* stays that in every
  language; only the lines under it are translated.
- **State lives in the page.** Ticks survive a reload, and clearing them is one deliberate,
  confirmed action.
- **Read-only.** The source, the site and the project come out unchanged.

## Flow

### 1. Pin the source and the unit

Three answers before anything else: what is the source, what counts as **one entry**, and how deep
does the source go.

The unit is the thing that gets one card on the page — a pattern, a rule, a lint code, a heading, a
guideline, a component. Get it wrong and everything downstream is the wrong size.

Depth is the one question worth asking the user, and only once:

- **Index-only** — the source's list page carries a name and a line of description per entry. Fast;
  the checks under each entry are *your* interpretation of what that entry implies.
- **Per-entry** — each entry has its own page, section or file worth fetching. Slower, and the checks
  come from the source's own words.

Ask which they want when the source has detail pages and the answer changes the work. Otherwise pick
index-only, say that you did, and offer the deeper pass in the closing message.

### 2. Muster the entries — and count them

Pull the **complete** list before writing anything. No summarising, no *"and 20 more like these"*.
Write the count down; it is the number the rest of the run is checked against.

A rendered page that shows 12 of 73 is not the source. Pagination, lazy-loading, a "show all" control,
a filter defaulting to one category, a `sitemap.xml`, an underlying JSON feed — go and get the rest.
For a codebase or a folder, the enumeration is a `grep`/`glob` whose pattern is written down, not a
walk through the files you happened to open.

Then the **reverse check**: pick five entries at random *from the source* and confirm each one
appears in your list. Sampling forwards only tells you what you already collected.

### 3. Codify each entry

Two to five boxes per entry — the rules for writing one are in `references/item-rules.md`. In short:
the passing state, present tense, one thing per line, specific enough to be disagreed with.

Where the source gives a number — 400ms, 4.5:1, 44px, three levels — **keep the number**. Numbers are
most of what makes a box checkable, and they are the first thing a paraphrase loses.

Where the source gives a tagline that names a failure (*"the error fires while you're still typing"*),
the box is that failure inverted into its passing state. The tagline itself stays on the card as
context; it is not a check.

### 4. Kill pass

Go back over every box and delete:

- boxes nobody could answer from the artefact,
- boxes that are two boxes joined by *and*,
- boxes that repeat the neighbour above in different words,
- boxes that restate the entry's own title,
- boxes that are true of every project that has ever existed.

Cutting a weak box costs nothing. Shipping one costs the credibility of every box around it.

### 5. Build the page

Copy `references/checklist-template.html` and fill in the data. The template already carries the
mechanics, so none of them have to be reinvented: grouping, a stable per-entry ID (`INT-04`), search
across titles and box text, group filters, an **only unfinished** filter, overall and per-group
progress, `localStorage` persistence in a `try`/`catch`, light and dark themes driven by tokens,
visible keyboard focus and `prefers-reduced-motion`.

What the template does *not* carry is an identity. It is a working skeleton, not a finished design:
palette, typefaces, the header and the way an entry card reads belong to **this** subject. Load the
`artifact-design` skill before touching it and design it for the source at hand.

Keep it one file. The Google Fonts `<link>` the template declares is the only external reference
allowed; everything else is inline.

### 6. Deliver

- **Artifact tool available** → publish it and hand back the URL.
- **Not available** → write the HTML where the user said, or next to the source material, and hand
  back the path.
- Closing message: the link or path, the three counts (entries / boxes / groups), one line naming
  what you interpreted rather than quoted, and — if you ran index-only on a source that has detail
  pages — the offer to redo it from those pages.
- Do not paste the checklist body back into the chat. The page is the deliverable.

## Checklist

Walk `references/checklist.md` before delivering.

---

## MUST summary

- The complete entry list is collected and counted **before** any check is written.
- Source count and page count agree; any deliberate omission is named out loud.
- Five entries picked at random from the source are confirmed present on the page.
- Every box is a passing state in the present tense, not an instruction.
- Every box is answerable from one place with one yes or no; numbers from the source are kept.
- Two to five boxes per entry, after a kill pass that removes the unanswerable, the doubled, the
  duplicated and the universally true.
- Interpretation is labelled as interpretation, on the page and in the closing message.
- The source's grouping and order survive; no invented taxonomy.
- Checks are in the user's language; entry names keep their original spelling.
- One self-contained HTML file, designed for its subject rather than shipped as the raw template,
  with ticks that persist and a deliberate way to clear them.
- Closing message is a link plus counts, not the checklist.
