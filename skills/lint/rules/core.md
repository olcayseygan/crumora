# core rules

Language-independent, applied to every file in the target. `SKILL.md` holds the procedure; this file is
only the rules. Each rule states itself, then what FAILs, then what legitimately PASSes, then what to
grep.

Rules are addressed by **name**, never by number, and the name is what appears in the output line the
rule produces and in every cross-reference below. Never rename one.

The heading of each rule carries the level that first enables it. **lite** is the surface pass, **full**
adds it plus everything behavioural, **ultra** adds the architecture on top, and the **floor** runs at
every level including lite. Rules are grouped below in that order, which is not the order they are
fixed in — the fix order lives in `SKILL.md`.

---

## floor — runs at every level

### injection — untrusted input is never interpolated · floor

`guards` draws the trusted/untrusted boundary; this rule says what happens when such a value goes
somewhere that interprets it — a query, a shell, a path, an HTML document, a template, a redirect. **The
value is passed as data, never assembled into the sentence.**

FAIL, in every language: SQL by concatenation or interpolation, such as `"SELECT … WHERE id = " + userId`,
`f"… WHERE name = '{name}'"`, or a `.raw()` call with a variable — parameterised queries always, and
where an identifier must vary, such as a column name or a sort direction, it comes from a fixed
allow-list. Shell commands built from strings, such as `os.system(f"convert {path}")`,
`exec("git " + branch)`, or `shell=True` with a variable — pass an argument list and do not spawn a
shell. HTML assembled from values, through `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, a template
engine's raw-output marker, or a string-built `<script>` tag — set text, bind a property, or sanitise
with a real library at the one place the value enters. A path built from user input, such as
`uploads/ + filename` with no normalisation, so `../../etc` walks out — resolve, then verify the result
is inside the intended directory. A redirect, origin check or URL built from a parameter without an
allow-list. A regex compiled from user input, and a regex with nested quantifiers applied to user input,
which is a denial of service that looks like a hang. And deserialisation of untrusted bytes into
arbitrary types — `pickle.loads`, `eval`, `JSON.parse` into a shape nobody validates, `BinaryFormatter`.

**Trust is neither transitive nor permanent.** A value from a request, queue message, file, webhook or
another service is untrusted at every layer it reaches, not just the first. A value read back out of your
own database is untrusted if a user ever wrote it.

**Validate at the boundary, once** — where `guards` allows a guard. Convert to a typed value there
(`UserId`, `Email`, `SafePath`); downstream trusts the type instead of re-checking the string.

So `f"SELECT * FROM users WHERE id = {user_id}"` becomes `cursor.execute("… WHERE id = %s", (user_id,))`;
`os.system(f"rm {path}")` becomes `subprocess.run(["rm", str(path)], check=True)`;
`element.innerHTML = comment` becomes `element.textContent = comment`; `v-html="post.body"` becomes
rendered text, or sanitising once on ingest; `open(UPLOAD_DIR + filename)` becomes
`(UPLOAD_DIR / filename).resolve()` followed by an assertion that it is under `UPLOAD_DIR`; and
`res.redirect(req.query.next)` redirects only to a path from a known allow-list.

**grep:** `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `eval(`, `exec(`, `os.system`, `subprocess`
with `shell=True`, `pickle.loads`, `.raw(`, `execute(` with an f-string or a `+`, string concatenation
next to `SELECT`, `INSERT`, `UPDATE` or `DELETE`, and path joins whose right side is a variable. For each
hit, trace the value back to where it entered the process.

**This is the one rule where an uncertain finding is still reported.** If you cannot establish a value is
trusted, say so as a `NEEDS DECISION` rather than dropping it in the kill pass.

The secrets clause of `literals` is the other half of the floor, and it runs at lite for the same reason.

---

## lite — the surface pass

Nothing here changes behaviour and nothing needs a second file open.

### names — names mean something, no abbreviations · lite

Spelled out. No `cfg`, `mgr`, `tmp`, `val`, `res`, `btn`, `idx`, `e`, `d` or `x`, no single letters, no
acronyms the project has not defined. Short names survive only where the language or framework mandates
them — `self`, `cls`, `id`, a documented domain acronym like `URL`.

So `cfg` becomes `configuration`, `usrMgr` becomes `userManager`, `tmpRes` becomes `pendingResponse`,
and `calc(a, b)` becomes `calculateTotalPrice(unitPrice, quantity)`.

### verbs — function names are verbs · lite

Imperative verb first: `calculateTotal`, `fetchUser`, `validateInput`. Not `totalCalculation`, not
`userData`, not `inputValidator` for a function. Class names are nouns; their methods are still verbs.

### nouns — variable names are nouns · lite

`activeUser`, `retryCount`, `parsedResponse`. Not `getUser`, not `processing`, not a bare verb.

### booleans — booleans start with is / has / can · lite

Every boolean — variable, field, property, predicate — is prefixed `is`, `has`, `can`, `should` or
`was`. `active`, `permission`, `flag`, `status` and `state` FAIL.

### literals — no magic numbers or strings · lite

Every meaningful literal is a named constant, declared once at the boundary that owns it and reused —
the same constant in two files is also a `repetition` violation. `86400`, `0.15`, `3`, `"pending"`,
`"application/json"`, `"#ff0000"` and a raw route path in logic all FAIL. So `if (retries > 3)` becomes
`if (retryCount > MAX_RETRY_COUNT)`, `setTimeout(fn, 86400000)` becomes
`setTimeout(fn, ONE_DAY_IN_MILLISECONDS)`, `status === "pending"` becomes
`status === OrderStatus.Pending`, and `price * 0.15` becomes `price * VAT_RATE`.

Allowed bare: `0`, `1` and `-1` meaning exactly nothing, one and last; the empty string; and a literal
in a test that *is* the point of the test.

**Secrets invert the fix, and this clause is part of the floor** — it is checked at every level. An API
key, token, password, private key, webhook secret or connection string as a literal is a `literals` hit,
but naming it fixes nothing: `const API_KEY = "sk-live-…"` is the same secret with a tidier label, and
moving it to `constants.ts` spreads it. It must come from the environment or a secret store, and only
the user knows which, so it is a `NEEDS DECISION`, not an edit. Say in that line that the value is live
in the file and that rotating it is the user's call. Do not move it, do not rename it, and never paste
the value into the output.

**grep:** numeric literals outside constant declarations, and string literals compared with `==`/`===`
or `switch` or passed as a mode, kind or status argument. Separately for secrets: `key`, `secret`,
`token`, `password`, `passwd`, `apikey`, `connection string`, `sk-`, `AKIA`, `Bearer `, `-----BEGIN`.

### comments — comments say why, not what · lite

A comment restating the line above it is a second copy of the code that nobody updates, so it drifts and
starts lying. The code says *what*; a comment earns its place by carrying what the code cannot.

FAIL: the restatement, such as `// increment the counter` above `counter++`, or a docstring repeating
the signature in prose; the comment that contradicts the code, where whichever is right the pair FAILs —
fix the code if the comment holds the intent, fix the comment if the code is right, and report
`NEEDS DECISION` if you cannot tell; the stale marker, a `// TODO`, `FIXME` or `HACK` with no owner, date
or issue reference, which gets a reference or gets deleted; the section banner, `// ---- validation ----`
inside a function body, which is `spacing`'s blank line wearing a hat, since the section it marks is a
separate function; commented-out code, which belongs to `dead-code` and is deleted there; and noise
headers — a generated `@param` block repeating typed parameters, a changelog in the file header, a
name-and-date stamp version control already holds.

PASS, and worth keeping: **why this way** (`// binary search: sorted by the caller, up to 10⁶ entries`);
**why not the obvious way** (`// not Promise.all: the API rate-limits above 5 concurrent`); an external
constraint such as a spec section, an RFC, a hardware quirk or a vendor bug with a link; a non-obvious
unit or frame; and a public API docstring stating contract, units, raised errors and ownership of
returned data.

Deletion is not a loss: a comment removed because the code already says it costs nothing, while one kept
in case it is useful costs a reader on every visit.

So `// set the user to active` above `user.isActive = true` is deleted; `// TODO: fix later` becomes
`// TODO(#412): remove once the v2 endpoint ships`; `// ---- parsing ----` inside a function becomes an
extracted `parseHeader()`; and `// wait 500ms` above `sleep(500)` becomes
`// the device NACKs anything sent under 400ms after reset`.

**grep:** `TODO`, `FIXME`, `HACK`, `XXX`; comment lines whose words are the identifiers on the next line;
and `@param`/`@returns` blocks adding nothing to a typed signature. Then read every remaining comment and
ask whether deleting it loses information the code does not already carry.

### spacing — blank lines separate blocks, never code · lite

**No blank lines between statements inside a body.** When a run of lines wants a blank line above it to
say "this part is a different job", that run *is* a different job — extract it into a named function.
The blank line is not the fix; the function is.

Around a control block the spacing is fixed, and it is the only spacing there is. One blank line goes
**after** every `if`, `else`, `for`, `foreach`, `while`, `do`, `switch`, `try`, `using` and `lock`
block, after the closing brace, and **no** blank line goes before one. Nothing follows the closing brace
of the *enclosing* body — a block that is last in its parent closes straight into `}`. Chained parts
stay glued (`} else if (…) {`, `} catch {`, `} finally {`), and there are never two blank lines in a
row, anywhere. One blank line between top-level members is normal; this rule is about the inside of a
body.

So `var total = 0;` followed by a blank line and `var count = items.Count;` loses the blank line;
`var user = Load(id);` followed by a blank line and `if (user.IsActive) { … }` loses it too; and
`if (isReady) { … }` immediately followed by `Send(payload);` gains one after the closing brace. A
40-line body split into three parts by blank lines becomes three named functions called in order.

**grep:** a blank line whose next non-empty line is `if`, `for`, `while`, `switch`, `try` or `foreach`;
a `}` closing a control block whose next line is neither blank, nor `}`, nor a chained `else`, `catch`
or `finally`; and any other blank line inside a function body. Every hit of that last kind is two edits
— the blank line goes, and the run it split becomes its own function.

---

## full — everything behavioural, on top of lite

This is the default level.

### types — everything is typed · full

Every parameter, return, field and exported binding carries a declared type. No `any` or implicit
`any`, no untyped `dict`/`object`/`Dictionary` standing in for a shape, no `var` where the initialiser
does not make the type obvious, no untyped `**kwargs` crossing a public boundary.

**Python is stricter, not looser.** Containers come from `typing`, never bare builtins — `List[str]`,
`Dict[str, int]`, `Tuple[int, int]`, `Set[str]`, `Optional[User]`, `Callable[[int], str]`,
`Iterable[Path]` — so bare `list`, `dict`, `tuple` and `set` FAIL, and so does `List` with no element
type. numpy carries dtype (`NDArray[np.float64]`, `NDArray[np.uint8]`), so bare `np.ndarray` FAILs and
so does `NDArray` with no dtype; `float` is not a dtype, while `float32` and `float64` are different
contracts and mixing them silently upcasts. Shape and axis count are part of the type, written as a
comment next to the annotation — `# (batch, height, width, 3)`, `# (n_points, 3) world frame, metres` —
and a shape used twice becomes an alias, `ImageArray = NDArray[np.uint8]  # (h, w, 3), BGR, 0-255`. The
neighbours follow the same standard: `torch.Tensor` states dtype, device and shape, `pd.DataFrame`
states its column contract, and a fixed-key dict is a `TypedDict` rather than `Dict[str, Any]`. A path
is a `Path`, never a `str`, so `os.path.join`, `+ "/" +` and `f"{dir}/{name}"` FAIL — widen to
`Union[str, Path]` at one entry boundary only, convert immediately, and use `Path` downstream, which is
the same rule in every language: the string is not the path type. `Any` FAILs, including the implicit
`Any` of an unannotated parameter or a missing return, so write `-> None`.

So `def load(paths: list):` becomes `def load(paths: List[Path]) -> List[ImageArray]:`, and
`def solve(matrix, vector):` becomes
`def solve(matrix: NDArray[np.float64], vector: NDArray[np.float64]) -> NDArray[np.float64]:`. A bare
`points: np.ndarray` becomes `points: NDArray[np.float32]  # (n_points, 3), camera frame, metres`,
`config: dict` becomes `config: Dict[str, str]`, `def read(path: str):` becomes
`def read(path: Path) -> str:`, and `os.path.join(out_dir, name)` becomes `output_directory / name`.

**grep:** `any`, `object`, `dynamic`, `interface{}`, and functions with no return annotation; in Python
`: list`, `: dict`, `: tuple`, `np.ndarray`, `Any`, `os.path.join`, path-ish names typed `str`, and
`def` lines with an unannotated parameter or no `->`. Confirm the type checker is in strict mode — a
green build under a loose config, or no `mypy`/`pyright` at all, proves nothing.

### repetition — no repetition · full

The same logic does not exist twice. Two identical blocks, two callers re-implementing one rule, two
constants holding one value, two functions differing only by a literal — all FAIL. Extract once, call
twice. Copies identical **today but existing for different reasons** are not duplication; say so and
say why when you let one live.

### idiom — write the language, not a translation of another one · full

**Does the language already have a built-in way to say this, and did the author use it?** A C loop
transliterated into Python, a jQuery reflex inside Vue, a Java factory bolted onto TypeScript: all FAIL.
The standard library and the framework are part of the language, so hand-rolling what they ship is this
rule and `repetition` both.

**Idiomatic is not clever.** A comprehension nested three deep, an unreadable LINQ chain, a one-liner
needing a comment to decode — those FAIL under this same rule.

**`guards` outranks this one.** `?.`, `??` and null-conditional access read as idiomatic and are still
defensive guards; where `guards` says delete, they are deleted rather than modernised. Never "fix" an
`&&` chain into `?.` — first check whether the value can legitimately be absent at all.

Per-language detail is in `SKILL.md`. For a language with no file, apply the above directly and say in
one line that you judged idiom without a reference.

**grep:** name each file's language and framework, read the matching idiom file, and grep its tell-tale
non-idioms. Then ask of the biggest function in the file: *how would a fluent native write this?*

### guards — no defensive guards, let it fail loudly · full

A bug that throws gets found. A bug wrapped in a null check becomes a silent wrong result three layers
away. Code does not defend itself against its own callers.

FAIL: a null, `None` or `nullptr` check on a value that should never be null, where the fix is to trust
the contract and let the dereference throw; a `try`/`catch` that swallows — an empty catch, a catch that
logs and continues, a catch returning a default, `except Exception: pass`, `catch { }`, `?.` sprinkled
over an internal object; a fallback that hides a missing value — `?? 0`, `|| ""`, `.get(key, None)`
followed by a branch pretending the key was optional, a `GetComponent<T>()` result ignored when absent;
re-validating what the caller guaranteed, including the `if (list != null && list.Count > 0)` reflex
around a list that is always constructed; and a guard with no handling behind it, such as
`if (thing == null) return;` at the top of a method that is meaningless without `thing`, which is a
crash moved somewhere harder to find.

The most you may add is a **log that does not change control flow**: log, then let it propagate or
rethrow unchanged. Log-and-rethrow passes; log-and-return does not.

PASS: a boundary with a genuinely untrusted or unreliable source — network, disk and other IO, hardware,
a parsed file, user input, a third-party API, a cross-process message. There failure is expected, so it
is handled explicitly: validate once at the boundary, convert to a typed error or domain result, and
everything inside then trusts its inputs. Also PASS: a check that *is* the business rule
(`if (balance < amount) throw new InsufficientFunds()`), cleanup that does not swallow — `finally`,
`using`, `with`, all `teardown` — and assertions or fail-fast checks that **throw**.

So `if (user == null) return;` becomes plain use of `user`, since a null there is a bug worth crashing
on; `try { Parse(); } catch { }` becomes letting `Parse` throw; `catch (Exception e) { Log(e); return
null; }` becomes `catch (Exception e) { Log(e); throw; }`; `except Exception: pass` becomes no `except`
at all, or `except FileNotFoundError:` at the IO boundary; `var speed = config?.Speed ?? 0f;` becomes
`var speed = configuration.Speed;`; `if (target != null) target.Hit();` becomes `target.Hit();`; and
`GetComponent<Rigidbody>()` followed by a null-check return becomes `[RequireComponent]` and then plain
use.

**grep:** `!= null`, `is null`, `== None`, `?.`, `??`, `||` defaults, `catch`, `except`, `try:`,
`.get(` with a default, and `if (…) return;` early exits. For each ask: **can this value legitimately be
absent, from a source outside our control?** Yes at a real IO, hardware or user boundary is a PASS.
Anything else is a FAIL, and the fix is deletion.

Deleting a guard converts a silent wrong answer into a loud crash. If the suite goes red on one, that is
the rule working — report `NEEDS DECISION` with the failure, do not reinstate the guard.

### teardown — everything opened is closed · full

Whatever a unit starts, it stops when the unit goes away. A listener nobody removes keeps its closure
alive, a timer nobody clears fires into a dead object, and a response landing after teardown writes
state that no longer exists. A background service leaks exactly the way a component does.

Each needs a matching teardown in the same file, near where it was opened. `addEventListener` pairs with
`removeEventListener` using the *same* function reference — an inline arrow can never be removed, so
hoist it to a named handler or use `AbortController` and `{ signal }`. `setInterval` pairs with
`clearInterval`, `setTimeout` with `clearTimeout`, `requestAnimationFrame` with `cancelAnimationFrame`.
Subscriptions pair with unsubscribe or dispose — event bus, store watcher, RxJS subscription, websocket,
`ResizeObserver`, `IntersectionObserver`, `MutationObserver` (`.disconnect()`), `matchMedia`. In-flight
requests are aborted on teardown so a response cannot resolve into an object that is gone, and a `then`
writing state after teardown FAILs even when the framework only warns. Native and unmanaged resources
are released: file handles, sockets, database connections, `IDisposable` via `using`,
`createObjectURL` paired with `revokeObjectURL`, Unity `RenderTexture`, material instances and
`NativeArray`, an OpenCV `VideoCapture`, a `torch` hook.

Where the teardown lives is the framework's answer: `onUnmounted` or `onScopeDispose` in Vue, the
`useEffect` cleanup return in React, `onDestroy` in Svelte, `OnDisable` and `OnDestroy` in Unity,
`Dispose` and `using` in C#, `with` or `try`/`finally` in Python, `defer` in Go. A teardown in the wrong
hook — one that never fires, or fires on every re-render — is the same FAIL as no teardown.

Two more shapes recur. **The conditional teardown** registers unconditionally but removes behind an
`if`, so one path leaks. **The re-registration** adds a listener on every prop change without removing
the previous one, so check the dependency list and the teardown together.

So `onMounted(() => window.addEventListener("scroll", () => …))` becomes a named handler removed in
`onUnmounted`; `setInterval(poll, MS)` with no handle kept becomes a kept id and `clearInterval(pollTimerId)`
on teardown; `useEffect(() => { subscribe(onMessage) }, [])` gains `return () => unsubscribe(onMessage)`;
`fetch(url).then(setData)` becomes `fetch(url, { signal })` with `controller.abort()` on teardown; a
`new ResizeObserver(…)` never disconnected gains `observer.disconnect()`; and an `OnEnable` that
subscribes with nothing in `OnDisable` gets every `+=` mirrored by a `-=`.

**grep:** `addEventListener`, `setInterval`, `setTimeout`, `requestAnimationFrame`, `subscribe(`,
`\.on(`, `new .*Observer`, `createObjectURL`, `+=` on a C# event, and `open(` without `with` in Python —
find each hit's partner in the same file. Then grep the teardown hooks (`onUnmounted`, `useEffect`
returns, `onDestroy`, `OnDisable`, `Dispose`) and check nothing registered is missing. A file with
registrations and no teardown hook at all is the loudest version of this FAIL.

### dead-code — no dead code · full

Code nothing reaches is still read, trusted, searched, refactored and kept compiling. The fix is
deletion, and it applies to an unused export, function, class, method, field or constant with no caller
anywhere in the repository — check the whole repo, not just the target; an unused import, unused local,
or unused parameter no overload or interface requires; commented-out code of any age, with or without a
`// TODO: bring this back`; an unreachable branch, meaning code after an unconditional `return` or
`throw`, a condition that cannot be false, a `case` no value can take, an `if (false)` left from
debugging; and a feature flag fully on or fully off long enough that one side never runs, where the dead
branch goes and so does the flag.

Not dead, so kill it in the verify pass rather than deleting: a public API consumed outside the
repository — a published package, a plugin surface, something reflection or serialisation reaches by
name — and a parameter mandated by an interface, framework signature or Unity/Qt-style callback. If you
cannot establish which, it is a `NEEDS DECISION`.

**grep:** run what the project has — `ts-prune`, `knip`, eslint `no-unused-vars`, `vulture`,
`ruff F401`, compiler unused warnings. Then grep the repository for each exported name the target
defines and count call sites. For commented-out code, look for comment lines ending in `;`, `)`, `{` or
`:`.

### mutation — no hidden mutation · full

A function that quietly rewrites what it was handed, or writes state its signature never mentions, is a
bug that appears at the second call site. Same family as `guards`: make the effect visible or do not
have it.

FAIL: mutating an argument in place while name and return say otherwise — `points[:] = …` inside
`normalize(points)`, `items.push(…)` on a caller's list, `Object.assign(target, …)` on an argument,
`.sort()` on a caller's array instead of `[...items].sort()`; writing module-level or global mutable
state from a function that reads as a calculation, such as a module-scope `dict` or `Map` accumulating
entries, a static counter, or a singleton mutated from three places; a mutable default argument, as in
`def append_to(item, target=[])`; a getter, property or `computed` with a side effect — anything named
`get…`, `is…` or `total` that writes, caches into shared state, fires a request, or logs at a level
someone depends on; and returning an internal collection by reference, so callers mutate private state
from outside.

PASS: a method mutating **its own object's** fields; a builder or accumulator whose declared job is to be
filled; an explicitly named in-place operation such as `sortInPlace`, `normalize_inplace` or numpy's
`out=`; and performance-critical code where copying is genuinely the bottleneck and a comment says so.

The fix is one of three, first preferred: copy before modifying and return the copy; rename so the
mutation is declared (`sortItems` becomes `sortItemsInPlace`); or lift shared state into an explicit
parameter.

**grep:** for every function taking a collection or object, check whether it writes to that parameter —
`.push(`, `.pop(`, `.splice(`, `.sort(`, `.reverse(`, `Object.assign(`, `[:] =`, `.update(`, `.append(`
on a parameter name. Then assignments to module-scope names inside functions, `=[]`, `={}` and `=dict()`
in Python signatures, and `get`/`@property` bodies assigning to `self` or `this`.

### errors — errors carry what broke · full

`guards` says fail loudly; this is the other half, because **loud is not informative.** The stack trace
says where; the message says what.

FAIL: a message with no value in it — `"invalid input"`, `"failed"`, `"error occurred"` — when the
offending value should go in, as in `f"expected 3 channels, got {array.shape[-1]} for {path}"`; a bare
base type where a specific one exists, such as `throw new Error(…)`, `raise Exception(…)` or
`throw new ApplicationException(…)`, when `ValueError`, `KeyError`, `ArgumentOutOfRangeException`,
`TypeError` or a domain type the caller can catch is available; a boundary leaking its internals upward,
such as a `SqlException` or `HTTPError` escaping into domain code, where the fix is to convert at the
boundary and put the original in `cause`, `from` or `innerException` rather than dropping it; a rethrow
that erases the original — `raise ValueError(str(e))`, `throw new Error(e.message)`, `throw ex;` in C#,
which resets the stack trace where `throw;` does not; and a secret, token, password or credential in the
message, or a whole request body or user record — enough context to locate the failure, not enough to
become an incident. A message describing the recovery instead of the fault, like `"please try again"`,
FAILs too.

Where it stops: one sentence with the offending values, not a paragraph with a suggested fix and a link.
A `catch` that only improves the message before rethrowing is fine; one that improves it and returns is
a `guards` FAIL.

So `raise Exception("bad shape")` becomes `raise ValueError(f"expected (n, 3), got {points.shape}")`;
`throw new Error("not found")` becomes `throw new UserNotFoundError(userId)`;
`except SqlError as e: raise ValueError(str(e))` becomes
`raise RepositoryError(f"loading user {user_id}") from e`; `catch (Exception ex) { throw ex; }` becomes
`catch (Exception) { throw; }`; and an auth error interpolating `apiKey` becomes one naming `userId`.

**grep:** `Error("`, `Exception("`, `raise Exception`, `throw new Error` — read every message literal and
ask whether it names a value. Then `str(e)`, `e.message`, `throw ex;`, and message strings containing
`key`, `token`, `password` or `secret`.

### flags — no flag parameters · full

`render(true, false)` tells the reader nothing at the call site, and naming inside the function does not
fix it because the reader is looking at the call. A boolean parameter is usually two functions glued
together, and the `if (isCompact)` in the body is the seam.

FAIL: a boolean parameter selecting behaviour, such as `save(user, true)`, which splits into two named
functions, an enum, or an options object with named fields; two or more positional booleans in a row; a
"mode" or "kind" string parameter, such as `export(data, "csv")`, which is an enum and a `literals` hit
too; more than four parameters, since past four the reader counts positions, so use a parameter object,
`@dataclass` or `record` — which usually reveals three of them always travelled together; and a parameter
only read on one branch, which belongs to the branch rather than the signature.

PASS: something genuinely data rather than a switch, like `setEnabled(isEnabled)` or
`setVisible(isVisible)`; a language forcing named arguments at the call site, such as Python keyword-only
after `*`, Swift labels, or C# named arguments used consistently; and an interface or framework signature
that mandates it.

So `save(user, true)` becomes `saveDraft(user)` or `savePublish(user)`; `export(data, "csv")` becomes
`export(data, ExportFormat.Csv)`; `createUser(name, email, true, false, null)` becomes
`createUser({ name, email, isAdmin, hasNewsletter })`; and `def fetch(url, retry, cache, verbose):`
becomes `def fetch(url: str, *, options: FetchOptions) -> Response:`.

**grep:** call sites with a bare `true`, `false`, `True`, `False`, `null` or `None` argument; `def` and
`function` lines with more than four parameters; and string literals passed in and then compared inside
the body.

### floating — no floating promises · full

An async call nobody awaits and whose failure nobody catches loses the error entirely — an unhandled
rejection in a log nobody reads, or in some runtimes nothing at all. The exact silence `guards` exists to
prevent, through a different door.

FAIL: a promise-returning call with no `await`, no `return` and no `.catch`, such as
`saveDraft(document)` on its own line, and `void saveDraft(document)` too unless a comment says why;
`async` passed where a sync callback is expected — `array.forEach(async item => …)`, where promises escape
and the loop does not wait, `setTimeout(async () => …)`, or an async handler passed where the return value
is ignored; `async void` in C# anywhere but an event handler, and a fire-and-forget `Task` with no
continuation; a Python coroutine called without `await`, or an `asyncio.create_task(…)` whose handle is
discarded so exceptions vanish at garbage collection; and a background task with no failure path, since
deliberate fire-and-forget is allowed but must be explicit — keep the handle, attach a failure handler
that logs, and write one comment saying it is intentional, which is a `comments` PASS because that is a
why.

The fix is nearly always one word: `await` it, or `return` it so the caller's `await` covers it. So
`saveDraft(doc);` becomes `await saveDraft(doc);`; `items.forEach(async item => await send(item))` becomes
`await Promise.all(items.map(item => send(item)))`; `async void SaveAsync()` becomes
`async Task SaveAsync()` awaited by the caller; and `asyncio.create_task(sync_all())` keeps the task and
either awaits it or adds a done-callback that logs.

**grep:** enable `@typescript-eslint/no-floating-promises` and `no-misused-promises` if the repo has
eslint, and ruff `RUF006` and `ASYNC`. Then look for `async` inside `forEach` or `map` without
`Promise.all`, `async void`, `create_task(` without an assignment, and statement lines calling a known
async function with no `await`.

### clock — time, randomness and identity come from outside · full

`new Date()`, `Math.random()`, `uuid4()` and `Guid.NewGuid()` inside business logic make it untestable —
you cannot assert on a value the function invented, so the test `tests` asks for either does not exist or
asserts nothing. It is also unrunnable in the past, unreproducible after a bug, and timezone-dependent in
ways nobody notices until a midnight release.

FAIL: a clock read inside a calculation, such as `if (order.dueAt < new Date())`, `datetime.now()` in a
pricing rule, or `Time.time` inside game logic a test calls; randomness inside logic, meaning a shuffle,
sample, jitter or retry backoff that cannot be seeded; identity minted deep inside, such as a `uuid`
generated three layers down so the caller cannot know what id was used and the test cannot fix it; and a
naive local timestamp crossing a boundary — `datetime.now()` rather than `datetime.now(timezone.utc)`, a
`DateTime.Now` stored in a database, a date formatted for display in the layer that computes it.

The fix is to take the clock, random source or id factory as a parameter or constructor dependency —
the DIP half of `solid` — default it at the composition root, and inject a fixed one in tests. The
smallest version is a single `now: () => Date` parameter, no framework required.

So `if (dueAt < new Date())` becomes `isOverdue(order, now)` with `now` passed in;
`def price(order): today = date.today()` becomes `def price(order: Order, today: date) -> Decimal:`; an
`id = uuid4()` deep in a repository is minted at the entry point and passed down; a stored
`datetime.now()` becomes `datetime.now(timezone.utc)`; and `random.shuffle(items)` becomes
`rng.shuffle(items)` with an injected, seedable `rng`.

PASS: the composition root, an entry point, a logger, a view rendering the current time, and
`Time.deltaTime` in Unity's own `Update` loop.

**grep:** `new Date(`, `Date.now(`, `datetime.now`, `date.today`, `DateTime.Now`, `Math.random`,
`random.`, `uuid`, `Guid.NewGuid`, `System.currentTimeMillis` — for each, does it sit at an entry point,
or inside logic a test would want to pin?

---

## ultra — the architecture, on top of full

These move code between files and write new ones. Expect `OUT OF TARGET` lines.

### solid — SOLID · ultra

**SRP** gives each unit one reason to change, so a unit that parses *and* renders *and* persists FAILs.
**OCP** means new behaviour is added rather than carved into an existing `switch` over types. **LSP**
forbids a "not supported" throw, a strengthened precondition and a weakened postcondition. **ISP**
forbids a consumer depending on methods it never calls. **DIP** makes high-level code depend on an
abstraction rather than a concrete class it constructs itself.

### single-entry — one way in · ultra

Each module or feature exposes **exactly one** way in; everything else is internal. No second function
doing the same job by another route, no caller reaching past the entry, no "convenience" wrapper that
becomes a parallel path and drifts. An `api.ts` exporting both `send()` and `sendWithRetry()` FAILs.

### tests — behaviour arrives with a test · ultra

Behaviour arrives with a test that would fail without it. A test exists for every behaviour the target
adds or changes; it asserts **behaviour** rather than implementation, so no asserting on private calls
and no mocking the thing under test; it fails when the change is reverted, and if you cannot show that,
it is decoration; and the risky path is covered, not only the happy one.

Tests written afterwards still pass. No test at all does not.

### direction — dependencies point one way · ultra

Modules form either a layered graph or a knot, and a knot cannot be tested, understood or extracted in
pieces. The DIP half of `solid` made concrete and greppable.

FAIL: a cycle, where `A` imports `B` imports `A`, directly or through three files — some bundlers
tolerate it silently until an initialisation order changes and a value is `undefined` at import time; an
inward-pointing import that should point outward, such as domain or business code importing the UI, the
ORM, the HTTP framework or the logger implementation, where the fix is to invert it so the inner layer
declares an interface and the outer layer implements it; a layer skipped, such as a view reaching
straight into the database client, or a controller importing a repository's internals rather than going
through the service, which is `single-entry` too; a sibling reaching sideways into another feature's
internals, such as `features/billing/…` importing `features/auth/internal/tokenStore`, when cross-feature
traffic goes through that feature's one public entry (`single-entry`) or a shared module both depend on;
and a shared "utils" or "common" module importing from the features that use it, which is the cycle again
wearing a helpful name.

The fix is one of three: invert behind an interface, move the shared thing down into a module both sides
may depend on, or merge two modules that were never separate. It is usually obvious from the direction
the data flows; when it is not, report `NEEDS DECISION`.

So `domain/order.ts` importing `db/prismaClient` becomes `domain` declaring `OrderRepository` and `infra`
implementing it; `utils/format.ts` importing `features/cart` moves the formatter into `features/cart`; a
`UserService` ↔ `NotificationService` pair becomes one raising an event the other subscribes to; and a
view importing `axios` and calling the API directly becomes a view calling a service that owns the
client.

**grep:** run what the repo has — `madge --circular`, `dependency-cruiser`, `import-linter`,
`eslint-plugin-import/no-cycle`, a compiler's circular-reference warning. Then read each target file's
import block and ask per line: **is this import pointing outward from the core, or inward toward it?**
Inward is the FAIL.
