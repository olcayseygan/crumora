# core rules

Ten rules, applied to the **rendered** target. `SKILL.md` holds the procedure and the fix order.

Rules are addressed by **name**; the name prints in the output line. Clauses are numbered so an
override can name one (`alignment#7`) — never reorder them. Each heading carries the level that first
enables it; a clause tagged `· full` waits for full inside a lite rule; the **floor** runs at every
level.

**Every answer comes from the render, with the number written down.** The source is read only to
locate tokens, components and declared scales. An unmeasured clause is not a passing clause; if one
cannot be measured on this target, say so in the `notes` line. Everything a clause asks to write down,
state or list goes in that line too.

---

## floor — runs at every level

Four clauses no level switches off and no override disables or relaxes: `access#1`, `access#4`,
`contrast#2` and `contrast#3`. Every other clause of `access` and `contrast` (the 44px target
included) can be relaxed clause by clause with a reason; neither rule can be disabled whole.

---

## lite

### access · lite

Driven on the render: tab through, query the accessibility tree, measure the boxes.

1. **Keyboard and focus ring · floor.** Every interactive element reachable by keyboard, in visual
   reading order (write the tab order down), with a **visible** focus ring — one that clears
   `contrast#3`. A positive `tabindex`, a focus trap with no exit and a skipped control are fails.
2. **Accessible name.** Every control has one, measured from the accessibility tree, not the markup.
3. **Semantics carry the structure.** Headings in order, lists, `<button>`, `<a href>`, landmarks. A
   clickable `<div>` fails even with a `role`, unless it also has the key handling and focusability
   the role implies.
4. **Never colour alone · floor.** Error, selection, status and required carry a second cue.
   Measured on a greyscaled render.
5. **Alt text.** Meaningful images and icons say what they mean; decorative ones are hidden from AT.
   An icon inside a button already named by `access#2` is decorative.
6. **Target size.** **≥ 44×44 CSS px** (or a larger platform minimum), and no two targets closer than
   **one spacing step**. Measure the box, not the glyph.
7. **Reduced motion.** With `prefers-reduced-motion` set, transforms and transitions are gone or
   reduced to opacity — not merely shortened. Nothing autoplays, flashes or blocks reading.
8. **Zoom.** **200%** text zoom at the narrowest viewport rendered (lite: its one viewport): no
   clipping, no horizontal scroll.

**Passes:** a genuinely non-interactive element; a decorative image with empty alt; a sub-44px target
the platform defines smaller and the project declares. Each written down with its reason.

### type · lite

From the **computed styles on screen**, not the `@font-face` block.

1. **Families listed.** List every rendered `font-family`.
2. **The pairing has a reason**, stated in one sentence. Two faces of the same classification at the
   same weight (two neutral grotesques) are collapsed to one.
3. **One job per family** — headings, body, or code. The display face never sets a paragraph; the
   monospace only sets tabular or code content.
4. **Sizes from the scale.** Distinct rendered `font-size` values are a subset of the project's type
   scale; a stray 15px or 23px fails. No declared scale: the surface's dominant values are the scale,
   stated in one line.
5. **Weights from the scale, shipped by the face.** Rendered weights come from the declared set. A
   synthesised bold or oblique fails.
6. **Line height tracks size.** From the type scale: body **1.4-1.6**, headings **1.1-1.3**. This is
   the value `alignment#6` measures rhythm against.
7. **Measure.** Body text **45-75 characters** per rendered line at each viewport. Over 75 fails; the
   fix is a `max-width` in `ch`, not a smaller font.
8. **Tracking follows size.** Negative-to-zero on display, zero on body, positive only on uppercase or
   small caps. Uniform tracking across every size fails.
9. **Real fallback.** Every family declares a same-classification fallback, and the surface is rendered
   **once with the web font blocked**: nothing reflows past a breakpoint or clips. A single-name
   `font-family` fails.

**Passes:** a one-off tracking value on a logotype, written down.

### palette · lite

Whether the set agrees; `contrast` handles whether a pair reads. Computed from resolved colours.

1. **The set is counted.** Every distinct rendered colour listed with its source.
2. **Neutrals are one ramp** — one hue, monotonic lightness. A second ramp at another hue fails unless
   declared and named.
3. **Semantic colours mean one thing.** Danger, warning, success, info each map to one colour, used for
   nothing else.
4. **Accent is not the only signal** — `access#4` measured on the palette.
5. **The ramp is even**, measured in OKLCH or LCH: comparable lightness steps, no hue wander.
6. **Saturation is deliberate.** Large surfaces are the least saturated thing on screen.
7. **Gradients stay in family.** Two palette colours, perceptual interpolation; the midpoint shows no
   grey dead zone and no third hue.
8. **Chart colours are one declared categorical set**, ordered and checked for colour-vision
   deficiencies. The `dataviz` skill carries the craft; this clause only measures that the set exists
   and is used.

**Passes:** a brand colour the project cannot change, named as such; a decorative illustration's own
palette, exempt from the ramp clauses.

### contrast · lite

Every pair and its ratio is **written out**.

1. **Computed, not judged.** Both colours resolved from the render, including any translucent layer
   between them. Never from a design file or memory.
2. **Text · floor.** Body **≥ 4.5:1**. Large text (**≥ 24px, or ≥ 19px bold**) **≥ 3:1**. No
   exception beyond WCAG's own (disabled controls, logos).
3. **Control boundaries · floor** — the edges needed to identify a control (input outlines,
   checkbox and toggle borders), meaningful icons, chart strokes, focus rings — **≥ 3:1**. Decorative
   borders (card hairlines, dividers) are exempt.
4. **Disabled** is distinguishable without being unreadable, and never the only cue that something is
   unavailable.
5. **Worst point.** Text over an image or gradient is checked at its worst point. Unresolvable (photo,
   video, user art): `NEEDS DECISION`, never an assumed pass.
6. **Every state · full.** Hover, active, selected and error each rechecked.

**Passes:** a logo or brand mark; a disabled control meeting `contrast#4` under 4.5:1; a decorative
element carrying no meaning.

### alignment · lite

Every clause is answered with a written list of measured values, before any edit.

1. **Shared edges at 0px.** List every coordinate elements are meant to share with its measured value;
   shared edges differ by **0px**. Measure at device pixel ratio 1.
2. **One spacing scale.** Distinct sibling gaps are a subset of the declared scale; any stray value
   (13px, 17px, 22px) fails. No declared scale: the surface's dominant values are the scale, stated in
   one line.
3. **Equal relationships, equal numbers.** Gaps doing the same job carry the same number.
4. **Symmetric padding**, measured on all four sides; left = right unless a stated reason (scrollbar
   gutter, optical correction) says otherwise.
5. **Repeated blocks are identical** in measured height and internal padding.
6. **Vertical rhythm.** Successive baselines on a consistent grid or line-height rhythm from the type
   scale.
7. **Optical corrections are recorded** — a 1px icon nudge written down with its reason. An
   unexplained offset fails under `alignment#1`.
8. **Numeric columns** right- or decimal-aligned, one alignment per column, measured on the rendered
   column.

---

## full

### responsive · full

Rendered at **every declared viewport**, and at minimum **~360px**, **~768px** and **~1440px** for web.
A viewport not rendered is not checked.

1. **No horizontal scroll** at any viewport; nothing clipped or overlapping. `scrollWidth` vs
   `clientWidth` on the document and every scroll container.
2. **Content breakpoints.** Narrow continuously; the width where the layout actually fails is the
   breakpoint, not a framework device name.
3. **Reading order survives reflow.** The primary action stays primary at narrow width, and DOM order
   matches visual order — a CSS reorder that scrambles the keyboard path fails here and under
   `access#1`.
4. **Wide content has a stated strategy** (scroll container, stacked cards, collapsed columns).
5. **Stress content at the narrowest width:** longest label, biggest number, a 40-item list, the empty
   state.

### theme · full

1. **Both modes rendered** and screenshotted.
2. **Semantic tokens** (surface, on-surface, border, accent, danger). A literal in the computed style
   with no token behind it fails.
3. **`contrast` and `palette` re-run in full** in the second mode.
4. **Elevation reads in both** — lighter fills in dark mode, not recycled drop shadows.
5. **Assets legible in both** — images, icons, illustrations, charts, code blocks.
6. **Default and toggle.** Default follows the system preference; a toggle overrides it **in both
   directions**, measured by toggling twice.
7. **No wrong-theme flash** on a cold load with the non-default preference set.

### states · full

1. **The full set:** **default, hover, active, focus, disabled, loading, error, empty** for every
   component. A state the component cannot enter is named as such; a state nobody rendered fails.
2. **Each state re-measured** for `access`, `contrast` and `alignment` where it changes colour, size or
   position.
3. **No dead end.** Error states say what to do next, loading resolves, empty is not a blank box. The
   copy belongs to `muster`; this rule measures that the state exists and is reachable.

---

## ultra

### reuse · ultra

1. **Justified or existing.** Every element is an existing project component or a new one **justified
   in one sentence**.
2. **Library searched first** — no redrawn button, card, modal or input that already exists. Say what
   you searched and what you found.
3. **Existing API respected.** A local override that forks behaviour fails; the fix is a variant, per
   `variants#2`.
4. **Project tokens.** A parallel scale invented beside them is a fail; the surface goes back
   on the project scale.
5. **No styled one-offs** where a component belongs.

### variants · ultra

1. **One component per job** — never twice under two names or implementations.
2. **Differences as variants or props** of one component, not forked copies.
3. **Bounded axes.** Named, bounded variant axes. A dozen booleans combining into contradictory states
   fails; split it or use one enum.
4. **No speculative variants.** A variant this surface does not use is deleted.
5. **Duplicates listed** with what they collapse into, in the edit line that collapses them.
