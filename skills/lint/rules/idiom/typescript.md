# idiom — JavaScript / TypeScript, Vue, React

`idiom` is a full-level rule, so this file is not read on a lite run.

**Does the language or the framework already have a built-in way to say this, and did the author use
it?**

**`guards` outranks this file, and it matters most here.** `?.` and `??` are idiomatic modern JS and
defensive guards at once. Keep them only where the value can legitimately be absent from a source
outside our control — a fetch response, a parsed file, user input, a third-party SDK. Everywhere else
delete: `user && user.profile && user.profile.name` becomes `user.profile.name`, not optional chaining.
Never "fix" an `&&` chain by converting it; ask first whether it should exist at all.

## Modern JS / TS

`map`, `filter`, `reduce`, `find`, `some`, `every` and `flatMap` replace index loops, and `for…of` is the
answer when the body has side effects and builds no result. Destructuring and spread replace manual
copying and positional access, including in parameters. `async`/`await` replaces `.then` pyramids, and
`Promise.all` replaces sequential `await`s with no data dependency — two independent fetches awaited in
sequence is a latency bug, not a style note. Template literals replace concatenation. `Map` and `Set`
replace objects used as lookup tables and `Array.includes` in a loop. `for…of` with `Object.entries`,
`keys` or `values` replaces `for…in`.

Discriminated unions, `as const`, literal types and generics replace stringly-typed flags and `any`,
which overlaps `types`: a `kind: string` holding three values is both. `??` beats `||` when a default is
genuinely warranted, since `||` swallows `0` and `""` — but read the `guards` note above before keeping
either. Optional catch binding, `Array.at(-1)`, `structuredClone` and `Object.groupBy` replace
hand-rolled equivalents.

## Vue

`computed` replaces a watcher that assigns to a `ref`, which is the most common Vue non-idiom there is.
`ref` and `reactive` state driving the template replaces manual DOM mutation, so a `document.querySelector`
inside a component is almost always a FAIL — use a template ref. `v-if`, `v-for` and `v-model` replace
imperative rendering, with a real `:key` on `v-for` and never the array index when the list can reorder.
Props go down and emits go up, so reaching into a child through a ref to call its method, or mutating a
prop, FAILs. `<script setup>` is the default, and composables carry shared logic rather than mixins or the
same three methods copied into four components, which is `repetition` too. `watchEffect` and lifecycle hooks
replace ad-hoc timers and manual bookkeeping, with the teardown `teardown` demands.

## React

Hooks carry correct dependency arrays, and derived values are computed during render rather than synced by
an effect — a `useEffect` that only mirrors one state into another is the React version of the Vue watcher
FAIL. `key`s are stable and come from data identity, not the array index. `useMemo` and `useCallback` go
where they change behaviour, not sprinkled everywhere. Effects that subscribe return a cleanup function,
which is `teardown`.

**The limit:** idiomatic is not clever. A `reduce` building an object nobody can read, six chained array
methods over one list, a ternary nested three deep — all FAIL here. Three `filter`/`map` passes over a
large array where one `for…of` is clearer and faster is not idiomatic either.

So `for (let i = 0; i < items.length; i++)` becomes `for (const item of items)` or `items.map(…)`;
`if (list.filter(x => x.id === id).length > 0)` becomes `if (list.some(user => user.id === id))`; two
sequential `await`s with no dependency become `const [a, b] = await Promise.all([getA(), getB()])`;
`fetch(url).then(r => r.json()).then(…)` becomes `const response = await fetch(url)`; `"Hello " + name`
becomes a template literal; `const seen = {}` used as a lookup becomes `const seenKeys = new Set()`;
`for (const key in object)` becomes `for (const [key, value] of Object.entries(object))`;
`watch(items, () => { total.value = sum(items.value) })` becomes
`const total = computed(() => sum(items.value))`; a `document.querySelector(".row")` in a component becomes
a template ref or state driving the template; `:key="index"` becomes `:key="row.id"`; a `status: string`
holding `"draft"` or `"sent"` becomes `type Status = "draft" | "sent"`; and
`useEffect(() => setFullName(first + last), [first, last])` becomes a plain derived
`` const fullName = `${first} ${last}` ``.

**grep:** `for (let i`, `.then(`, `for…in`, `+ "` string building, `filter(...).length`, `querySelector`
inside a component, `:key="index"`, `watch(` bodies containing an assignment, `useEffect` bodies that only
call a setter, `any`, and consecutive `await`s with no data dependency. Then take the largest component or
module and ask how a fluent TypeScript, Vue or React developer would write it — if the answer moves half
the body into a `computed` or a composable, the current version FAILs.
