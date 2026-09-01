# core rules — 1–13, 17–26

Language-independent, applied to every file in the target. `SKILL.md` holds the procedure; this file
is only the rules. Each rule: the statement, what FAILs, what legitimately PASSes, and what to grep.

---

### 1 · Types — everything is typed

Every parameter, return, field and exported binding carries a declared type. No `any`/implicit `any`,
no untyped `dict`/`object`/`Dictionary` standing in for a shape, no `var` where the initialiser does
not make the type obvious, no untyped `**kwargs` crossing a public boundary.

**Python is stricter, not looser:**

- **`typing` containers, never bare builtins** — `List[str]`, `Dict[str, int]`, `Tuple[int, int]`,
  `Set[str]`, `Optional[User]`, `Callable[[int], str]`, `Iterable[Path]`. Bare `list`/`dict`/`tuple`/
  `set` FAIL, and so does `List` with no element type.
- **numpy carries dtype** — `NDArray[np.float64]`, `NDArray[np.uint8]`. Bare `np.ndarray` FAILs, so
  does `NDArray` with no dtype. `float` is not a dtype; `float32` and `float64` are different
  contracts and mixing them silently upcasts.
- **Shape and axis count are part of the type**, as a comment next to the annotation:
  `# (batch, height, width, 3)`, `# (n_points, 3) world frame, metres`.
- **A shape used twice becomes an alias** — `ImageArray = NDArray[np.uint8]  # (h, w, 3), BGR, 0-255`.
- **Neighbours too** — `torch.Tensor` states dtype/device/shape, `pd.DataFrame` states its column
  contract, a fixed-key dict is a `TypedDict` not `Dict[str, Any]`.
- **A path is a `Path`, never a `str`** — `os.path.join`, `+ "/" +` and `f"{dir}/{name}"` FAIL. Widen
  to `Union[str, Path]` at one entry boundary only, convert immediately, `Path` downstream. Same rule
  in every language: the string is not the path type.
- **`Any` FAILs**, including the implicit `Any` of an unannotated parameter or a missing return; write
  `-> None`.

| Bad | Good |
| --- | --- |
| `def load(paths: list):` | `def load(paths: List[Path]) -> List[ImageArray]:` |
| `def solve(matrix, vector):` | `def solve(matrix: NDArray[np.float64], vector: NDArray[np.float64]) -> NDArray[np.float64]:` |
| `points: np.ndarray` | `points: NDArray[np.float32]  # (n_points, 3), camera frame, metres` |
| `config: dict` | `config: Dict[str, str]` |
| `def read(path: str):` | `def read(path: Path) -> str:` |
| `os.path.join(out_dir, name)` | `output_directory / name` |

**grep:** `any`, `object`, `dynamic`, `interface{}`, functions with no return annotation; in Python
`: list`, `: dict`, `: tuple`, `np.ndarray`, `Any`, `os.path.join`, path-ish names typed `str`, `def`
lines with an unannotated parameter or no `->`. Confirm the type checker is in strict mode — a green
build under a loose config, or no `mypy`/`pyright` at all, proves nothing.

### 2 · Names mean something — no abbreviations

Spelled out. No `cfg`, `mgr`, `tmp`, `val`, `res`, `btn`, `idx`, `e`, `d`, `x`, no single letters, no
acronyms the project has not defined. Short names survive only where the language or framework
mandates them (`self`, `cls`, `id`, a documented domain acronym like `URL`).

`cfg` → `configuration`, `usrMgr` → `userManager`, `tmpRes` → `pendingResponse`,
`calc(a, b)` → `calculateTotalPrice(unitPrice, quantity)`.

### 3 · No repetition

The same logic does not exist twice. Two identical blocks, two callers re-implementing one rule, two
constants holding one value, two functions differing only by a literal — all FAIL. Extract once, call
twice. Copies identical **today but existing for different reasons** are not duplication; say so and
say why when you let one live.

### 4 · SOLID

- **SRP** — one reason to change per unit. Parses *and* renders *and* persists FAILs.
- **OCP** — new behaviour added, not carved into an existing `switch` over types.
- **LSP** — no "not supported" throw, no strengthened precondition, no weakened postcondition.
- **ISP** — no consumer depending on methods it never calls.
- **DIP** — high-level code depends on an abstraction, not a concrete class it constructs itself.

### 5 · Single entry

Each module or feature exposes **exactly one** way in; everything else is internal. No second function
doing the same job by another route, no caller reaching past the entry, no "convenience" wrapper that
becomes a parallel path and drifts. `api.ts` exporting both `send()` and `sendWithRetry()` FAILs.

### 6 · Test driven

Behaviour arrives with a test that would fail without it:

- a test exists for every behaviour the target adds or changes;
- it asserts **behaviour**, not implementation — no asserting on private calls, no mocking the thing
  under test;
- it fails when the change is reverted; if you cannot show that, it is decoration;
- the risky path is covered, not only the happy one.

Tests written afterwards still pass. No test at all does not.

### 7 · Function names are verbs

Imperative verb first: `calculateTotal`, `fetchUser`, `validateInput`. Not `totalCalculation`, not
`userData`, not `inputValidator` for a function. Class names are nouns; their methods are still verbs.

### 8 · Variable names are nouns

`activeUser`, `retryCount`, `parsedResponse`. Not `getUser`, not `processing`, not a bare verb.

### 9 · Booleans start with is / has / can

Every boolean — variable, field, property, predicate — is prefixed `is`, `has`, `can`, `should` or
`was`. `active`, `permission`, `flag`, `status`, `state` FAIL.

### 10 · No magic numbers or strings

Every meaningful literal is a named constant, declared once at the boundary that owns it and reused —
the same constant in two files is also a rule 3 violation. `86400`, `0.15`, `3`, `"pending"`,
`"application/json"`, `"#ff0000"`, a raw route path in logic: all FAIL.

| Bad | Good |
| --- | --- |
| `if (retries > 3)` | `if (retryCount > MAX_RETRY_COUNT)` |
| `setTimeout(fn, 86400000)` | `setTimeout(fn, ONE_DAY_IN_MILLISECONDS)` |
| `status === "pending"` | `status === OrderStatus.Pending` |
| `price * 0.15` | `price * VAT_RATE` |

**Allowed bare:** `0`, `1`, `-1` meaning exactly nothing/one/last, the empty string, and a literal in
a test that *is* the point of the test.

**Secrets invert the fix.** An API key, token, password, private key, webhook secret or connection
string as a literal is a rule 10 hit, but naming it fixes nothing — `const API_KEY = "sk-live-…"` is
the same secret with a tidier label, and moving it to `constants.ts` spreads it. It must come from the
environment or a secret store, and only the user knows which, so it is a `NEEDS DECISION`, not an edit.
Say in that line that the value is live in the file and that rotating it is the user's call. Do not
move it, do not rename it, never paste the value into the output.

**grep:** numeric literals outside constant declarations; string literals compared with `==`/`===`/
`switch` or passed as a mode/kind/status argument. Separately for secrets: `key`, `secret`, `token`,
`password`, `passwd`, `apikey`, `connection string`, `sk-`, `AKIA`, `Bearer `, `-----BEGIN`.

### 11 · Blank lines separate blocks, never code

**No blank lines between statements inside a body.** When a run of lines wants a blank line above it
to say "this part is a different job", that run *is* a different job — extract it into a named
function. The blank line is not the fix; the function is.

Around a control block the spacing is fixed, and it is the only spacing there is:

- **One blank line after** every `if`/`else`/`for`/`foreach`/`while`/`do`/`switch`/`try`/`using`/
  `lock` block, after the closing brace.
- **No blank line before** one.
- Nothing after the closing brace of the *enclosing* body — a block that is last in its parent closes
  straight into `}`.
- Chained parts stay glued: `} else if (…) {`, `} catch {`, `} finally {`.
- Never two blank lines in a row, anywhere.

One blank line between top-level members is normal. This rule is about the inside of a body.

| Bad | Good |
| --- | --- |
| `var total = 0;`<br>` `<br>`var count = items.Count;` | `var total = 0;`<br>`var count = items.Count;` |
| `var user = Load(id);`<br>` `<br>`if (user.IsActive)`<br>`{ … }` | `var user = Load(id);`<br>`if (user.IsActive)`<br>`{ … }` |
| `if (isReady)`<br>`{ … }`<br>`Send(payload);` | `if (isReady)`<br>`{ … }`<br>` `<br>`Send(payload);` |
| a 40-line body split into three parts by blank lines | three named functions called in order |

**grep:** a blank line whose next non-empty line is `if`/`for`/`while`/`switch`/`try`/`foreach`; a `}`
closing a control block whose next line is neither blank, nor `}`, nor a chained
`else`/`catch`/`finally`; any other blank line inside a function body. Every hit of the last kind is
two edits — the blank line goes, and the run it split becomes its own function.

### 12 · Idiomatic — write the language, not a translation of another one

**Does the language already have a built-in way to say this, and did the author use it?** A C loop
transliterated into Python, a jQuery reflex inside Vue, a Java factory bolted onto TypeScript: all
FAIL. The standard library and the framework are part of the language; hand-rolling what they ship is
this rule and rule 3 both.

**Idiomatic is not clever.** A comprehension nested three deep, an unreadable LINQ chain, a one-liner
needing a comment to decode — those FAIL under this same rule.

**Rule 13 outranks this one.** `?.`, `??` and null-conditional access read as idiomatic and are still
defensive guards; where 13 says delete, they are deleted rather than modernised. Never "fix" an `&&`
chain into `?.` — first check whether the value can legitimately be absent at all.

Per-language detail: the file table in `SKILL.md` section 1. For a language with no file, apply the
above directly and say in one line that you judged idiom without a reference.

**grep:** name each file's language and framework, read the matching idiom file, grep its tell-tale
non-idioms. Then ask of the biggest function in the file: *how would a fluent native write this?*

### 13 · No defensive guards — let it fail loudly

A bug that throws gets found. A bug wrapped in a null check becomes a silent wrong result three layers
away. Code does not defend itself against its own callers.

FAIL:

- **A null/`None`/`nullptr` check on a value that should never be null.** Trust the contract, let the
  dereference throw.
- **`try`/`catch` that swallows** — an empty catch, a catch that logs and continues, a catch returning
  a default, `except Exception: pass`, `catch { }`, `?.` sprinkled over an internal object.
- **A fallback that hides a missing value** — `?? 0`, `|| ""`, `.get(key, None)` followed by a branch
  pretending the key was optional, a `GetComponent<T>()` result ignored when absent.
- **Re-validating what the caller guaranteed**, and the `if (list != null && list.Count > 0)` reflex
  around a list that is always constructed.
- **A guard with no handling behind it** — `if (thing == null) return;` at the top of a method that is
  meaningless without `thing`. That is a crash moved somewhere harder to find.

The most you may add is a **log that does not change control flow**: log, then let it propagate or
rethrow unchanged. Log-and-rethrow passes; log-and-return does not.

**PASS:** a boundary with a genuinely untrusted or unreliable source — network, disk and other IO,
hardware, a parsed file, user input, a third-party API, a cross-process message. There failure is
expected, so it is handled explicitly: validate once at the boundary, convert to a typed error or
domain result, and everything inside then trusts its inputs. Also PASS: a check that *is* the business
rule (`if (balance < amount) throw new InsufficientFunds()`), cleanup that does not swallow
(`finally`, `using`, `with` — rule 17), and assertions or fail-fast checks that **throw**.

| Bad | Good |
| --- | --- |
| `if (user == null) return;` | use `user` — a null here is a bug worth crashing on |
| `try { Parse(); } catch { }` | let `Parse` throw |
| `catch (Exception e) { Log(e); return null; }` | `catch (Exception e) { Log(e); throw; }` |
| `except Exception: pass` | no `except`, or `except FileNotFoundError:` at the IO boundary |
| `var speed = config?.Speed ?? 0f;` | `var speed = configuration.Speed;` |
| `if (target != null) target.Hit();` | `target.Hit();` |
| `GetComponent<Rigidbody>(); if (rb == null) return;` | `[RequireComponent]`, then use it |

**grep:** `!= null`, `is null`, `== None`, `?.`, `??`, `||` defaults, `catch`, `except`, `try:`,
`.get(` with a default, `if (…) return;` early exits. For each: **can this value legitimately be
absent, from a source outside our control?** Yes at a real IO/hardware/user boundary → PASS. Anything
else → FAIL, and the fix is deletion.

Deleting a guard converts a silent wrong answer into a loud crash. If the suite goes red on one, that
is the rule working — report `NEEDS DECISION` with the failure, do not reinstate the guard.

### 17 · Everything opened is closed

Whatever a unit starts, it stops when the unit goes away. A listener nobody removes keeps its closure
alive, a timer nobody clears fires into a dead object, a response landing after teardown writes state
that no longer exists. A background service leaks exactly the way a component does.

Each needs a matching teardown in the same file, near where it was opened:

- **`addEventListener` → `removeEventListener`** with the *same* function reference. An inline arrow
  can never be removed — hoist to a named handler, or use `AbortController` and `{ signal }`.
- **`setInterval` → `clearInterval`, `setTimeout` → `clearTimeout`, `requestAnimationFrame` →
  `cancelAnimationFrame`.**
- **Subscriptions → unsubscribe / dispose** — event bus, store watcher, RxJS subscription, websocket,
  `ResizeObserver`/`IntersectionObserver`/`MutationObserver` (`.disconnect()`), `matchMedia`.
- **In-flight requests → abort on teardown**, so a response cannot resolve into an object that is
  gone. A `then` writing state after teardown FAILs even when the framework only warns.
- **Native and unmanaged resources → released** — file handles, sockets, database connections,
  `IDisposable` (`using`), `createObjectURL` → `revokeObjectURL`, Unity `RenderTexture`/`Material`
  instances/`NativeArray`, an OpenCV `VideoCapture`, a `torch` hook.

Where the teardown lives is the framework's answer: `onUnmounted`/`onScopeDispose` in Vue, the
`useEffect` cleanup return in React, `onDestroy` in Svelte, `OnDisable`/`OnDestroy` in Unity,
`Dispose`/`using` in C#, `with` or `try/finally` in Python, `defer` in Go. A teardown in the wrong
hook — one that never fires, or fires on every re-render — is the same FAIL as no teardown.

Two more shapes: **the conditional teardown** (registration unconditional, removal behind an `if`, so
one path leaks) and **the re-registration** (a hook adding a listener on every prop change without
removing the previous one; check the dependency list and the teardown together).

| Bad | Good |
| --- | --- |
| `onMounted(() => window.addEventListener("scroll", () => …))` | named handler, removed in `onUnmounted` |
| `setInterval(poll, MS)` with no handle kept | keep the id, `clearInterval(pollTimerId)` on teardown |
| `useEffect(() => { subscribe(onMessage) }, [])` | `return () => unsubscribe(onMessage)` |
| `fetch(url).then(setData)` | `fetch(url, { signal })`, `controller.abort()` on teardown |
| `new ResizeObserver(…)` never disconnected | `observer.disconnect()` on teardown |
| `OnEnable` subscribes, nothing in `OnDisable` | mirror every `+=` with a `-=` |

**grep:** `addEventListener`, `setInterval`, `setTimeout`, `requestAnimationFrame`, `subscribe(`,
`\.on(`, `new .*Observer`, `createObjectURL`, `+=` on a C# event, `open(` without `with` in Python —
find each hit's partner in the same file. Then grep the teardown hooks (`onUnmounted`, `useEffect`
returns, `onDestroy`, `OnDisable`, `Dispose`) and check nothing registered is missing. A file with
registrations and no teardown hook at all is the loudest version of this FAIL.

### 18 · No dead code

Code nothing reaches is still read, trusted, searched, refactored and kept compiling. Fix is deletion:

- an **unused export, function, class, method, field or constant** with no caller anywhere in the
  repository — check the whole repo, not just the target;
- an **unused import**, unused local, or unused parameter no overload or interface requires;
- **commented-out code** of any age, with or without a `// TODO: bring this back`;
- an **unreachable branch** — code after an unconditional `return`/`throw`, a condition that cannot be
  false, a `case` no value can take, an `if (false)` left from debugging;
- a **feature flag fully on or fully off long enough that one side never runs** — the dead branch goes
  and so does the flag.

**Not dead, so kill in the verify pass rather than deleting:** a public API consumed outside the
repository (a published package, a plugin surface, something reflection or serialisation reaches by
name), and a parameter mandated by an interface, framework signature or Unity/Qt-style callback. If
you cannot establish which, it is a `NEEDS DECISION`.

**grep:** run what the project has — `ts-prune`, `knip`, eslint `no-unused-vars`, `vulture`,
`ruff F401`, compiler unused warnings. Then grep the repository for each exported name the target
defines and count call sites. For commented-out code, comment lines ending in `;`, `)`, `{` or `:`.

### 19 · No hidden mutation

A function that quietly rewrites what it was handed, or writes state its signature never mentions, is
a bug that appears at the second call site. Same family as rule 13: make the effect visible or do not
have it.

FAIL:

- **Mutating an argument in place** while name and return say otherwise — `points[:] = …` inside
  `normalize(points)`, `items.push(…)` on a caller's list, `Object.assign(target, …)` on an argument,
  `.sort()` on a caller's array instead of `[...items].sort()`.
- **Writing module-level or global mutable state** from a function that reads as a calculation — a
  module-scope `dict`/`Map` accumulating entries, a static counter, a singleton mutated from three
  places.
- **A mutable default argument** — `def append_to(item, target=[])`.
- **A getter, property or `computed` with a side effect** — anything named `get…`, `is…` or `total`
  that writes, caches into shared state, fires a request, or logs at a level someone depends on.
- **Returning an internal collection by reference**, so callers mutate private state from outside.

**PASS:** a method mutating **its own object's** fields; a builder or accumulator whose declared job
is to be filled; an explicitly named in-place operation (`sortInPlace`, `normalize_inplace`, numpy's
`out=`); performance-critical code where copying is genuinely the bottleneck and a comment says so.

Fix is one of three, first preferred: copy before modifying and return the copy; rename so the
mutation is declared (`sortItems` → `sortItemsInPlace`); lift shared state into an explicit parameter.

**grep:** for every function taking a collection or object, whether it writes to that parameter —
`.push(`, `.pop(`, `.splice(`, `.sort(`, `.reverse(`, `Object.assign(`, `[:] =`, `.update(`,
`.append(` on a parameter name; assignments to module-scope names inside functions; `=[]`/`={}`/
`=dict()` in Python signatures; `get`/`@property` bodies assigning to `self`/`this`.

### 20 · Errors carry what broke

Rule 13 says fail loudly; this is the other half — **loud is not informative.** The stack trace says
where; the message says what.

FAIL:

- **A message with no value in it** — `"invalid input"`, `"failed"`, `"error occurred"`. The offending
  value goes in: `f"expected 3 channels, got {array.shape[-1]} for {path}"`.
- **A bare base type where a specific one exists** — `throw new Error(…)`, `raise Exception(…)`,
  `throw new ApplicationException(…)`. Use `ValueError`, `KeyError`,
  `ArgumentOutOfRangeException`, `TypeError`, or a domain type the caller can catch.
- **A boundary leaking its internals upward** — a `SqlException` or `HTTPError` escaping into domain
  code. Convert at the boundary; the original goes in `cause`/`from`/`innerException`, never dropped.
- **A rethrow that erases the original** — `raise ValueError(str(e))`, `throw new Error(e.message)`,
  `throw ex;` in C# (resets the stack trace — `throw;` does not).
- **A secret, token, password or credential in the message**, or a whole request body or user record.
  Enough context to locate the failure, not enough to become an incident.
- **A message describing the recovery instead of the fault** — `"please try again"`.

**Where it stops:** one sentence with the offending values, not a paragraph with a suggested fix and a
link. A `catch` that only improves the message before rethrowing is fine; one that improves it and
returns is a rule 13 FAIL.

| Bad | Good |
| --- | --- |
| `raise Exception("bad shape")` | `raise ValueError(f"expected (n, 3), got {points.shape}")` |
| `throw new Error("not found")` | `throw new UserNotFoundError(userId)` |
| `except SqlError as e: raise ValueError(str(e))` | `raise RepositoryError(f"loading user {user_id}") from e` |
| `catch (Exception ex) { throw ex; }` | `catch (Exception) { throw; }` |
| `throw new Error(\`auth failed: ${apiKey}\`)` | `throw new AuthError(\`auth failed for ${userId}\`)` |

**grep:** `Error("`, `Exception("`, `raise Exception`, `throw new Error` — read every message literal
and ask whether it names a value. Then `str(e)`, `e.message`, `throw ex;`, and message strings
containing `key`, `token`, `password`, `secret`.

### 21 · Comments say why, not what

A comment restating the line above it is a second copy of the code that nobody updates, so it drifts
and starts lying. The code says *what*; a comment earns its place by carrying what the code cannot.

FAIL:

- **The restatement** — `// increment the counter` above `counter++`; a docstring repeating the
  signature in prose.
- **The comment that contradicts the code.** Whichever is right, the pair FAILs; fix the code if the
  comment holds the intent, the comment if the code is right, `NEEDS DECISION` if you cannot tell.
- **The stale marker** — `// TODO`/`FIXME`/`HACK` with no owner, date or issue reference. Give it a
  reference or delete it.
- **The section banner** — `// ---- validation ----` inside a function body. That is rule 11's blank
  line wearing a hat: the section it marks is a separate function.
- **Commented-out code** — already rule 18, deleted there.
- **Noise headers** — a generated `@param` block repeating typed parameters, a changelog in the file
  header, a name-and-date stamp version control already holds.

PASS, and worth keeping: **why this way** (`// binary search: sorted by the caller, up to 10⁶
entries`); **why not the obvious way** (`// not Promise.all: the API rate-limits above 5 concurrent`);
**an external constraint** (a spec section, an RFC, a hardware quirk, a vendor bug with a link); **a
non-obvious unit or frame**; **a public API docstring** stating contract, units, raised errors and
ownership of returned data.

Deletion is not a loss: a comment removed because the code already says it costs nothing, while one
kept in case it is useful costs a reader on every visit.

| Bad | Good |
| --- | --- |
| `// set the user to active` above `user.isActive = true` | delete the comment |
| `// TODO: fix later` | `// TODO(#412): remove once the v2 endpoint ships` |
| `// ---- parsing ----` inside a function | extract `parseHeader()` |
| `// wait 500ms` above `sleep(500)` | `// the device NACKs anything sent under 400ms after reset` |

**grep:** `TODO`, `FIXME`, `HACK`, `XXX`; comment lines whose words are the identifiers on the next
line; `@param`/`@returns` blocks adding nothing to a typed signature. Then read every remaining
comment and ask whether deleting it loses information the code does not already carry.

### 22 · No flag parameters

`render(true, false)` tells the reader nothing at the call site, and naming inside the function does
not fix it because the reader is looking at the call. A boolean parameter is usually two functions
glued together, and the `if (isCompact)` in the body is the seam.

FAIL:

- **A boolean parameter selecting behaviour** — `save(user, true)`. Split into two named functions,
  take an enum, or take an options object with named fields.
- **Two or more positional booleans in a row.**
- **A "mode" or "kind" string parameter** — `export(data, "csv")`. That is an enum (rule 10 too).
- **More than four parameters.** Past four the reader counts positions. Use a parameter object,
  `@dataclass` or `record` — which usually reveals three of them always travelled together.
- **A parameter only read on one branch** — it belongs to the branch, not the signature.

**PASS:** genuinely data rather than a switch (`setEnabled(isEnabled)`, `setVisible(isVisible)`); a
language forcing named arguments at the call site (Python keyword-only after `*`, Swift labels, C#
named arguments used consistently); an interface or framework signature that mandates it.

| Bad | Good |
| --- | --- |
| `save(user, true)` | `saveDraft(user)` / `savePublish(user)` |
| `export(data, "csv")` | `export(data, ExportFormat.Csv)` |
| `createUser(name, email, true, false, null)` | `createUser({ name, email, isAdmin, hasNewsletter })` |
| `def fetch(url, retry, cache, verbose):` | `def fetch(url: str, *, options: FetchOptions) -> Response:` |

**grep:** call sites with a bare `true`/`false`/`True`/`False`/`null`/`None` argument; `def`/`function`
lines with more than four parameters; string literals passed in and then compared inside the body.

### 23 · No floating promises

An async call nobody awaits and whose failure nobody catches loses the error entirely — an unhandled
rejection in a log nobody reads, or in some runtimes nothing at all. The exact silence rule 13 exists
to prevent, through a different door.

FAIL:

- **A promise-returning call with no `await`, no `return`, no `.catch`** — `saveDraft(document)` on
  its own line; `void saveDraft(document)` too, unless a comment says why.
- **`async` passed where a sync callback is expected** — `array.forEach(async item => …)` (promises
  escape, the loop does not wait), `setTimeout(async () => …)`, an async handler passed where the
  return value is ignored.
- **`async void` in C#** anywhere but an event handler; a fire-and-forget `Task` with no continuation.
- **A Python coroutine called without `await`**, or `asyncio.create_task(…)` whose handle is discarded
  so exceptions vanish at garbage collection.
- **A background task with no failure path.** Deliberate fire-and-forget is allowed but must be
  explicit: keep the handle, attach a failure handler that logs, and one comment saying it is
  intentional (a rule 21 PASS — that is a why).

The fix is nearly always one word: `await` it, or `return` it so the caller's `await` covers it.

| Bad | Good |
| --- | --- |
| `saveDraft(doc);` | `await saveDraft(doc);` |
| `items.forEach(async item => await send(item))` | `await Promise.all(items.map(item => send(item)))` |
| `async void SaveAsync()` | `async Task SaveAsync()`, awaited by the caller |
| `asyncio.create_task(sync_all())` | keep the task, `await` it or add a done-callback that logs |

**grep:** enable `@typescript-eslint/no-floating-promises` and `no-misused-promises` if the repo has
eslint, and ruff `RUF006`/`ASYNC`. Then `async` inside `forEach`/`map` without `Promise.all`,
`async void`, `create_task(` without an assignment, and statement lines calling a known async function
with no `await`.

### 24 · Time, randomness and identity come from outside

`new Date()`, `Math.random()`, `uuid4()`, `Guid.NewGuid()` inside business logic make it untestable —
you cannot assert on a value the function invented, so rule 6's test either does not exist or asserts
nothing. Also unrunnable in the past, unreproducible after a bug, and timezone-dependent in ways
nobody notices until a midnight release.

FAIL:

- **A clock read inside a calculation** — `if (order.dueAt < new Date())`, `datetime.now()` in a
  pricing rule, `Time.time` inside game logic a test calls.
- **Randomness inside logic** — a shuffle, sample, jitter, or retry backoff that cannot be seeded.
- **Identity minted deep inside** — a `uuid` generated three layers down, so the caller cannot know
  what id was used and the test cannot fix it.
- **A naive local timestamp crossing a boundary** — `datetime.now()` rather than
  `datetime.now(timezone.utc)`, a `DateTime.Now` stored in a database, a date formatted for display in
  the layer that computes it.

Fix: take the clock, random source or id factory as a parameter or constructor dependency (rule 4's
DIP), default it at the composition root, inject a fixed one in tests. Smallest version is a single
`now: () => Date` parameter — no framework required.

| Bad | Good |
| --- | --- |
| `if (dueAt < new Date())` | `isOverdue(order, now)` with `now` passed in |
| `def price(order): today = date.today()` | `def price(order: Order, today: date) -> Decimal:` |
| `id = uuid4()` deep in a repository | mint at the entry point, pass it down |
| `datetime.now()` stored | `datetime.now(timezone.utc)` |
| `random.shuffle(items)` | `rng.shuffle(items)` with an injected, seedable `rng` |

**PASS:** the composition root, an entry point, a logger, a view rendering the current time, and
`Time.deltaTime` in Unity's own `Update` loop.

**grep:** `new Date(`, `Date.now(`, `datetime.now`, `date.today`, `DateTime.Now`, `Math.random`,
`random.`, `uuid`, `Guid.NewGuid`, `System.currentTimeMillis` — for each, does it sit at an entry
point, or inside logic a test would want to pin?

### 25 · Untrusted input is never interpolated

Rule 13 draws the trusted/untrusted boundary; this rule says what happens when such a value goes
somewhere that interprets it — a query, a shell, a path, an HTML document, a template, a redirect.
**The value is passed as data, never assembled into the sentence.**

FAIL, in every language:

- **SQL by concatenation or interpolation** — `"SELECT … WHERE id = " + userId`,
  `f"… WHERE name = '{name}'"`, a `.raw()` call with a variable. Parameterised queries always; where
  an identifier must vary (a column name, a sort direction) it comes from a fixed allow-list.
- **Shell commands built from strings** — `os.system(f"convert {path}")`, `exec("git " + branch)`,
  `shell=True` with a variable. Pass an argument list; do not spawn a shell.
- **HTML assembled from values** — `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, a template
  engine's raw-output marker, a string-built `<script>` tag. Set text, bind a property, or sanitise
  with a real library at the one place the value enters.
- **A path built from user input** — `uploads/ + filename` with no normalisation, so `../../etc` walks
  out. Resolve, then verify the result is inside the intended directory.
- **A redirect, origin check or URL built from a parameter** without an allow-list.
- **A regex compiled from user input**, and a regex with nested quantifiers applied to user input (a
  denial of service that looks like a hang).
- **Deserialisation of untrusted bytes into arbitrary types** — `pickle.loads`, `eval`, `JSON.parse`
  into a shape nobody validates, `BinaryFormatter`.

**Trust is neither transitive nor permanent.** A value from a request, queue message, file, webhook or
another service is untrusted at every layer it reaches, not just the first. A value read back out of
your own database is untrusted if a user ever wrote it.

**Validate at the boundary, once** — where rule 13 allows a guard. Convert to a typed value there
(`UserId`, `Email`, `SafePath`); downstream trusts the type instead of re-checking the string.

| Bad | Good |
| --- | --- |
| `f"SELECT * FROM users WHERE id = {user_id}"` | `cursor.execute("… WHERE id = %s", (user_id,))` |
| `os.system(f"rm {path}")` | `subprocess.run(["rm", str(path)], check=True)` |
| `element.innerHTML = comment` | `element.textContent = comment` |
| `v-html="post.body"` | render text, or sanitise once on ingest |
| `open(UPLOAD_DIR + filename)` | `(UPLOAD_DIR / filename).resolve()`, then assert it is under `UPLOAD_DIR` |
| `res.redirect(req.query.next)` | redirect only to a path from a known allow-list |

**grep:** `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `eval(`, `exec(`, `os.system`,
`subprocess` with `shell=True`, `pickle.loads`, `.raw(`, `execute(` with an f-string or a `+`, string
concatenation next to `SELECT`/`INSERT`/`UPDATE`/`DELETE`, path joins whose right side is a variable.
For each hit, trace the value back to where it entered the process.

**This is the one rule where an uncertain finding is still reported.** If you cannot establish a value
is trusted, say so as a `NEEDS DECISION` rather than dropping it in the kill pass.

### 26 · Dependencies point one way

Modules form either a layered graph or a knot, and a knot cannot be tested, understood or extracted in
pieces. Rule 4's DIP made concrete and greppable.

FAIL:

- **A cycle** — `A` imports `B` imports `A`, directly or through three files. Some bundlers tolerate
  it silently until an initialisation order changes and a value is `undefined` at import time.
- **An inward-pointing import that should point outward** — domain or business code importing the UI,
  the ORM, the HTTP framework, the logger implementation. Invert it: the inner layer declares an
  interface, the outer layer implements it.
- **A layer skipped** — a view reaching straight into the database client, a controller importing a
  repository's internals rather than going through the service (rule 5 too).
- **A sibling reaching sideways into another feature's internals** — `features/billing/…` importing
  `features/auth/internal/tokenStore`. Cross-feature traffic goes through that feature's one public
  entry (rule 5) or a shared module both depend on.
- **A shared "utils" or "common" module importing from the features that use it** — the cycle again,
  wearing a helpful name.

Fix is one of three: invert behind an interface, move the shared thing down into a module both sides
may depend on, or merge two modules that were never separate. Usually obvious from the direction the
data flows; when it is not, `NEEDS DECISION`.

| Bad | Good |
| --- | --- |
| `domain/order.ts` imports `db/prismaClient` | `domain` declares `OrderRepository`, `infra` implements it |
| `utils/format.ts` imports `features/cart` | move the formatter into `features/cart` |
| `UserService` ↔ `NotificationService` | one raises an event the other subscribes to |
| a view imports `axios` and calls the API directly | the view calls a service; the service owns the client |

**grep:** run what the repo has — `madge --circular`, `dependency-cruiser`, `import-linter`,
`eslint-plugin-import/no-cycle`, a compiler's circular-reference warning. Then read each target file's
import block and ask per line: **is this import pointing outward from the core, or inward toward it?**
Inward is the FAIL.
