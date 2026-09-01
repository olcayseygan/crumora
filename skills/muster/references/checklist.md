# Pre-delivery checklist

Walk this before handing anything back. Every box is answered from the **built page**, not from the
plan or the notes. An unticked box is a miss and blocks delivery until it is fixed or named out loud.

## Enumeration
- [ ] The source's entry count is **written down**, taken from the source itself — not from what got
      collected.
- [ ] The page's entry count equals it. If not, every missing entry is listed by name in the closing
      message with the reason.
- [ ] Pagination, lazy-loading, default filters and "show more" controls were checked; the list is
      not what one viewport happened to render.
- [ ] Five entries picked at random **from the source** were looked up on the page and found.
- [ ] Entry order and grouping follow the source; nothing was alphabetised or re-bucketed.

## The boxes
- [ ] Every box is a present-tense passing state, not an instruction.
- [ ] No box contains a second clause joined by *and* / *also*.
- [ ] No box requires auditing the whole product to answer.
- [ ] Every number the source gave survives verbatim in the box that carries it.
- [ ] No invented threshold is presented as the source's.
- [ ] Two to five boxes per entry; none is a restatement of the entry's own title.
- [ ] The kill pass actually ran — the unanswerable, doubled, duplicated and universally-true lines
      were deleted, not softened.

## Honesty
- [ ] The page and the closing message say whether the boxes are quoted or interpreted.
- [ ] Where entries mix quoted and derived boxes, the derived ones are marked per card.
- [ ] The source is linked or named on the page.
- [ ] Nothing on the page claims coverage the run did not have (an index-only run does not describe
      itself as built from the detail pages).

## The page
- [ ] One file. No external `script src`, no external stylesheet other than the Google Fonts link.
- [ ] Ticks persist across a reload, and reading `localStorage` is wrapped in `try`/`catch` so a
      browser that blocks it still renders.
- [ ] Clearing all ticks is deliberate and confirmed — no one-click wipe.
- [ ] Search, the group filter and "only unfinished" each work, and the empty result has its own
      state with a way out.
- [ ] Overall and per-group progress update on the tick, without a reload.
- [ ] Light and dark both render correctly, including in the un-stamped system-default state; no
      colour is defined only inside a media or `[data-theme]` block.
- [ ] Every checkbox is reachable by keyboard with a visible focus ring; the label is clickable.
- [ ] `prefers-reduced-motion` is respected.
- [ ] Nothing scrolls horizontally at ~360px width.
- [ ] The page has a real title and an identity of its own — the template's skeleton was designed
      for this subject, not shipped raw.

## Delivery
- [ ] Closing message carries the link or path, the entry / box / group counts, and the one line on
      interpretation.
- [ ] The checklist body was **not** pasted into the chat.
- [ ] If the run was index-only on a source with detail pages, the deeper pass was offered.
