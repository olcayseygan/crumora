# idiom — JavaScript / TypeScript, Vue, React

House picks on top of `idiom` in `core.md`. Everything else, judge as a fluent TypeScript, Vue or React
developer would.

## JS / TS

- Module-level constants are SCREAMING_CASE.
- Independent `await`s run through `Promise.all`; sequential ones with no data dependency are a latency
  bug, not style.
- Current built-ins over hand-rolled ones: `Array.at`, `structuredClone`, `Object.groupBy`.
- Several chained array passes over one large list become one `for…of`.

## Vue

- `<script setup>` is the default; shared logic lives in composables, never mixins.

## React

- `useMemo` and `useCallback` only where they change behaviour, not sprinkled everywhere.
