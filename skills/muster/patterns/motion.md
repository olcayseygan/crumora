# Motion — duration, curve, scroll

### animation-timing — Animation Timing
1. Entrances run 200-300ms with a cubic ease-out, and never stretch past ~300ms.
2. Exits run ~150ms, roughly 40% faster than the entrance — in and out are never symmetric.
3. Tap and button feedback lands under 100ms.
4. Attention-grabbing motion runs 500-800ms with a bounce or an overshoot.
5. List items stagger 50ms apart: 30ms blurs into a blob, 100ms makes the list crawl.
6. Entrances never use linear easing.

### easing-curves — Easing Curves
1. Linear is only for continuous motion — spinners, marquees — never for UI that starts and stops.
2. Ease-out is the default for anything entering the screen.
3. A subtle spring overshoot belongs on button presses, modals and playful confirmations; never high stiffness or heavy bounce.
4. The same handful of curves is used everywhere.
5. List and card entrances stagger a few frames apart rather than snapping in together.

### doherty-threshold — Doherty Threshold
1. Visible feedback appears within 400ms of any interaction.
2. Under 200ms feels instant, 200-400ms is tolerable, past 400ms engagement breaks.
3. Actions that almost always succeed update optimistically; nothing waits on a server round-trip before any visual response.
4. Work past ~300ms shows progress feedback, per `loading-states-system`; 400ms is the response-time target, not the progress threshold.
5. The screen is never left blank or frozen while data loads — past ~300ms a skeleton paints its placeholder shapes.

### scroll-driven-animations — Scroll-Driven Animations
1. `animation-timeline: scroll()` ties motion to scroll; `animation-range` sets the exact trigger points; `view()` targets elements entering the viewport.
2. Sticky positioning combined with a scroll timeline drives headers and progress bars.
3. Parallax is never hand-rolled with a scroll listener and `getBoundingClientRect()`.
4. No JS animation library is pulled in for an effect CSS handles in a couple of lines.
