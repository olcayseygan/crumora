# rule 12 — JavaScript / TypeScript, Vue, React

Read alongside rule 12 in `core.md`. The question stays the same: **does the language or the framework
already have a built-in way to say this, and did the author use it?**

**Rule 13 outranks this file, and it matters most here.** `?.` and `??` are idiomatic modern JS and
defensive guards at the same time. Rule 13 decides: keep them only where the value can legitimately be
absent from a source outside our control — a fetch response, a parsed file, user input, a third-party
SDK. Everywhere else the fix is deletion, and a `user && user.profile && user.profile.name` chain gets
deleted down to `user.profile.name` rather than modernised into optional chaining. Never "fix" a
`&&` chain by converting it; ask first whether it should exist at all.

---

## Modern JS / TS

- **`map` / `filter` / `reduce` / `find` / `some` / `every` / `flatMap`** over index loops. `for…of`
  when the body has side effects and no result is being built.
- **Destructuring and spread** over manual copying and positional access — including in parameters,
  which also documents them.
- **`async` / `await`** over `.then` pyramids, and **`Promise.all`** over sequential `await`s that do
  not depend on each other. Two independent fetches awaited in sequence is a real latency bug, not a
  style note.
- **Template literals** over concatenation.
- **`Map` / `Set`** over objects used as lookup tables or `Array.includes` in a loop. A `Set` lookup
  is the reason `Set` exists.
- **`for…of` with `Object.entries` / `Object.keys` / `Object.values`** over `for…in`.
- **Discriminated unions, `as const`, literal types and generics** over stringly-typed flags and
  `any`. This overlaps rule 1 — a `kind: string` that only ever holds three values is both.
- **`??` over `||` *when a default is genuinely warranted*** — `||` swallows `0` and `""`. But read
  the rule 13 note above before keeping either.
- **Optional catch binding, `Array.at(-1)`, `structuredClone`, `Object.groupBy`** and the rest of the
  modern standard library over hand-rolled equivalents.

## Vue

- **`computed`** over a watcher that assigns to a `ref`. A watcher that only derives a value is the
  most common Vue non-idiom there is.
- **`ref` / `reactive` state** driving the template, over manual DOM mutation.
  `document.querySelector` inside a component is almost always a FAIL — use a template ref.
- **`v-if` / `v-for` / `v-model`** over imperative rendering, with a real `:key` on `v-for` (never the
  array index when the list can reorder).
- **Props down, emits up.** Reaching into a child through a ref to call its method, or mutating a
  prop, FAILs.
- **`<script setup>`**, and **composables** for shared logic over mixins or the same three methods
  copied into four components (also rule 3).
- **`watchEffect` and lifecycle hooks** over ad-hoc timers and manual bookkeeping — with the teardown
  rule 17 requires.

## React

- **Hooks with correct dependency arrays**; derived values computed during render over state synced by
  an effect. `useEffect` that only mirrors one state into another is the React version of the Vue
  watcher FAIL.
- **Stable `key`s** from data identity, not the array index.
- **`useMemo` / `useCallback` where they change behaviour**, not sprinkled everywhere.
- Effects that subscribe **return a cleanup function** — see rule 17.

## The limit

Idiomatic is not clever. A `reduce` that builds an object nobody can read, a chain of six array
methods over the same list, a ternary nested three deep — those FAIL under this same rule. Three
`filter`/`map` passes over a large array where one `for…of` is clearer and faster is not idiomatic
either.

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

## How to check

Grep the target for: `for (let i`, `.then(`, `for…in`, `+ "` string building, `filter(...).length`,
`querySelector` inside a component, `:key="index"`, `watch(` bodies containing an assignment,
`useEffect` bodies that only call a setter, `any`, and consecutive `await`s with no data dependency
between them.

Then take the largest component or module and ask the reverse question: how would a fluent
TypeScript/Vue/React developer write this? If the answer moves half the body into a `computed` or a
composable, the current version FAILs.

**FAIL evidence:** `FeedList.vue:44 — watcher assigns total on every items change; this is a derived
value, use computed`.
