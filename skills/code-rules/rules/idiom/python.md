# rule 12 — Python

Read alongside rule 12 in `core.md`. The question stays the same: **does the language already have a
built-in way to say this, and did the author use it?** The standard library is part of the language,
so hand-rolling what it ships is this rule *and* rule 3.

Rule 13 outranks this file. Where the two disagree — `.get(key, default)`, a `try/except` that
swallows — rule 13 decides and the fix is deletion, not a more elegant guard.

---

## What pythonic means here

- **Comprehensions and generator expressions** over `append` loops. A generator when the result is
  consumed once and the collection would be large.
- **`enumerate` and `zip`** over index arithmetic. `range(len(x))` is the single loudest tell in the
  language.
- **Unpacking** over indexing — `first, second = pair`, `head, *rest = items`, `**overrides` when
  merging dicts.
- **`with`** over manual open/close, and over try/finally around any resource that has a context
  manager.
- **`pathlib`** over string paths — this is also rule 1, where `Path` is the required type.
- **`dataclass`, `NamedTuple`, `Enum`, `TypedDict`** over ad-hoc tuples and dicts. A tuple whose
  fields are addressed by index in three places is a dataclass that has not been written yet.
- **`collections` and `itertools`** — `defaultdict`, `Counter`, `deque`, `chain`, `groupby`,
  `pairwise`, `islice` — over reinvented loops. `Counter(words).most_common(n)` is not clever, it is
  the standard answer.
- **`any` / `all` / `sum` / `min` / `max` with a `key`** over accumulator variables and early-exit
  flags.
- **f-strings** over concatenation and `%` and `.format`.
- **EAFP over LBYL** where the language expects it — try the operation and catch the *specific*
  exception rather than pre-checking, at a real boundary. Inside the boundary, rule 13 says do
  neither.
- **Truthiness and chained comparisons** — `if items:`, `0 <= index < length` — over
  `if len(items) > 0` and `index >= 0 and index < length`.
- **`@property`** over `get_x()` / `set_x()`.
- **Decorators and context managers** for cross-cutting concerns (timing, retry, locking) rather than
  the same four lines pasted at the top of six functions.
- **`sorted(items, key=…)`** over a comparison function, and never `.sort()` on a caller's list
  (rule 19).

## The limit

Idiomatic is not clever. A comprehension nested three deep, a `reduce` with a lambda that needs a
comment, a one-line walrus chain — those FAIL under this same rule. The bar is *how a fluent Python
programmer writes it plainly*, not how short it can get. When a comprehension needs a conditional
expression and a nested loop at once, the explicit `for` block is the idiomatic answer.

| Bad | Good |
| --- | --- |
| `result = []`<br>`for item in items:`<br>`    result.append(item.name)` | `names = [item.name for item in items]` |
| `for i in range(len(rows)):` | `for index, row in enumerate(rows):` |
| `for i in range(len(a)):`<br>`    pair(a[i], b[i])` | `for left, right in zip(a, b):` |
| `f = open(path)` … `f.close()` | `with path.open() as handle:` |
| `os.path.join(directory, name)` | `directory / name` |
| `counts = {}`<br>`if key in counts: counts[key] += 1` | `counts = Counter(items)` or `defaultdict(int)` |
| `found = False`<br>`for u in users:`<br>`    if u.is_admin: found = True` | `has_admin = any(user.is_admin for user in users)` |
| `"Hello " + name + "!"` | `f"Hello {name}!"` |
| `def get_total(self):` | `@property`<br>`def total(self) -> Decimal:` |
| `return (name, age, email)` addressed by index | a `NamedTuple` or `@dataclass` |
| `if len(items) > 0:` | `if items:` |
| `sorted(items, cmp=compare)` | `sorted(items, key=attrgetter("created_at"))` |

## How to check

Grep the target for: `range(len(`, `.append(` inside a loop whose only job is building a list,
`os.path`, `.keys()` in a `for … in`, `for i in range` with `[i]` in the body, `%` formatting and
`.format(`, `if key in d:` followed by `d[key]`, `get_`/`set_` method pairs, `open(` without `with`,
`== True` / `!= None`, and manual `try/finally` where a context manager exists.

Then take the longest function in the file and ask the reverse question: how would a fluent Python
programmer write this? If the answer is a comprehension, a `dataclass` and two standard-library
calls, the current version FAILs.

**FAIL evidence:** `loader.py:88 — index loop with range(len(paths)) building a list via append; use a
comprehension over enumerate`.
