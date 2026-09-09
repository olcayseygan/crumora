# core rules

Ten rules, applied to the **rendered** target. `SKILL.md` holds the procedure; this file is only the
rules. Each rule states itself, then its clauses, then how the clause is measured, then what
legitimately passes.

Rules are addressed by **name**, never by number, and the name is what appears in the output line the
rule produces. Clauses are numbered inside a rule so an override can name one — `alignment#7` — and
that numbering is fixed: never reorder the clauses of a rule.

The heading of each rule carries the level that first enables it. **lite** is the single-render pass,
**full** adds everything that needs the target rendered more than once, **ultra** adds the component
system, and the **floor** runs at every level. Rules are grouped below in that order, which is not the
order they are fixed in — the fix order lives in `SKILL.md`.

**The one thing every rule shares: the answer comes from the render, with the number written down.**
An unmeasured clause is not a passing clause. If a clause cannot be measured on this target, say so in
one line rather than ticking it.

---

## floor — runs at every level

The floor is not a rule of its own; it is two clauses that no level and no override switches off:
`access#1` (keyboard reach and a visible focus ring) and `contrast#2` (body and large text at AA).
Everything else in `access` and `contrast` can be relaxed clause by clause with a reason, and neither
rule can be disabled whole.

---

## lite

### access — everyone can reach it and read it · lite

Measured by driving the render, not by reading the JSX. Tab through the surface, look at what is
focused, query the accessibility tree, and measure the boxes.

1. **Keyboard and focus ring · floor.** Every interactive element is reachable by keyboard, in reading
   order, with a **visible** focus ring — not the browser default washed out to invisible, and not
   `outline: none` with nothing put back. Measure by tabbing from the top of the surface: write down
   the order reached and confirm it matches the visual reading order. A focus ring is visible when it
   clears `contrast#3` against what sits behind it. A positive `tabindex`, a focus trap with no exit
   and a skipped control are all fails of this clause.
2. **Accessible name.** Every control has an accessible name — a label, an `aria-label`, or visible
   text. An icon-only button without one is a fail. Measure from the accessibility tree, not from the
   markup: a `<label>` that is not associated produces no name.
3. **Semantics carry the structure.** Headings in order with no level skipped, lists as lists, buttons
   as `<button>`, links as `<a href>`, landmarks present. A `<div>` with a click handler is a fail
   even when it has a `role`, unless it also has the key handlers and the focusability the role
   implies.
4. **Never colour alone.** Error, selection, status and required each carry a second cue — icon, text,
   weight, underline. Measure by rendering the surface greyscaled: anything whose meaning disappears
   fails.
5. **Alt text.** Images and icons that mean something have alt text that says what they mean, not what
   they depict; purely decorative ones are hidden from assistive technology (`alt=""`,
   `aria-hidden="true"`). An icon inside a button already named by `access#2` is decorative.
6. **Target size.** Touch and click targets are **≥ 44×44 CSS px**, or the platform minimum where the
   platform states a larger one, and no two targets sit closer than **one spacing step** from the
   declared scale. Measure the box, not the glyph: a 16px icon in 14px of padding passes at 44px.
7. **Reduced motion.** Motion respects `prefers-reduced-motion`; nothing autoplays, flashes or blocks
   reading. Measure by re-rendering with the preference set and confirming the transforms and
   transitions are gone or reduced to opacity — not merely shortened.
8. **Zoom.** Text zooms to **200%** without clipping and without horizontal scroll. Measure by
   rendering at 200% text zoom at the narrowest declared viewport, which is where it breaks.

**Passes:** a control unreachable by keyboard because it is genuinely not interactive; a decorative
image with an empty alt; a target under 44px that the platform itself defines smaller and the project
declares. Each of those is written down with its reason.

### type — the fonts agree with each other · lite

Measured from the **computed styles on screen**, not from the `@font-face` block: what actually
painted, at what size, weight, line height and tracking, in what family.

1. **Families are counted and bounded.** List every distinct `font-family` that rendered on the
   surface. **At most two** — a text face and a display face — plus one monospace where code or
   numbers demand it. A third unexplained family is a fail; the fix is folding it into one of the two.
2. **The pairing has a reason.** Where two families are used, the pairing is stated in one sentence
   and the two are **distinguishable but compatible**: they differ clearly in structure (a serif
   against a sans, a grotesque against a humanist) and share a comparable x-height and width so they
   sit on the same line without one looking shrunken. Two faces from the same classification at the
   same weight — two neutral grotesques — read as a mistake, not a pairing, and are collapsed to one.
3. **Roles, not decoration.** Each family has **one job** across the surface: headings, body, or code.
   The display face never sets a paragraph, the body face never sets a hero out of laziness, and the
   monospace face is used for tabular or code content only.
4. **Sizes come from the scale.** List the distinct rendered `font-size` values and confirm the set is
   a subset of the project's type scale. A stray 15px or 23px in a 12/14/16/20/24/32 scale is a fail,
   exactly as a stray gap is under `alignment#2`. Where no scale is declared, the surface's own
   dominant values are the scale and that is stated in one line.
5. **Weights come from the scale, and the face has them.** List the distinct rendered `font-weight`
   values; **at most three** across the surface, all from the declared set. Every weight used is a
   weight the loaded family actually ships — a synthesised bold or oblique, which the browser fakes
   when the file is missing, is a fail. Measure by comparing the rendered weight against the loaded
   font's available axes.
6. **Line height belongs to the size.** Line heights come from the type scale and track the size:
   body text lands around **1.4-1.6**, headings tighter (**1.1-1.3**), and nothing is a bare unitless
   value copied across sizes that makes 32px text touch itself. This is the value `alignment#6`
   measures the rhythm against.
7. **Measure is bounded.** Body text runs **45-75 characters** per line at each rendered viewport.
   Measure the rendered line, not the container width. Over 75 is a fail; the fix is a `max-width` in
   `ch`, not a smaller font.
8. **Tracking follows size.** Letter-spacing is negative-to-zero on large display text, zero on body,
   and positive only on uppercase or small-caps runs. Tracking applied uniformly across every size is
   a fail.
9. **The fallback stack is real.** Every family declares a fallback of the same classification, and
   the surface is rendered **once with the web font blocked** to confirm nothing reflows past a
   breakpoint or clips. A single-name `font-family` with no fallback is a fail.

**Passes:** a third family that is a brand asset used in one fixed mark; a monospace face in a table
of figures; a one-off tracking value on a logotype, written down.

### palette — the colours agree with each other · lite

`contrast` measures whether a pair can be read. This rule measures whether the set makes sense
together. Both are computed from the resolved colours in the render.

1. **The set is counted.** List every distinct colour that rendered — background, text, border, icon,
   chart, state — with where it came from. A surface painting eleven near-identical greys has no
   palette; the fix is collapsing them onto the scale.
2. **Neutrals are one ramp.** All greys come from **one** neutral ramp with a consistent hue and a
   monotonic lightness progression. Two ramps at different hues — a blue-grey border against a
   warm-grey surface — is a fail unless the second is declared and named.
3. **One accent leads.** **One** accent carries the primary action and the current/selected state. A
   second accent exists only with a stated job (a brand secondary, a data series), and a third is a
   fail. Measure by listing every element painted in an accent and the job it does.
4. **Semantic colours mean one thing.** Danger, warning, success and info each map to one colour, and
   that colour is used for nothing else. Red as both the destructive action and a decorative heading
   is a fail.
5. **Accent is not the only signal.** Anything the accent marks — selected, active, current — carries
   a second cue as well, which is `access#4` measured on the palette rather than on the state.
6. **The ramp is even.** Within a ramp, steps are perceptually even: measured in a perceptual space
   (OKLCH or LCH), lightness moves in comparable steps and hue does not wander between steps. A ramp
   built by nudging hex values by eye typically fails here and is regenerated.
7. **Saturation is deliberate.** Large surfaces are the least saturated thing on screen; saturation
   climbs toward the small, load-bearing elements. A fully saturated page background under muted
   controls inverts the hierarchy and is a fail.
8. **Gradients stay in family.** A gradient interpolates between two colours from the palette, in a
   perceptual space, with no grey dead zone in the middle and no third hue appearing that the palette
   does not contain. Measure the midpoint, which is where sRGB interpolation goes muddy.
9. **Chart colours are a declared set.** Series colours come from one categorical set that is
   distinguishable at a glance, ordered, and checked for the common colour-vision deficiencies —
   never picked one at a time as series are added. The `dataviz` skill carries the craft; this clause
   only measures that the set exists and is used.

**Passes:** a brand colour the project cannot change, named as such; a second accent with a stated
job; a decorative illustration with its own internal palette, which is exempt from the ramp clauses.

### contrast — the ratios are computed, not eyeballed · lite

Every pair and its ratio is **written out**. A ratio you did not compute is not a ratio.

1. **Computed, not judged.** Resolve both colours from the render — the computed foreground and the
   colour actually painted behind it, including any translucent layer between them — and compute the
   ratio. Never take the ratio from a design file or from memory of a palette.
2. **Text · floor.** Body text **≥ 4.5:1**. Large text — **≥ 24px, or ≥ 19px bold** — **≥ 3:1**. Any
   text below its threshold is a fail with no exception; this is the clause the floor holds.
3. **Meaningful boundaries.** UI boundaries that carry meaning — borders, input outlines, icons, chart
   strokes, focus rings — **≥ 3:1** against their background. A purely decorative divider is exempt
   and is named as such.
4. **Disabled.** The disabled state is distinguishable without being unreadable, and disabled is never
   the only cue that something is unavailable.
5. **Worst point.** Text over an image or a gradient is checked at its **worst** point, not its best.
   Where the worst point cannot be resolved — a photo, a video, user-supplied art — the pair is a
   `NEEDS DECISION`, never an assumed pass.
6. **Every state.** Hover, active, selected and error are each rechecked. **Hover is where contrast
   usually dies** — a lightened background under unchanged text is the standard failure.

**Passes:** a logo or brand mark, which is exempt from the text thresholds; a disabled control meeting
`contrast#4` while under 4.5:1; a decorative element carrying no meaning.

### alignment — mathematical, not "looks right" · lite

Measure it and **write the numbers down**. Every clause here is answered with a list of values, and
the list goes in the round of measurements before any edit.

1. **Shared edges at 0px.** Every x/y coordinate that elements are meant to share is listed with its
   **measured** value, and shared edges differ by **0px** — not 1px, not 2px. Measure with
   `getBoundingClientRect()`, at a device pixel ratio of 1 so subpixel scaling does not invent
   offsets.
2. **One spacing scale.** Every gap between siblings is a value **from the declared spacing scale**.
   List the distinct gap values found on the surface and confirm the set is a subset of the scale. Any
   stray value — 13px, 17px, 22px — is a fail. If the project declares no scale, the surface's own
   dominant values are the scale, and that is stated in one line.
3. **Equal relationships, equal numbers.** All card gaps equal, all label→field gaps equal, all
   section gaps equal. Equivalence is judged by role, not by looks: two gaps doing the same job carry
   the same number.
4. **Symmetric padding.** Container padding is measured on **all four sides**, and left = right unless
   a stated reason says otherwise. Scrollbar gutters and optical corrections are reasons; leftover
   values are not.
5. **Repeated blocks are identical.** Repeated blocks have identical measured height and identical
   internal padding. A list of ten rows produces one height, not ten.
6. **Vertical rhythm.** Text sits on a consistent baseline grid or line-height rhythm, and line heights
   come from the type scale. Measure the distance between successive baselines, not the font sizes.
7. **Deliberate optical corrections.** An optical correction is fine when it is **recorded** — an icon
   nudged 1px, written down as a nudge with its reason. An unexplained leftover offset is a fail under
   `alignment#1`.
8. **Numeric columns.** Numbers are right- or decimal-aligned, and a column carries **one** alignment.
   Measure the rendered column, where a locale format or a currency symbol commonly breaks it.

**Cap:** where the run also scores a design — `redesign` calling this checklist — unfixed misses here
hold Layout & alignment at **≤ 7**.

---

## full

### responsive — it survives every width · full

Rendered at **every declared viewport**, and at minimum a narrow (**~360px**), a mid (**~768px**) and
a wide (**~1440px**) one for web. A viewport not rendered is not checked.

1. **No horizontal scroll.** No horizontal scrollbar at any viewport; nothing clipped, nothing
   overlapping. Measure `scrollWidth` against `clientWidth` on the document and on every scroll
   container.
2. **Content breakpoints.** Breakpoints sit where the **content** breaks, not at device names copied
   from a framework. Measure by narrowing continuously and noting the width where the layout actually
   fails; that width is the breakpoint.
3. **Reading order survives reflow.** The primary action stays primary at narrow width, and the DOM
   order still matches the visual order after every reflow — a CSS reorder that leaves the keyboard
   path scrambled is a fail here and under `access#1`.
4. **Wide content has a strategy.** Tables, charts and other wide content have a **stated** strategy —
   scroll container, stacked cards, collapsed columns — not accidental overflow.
5. **Stress content at the narrowest width.** The stress content is rendered at the narrowest viewport
   too: the longest label, the biggest number, a 40-item list, and the empty state. A layout that only
   holds with short strings is a fail.

### theme — dark and light, from tokens · full

1. **Both modes rendered.** **Both** modes are rendered and screenshotted. One mode plus an assumption
   about the other is a fail.
2. **Semantic tokens.** Colours come from semantic tokens — surface, on-surface, border, accent,
   danger — not from a literal hex flipped per mode. A literal in the rendered computed style that has
   no token behind it is a fail.
3. **Contrast and palette re-run.** The whole `contrast` rule is re-run **in full** against the
   second mode, and `palette` with it — a ramp that is even in light mode routinely collapses in dark,
   and an accent that leads on white disappears on near-black.
4. **Elevation reads in both.** Dark mode raises surfaces with lighter fills; light-mode drop shadows
   recycled into a black void are a fail.
5. **Assets legible in both.** Images, icons, illustrations, charts and code blocks are legible in
   both. Nothing is a white PNG on a white page.
6. **Default and toggle.** The default follows the system preference, and any explicit toggle overrides
   it **in both directions** — measured by toggling twice.
7. **No wrong-theme flash.** No flash of the wrong theme on load. Measure on a cold load with the
   non-default preference set, watching the first painted frame.

### states — every state is rendered · full

1. **The full set.** Every component on the surface renders its full state set: **default, hover,
   active, focus, disabled, loading, error, empty**. A state the component cannot enter is named as
   such; a state nobody rendered is a fail.
2. **Each state re-measured.** `access`, `contrast` and `alignment` are re-measured in each state that
   changes colour, size or position. A hover that shifts a card 4px is an `alignment` question, not a
   free one.
3. **No state is a dead end.** Error states say what to do next, loading states resolve, and the empty
   state is not a blank box. The copy itself belongs to `muster`; what this rule measures is that the
   state exists and is reachable.

---

## ultra

### reuse — the project's components, not new ones · ultra

1. **Justified or existing.** Every element on the surface is either an existing project component or
   a new one **justified in one sentence**.
2. **Library searched first.** The project's existing library was searched before anything was drawn —
   no re-drawn button, card, modal or input that already exists a few files over. Say what you searched
   and what you found.
3. **Existing API respected.** Existing components are used with their existing API. A local override
   that forks their behaviour is a fail; the fix is a variant on the component, per `variants#2`.
4. **Project tokens.** Project design tokens are used, and **a parallel scale invented alongside them
   is a red line** — the surface is put back on the project scale, never given a second one.
5. **No styled one-offs.** Nothing is a one-off styled `<div>` where a component belongs.

### variants — one component per job · ultra

1. **One per job.** **One** component per job across the surface. The same thing never exists twice
   under two names or two implementations.
2. **Differences as variants.** Differences between near-duplicates are expressed as variants or props
   of one component — `variant="danger"`, `size="sm"`, `density="compact"` — not as forked copies.
3. **Bounded axes.** The variant axes are named and bounded. A component with a dozen boolean props
   that combine into contradictory states is a fail; splitting it, or replacing the booleans with one
   enum, is the fix.
4. **No speculative variants.** No variant exists that this surface does not use. Speculative
   flexibility is dead code and is deleted.
5. **Duplicates listed.** Every duplicate found during the run is listed with what it collapses into,
   in the edit line that collapses it.
