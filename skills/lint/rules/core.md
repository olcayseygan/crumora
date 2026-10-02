# core rules

Language-independent, applied to every file in the target. Rules are addressed by **name** — in the
output line and in every cross-reference below — never by number. Never rename one. Each heading carries
the level that first enables the rule; the fix order lives in `SKILL.md`.

---

## floor — runs at every level

### injection — untrusted input is never interpolated · floor

A value that reaches something that interprets it is passed as data, never assembled into the sentence.

FAIL: SQL by concatenation, interpolation or `.raw()` with a variable — parameterise, and a varying
identifier (column, sort direction) comes from a fixed allow-list. Shell commands built from strings or
`shell=True` with a variable — pass an argument list, spawn no shell. HTML from values via `innerHTML`,
`dangerouslySetInnerHTML`, `v-html`, a raw-output template marker or a string-built `<script>`. A path
built from user input without resolving it and verifying it stays inside the intended directory. A
redirect, origin check or URL built from a parameter without an allow-list. A regex compiled from user
input, or one with nested quantifiers applied to it. Deserialising untrusted bytes into arbitrary types
(`pickle.loads`, `eval`, unvalidated `JSON.parse`, `BinaryFormatter`).

A value from a request, queue, file, webhook or another service is untrusted at every layer it reaches;
a value read from your own database is untrusted if a user ever wrote it. Validate once at the boundary
and convert to a typed value (`UserId`, `SafePath`) that downstream trusts.

The one rule where an uncertain finding is still reported: if you cannot establish a value is trusted,
it is a `NEEDS DECISION`, not dropped.

The secrets clause of `literals` is the other half of the floor.

---

## lite — the surface pass

### names — names mean something, no abbreviations · lite

Spelled out. No `cfg`, `mgr`, `tmp`, `val`, `res`, `btn`, `idx`, `e`, `d`, `x`, no single letters, no
acronyms the project has not defined, no type suffixes (`userList`, `nameString`, `configDict`). Short names survive only where the language or framework mandates
them — `self`, `cls`, `id`, a documented domain acronym like `URL`.

### verbs — function names are verbs · lite

Imperative verb first: `calculateTotal`, not `totalCalculation`. Class names are nouns; their methods are
still verbs.

### nouns — variable names are nouns · lite

`activeUser`, `retryCount` — not `getUser`, `processing` or a bare verb.

### booleans — booleans start with is / has / can · lite

Every boolean — variable, field, property, predicate — is prefixed `is`, `has`, `can`, `should` or
`was`.

### literals — no magic numbers or strings · lite

Every meaningful literal is a named constant, declared once at the boundary that owns it — the same
constant in two files is also `repetition`. Numbers, status/mode strings, MIME types, colours and raw
route paths in logic all FAIL. Allowed bare: `0`, `1` and `-1` meaning nothing, one and last; the empty
string; a literal in a test that *is* the point of the test. The constant's case follows the language's
idiom file.

**Secrets — part of the floor, checked at every level.** An API key, token, password, private key,
webhook secret or connection string as a literal is a `literals` hit that naming does not fix. It must
come from the environment or a secret store, and only the user knows which, so it is a
`NEEDS DECISION`, not an edit. Say in that line that the value is live in the file and rotating it is the
user's call. Do not move it, do not rename it, never paste the value into the output.

### comments — comments say why, not what · lite

FAIL: a restatement of the code, or a docstring repeating the signature in prose; a comment that
contradicts the code — fix the code if the comment holds the intent, the comment if the code is right,
`NEEDS DECISION` if you cannot tell; a `TODO`/`FIXME`/`HACK` with no owner, date or issue reference — add
one or delete it; a section banner inside a function body — extract the section into a function;
commented-out code — `dead-code` deletes it; noise headers (`@param` blocks repeating typed parameters,
file-header changelogs, name-and-date stamps).

PASS: why this way, why not the obvious way, an external constraint (spec, RFC, hardware quirk, vendor
bug), a non-obvious unit or frame, and a public API docstring stating contract, units, raised errors and
ownership of returned data.

### spacing — blank lines separate blocks, never code · lite

**One blank line where a thought ends, none inside one.** A blank line splitting statements that belong
to one step FAILs, and so does a run of separate steps with nothing between them. Never two blank lines
in a row. A block that is last in its parent closes straight into `}`, and chained parts stay glued
(`} else if (…) {`, `} catch {`, `} finally {`). One blank line between top-level members is normal.

---

## full — everything behavioural, on top of lite

### types — everything is typed · full

Every parameter, return, field and exported binding carries a declared type. No `any` or implicit `any`,
no untyped `dict`/`object`/`Dictionary` standing in for a shape, no `var` where the initialiser does not
make the type obvious, no untyped `**kwargs` crossing a public boundary.

**Python is stricter.** Containers use the built-in generics (PEP 585) — `list[str]`,
`dict[str, int]`, `tuple[int, int]`, `set[str]`, `User | None`, `Callable[[int], str]` from
`collections.abc` — so a container with no element type (`list`, `dict`) FAILs, and so does the legacy
`typing.List`/`Dict`/`Optional` spelling. numpy carries dtype
(`NDArray[np.float64]`), so bare `np.ndarray` and dtype-less `NDArray` FAIL; `float32` and `float64` are
different contracts. Shape and axis count are written as a comment next to the annotation —
`# (batch, height, width, 3)` — and a shape used twice becomes an alias,
`ImageArray = NDArray[np.uint8]  # (h, w, 3), BGR, 0-255`. `torch.Tensor` states dtype, device and shape,
`pd.DataFrame` states its column contract, and a fixed-key dict is a `TypedDict`. `Any` FAILs, including
the implicit `Any` of an unannotated parameter or missing return — write `-> None`.

A path is a `Path`, never a `str`, in every language: `os.path.join`, `+ "/" +` and `f"{dir}/{name}"`
FAIL. Widen to `str | Path` at one entry boundary only, convert immediately.

Confirm the type checker runs in strict mode — a green build under a loose config, or no checker at all,
proves nothing.

### repetition — no repetition · full

The same logic does not exist twice: identical blocks, two callers re-implementing one rule, two
constants holding one value, two functions differing only by a literal. Copies identical today but
existing for different reasons are not duplication — say why when you let one live.

### idiom — write the language, not a translation of another one · full

Use the built-in way the language, standard library or framework already ships; hand-rolling it is this
rule and `repetition` both. Idiomatic is not clever: a three-deep comprehension, an unreadable LINQ
chain or a one-liner that needs a comment to decode FAIL too. Per-language detail lives in
`rules/idiom/*.md`.

**`guards` outranks this one.** Never "fix" an `&&` chain into `?.` — first check whether the value can
legitimately be absent at all.

### guards — no defensive guards, let it fail loudly · full

Code does not defend itself against its own callers.

FAIL: a null/`None`/`nullptr` check on a value that should never be null — trust the contract and let
the dereference throw; a `try`/`catch` that swallows (empty, log-and-continue, return-a-default,
`except Exception: pass`, `?.` over an internal object); a fallback hiding a missing value (`?? 0`,
`|| ""`, `.get(key, None)` then a branch, an ignored-when-absent `GetComponent<T>()` — use
`[RequireComponent]`); re-validating what the caller guaranteed; an early `return` on a value the method
is meaningless without.

The most you may add is a **log that does not change control flow**: log-and-rethrow passes,
log-and-return does not.

PASS: a boundary with a genuinely untrusted or unreliable source — network, disk and other IO, hardware,
a parsed file, user input, a third-party API, a cross-process message — validated once and converted to
a typed error or domain result; a check that *is* the business rule; cleanup that does not swallow
(`teardown`); assertions and fail-fast checks that **throw**.

The test per hit: can this value legitimately be absent, from a source outside our control? Yes at a real
boundary is a PASS; anything else is a FAIL and the fix is deletion. If the suite goes red on a deleted
guard, report `NEEDS DECISION` with the failure — do not reinstate the guard.

### teardown — everything opened is closed · full

Whatever a unit starts, it stops when the unit goes away, in the same file, near where it was opened:
listeners (removed with the *same* function reference — hoist inline arrows or use `AbortController`),
timers and animation frames, subscriptions and observers, in-flight requests (aborted, so no `then`
writes state after teardown), and native or unmanaged resources (handles, sockets, connections,
`IDisposable`, `createObjectURL`, Unity `RenderTexture`/material instances/`NativeArray`, `VideoCapture`,
`torch` hooks).

The teardown lives in the framework's hook for it; one in a hook that never fires, or fires on every
re-render, is the same FAIL. Also FAIL: a teardown behind an `if` that one path skips, and a listener
re-registered on every prop change without removing the previous one. A file with registrations and no
teardown hook at all is the loudest version.

### dead-code — no dead code · full

Delete: an unused export, function, class, method, field or constant with no caller anywhere in the
**repository** (check the whole repo, not just the target); an unused import, local, or parameter no
overload or interface requires; commented-out code of any age; an unreachable branch; a feature flag
fully on or off long enough that one side never runs — the dead branch and the flag both go. Use the
project's own unused-code tools where it has them.

Not dead: a public API consumed outside the repository (published package, plugin surface, reached by
reflection or serialisation by name) and a parameter mandated by an interface, framework signature or
callback. Cannot tell which → `NEEDS DECISION`.

### mutation — no hidden mutation · full

FAIL: mutating an argument in place while name and return say otherwise (including `.sort()` on a
caller's array); writing module-level or global mutable state from a function that reads as a
calculation; a mutable default argument; a getter, property or `computed` with a side effect; returning
an internal collection by reference.

PASS: a method mutating its own object's fields; a builder or accumulator whose declared job is to be
filled; an explicitly named in-place operation (`sortInPlace`, numpy `out=`); performance-critical code
where copying is the measured bottleneck and a comment says so.

Fix, first preferred: copy and return the copy; rename so the mutation is declared; lift shared state
into an explicit parameter.

### errors — errors carry what broke · full

FAIL: a message with no value in it (`"invalid input"`) when the offending value should go in; a bare
base type (`Error`, `Exception`, `ApplicationException`) where a specific or domain type exists; a
boundary leaking internals upward (`SqlException`, `HTTPError` in domain code) — convert at the boundary
and chain the original via `cause`/`from`/`innerException`; a rethrow that erases the original
(`raise ValueError(str(error))`, `throw exception;` in C#, where `throw;` keeps the stack trace); a secret, credential, whole request body or user record
in the message; a message describing the recovery (`"please try again"`) instead of the fault.

One sentence with the offending values, not a paragraph. A `catch` that improves the message and
rethrows is fine; one that improves it and returns is a `guards` FAIL.

### flags — no flag parameters · full

FAIL: a boolean parameter selecting behaviour — split into two named functions, an enum, or an options
object; two or more positional booleans in a row; a "mode" or "kind" string parameter (an enum, and a
`literals` hit too); **more than four parameters** — use a parameter object, `@dataclass` or `record`; a
parameter read on only one branch.

PASS: a boolean that is data rather than a switch (`setEnabled(isEnabled)`); named arguments the
language forces at the call site (Python keyword-only, Swift labels, C# named arguments used
consistently); a signature an interface or framework mandates.

### floating — no floating promises · full

FAIL: a promise-returning call with no `await`, `return` or `.catch` (and `void call()` unless a comment
says why); `async` passed where a sync callback is expected (`forEach(async …)`, `setTimeout(async …)`,
an async handler whose return is ignored); `async void` in C# outside an event handler, and a
fire-and-forget `Task` with no continuation; a Python coroutine called without `await`, or a discarded
`asyncio.create_task(…)` handle. Deliberate fire-and-forget is allowed only explicitly: keep the handle,
attach a failure handler that logs, and one comment saying it is intentional (a `comments` PASS).

The fix is nearly always `await` it, or `return` it so the caller's `await` covers it.

### clock — time, randomness and identity come from outside · full

FAIL: a clock read inside a calculation (`new Date()`, `datetime.now()`, `Time.time` in game logic a test
calls); unseedable randomness inside logic (shuffle, sample, jitter, retry backoff); an id minted deep
inside where the caller and the test cannot fix it; a naive local timestamp crossing a boundary —
`datetime.now()` rather than `datetime.now(timezone.utc)`, a stored `DateTime.Now`, display formatting in
the layer that computes.

Fix: take the clock, random source or id factory as a parameter or constructor dependency, default it at
the composition root, inject a fixed one in tests. A single `now: () => Date` parameter is enough.

PASS: the composition root, an entry point, a logger, a view rendering the current time, and
`Time.deltaTime` in Unity's own `Update` loop.

---

## ultra — the architecture, on top of full

These move code between files and write new ones. Expect `OUT OF TARGET` lines.

### solid — SOLID · ultra

**SRP** one reason to change per unit. **OCP** new behaviour added, not carved into a `switch` over
types. **LSP** no "not supported" throw, no strengthened precondition, no weakened postcondition. **ISP**
no consumer depending on methods it never calls. **DIP** high-level code depends on an abstraction, not a
concrete class it constructs itself.

### single-entry — one way in · ultra

Each module or feature exposes **exactly one** way in; everything else is internal. No second function
doing the same job by another route, no caller reaching past the entry, no "convenience" wrapper that
becomes a parallel path. An `api.ts` exporting both `send()` and `sendWithRetry()` FAILs.

### tests — behaviour arrives with a test · ultra

A test exists for every behaviour the target adds or changes; it asserts behaviour, not implementation
(no asserting on private calls, no mocking the thing under test); it fails when the change is reverted;
and the risky path is covered, not only the happy one. Tests written afterwards still pass. No test at
all does not.

### direction — dependencies point one way · ultra

Dependencies point inward, toward the core: an outer layer importing the core is a PASS.

FAIL: a cycle, direct or through several files; an import pointing outward from the core, such as
domain code importing the UI, the ORM, the HTTP framework or the logger implementation — invert
it so the inner layer declares an interface and the outer layer implements it; a skipped layer (a view
reaching the database client, a controller importing a repository's internals); a sibling reaching into
another feature's internals instead of its one public entry (`single-entry`) or a shared module; a
shared "utils" or "common" module importing from the features that use it.

Fix: invert behind an interface, move the shared thing down into a module both sides may depend on, or
merge two modules that were never separate. Not obvious from the data flow → `NEEDS DECISION`. Use the
project's own cycle tooling where it has it, then read each target file's import block: **does this import
point inward toward the core, or outward from it? Outward is the FAIL.**
