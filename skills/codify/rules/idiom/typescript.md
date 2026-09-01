# rule 12 — JavaScript / TypeScript, Vue, React

**Does the language or the framework already have a built-in way to say this, and did the author use
it?**

**Rule 13 outranks this file, and it matters most here.** `?.` and `??` are idiomatic modern JS and
defensive guards at once. Keep them only where the value can legitimately be absent from a source
outside our control — a fetch response, a parsed file, user input, a third-party SDK. Everywhere else
delete: `user && user.profile && user.profile.name` becomes `user.profile.name`, not optional
chaining. Never "fix" an `&&` chain by converting it; ask first whether it should exist at all.

## Modern JS / TS

- **`map`/`filter`/`reduce`/`find`/`some`/`every`/`flatMap`** over index loops; `for…of` when the body
  has side effects and builds no result.
- **Destructuring and spread** over manual copying and positional access, including in parameters.
- **`async`/`await`** over `.then` pyramids, and **`Promise.all`** over sequential `await`s with no
  data dependency — two independent fetches awaited in sequence is a latency bug, not a style note.
- **Template literals** over concatenation.
- **`Map`/`Set`** over objects used as lookup tables, or `Array.includes` in a loop.
- **`for…of` with `Object.entries`/`keys`/`values`** over `for…in`.
- **Discriminated unions, `as const`, literal types, generics** over stringly-typed flags and `any` —
  overlaps rule 1: a `kind: string` holding three values is both.
- **`??` over `||` when a default is genuinely warranted** (`||` swallows `0` and `""`) — but read the
  rule 13 note above before keeping either.
- **Optional catch binding, `Array.at(-1)`, `structuredClone`, `Object.groupBy`** over hand-rolled
  equivalents.

## Vue

- **`computed`** over a watcher that assigns to a `ref` — the most common Vue non-idiom there is.
- **`ref`/`reactive` state driving the template** over manual DOM mutation. `document.querySelector`
  inside a component is almost always a FAIL — use a template ref.
- **`v-if`/`v-for`/`v-model`** over imperative rendering, with a real `:key` on `v-for` (never the
  array index when the list can reorder).
- **Props down, emits up.** Reaching into a child through a ref to call its method, or mutating a
  prop, FAILs.
- **`<script setup>`**, and **composables** for shared logic over mixins or the same three methods
  copied into four components (rule 3 too).
- **`watchEffect` and lifecycle hooks** over ad-hoc timers and manual bookkeeping — with the teardown
  rule 17 requires.

## React

- **Hooks with correct dependency arrays**; derived values computed during render over state synced by
  an effect. A `useEffect` that only mirrors one state into another is the React version of the Vue
  watcher FAIL.
- **Stable `key`s** from data identity, not the array index.
- **`useMemo`/`useCallback` where they change behaviour**, not sprinkled everywhere.
- Effects that subscribe **return a cleanup function** — rule 17.

**The limit:** idiomatic is not clever. A `reduce` building an object nobody can read, six chained
array methods over one list, a ternary nested three deep — all FAIL here. Three `filter`/`map` passes
over a large array where one `for…of` is clearer and faster is not idiomatic either.

| Bad | Good |
| --- | --- |
| `for (let i = 0; i < items.length; i++)` | `for (const item of items)` or `items.map(…)` |
| `if (list.filter(x => x.id === id).length > 0)` | `if (list.some(user => user.id === id))` |
| `const a = await getA(); const b = await getB();` | `const [a, b] = await Promise.all([getA(), getB()])` |
| `fetch(url).then(r => r.json()).then(…)` | `const response = await fetch(url)` |
| `"Hello " + name` | `` `Hello ${name}` `` |
| `const seen = {}; if (seen[key])` | `const seenKeys = new Set()` |
| `for (const key in object)` | `for (const [key, value] of Object.entries(object))` |
| `watch(items, () => { total.value = sum(items.value) })` | `const total = computed(() => sum(items.value))` |
| `document.querySelector(".row")` in a component | a template ref, or state driving the template |
| `v-for="(row, index) in rows" :key="index"` | `:key="row.id"` |
| `status: string` holding `"draft" \| "sent"` | `type Status = "draft" \| "sent"` |
| `useEffect(() => setFullName(first + last), [first, last])` | `const fullName = \`${first} ${last}\`` |

**grep:** `for (let i`, `.then(`, `for…in`, `+ "` string building, `filter(...).length`,
`querySelector` inside a component, `:key="index"`, `watch(` bodies containing an assignment,
`useEffect` bodies that only call a setter, `any`, consecutive `await`s with no data dependency. Then
take the largest component or module and ask how a fluent TypeScript/Vue/React developer would write
it — if the answer moves half the body into a `computed` or a composable, the current version FAILs.
