# Pre-crown design checklist

Walk this on round 0 and on each **challenger up for the throne**, highest-ranked first
(`tournament.md` §4.7), alongside the alignment audit (§4). Each box is answered from the **render**,
with the numbers written down. Any unticked box is a miss and is named in the round log.

## Accessibility
- [ ] Keyboard reaches every interactive element in reading order, with a **visible** focus ring.
- [ ] Every control has an accessible name.
- [ ] Semantic structure: headings in order, lists, `<button>`, landmarks.
- [ ] Nothing is signalled by colour alone.
- [ ] Meaningful images/icons have alt text; decorative ones are hidden from AT.
- [ ] Touch/click targets ≥ 44×44 CSS px (or the platform minimum), no two closer than one spacing step.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] Text zooms to 200% without clipping or horizontal scroll.

## Responsive
- [ ] Rendered at the round's viewports — the narrowest and widest declared (§2c); every declared
      viewport is re-checked at apply.
- [ ] No horizontal scrollbar, clipping or overlap at any viewport.
- [ ] Breakpoints sit where the content breaks.
- [ ] Reading order and the primary action survive the reflow.
- [ ] Wide content (tables, charts) has a stated strategy.
- [ ] The stress content is rendered at the narrowest viewport too.

## Alignment — mathematical
- [ ] Every shared x/y coordinate listed with its measured value; shared edges differ by **0px**.
- [ ] Distinct gap values listed; the set is a subset of the declared spacing scale.
- [ ] Equivalent relationships use equal gaps.
- [ ] Container padding measured on all four sides; left = right unless a stated reason.
- [ ] Repeated blocks have identical measured height and internal padding.
- [ ] Line heights come from the type scale; baseline rhythm holds.
- [ ] Optical corrections are recorded, not leftovers.
- [ ] Numbers right- or decimal-aligned; one alignment per column.

## Typography
Answered from computed styles on screen.
- [ ] Every rendered `font-family` listed.
- [ ] The pairing is justified in one sentence.
- [ ] Each family has one job — headings, body, or code.
- [ ] Distinct rendered `font-size` values are a subset of the type scale.
- [ ] Every weight shipped by the loaded face — no synthesised bold or oblique.
- [ ] Line height: body ~**1.4-1.6**, headings **1.1-1.3**.
- [ ] Body measure **45-75 characters** at every rendered viewport.
- [ ] Rendered **once with the web font blocked**: fallback is the same classification and nothing
      reflows past a breakpoint or clips.

## Palette
- [ ] Every distinct rendered colour listed with its source.
- [ ] All greys come from **one** neutral ramp unless a second is declared.
- [ ] Danger, warning, success and info each map to one colour, used for nothing else.
- [ ] Ramp steps perceptually even, measured in OKLCH/LCH.
- [ ] Gradients interpolate between two palette colours in a perceptual space — no grey dead zone, no
      third hue.
- [ ] Chart series come from one declared categorical set, checked for colour-vision deficiencies.

## Contrast
- [ ] Ratios **computed** and written out.
- [ ] Body text ≥ **4.5:1**; large text (≥24px, or ≥19px bold) ≥ **3:1**.
- [ ] Meaningful UI boundaries (borders, input outlines, icons, chart strokes, focus rings) ≥ **3:1**.
- [ ] Disabled distinguishable, never the only cue.
- [ ] Text over images/gradients checked at its **worst** point.
- [ ] Every state (hover, active, selected, error) rechecked.

## Dark and light mode
- [ ] **Both** modes rendered and screenshotted.
- [ ] Colours from **semantic tokens**, not literal hex flipped per mode.
- [ ] Contrast section re-run **in full** against the second mode.
- [ ] Elevation, images, icons, charts and code blocks legible in both.
- [ ] Default follows system preference; an explicit toggle overrides it in both directions.
- [ ] No flash of the wrong theme on load.

## Components
- [ ] Every element is an existing project component or a new one justified in one sentence.
- [ ] The project's library was searched first; existing components used with their existing API.
- [ ] Project design tokens used, no parallel scale.
- [ ] Every component renders default, hover, active, focus, disabled, loading, error, empty.
- [ ] No one-off styled `<div>` where a component belongs.

## Unique component, variants
- [ ] **One** component per job; near-duplicates become variants/props of one component.
- [ ] Variant axes named and bounded — no dozen booleans combining into contradictory states.
- [ ] No variant this surface does not use.
- [ ] Duplicates found are listed in the round log with what they collapse into.
