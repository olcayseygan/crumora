# Foundation — tokens, scale, colour, depth

### design-tokens — Design Tokens
1. Semantic and component tokens are named by meaning, never by value — `color-primary`, not `color-blue-500`; value names belong to primitives only.
2. Three layers, each referencing the one above: primitives (raw values) -> semantic (meaning) -> component (usage).
3. A scale is defined and everything snaps to it — a stray `13px` padding or `17px` gap collapses to 12 and 16.
4. Dark mode swaps one token set for another; it is never an inversion of colours.
5. No raw value is hardcoded in a component that a token already covers.

### design-system-kit — Design System Kit
1. Every value is a named semantic token — no raw hex or pixel value inline.
2. Colour is a numbered scale, 100-900.
3. The type scale has fixed sizes and weights; not every text sits at the same size and weight.
4. Spacing runs on a 4px scale, `space-1` = 4 up to `space-16` = 64 — no off-scale value.
5. Components are standardised as variants, sizes and states.
6. Motion has a duration scale, 100ms for micro-interactions up to 500ms for complex transitions, with ease-out to enter, ease-in-out to move, ease-in to exit.

### grid-system — Grid System
1. A 12-column grid.
2. Clean ratios only: 4:8 sidebar + content, 6:6 even split, 3:9 narrow nav + wide canvas. No arbitrary widths.
3. Gutter carries the mood: 8px dense and technical, 24px balanced and clean, 40px editorial and premium.
4. Columns collapse per breakpoint: 12 desktop -> 6 tablet -> 4 large phone -> 1 smallest.
5. Elements anchor to shared column edges, and the grid is established before it is broken.

### golden-ratio — Golden Ratio
1. The base unit multiplies by 1.618 for spacing and type scales — spacing runs 8 -> 13 -> 21 -> 34 -> 55.
2. A two-pane layout splits 62% / 38% with the primary content in the larger section.
3. Type example: 16px body, 26px subheading, 42px heading, 68px display.
4. Results round to clean pixel values compatible with the grid; the ratio never overrides content or an existing 8px grid.

### border-radius — Border Radius
1. Inner radius = outer radius minus padding.
2. One radius scale across every component: 4 / 8 / 12 / 16 / 24.
3. Radius scales with element size: tooltips ~4px, inputs ~8px, cards ~12px, modals ~16px, panels ~24px.
4. Radius matches brand tone — a playful oversized radius is never mixed into a serious brand, or the reverse.
5. No radius value is picked at random per component.

### dark-mode — Dark Mode
1. The darkest layer is a near-black grey like `#121212`, never pure `#000000`.
2. Elevation is signalled by layered surfaces, each step up a lighter grey: base -> surface -> elevated.
3. Accent colours are desaturated by ~20%.
4. Body text is a soft off-white, never pure `#FFFFFF`.
5. Text hierarchy is built from opacity tiers — high-emphasis, medium, disabled — not from new colours.

### color-accessibility — Color Accessibility
1. Body text clears 4.5:1 against its background; large text clears 3:1.
2. Muted greys — nav links, card labels, secondary headings — routinely sit at 1.5-2:1 and are adjusted until they clear.
3. ~8% of men have a colour vision deficiency: red error and green success collapse into the same tone.
4. Every colour cue carries a second signal — an icon on error text, a trend arrow on a stat, a texture or pattern in a chart.

### gradient-design — Gradient Design
1. Hue travel stays within 60 degrees — opposite hues create a muddy grey dead zone.
2. Lightness moves in one direction only.
3. 2-3% noise or grain hides banding on cheap displays; the result is checked on a low-quality screen.
4. Gradients are ambiance, not surface: a soft radial glow behind content beats a full-bleed linear wash.
5. Body text never sits on a gradient's mid-transition zone.

### shadow-elevation — Shadow Elevation
1. Three shadows layer for believable depth: tight contact (~`0 1px 3px`), mid-distance, wide soft spread — never one flat drop shadow on every surface.
2. A coloured glow sits in the accent hue at low opacity, tinted to the product context (purple creative, blue fintech, green health).
3. A 3D lift is perspective + a small `rotateX` + `translateZ`.
4. Elevation encodes hierarchy: the strongest elevation is reserved for the most important element.

### depth-layers — Depth Layers
1. Shadows stack — tight (~2px), mid spread (~12px), large ambient (~32px) — instead of one flat drop.
2. Hover lift stays subtle: a few pixels, `scale(1.03)`, a soft glow, and a brightened border to reinforce the lift.
3. Parallax layers move at different speeds — background slow, midground medium, foreground fastest, roughly 1x / 2.5x / 5x.
4. Depth comes from border and shadow intensity, not from redesigning the layout or the palette, and never pulls attention off the content.

### icon-design-rules — Icon Design Rules
1. Circular and organic shapes sit 5-8% larger than square ones to read the same size.
2. Every shape snaps to a 24px grid, 16px for dense UI.
3. One stroke weight — 2px — across the entire set.
4. The bounding box stays fixed even when the shape changes.
5. Fill vs outline is a set-wide commitment, never a per-icon choice.

### visual-hierarchy — Visual Hierarchy
1. The primary element is roughly 2x the size of body text.
2. The interface stays neutral, so accent colour reads as emphasis on the actions that matter.
3. Weight ladder: heading 800, body 400, caption 300.
4. The most important element gets more padding than everything else.
5. Emphasis never leans on size alone — size, weight, contrast and spacing combine, and nothing ships at equal emphasis throughout.

### z-index-mastery — Z-Index Mastery
1. `z-index` on a `position: static` element does nothing — `position: relative` (or absolute/fixed/sticky) comes first.
2. `z-index` ranks siblings inside one stacking context only: a child at 9999 cannot climb above its parent siblings.
3. `isolation: isolate` creates a fresh stacking context and contains a component stacking.
4. `z-index: 9999` is never used to force a child above another branch — a z-index arms race means an unexpected stacking context up the tree.
