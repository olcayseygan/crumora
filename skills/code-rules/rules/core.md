# core rules — 1–13, 18–26

Language-independent. Every rule here applies to every file in the target, whether it renders
anything or not. A component is judged on these *as well as* on `ui.md`, never instead of it.

Read `SKILL.md` for target selection, precedence, the kill pass, the scope budget, verification and
the output format. This file is only the rules.

---

### 1 · Types — everything is typed

Every parameter, return value, field and exported binding carries a declared type. No `any`, no
implicit `any`, no untyped `dict`/`object`/`Dictionary` standing in for a shape, no `var` where the
type is not obvious from the initialiser, no untyped `**kwargs` crossing a public boundary.

**How to check:** grep the target for `any`, `object`, `dynamic`, `interface{}`, and for functions
whose signature carries no return annotation. In Python grep for `: list`, `: dict`, `: tuple`,
`np.ndarray`, `Any`, `os.path.join`, path-ish names annotated `str`, and for `def` lines with an
unannotated parameter or no `->`. Check the compiler or type checker is actually in strict mode — a
green build under a loose config, or a repo with no `mypy`/`pyright` at all, proves nothing.

**FAIL evidence:** `parser.ts:44 — parse(input): any`.

**In Python the bar is higher, not lower.** A dynamic language is exactly where the annotation has to
carry the whole contract:

- **`typing` containers, never the bare builtins.** `List[str]`, `Dict[str, int]`, `Tuple[int, int]`,
  `Set[str]`, `Optional[User]`, `Callable[[int], str]`, `Iterable[Path]`. Bare `list`, `dict`,
  `tuple`, `set` FAIL, and so does a `List` with no element type — the container without its element
  type says nothing.
- **numpy arrays are typed with `numpy.typing`, with the dtype spelled out.**
  `NDArray[np.float64]`, `NDArray[np.float32]`, `NDArray[np.uint8]`, `NDArray[np.int32]`. A bare
  `np.ndarray` FAILs; so does `NDArray` with no dtype parameter. `float` is not a dtype — `float32`
  and `float64` are different contracts, and the code that mixes them silently upcasts.
- **Shape and dimension count are part of the type.** Every array parameter and return states how
  many axes it has and what each axis means, next to the annotation: `# (batch, height, width, 3)`,
  `# (n_points, 3) in world frame, metres`. A matrix says 2-D and which axis is rows; a batch says
  where the batch axis sits. "It's an array" is not a contract.
- **A shape used more than once becomes a named alias**, so the meaning lives in one place:
  `ImageArray = NDArray[np.uint8]  # (height, width, 3), BGR, 0-255`.
- **Same rule for the neighbours.** A `torch.Tensor` states dtype, device and shape; a
  `pd.DataFrame` states its column contract; a dict with fixed keys is a `TypedDict`, not
  `Dict[str, Any]`.
- **A filesystem path is a `Path`, never a `str`.** `pathlib.Path` in the annotation, in the field and
  in the variable; `os.path.join`, `+ "/" +` and `f"{directory}/{name}"` all FAIL, because
  `path / name`, `.stem`, `.suffix`, `.exists()` are the whole point. A function that accepts a path
  from a caller may widen to `Union[str, Path]` at that one boundary and converts to `Path`
  immediately; everything downstream is `Path`. Same rule outside Python: whatever the language's
  path type is, the string is not it.
- **`Any` is a FAIL in Python too**, including the implicit `Any` of an unannotated parameter and of
  a function with no return annotation — `-> None` is written out.

| Bad | Good |
| --- | --- |
| `def load(paths: list):` | `def load(paths: List[Path]) -> List[ImageArray]:` |
| `def solve(matrix, vector):` | `def solve(matrix: NDArray[np.float64], vector: NDArray[np.float64]) -> NDArray[np.float64]:` |
| `points: np.ndarray` | `points: NDArray[np.float32]  # (n_points, 3), camera frame, metres` |
| `config: dict` | `config: Dict[str, str]` |
| `def read(path: str):` | `def read(path: Path) -> str:` |
| `os.path.join(out_dir, name)` | `output_directory / name` |
| `def render(frame) -> np.ndarray:` | `def render(frame: ImageArray) -> ImageArray:  # (height, width, 3), BGR` |

**FAIL evidence:** `solver.py:31 — def solve(matrix, vector) has no annotations and returns a bare
np.ndarray with no dtype, no shape`.

### 2 · Names mean something — no abbreviations

A name says what the thing is, spelled out. No `cfg`, `mgr`, `tmp`, `val`, `res`, `btn`, `idx`, `e`,
`d`, `x`. No single letters. No acronyms the project has not defined.

The only names allowed to stay short are the ones a framework or the language mandates (`self`,
`cls`, `id`, a documented domain acronym such as `URL` or `HTTP`).

| Bad | Good |
| --- | --- |
| `cfg` | `configuration` |
| `usrMgr` | `userManager` |
| `tmpRes` | `pendingResponse` |
| `calc(a, b)` | `calculateTotalPrice(unitPrice, quantity)` |

**FAIL evidence:** `service.ts:12 — const cfg = loadConfig()`.

### 3 · No repetition

The same logic does not exist in two places. Two identical blocks, two callers each re-implementing
the same rule, two constants holding the same value, two functions differing only by a literal — all
FAIL. Extract once, call twice.

Copies that are identical **today but exist for different reasons** are not duplication; say so
explicitly when you let one live, and say why.

**FAIL evidence:** `orders.ts:80` and `invoices.ts:31` both compute VAT inline.

### 4 · SOLID

Five sub-checks. Each gets its own line in the output.

- **SRP** — one reason to change per unit. A class that parses *and* renders *and* persists FAILs.
- **OCP** — new behaviour is added, not carved into an existing `switch` over types.
- **LSP** — a subtype honours the base contract: no method that throws "not supported", no
  strengthened precondition, no weakened postcondition.
- **ISP** — no consumer forced to depend on methods it never calls. Fat interfaces FAIL.
- **DIP** — high-level code depends on an abstraction, not on a concrete class it constructs itself.

### 5 · Single entry

Each module, feature or unit exposes **exactly one** way in. One public entry point; everything else
is internal. No second function doing the same job by another route, no caller reaching past the
entry into internals, no "convenience" wrapper that becomes a parallel code path and then drifts.

**FAIL evidence:** `api.ts` exports both `send()` and `sendWithRetry()`, and callers use both.

### 6 · Test driven

Behaviour arrives with a test that would fail without it. Check:

- a test exists for every behaviour the target adds or changes;
- it asserts the **behaviour**, not the implementation — no asserting on private calls, no mocking the
  thing under test;
- it actually fails when the change is reverted; if you cannot show that, the test is decoration;
- the risky path is covered, not only the happy one.

Tests written **after** the fact still pass this rule when they hold to the above. Code with no test
at all does not.

### 7 · Function names are verbs

Imperative verb first: `calculateTotal`, `fetchUser`, `validateInput`, `renderRow`. Not
`totalCalculation`, not `userData`, not `inputValidator` for a function.

A class name is a noun; a method on it is still a verb.

### 8 · Variable names are nouns

A variable holds a thing, so its name is a noun or noun phrase: `activeUser`, `retryCount`,
`parsedResponse`. Not `getUser`, not `processing`, not a bare verb.

### 9 · Booleans start with is / has / can

Every boolean — variable, field, property, or predicate function — is prefixed `is`, `has`, `can`,
`should`, or `was`: `isActive`, `hasPermission`, `canRetry`, `shouldRefresh`, `wasDeleted`. A boolean
named `active`, `permission`, `flag`, `status` or `state` FAILs.

### 10 · No magic numbers or strings

Every literal that carries meaning is a named constant. A bare `86400`, `0.15`, `3`, `"pending"`,
`"application/json"`, `"#ff0000"` or a raw route path inside the logic FAILs. The name is where the
meaning lives; the literal is where it hides.

Named once, at the boundary that owns it, and reused — a constant repeated in two files is also a
rule 3 violation.

| Bad | Good |
| --- | --- |
| `if (retries > 3)` | `if (retryCount > MAX_RETRY_COUNT)` |
| `setTimeout(fn, 86400000)` | `setTimeout(fn, ONE_DAY_IN_MILLISECONDS)` |
| `status === "pending"` | `status === OrderStatus.Pending` |
| `price * 0.15` | `price * VAT_RATE` |

Allowed bare: the identity values `0`, `1`, `-1` where they mean exactly nothing/one/last, an empty
string, and a literal in a test that is *the point of the test*.

**Secrets are the exception, and they invert the fix.** An API key, access token, password, private
key, webhook secret or connection string sitting as a literal is a rule 10 hit, but naming it does
not fix it — `const API_KEY = "sk-live-…"` is the same secret in the same repository with a tidier
label, and extracting it to a `constants.ts` spreads it further. The fix is to read it from the
environment or the secret store, and **which** one is something only the user knows, so it is a
`NEEDS DECISION`, not an edit:

```
NEEDS DECISION   config.ts:4   10   hardcoded Stripe key — which env var / secret store should this read from?
```

Say in the same line that the value is live in the file and, if the repository has history, that
rotating it is the user's call. Do not move it, do not rename it, and never paste the value into the
output.

**How to check:** grep the target for numeric literals outside constant declarations, and for string
literals compared with `==`/`===`/`switch` or passed as a mode/kind/status argument. Then grep
separately for the secret shapes — `key`, `secret`, `token`, `password`, `passwd`, `apikey`,
`connection string`, `sk-`, `AKIA`, `Bearer `, `-----BEGIN`.

**FAIL evidence:** `orders.ts:60 — price * 0.15`.

### 11 · Blank lines separate blocks, never code

Inside a body there are **no blank lines between statements**. Consecutive statements sit flush against
each other. The moment a run of lines wants a blank line above it to say "this part is a different
job", that run *is* a different job — extract it into its own named function and call it. The blank
line is not the fix; the function is.

Around a control block the spacing is fixed, and it is the only spacing there is:

- **One blank line after** every `if` / `else` / `for` / `foreach` / `while` / `do` / `switch` /
  `try` / `using` / `lock` block — after the closing brace, before whatever follows.
- **No blank line before** one. The block starts immediately after the statement above it.
- Nothing after the closing brace of the *enclosing* body needs a blank line — a block that is the
  last thing in its parent closes straight into `}`.
- Chained parts stay glued: `}` `else if (…)` `{`, `}` `catch` `{`, `}` `finally` `{` — no blank line
  cuts a chain apart.
- Never two blank lines in a row, anywhere.

Between top-level members — methods, classes, fields grouped by purpose — one blank line is normal and
expected. This rule is about the inside of a body.

| Bad | Good |
| --- | --- |
| `var total = 0;`<br>` `<br>`var count = items.Count;` | `var total = 0;`<br>`var count = items.Count;` |
| `var user = Load(id);`<br>` `<br>`if (user.IsActive)`<br>`{ … }` | `var user = Load(id);`<br>`if (user.IsActive)`<br>`{ … }` |
| `if (isReady)`<br>`{ … }`<br>`Send(payload);` | `if (isReady)`<br>`{ … }`<br>` `<br>`Send(payload);` |
| a 40-line body split into three parts by blank lines | three named functions called in order |

**How to check:** grep the target for a blank line whose next non-empty line is `if`, `for`, `while`,
`switch`, `try`, `foreach`; for a `}` closing a control block whose next line is neither blank, nor
`}`, nor a chained `else`/`catch`/`finally`; and for any blank line inside a function body that is not
one of those. Every hit of the last kind is two edits — the blank line goes, and the run it was
splitting becomes its own function.

**FAIL evidence:** `SpawnService.cs:52 — blank line between two statements inside Spawn(); the four
lines below it are a distinct job, so extract ResolveSpawnPoint()`.

### 12 · Idiomatic — write the language, not a translation of another one

Code is written in the grain of the language it lives in. A C programmer's loop transliterated into
Python, a jQuery reflex inside Vue, a Java factory bolted onto TypeScript — all FAIL. The check is
simple: **does the language already have a built-in way to say this, and did the author use it?**

The standard library and the framework are part of the language. Hand-rolling something they already
ship is both this rule and rule 3.

The limit: **idiomatic is not clever.** A comprehension nested three deep, a LINQ chain no one can
read, a one-liner that needs a comment to decode — those FAIL too, under this same rule. Idiom means
the way a fluent native writes it plainly, not the shortest thing that runs.

**Rule 13 outranks this one.** Optional chaining, `??` defaults and null-conditional access read as
idiomatic and are still defensive guards; where rule 13 says delete, they get deleted rather than
modernised. Do not "fix" a `&&` chain into `?.` — check first whether the value can legitimately be
absent at all.

**The per-language detail lives in its own file.** Name the language and framework of each file
first, then read only what you need:

| Language | File |
| --- | --- |
| Python | `rules/idiom/python.md` |
| JavaScript / TypeScript, Vue, React | `rules/idiom/typescript.md` |
| C#, Unity | `rules/idiom/csharp.md` |

For anything else, apply the principle above directly and say in one line that you judged idiom
without a reference file.

**How to check:** for each file, name the language and framework, read the matching idiom file, grep
for that language's tell-tale non-idioms. Then ask the reverse question on the biggest function in
the file: *how would a fluent native write this?*

**FAIL evidence:** `loader.py:88 — index loop with range(len(paths)) building a list via append; use a
comprehension over enumerate`.

### 13 · No defensive guards — let it fail loudly

A bug that throws gets found and fixed. A bug wrapped in a null check becomes a silent wrong result
three layers away, and nobody knows where it started. So the code does **not** defend itself against
its own callers.

FAIL, every time:

- **A null / `None` / `nullptr` check on a value that should never be null.** If the contract says the
  argument is there, trust the contract and let the dereference throw.
- **`try`/`catch` that swallows.** An empty catch, a catch that logs and continues as if nothing
  happened, a catch that returns a default, `except Exception: pass`, `catch { }`, `?.` sprinkled over
  an internal object to keep a crash away.
- **A fallback default that hides a missing value** — `?? 0`, `|| ""`, `.get(key, None)` followed by a
  branch that pretends the key was optional, `GetComponent<T>()` result silently ignored when absent.
- **Re-validating what the caller already guaranteed**, and the `if (list != null && list.Count > 0)`
  reflex around a list that is always constructed.
- **A guard with no handling behind it** — `if (thing == null) return;` at the top of a method that is
  meaningless without `thing`. That is not a guard, it is a crash moved somewhere harder to find.

The most you may add is a **log**, and only when it does not change control flow: log the state, then
let the exception propagate or rethrow it unchanged. A `catch` that logs and rethrows passes. A
`catch` that logs and returns does not.

**Where a guard is legitimate:** at a boundary with a genuinely untrusted or unreliable source —
network, disk and other IO, hardware, a parsed file, user input, a third-party API, a cross-process
message. There the failure is expected, not a bug, so it is handled explicitly: validate once at the
boundary, convert to a typed error or a domain result, and everything inside the boundary then trusts
its inputs and stays guard-free. Also legitimate: a check that *is* the business rule (`if (balance <
amount) throw new InsufficientFunds()`), cleanup that runs without swallowing (`finally`, `using`,
`with`), and the rollback `catch` of rule 14, which restores state, tells the user and logs.

Assertions and fail-fast checks that **throw** are not defensive guards — they are the opposite, and
they pass this rule.

| Bad | Good |
| --- | --- |
| `if (user == null) return;` | use `user` — a null here is a bug worth crashing on |
| `try { Parse(); } catch { }` | let `Parse` throw |
| `try { … } catch (Exception e) { Log(e); return null; }` | `catch (Exception e) { Log(e); throw; }` |
| `except Exception: pass` | no `except` at all, or `except FileNotFoundError:` at the IO boundary |
| `var speed = config?.Speed ?? 0f;` | `var speed = configuration.Speed;` |
| `if (target != null) target.Hit();` | `target.Hit();` |
| `rigidbody = GetComponent<Rigidbody>(); if (rigidbody == null) return;` | require it: `[RequireComponent]`, then use it |

**How to check:** grep the target for `!= null`, `is null`, `== None`, `?.`, `??`, `||` defaults,
`catch`, `except`, `try:`, `.get(` with a default, and `if (… ) return;` early exits. For each hit ask
one question: **can this value legitimately be absent, from a source outside our control?** Yes at a
real IO/hardware/user boundary → PASS. Anything else → FAIL, and the fix is deletion.

Deleting a guard is meant to convert a silent wrong answer into a loud crash. If the test suite goes
red on one of these afterwards, that is the rule working — report it as `NEEDS DECISION` with the
failure, do not reinstate the guard to get back to green.

**FAIL evidence:** `PlayerController.cs:41 — if (weapon == null) return; hides a broken spawn path;
delete the guard and let the NullReferenceException point at the real bug`.

### 18 · No dead code

Code that nothing reaches is not harmless — it is read, trusted, searched, refactored and kept
compiling by people who assume it matters. Every one of these FAILs, and the fix is deletion:

- an **unused export, function, class, method, field or constant** with no caller anywhere in the
  repository (not just in the target — check before deleting);
- an **unused import**, an unused local, an unused parameter that no overload or interface requires;
- **commented-out code**, of any age, with or without a `// TODO: bring this back`. Version control
  already remembers it;
- an **unreachable branch** — code after an unconditional `return`/`throw`, a condition that cannot be
  false, a `case` no value can take, an `if (false)`/`if (True)` left from debugging;
- a **feature flag that has been fully on or fully off long enough that one side never runs** — the
  branch that never executes goes, and so does the flag.

Two things that look dead and are not, so kill them in the verify pass rather than deleting: a public
API consumed outside the repository (a published package, a plugin surface, something reflection or
serialisation reaches by name), and a parameter mandated by an interface, a framework signature or a
Unity/Qt-style callback contract. If you cannot establish which, it is a `NEEDS DECISION`, not a
deletion.

**How to check:** run whatever the project already has — `ts-prune`, `knip`, `eslint`
`no-unused-vars`, `vulture`, `ruff F401`, the compiler's own unused warnings, IDE analysis. Then grep
the repository for each exported name the target defines and count call sites. For commented-out
code, grep for lines beginning with a comment marker that end in `;`, `)`, `{` or `:`.

**FAIL evidence:** `api/client.ts:9 — export function legacyPost() has no call sites in the
repository; delete it and the two imports it drags in`.

### 19 · No hidden mutation

A function that quietly rewrites what it was handed, or writes to state its signature never mentions,
is a bug that only appears at the second call site. Same family as rule 13: make the effect visible
or do not have it.

FAIL:

- **Mutating an argument in place** while the name and return say otherwise — `points[:] = …` inside
  `normalize(points)`, `items.push(…)` on a list a caller passed in, `Object.assign(target, …)` on an
  argument, sorting a caller's array with `.sort()` (which sorts in place) instead of `[...items].sort()`.
- **Writing to module-level or global mutable state** from a function that reads as a calculation —
  a module-scope `dict`/`Map` accumulating entries, a static counter, a singleton mutated from three
  places.
- **A mutable default argument** — `def append_to(item, target=[])` in Python; the default is shared
  across every call and is essentially always a bug.
- **A getter, property or `computed` with a side effect** — anything named `get…`, `is…` or `total`
  that writes, caches into shared state, fires a request or logs at a level someone depends on.
- **Returning an internal collection by reference** from an accessor, so callers can mutate the
  object's private state from outside. Return a copy, or a read-only view.

**Where mutation is correct and stays:** a method mutating **its own object's** fields (that is what
methods are for); a builder or accumulator whose whole declared job is to be filled; an explicitly
named in-place operation (`sortInPlace`, `normalize_inplace`, numpy's `out=` parameter) where the
name and the signature say so; and performance-critical code where copying is genuinely the
bottleneck and a comment says so.

The fix is usually one of three: copy before modifying and return the copy, rename the function so
the mutation is declared (`sortItems` → `sortItemsInPlace`), or lift the shared state into an explicit
parameter. Prefer the first — a pure function is the one that never surprises the second caller.

| Bad | Good |
| --- | --- |
| `def normalize(points): points[:] = points / norm` | `return points / norm` |
| `def append_to(item, target=[]):` | `def append_to(item: str, target: Optional[List[str]] = None) -> List[str]:` |
| `items.sort()` on a caller's array | `const sortedItems = [...items].sort(compare)` |
| `get items() { this.cache = …; return this._items }` | compute without writing, return a copy |
| module-level `results = {}` filled by a function | pass the accumulator in, or return the new value |

**How to check:** for every function taking a collection, object or array, check whether it writes to
that parameter. Grep for `.push(`, `.pop(`, `.splice(`, `.sort(`, `.reverse(`, `Object.assign(`,
`[:] =`, `.update(`, `.append(` on a parameter name; for assignments to module-scope names inside
functions; for `=[]` / `={}` / `=dict()` in Python signatures; and for `get`/`@property` bodies
containing an assignment to `self`/`this`.

**FAIL evidence:** `normalize.py:22 — normalize(points) writes points[:] in place and also returns it,
so the caller's array is silently modified; copy first`.

### 20 · Errors carry what broke

Rule 13 says let it fail loudly. This is the other half: **loud is not the same as informative.**
`throw new Error("failed")` crashes exactly as hard as a useful exception and tells the person reading
the log nothing at all. A stack trace says where; the message has to say what.

FAIL:

- **A message with no value in it** — `"invalid input"`, `"failed"`, `"error occurred"`, `"something
  went wrong"`. The offending value, the identifier, the state goes in: `f"expected 3 channels, got
  {array.shape[-1]} for {path}"`.
- **A bare base type where a specific one exists** — `throw new Error(…)`, `raise Exception(…)`,
  `throw new ApplicationException(…)`. Use the specific built-in (`ValueError`, `KeyError`,
  `ArgumentOutOfRangeException`, `TypeError`) or a domain type the caller can actually catch.
- **A boundary that leaks its internals upward** — a `SqlException` or an `HTTPError` escaping into
  domain code. At the boundary (rule 13's legitimate guard) it converts into a typed domain error;
  what it wrapped goes in the `cause` / `from` / `innerException`, never dropped.
- **A rethrow that erases the original** — `raise ValueError(str(e))`, `throw new Error(e.message)`,
  `throw ex;` in C# (which resets the stack trace — `throw;` does not).
- **A secret, token, password or full credential in the message**, and a whole request body or user
  record dumped into it. Enough context to locate the failure, not enough to become an incident.
- **A message that describes the recovery instead of the fault** — `"please try again"` on an
  exception. Say what broke; the caller decides what to do about it.

**Where it stops:** an exception is not documentation. One sentence with the offending values is the
target; a paragraph, a suggested fix and a link is not. And a `catch` that only improves the message
before rethrowing is fine — a `catch` that improves the message and returns is a rule 13 FAIL.

| Bad | Good |
| --- | --- |
| `raise Exception("bad shape")` | `raise ValueError(f"expected (n, 3), got {points.shape}")` |
| `throw new Error("not found")` | `throw new UserNotFoundError(userId)` |
| `except SqlError as e: raise ValueError(str(e))` | `raise RepositoryError(f"loading user {user_id}") from e` |
| `catch (Exception ex) { throw ex; }` | `catch (Exception) { throw; }` |
| `throw new Error(\`auth failed: ${apiKey}\`)` | `throw new AuthError(\`auth failed for ${userId}\`)` |

**How to check:** grep for `Error("`, `Exception("`, `raise Exception`, `throw new Error`, and read
every message literal — does it name a value? Then grep for `str(e)`, `e.message`, `throw ex;`, and
for message strings containing `key`, `token`, `password`, `secret`.

**FAIL evidence:** `loader.py:57 — raise ValueError("bad file") names neither the path nor what was
wrong with it`.

### 21 · Comments say why, not what

A comment that restates the line above it is a second copy of the code that nobody updates, so it
drifts and starts lying. The code already says *what*. A comment earns its place by carrying what the
code cannot: the reason, the constraint, the thing that was tried and did not work.

FAIL:

- **The restatement** — `// increment the counter` above `counter++`, `# loop over users` above
  `for user in users`, a docstring that repeats the signature in prose.
- **The comment that contradicts the code.** Whichever is right, the pair is a FAIL; fix the code if
  the comment describes the intent, fix the comment if the code is right, and if you cannot tell
  which, it is a `NEEDS DECISION`.
- **The stale marker** — `// TODO`/`FIXME`/`HACK` with no owner, no date and no issue reference. Give
  it a reference or delete it.
- **The section banner** — `// ---- validation ----` in the middle of a function body. That banner is
  rule 11's blank line wearing a hat: the section it marks is a separate function.
- **The commented-out code** — already rule 18, deleted there.
- **Noise headers** — an auto-generated `@param` block that repeats typed parameters, a changelog in
  the file header, a name-and-date stamp version control already holds.

PASS, and worth keeping:

- **Why this way** — `// binary search: the list is sorted by the caller and can hit 10⁶ entries`.
- **Why not the obvious way** — `// not Promise.all: the API rate-limits above 5 concurrent`.
- **The external constraint** — a spec section, an RFC, a hardware quirk, a vendor bug with a link.
- **The non-obvious unit or frame** — already required by rule 1 for arrays; the same applies to a
  scalar in an odd unit.
- **A public API docstring** stating contract, units, raised errors and ownership of returned data.

The fix for most FAILs is deletion, and deletion is not a loss: a comment removed because the code
already says it costs nothing, while a comment kept because it might be useful costs a reader on
every visit.

| Bad | Good |
| --- | --- |
| `// set the user to active`<br>`user.isActive = true` | (delete the comment) |
| `// TODO: fix later` | `// TODO(#412): remove once the v2 endpoint ships` |
| `// ---- parsing ----` inside a function | extract `parseHeader()` |
| `# returns the total` above `def total(...) -> Decimal` | (delete, or state the rounding rule) |
| `// wait 500ms` above `sleep(500)` | `// the device NACKs anything sent under 400ms after reset` |

**How to check:** read every comment in the target and ask whether deleting it loses information the
code does not already carry. Grep for `TODO`, `FIXME`, `HACK`, `XXX`, for comment lines whose words
are the identifiers on the next line, and for `@param`/`@returns` blocks that add nothing to a typed
signature.

**FAIL evidence:** `cart.ts:88 — "// add item to cart" above cart.add(item); delete it`.

### 22 · No flag parameters

`render(true, false)` tells the reader nothing at the call site, and no amount of good naming inside
the function fixes it, because the reader is looking at the call. A boolean parameter is almost always
two functions that have been glued together, and the `if (isCompact)` in the body is the seam.

FAIL:

- **A boolean parameter that selects behaviour** — `save(user, true)`, `render(item, false, true)`.
  Split into two named functions (`saveDraft` / `savePublished`), or take an enum, or an options
  object with named fields.
- **Two or more positional booleans in a row.** Even named at the definition, the call site is a
  coin flip.
- **A "mode" or "kind" string parameter** — `export(data, "csv")`. That is an enum (rule 10 as well).
- **More than four parameters.** Past four, the reader is counting positions rather than reading. The
  fix is a parameter object, a `@dataclass`, a `record` — which usually reveals that three of them
  travel together everywhere and were always one thing.
- **A parameter that is only read on one branch** — passed on every call, used on one. It belongs to
  the branch, not the signature.

**Where a boolean parameter is fine:** when it is genuinely data rather than a switch
(`setEnabled(isEnabled)`, `setVisible(isVisible)`), when the language forces named arguments at the
call site (Python keyword-only after `*`, Swift labels, C# named arguments used consistently), and
when an interface or framework signature mandates it.

| Bad | Good |
| --- | --- |
| `save(user, true)` | `saveDraft(user)` / `savePublish(user)` |
| `export(data, "csv")` | `export(data, ExportFormat.Csv)` |
| `createUser(name, email, true, false, null)` | `createUser({ name, email, isAdmin, hasNewsletter })` |
| `def fetch(url, retry, cache, verbose):` | `def fetch(url: str, *, options: FetchOptions) -> Response:` |

**How to check:** grep the target for call sites containing a bare `true`/`false`/`True`/`False`/
`null`/`None` as an argument, for `def`/`function` lines with more than four parameters, and for
string literals passed as an argument and then compared inside the body.

**FAIL evidence:** `report.ts:34 — generate(data, true, false); split into generateSummary and
generateDetailed`.

### 23 · No floating promises

An async call whose result nobody awaits and whose failure nobody catches loses the error entirely —
it becomes an unhandled rejection in a log nobody reads, or in some runtimes nothing at all. This is
the exact silence rule 13 exists to prevent, arriving through a different door.

FAIL:

- **A promise-returning call with no `await`, no `return`, no `.catch`** — `saveDraft(document)` on
  its own line; `void saveDraft(document)` counts too unless a comment says why.
- **`async` passed where a sync callback is expected** — `array.forEach(async item => …)` (the
  promises escape and the loop does not wait), `setTimeout(async () => …)`, an async handler passed to
  something that ignores the return value.
- **`async void` in C#** anywhere except an event handler, and a fire-and-forget `Task` with no
  continuation.
- **A Python coroutine called without `await`** — creating the coroutine object and dropping it, or
  `asyncio.create_task(…)` whose handle is discarded so exceptions vanish at garbage collection.
- **A background task with no failure path.** Deliberate fire-and-forget is allowed, but then it is
  explicit: keep the handle, attach a failure handler that logs, and say in one comment that it is
  intentional (rule 21 PASS — this is a why).

The fix is nearly always one word: `await` it, or `return` it so the caller's `await` covers it.

| Bad | Good |
| --- | --- |
| `saveDraft(doc);` | `await saveDraft(doc);` |
| `items.forEach(async item => await send(item))` | `await Promise.all(items.map(item => send(item)))` |
| `async void SaveAsync()` | `async Task SaveAsync()`, awaited by the caller |
| `asyncio.create_task(sync_all())` | keep the task, `await` it or add a done-callback that logs |
| `function run() { return fetchAll(); }` untyped | `async function run(): Promise<Result> { return fetchAll(); }` |

**How to check:** turn on `@typescript-eslint/no-floating-promises` and `no-misused-promises` if the
repo has eslint, and `RUF006` / `ASYNC` rules in ruff. Then grep for `async` inside `forEach`/`map`
without `Promise.all`, for `async void`, for `create_task(` without an assignment, and for statement
lines that call a known async function with no `await` in front.

**FAIL evidence:** `editor.ts:71 — saveDraft(document) is not awaited; a failed save is silently lost`.

### 24 · Time, randomness and identity come from outside

`new Date()`, `Math.random()`, `uuid4()` and `Guid.NewGuid()` inside business logic make that logic
untestable — you cannot assert on a value the function invented, so rule 6's test either does not
exist or asserts nothing. They also make it unrunnable in the past, unreproducible after a bug, and
timezone-dependent in ways nobody notices until a release at midnight.

FAIL:

- **A clock read inside a calculation** — `if (order.dueAt < new Date())`, `datetime.now()` in a
  pricing rule, `Time.time` inside a method that decides game logic and is called from tests.
- **Randomness inside logic** — a shuffle, a sample, a jitter, a retry backoff that cannot be seeded.
- **Identity minted deep inside** — a `uuid` generated three layers down, so the caller cannot know
  what id was used and the test cannot fix it. (Rule 16's idempotency key is the same requirement
  from the other side: one intent, one key, minted where the intent forms.)
- **A naive local timestamp crossing a boundary** — `datetime.now()` rather than
  `datetime.now(timezone.utc)`, a `DateTime.Now` stored in a database, a date formatted for display
  in the layer that computes it.

The fix: take the clock, the random source or the id factory as a parameter or a constructor
dependency (rule 4's DIP), default it at the composition root, and inject a fixed one in tests. The
smallest version is a single `now: () => Date` parameter — no framework required.

| Bad | Good |
| --- | --- |
| `if (dueAt < new Date())` | `isOverdue(order, now)` with `now` passed in |
| `def price(order): today = date.today()` | `def price(order: Order, today: date) -> Decimal:` |
| `id = uuid4()` deep in a repository | mint at the entry point, pass it down |
| `datetime.now()` stored | `datetime.now(timezone.utc)` |
| `random.shuffle(items)` | `rng.shuffle(items)` with an injected, seedable `rng` |

**Where reading directly is fine:** the composition root, an entry point, a logger, a UI component
rendering the current time, and a `Time.deltaTime` in Unity's own `Update` loop.

**How to check:** grep for `new Date(`, `Date.now(`, `datetime.now`, `date.today`, `DateTime.Now`,
`Math.random`, `random.`, `uuid`, `Guid.NewGuid`, `System.currentTimeMillis` — and for each hit ask
whether it sits at an entry point or inside logic a test would want to pin.

**FAIL evidence:** `subscription.py:44 — renewal window computed from date.today() inside the rule, so
no test can pin the boundary; take today as a parameter`.

### 25 · Untrusted input is never interpolated

Rule 13 already draws the boundary between trusted and untrusted sources. This rule says what happens
at that boundary when the value goes somewhere that interprets it: a query, a shell, a filesystem
path, an HTML document, a template, a redirect. **The value is passed as data, never assembled into
the sentence.**

FAIL, in every language:

- **SQL built by concatenation or interpolation** — `"SELECT … WHERE id = " + userId`,
  `f"… WHERE name = '{name}'"`, a `.raw()` call with a variable in it. Parameterised queries, always;
  and where an identifier genuinely has to vary (a column name, a sort direction), it is chosen from a
  fixed allow-list, not passed through.
- **Shell commands built from strings** — `os.system(f"convert {path}")`, `exec("git " + branch)`,
  `shell=True` with a variable. Pass an argument list; do not spawn a shell.
- **HTML assembled from values** — `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, a template engine's
  raw-output marker, a string-built `<script>` tag. Set text, bind a property, or sanitise with a real
  library at the one place the value enters.
- **A path built from user input** — `uploads/ + filename` with no normalisation, so `../../etc` walks
  out. Resolve, then verify the result is inside the intended directory.
- **A redirect, an origin check or a URL built from a parameter** without an allow-list.
- **A regular expression compiled from user input**, and a regex with nested quantifiers applied to
  user input (a denial of service that looks like a hang).
- **Deserialisation of untrusted bytes into arbitrary types** — `pickle.loads`, `eval`,
  `JSON.parse` into a shape nobody validates, a `BinaryFormatter`.

**Trust is not transitive and not permanent.** A value that arrived from a request, a queue message, a
file, a webhook or another service is untrusted at every layer it reaches, not just the first. A value
read back out of your own database is untrusted if it was ever written by a user.

**Validate at the boundary, once** — the same place rule 13 allows a guard. Convert to a typed value
there (`UserId`, `Email`, `SafePath`) and everything downstream trusts the type instead of re-checking
the string.

| Bad | Good |
| --- | --- |
| `f"SELECT * FROM users WHERE id = {user_id}"` | `cursor.execute("… WHERE id = %s", (user_id,))` |
| `os.system(f"rm {path}")` | `subprocess.run(["rm", str(path)], check=True)` |
| `element.innerHTML = comment` | `element.textContent = comment` |
| `v-html="post.body"` | render text, or sanitise once on ingest |
| `open(UPLOAD_DIR + filename)` | `resolved = (UPLOAD_DIR / filename).resolve()` then assert it is under `UPLOAD_DIR` |
| `res.redirect(req.query.next)` | redirect only to a path from a known allow-list |

**How to check:** grep for `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `eval(`, `exec(`,
`os.system`, `subprocess` with `shell=True`, `pickle.loads`, `.raw(`, `execute(` with an f-string or a
`+`, string concatenation next to `SELECT`/`INSERT`/`UPDATE`/`DELETE`, and path joins whose right side
is a variable. For each hit, trace the value back to where it entered the process.

This is the one rule where an uncertain finding is still reported. If you cannot establish that a
value is trusted, say so as a `NEEDS DECISION` rather than dropping it in the kill pass.

**FAIL evidence:** `search.py:29 — query built with an f-string from request.args; parameterise it`.

### 26 · Dependencies point one way

Modules form a shape, and the shape is either a layered graph or a knot. A knot cannot be tested in
pieces, cannot be understood in pieces, and cannot be extracted later. This is rule 4's DIP made
concrete and greppable.

FAIL:

- **A cycle** — `A` imports `B` imports `A`, directly or through three files. Some bundlers even
  tolerate it silently until an initialisation order changes and a value is `undefined` at import time.
- **An inward-pointing import that should point outward** — domain or business code importing the UI,
  the ORM, the HTTP framework, the logger implementation. The dependency inverts: the inner layer
  declares an interface, the outer layer implements it.
- **A layer skipped** — a component reaching straight into the database client, a controller
  importing a repository's internals rather than going through the service (rule 5 as well).
- **A sibling reaching sideways into another feature's internals** — `features/billing/…` importing
  `features/auth/internal/tokenStore`. Cross-feature traffic goes through the feature's one public
  entry (rule 5) or through a shared module both depend on.
- **A shared "utils" or "common" module that imports from the features that use it.** That is the
  cycle again, wearing a helpful name.

The fix is one of three: invert the dependency behind an interface, move the shared thing down into a
module both sides may depend on, or merge two modules that were never actually separate. Which one is
usually obvious from the direction the data flows; when it is not, it is a `NEEDS DECISION`.

| Bad | Good |
| --- | --- |
| `domain/order.ts` imports `db/prismaClient` | `domain` declares `OrderRepository`, `infra` implements it |
| `utils/format.ts` imports `features/cart` | move the cart-specific formatter into `features/cart` |
| `UserService` ↔ `NotificationService` | one raises an event the other subscribes to |
| component imports `axios` and calls the API directly | component calls a service; the service owns the client |

**How to check:** run whatever the repo has — `madge --circular`, `dependency-cruiser`, `import-linter`
for Python, `eslint-plugin-import/no-cycle`, a compiler's own circular-reference warning. Then read the
import block at the top of each file in the target and ask a single question per line: **is this
import pointing outward from the core, or inward toward it?** Inward is the FAIL.

**FAIL evidence:** `domain/pricing.ts:3 — imports the Prisma client directly; declare a
PriceRepository interface here and implement it in infra/`.
