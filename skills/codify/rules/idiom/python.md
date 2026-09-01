# rule 12 — Python

**Does the language already have a built-in way to say this, and did the author use it?** The standard
library is part of the language, so hand-rolling what it ships is this rule *and* rule 3. Rule 13
outranks this file: where they disagree — `.get(key, default)`, a swallowing `try/except` — 13 decides
and the fix is deletion, not a more elegant guard.

## Pythonic here

- **Comprehensions and generator expressions** over `append` loops; a generator when the result is
  consumed once and the collection is large.
- **`enumerate` and `zip`** over index arithmetic. `range(len(x))` is the loudest tell in the language.
- **Unpacking** over indexing — `first, second = pair`, `head, *rest = items`, `**overrides`.
- **`with`** over manual open/close and over `try/finally` around anything with a context manager.
- **`pathlib`** over string paths — also rule 1, where `Path` is the required type.
- **`dataclass`, `NamedTuple`, `Enum`, `TypedDict`** over ad-hoc tuples and dicts. A tuple addressed
  by index in three places is a dataclass that has not been written yet.
- **`collections` and `itertools`** — `defaultdict`, `Counter`, `deque`, `chain`, `groupby`,
  `pairwise`, `islice` — over reinvented loops.
- **`any`/`all`/`sum`/`min`/`max` with a `key`** over accumulator variables and early-exit flags.
- **f-strings** over concatenation, `%` and `.format`.
- **EAFP over LBYL** where the language expects it — try the operation and catch the *specific*
  exception rather than pre-checking, at a real boundary. Inside the boundary, rule 13 says do neither.
- **Truthiness and chained comparisons** — `if items:`, `0 <= index < length`.
- **`@property`** over `get_x()`/`set_x()`.
- **Decorators and context managers** for cross-cutting concerns (timing, retry, locking) rather than
  four lines pasted at the top of six functions.
- **`sorted(items, key=…)`** over a comparison function, and never `.sort()` on a caller's list
  (rule 19).

**The limit:** idiomatic is not clever. A comprehension nested three deep, a `reduce` with a lambda
needing a comment, a one-line walrus chain — all FAIL here too. When a comprehension needs a
conditional expression and a nested loop at once, the explicit `for` block is the idiomatic answer.

| Bad | Good |
| --- | --- |
| `result = []`<br>`for item in items: result.append(item.name)` | `names = [item.name for item in items]` |
| `for i in range(len(rows)):` | `for index, row in enumerate(rows):` |
| `for i in range(len(a)): pair(a[i], b[i])` | `for left, right in zip(a, b):` |
| `f = open(path)` … `f.close()` | `with path.open() as handle:` |
| `os.path.join(directory, name)` | `directory / name` |
| `if key in counts: counts[key] += 1` | `Counter(items)` or `defaultdict(int)` |
| `found = False`<br>`for u in users: if u.is_admin: found = True` | `has_admin = any(user.is_admin for user in users)` |
| `"Hello " + name + "!"` | `f"Hello {name}!"` |
| `def get_total(self):` | `@property`<br>`def total(self) -> Decimal:` |
| `return (name, age, email)` addressed by index | a `NamedTuple` or `@dataclass` |
| `if len(items) > 0:` | `if items:` |
| `sorted(items, cmp=compare)` | `sorted(items, key=attrgetter("created_at"))` |

**grep:** `range(len(`, `.append(` inside a loop whose only job is building a list, `os.path`,
`.keys()` in a `for … in`, `for i in range` with `[i]` in the body, `%` formatting, `.format(`,
`if key in d:` followed by `d[key]`, `get_`/`set_` method pairs, `open(` without `with`, `== True`,
`!= None`, manual `try/finally` where a context manager exists. Then take the longest function and ask
how a fluent Python programmer would write it — if the answer is a comprehension, a `dataclass` and
two standard-library calls, the current version FAILs.
