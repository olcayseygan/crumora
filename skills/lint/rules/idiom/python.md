# idiom — Python

`idiom` is a full-level rule, so this file is not read on a lite run.

**Does the language already have a built-in way to say this, and did the author use it?** The standard
library is part of the language, so hand-rolling what it ships is this rule *and* `repetition`. `guards`
outranks this file: where they disagree — `.get(key, default)`, a swallowing `try/except` — `guards`
decides and the fix is deletion, not a more elegant guard.

## Pythonic here

Comprehensions and generator expressions replace `append` loops, and a generator is the answer when the
result is consumed once and the collection is large. `enumerate` and `zip` replace index arithmetic, and
`range(len(x))` is the loudest tell in the language. Unpacking replaces indexing — `first, second = pair`,
`head, *rest = items`, `**overrides`. `with` replaces manual open and close, and replaces `try/finally`
around anything with a context manager. `pathlib` replaces string paths, which is also `types`, where
`Path` is the required type.

`dataclass`, `NamedTuple`, `Enum` and `TypedDict` replace ad-hoc tuples and dicts, since a tuple addressed
by index in three places is a dataclass that has not been written yet. `collections` and `itertools` —
`defaultdict`, `Counter`, `deque`, `chain`, `groupby`, `pairwise`, `islice` — replace reinvented loops.
`any`, `all`, `sum`, `min` and `max` with a `key` replace accumulator variables and early-exit flags.
f-strings replace concatenation, `%` and `.format`.

EAFP beats LBYL where the language expects it: try the operation and catch the *specific* exception rather
than pre-checking, at a real boundary — inside the boundary, `guards` says do neither. Truthiness and
chained comparisons are idiomatic (`if items:`, `0 <= index < length`), `@property` replaces `get_x()` and
`set_x()`, and decorators and context managers carry cross-cutting concerns such as timing, retry and
locking rather than four lines pasted at the top of six functions. `sorted(items, key=…)` replaces a
comparison function, and never `.sort()` on a caller's list, which is `mutation`.

**The limit:** idiomatic is not clever. A comprehension nested three deep, a `reduce` with a lambda needing
a comment, a one-line walrus chain — all FAIL here too. When a comprehension needs a conditional expression
and a nested loop at once, the explicit `for` block is the idiomatic answer.

So an empty `result = []` filled by a loop appending `item.name` becomes
`names = [item.name for item in items]`; `for i in range(len(rows)):` becomes
`for index, row in enumerate(rows):`; `for i in range(len(a)): pair(a[i], b[i])` becomes
`for left, right in zip(a, b):`; `f = open(path)` with a later `f.close()` becomes
`with path.open() as handle:`; `os.path.join(directory, name)` becomes `directory / name`;
`if key in counts: counts[key] += 1` becomes `Counter(items)` or `defaultdict(int)`; a `found = False`
loop flipping the flag on `user.is_admin` becomes `has_admin = any(user.is_admin for user in users)`;
`"Hello " + name + "!"` becomes `f"Hello {name}!"`; `def get_total(self):` becomes a `@property` named
`total` returning `Decimal`; `return (name, age, email)` addressed by index becomes a `NamedTuple` or
`@dataclass`; `if len(items) > 0:` becomes `if items:`; and `sorted(items, cmp=compare)` becomes
`sorted(items, key=attrgetter("created_at"))`.

**grep:** `range(len(`, `.append(` inside a loop whose only job is building a list, `os.path`, `.keys()` in
a `for … in`, `for i in range` with `[i]` in the body, `%` formatting, `.format(`, `if key in d:` followed
by `d[key]`, `get_`/`set_` method pairs, `open(` without `with`, `== True`, `!= None`, and manual
`try/finally` where a context manager exists. Then take the longest function and ask how a fluent Python
programmer would write it — if the answer is a comprehension, a `dataclass` and two standard-library
calls, the current version FAILs.
