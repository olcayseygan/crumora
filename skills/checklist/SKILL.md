---
name: checklist
description: Checks code against a fixed fourteen-rule checklist — types everywhere, meaningful unabbreviated names, no duplication, SOLID, one entry point, test-driven, verb function names, noun variable names, boolean names prefixed with is/has/can, no magic numbers or strings, no blank lines between statements with one blank line after every control block, idiomatic use of the language and framework in hand, no defensive null checks or swallowed exceptions, and optimistic updates that roll back visibly when the request fails. Every rule gets an explicit PASS or FAIL with file:line evidence, and the target ships only when every rule passes. Use when the user says "/checklist", "check this against the rules", "does this follow the rules", "checklist review", "check the naming", "is this SOLID", "any magic numbers", "check the spacing", "is this pythonic", "too many null checks", "optimistic update", or the Turkish equivalents "kurallara uyuyor mu", "kontrol et". For an open-ended multi-perspective critique use tribunal; for improving code in place use sharpen; for rewriting use rewrite.
---

# checklist — the fourteen-rule gate

Fourteen rules. Each one gets a verdict. **PASS or FAIL, never "mostly".**

Sibling of **tribunal**, and deliberately the opposite of it. `tribunal` opens the question — several
lenses hunt for whatever is wrong. `checklist` closes it: the rules are fixed, known in advance, and the
only output is which ones the code passes.

The two failure modes it exists to prevent:

- **The vibe review** — "looks good, maybe rename that". No rule cited, nothing verifiable, nothing
  the author can argue with or act on.
- **The rule that was never checked** — the reviewer reads for bugs, never actually greps for
  untyped signatures, and reports PASS on a rule they did not test.

---

## 0. Target

If the user passed an argument, that is the target (`/checklist src/parser.ts`, `/checklist the diff`). If
not, default to the uncommitted diff; if the tree is clean, ask **one question**.

**Read the whole target first.** For a diff, read the surrounding file too — rule 3 (duplication) and
rule 5 (single entry) are invisible when you only see the changed lines.

Every rule is checked against **every file in the target**. A rule you did not actually look for is
reported as `NOT CHECKED`, never as PASS.

---

## The fourteen rules

### 1 · Types — everything is typed

Every parameter, return value, field and exported binding carries a declared type. No `any`, no
implicit `any`, no untyped `dict`/`object`/`Dictionary` standing in for a shape, no `var` where the
type is not obvious from the initialiser, no untyped `**kwargs` crossing a public boundary.

**How to check:** grep the target for `any`, `object`, `dynamic`, `interface{}`, and for functions
whose signature carries no return annotation. In Python grep for `: list`, `: dict`, `: tuple`,
`np.ndarray`, `Any`, `os.path.join`, path-ish names annotated `str`, and for `def` lines with an
unannotated parameter or no `->`. Check the
compiler or type checker is actually in strict mode — a green build under a loose config, or a
repo with no `mypy`/`pyright` at all, proves nothing.

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

**How to check:** grep the target for numeric literals outside constant declarations, and for string
literals compared with `==`/`===`/`switch` or passed as a mode/kind/status argument.

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
one of those. Every hit of the last kind is reported twice — once as the blank line, once as the
missing extraction it is standing in for.

**FAIL evidence:** `SpawnService.cs:52 — blank line between two statements inside Spawn(); the four
lines below it are a distinct job, so extract ResolveSpawnPoint()`.

### 12 · Idiomatic — write the language, not a translation of another one

Code is written in the grain of the language it lives in. A C programmer's loop transliterated into
Python, a jQuery reflex inside Vue, a Java factory bolted onto TypeScript — all FAIL. The check is
simple: **does the language already have a built-in way to say this, and did the author use it?**

The standard library and the framework are part of the language. Hand-rolling something they already
ship is both this rule and rule 3.

**Python is pythonic:** comprehensions and generator expressions over `append` loops, `enumerate` and
`zip` over index arithmetic, unpacking over indexing, `with` over manual open/close, `pathlib` over
string paths, `dataclass`/`NamedTuple`/`Enum` over ad-hoc tuples and dicts, `collections`
(`defaultdict`, `Counter`, `deque`) and `itertools` over reinvented loops, `any`/`all`/`sum`/`min` with
a key over accumulator variables, f-strings over concatenation, EAFP `try/except` over LBYL where the
language expects it, truthiness and chained comparisons (`0 <= index < length`) over verbose
equivalents, `@property` over `get_x()`, context managers and decorators for cross-cutting concerns.

**JavaScript / TypeScript is modern JS:** `map`/`filter`/`reduce`/`find`/`some`/`every` over index
loops, destructuring and spread over manual copying, `?.` and `??` over `&&` chains and `||` defaults
that swallow `0` and `""`, `async`/`await` over `.then` pyramids, `Promise.all` over sequential awaits
that do not depend on each other, template literals over concatenation, `Map`/`Set` over objects used
as lookup tables, `for…of` with `Object.entries` over `for…in`, discriminated unions and `as const`
over stringly-typed flags, generics over `any`.

**Vue is the framework's own model:** `computed` over a watcher that assigns a variable, `ref`/
`reactive` state over manual DOM mutation, `v-if`/`v-for`/`v-model` over imperative rendering,
`document.querySelector` inside a component is almost always a FAIL, props down and emits up over
reaching into a child, `<script setup>`, composables for shared logic over mixins and duplicated
methods, `watchEffect`/lifecycle hooks over ad-hoc timers. Same discipline for React (hooks, keys,
derived state over synced state), and for whatever framework the file actually belongs to.

**C# is C#:** LINQ over manual loops where it stays readable, `foreach` over index loops,
pattern matching and `switch` expressions over `if`/`is`/cast ladders, `using` declarations,
`IEnumerable<T>` and `yield return` over building throwaway lists, properties over getter methods,
`nameof` over string literals, `record` for value types, `async`/`await` over `.Result`. In Unity:
`TryGetComponent`, `SerializeField` private fields, `CompareTag` over `tag ==`, cached components over
per-frame `GetComponent`, `Time.deltaTime` in `Update`, coroutines or UniTask over hand-rolled timers.

The limit: **idiomatic is not clever.** A comprehension nested three deep, a LINQ chain no one can
read, a one-liner that needs a comment to decode — those FAIL too, under this same rule. Idiom means
the way a fluent native writes it plainly, not the shortest thing that runs.

| Bad | Good |
| --- | --- |
| `result = []`<br>`for item in items:`<br>`    result.append(item.name)` | `names = [item.name for item in items]` |
| `for i in range(len(rows)):` | `for index, row in enumerate(rows):` |
| `f = open(path)` … `f.close()` | `with path.open() as handle:` |
| `if (list.filter(x => x.id === id).length > 0)` | `if (list.some(user => user.id === id))` |
| `const name = user && user.profile && user.profile.name` | `const name = user?.profile?.name ?? DEFAULT_NAME` |
| `watch(items, () => { total.value = sum(items.value) })` | `const total = computed(() => sum(items.value))` |
| `if (obj is Dog) { var dog = (Dog)obj; … }` | `if (obj is Dog dog) { … }` |
| `GetComponent<Rigidbody>()` in `Update` | cached field assigned in `Awake` |

**How to check:** for each file, name the language and framework first, then grep for that language's
tell-tale non-idioms — `range(len(`, `.append(` inside a loop that builds a list, `os.path`, manual
index loops in JS, `.then(` chains, `querySelector` in a component, `if`/cast ladders in C#. Then ask
the reverse question on the biggest function in the file: *how would a fluent native write this?*

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
amount) throw new InsufficientFunds()`), and cleanup that runs without swallowing (`finally`, `using`,
`with`).

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

**FAIL evidence:** `PlayerController.cs:41 — if (weapon == null) return; hides a broken spawn path;
delete the guard and let the NullReferenceException point at the real bug`.

### 14 · Act first, roll back on failure

When a user action has to travel to something that can fail — a POST, a socket, a save — the interface
does **not** sit and wait. It applies the change immediately, sends the request, and if the request
fails it puts the state back exactly as it was and says so out loud.

Like button: the heart fills on click, the count goes up, the POST goes out. `catch` → heart empties,
count returns to the old value, a visible warning appears. Not a spinner on the heart, not a disabled
button, not a five-hundred-millisecond dead interface.

The shape, every time:

1. **Snapshot** the previous state before touching it — the actual old value, not a guess you plan to
   recompute later.
2. **Apply** the new state locally and immediately.
3. **Send** the request.
4. **On failure: restore the snapshot, and tell the user.** Both. A rollback the user never sees is a
   state that changed under their hands for no reason.
5. **Log the failure** with enough context to find it.

This is the one place a `catch` is not a rule 13 violation — it is a real boundary (network, IO) and
it does not swallow anything: the state is restored, the user is told, the error is logged.

FAIL:

- **Silent rollback.** State snaps back, no message. The user retries and blames themselves.
- **Silent failure.** Request dies, local state keeps the optimistic value, and the screen now lies
  about what the server holds.
- **Blocking the interaction** on the round trip — spinner-locked button, disabled input, frozen list
  — for an action that is cheap and reversible.
- **Rollback by recomputation** — `count -= 1` instead of restoring the snapshot. Two failures racing,
  or a value the server changed meanwhile, and the arithmetic drifts.
- **No concurrency rule for repeated clicks.** Toggle twice fast and the two responses land out of
  order; the last intent must win, so cancel the in-flight request, sequence them, or drop a rollback
  whose intent is already superseded.

**Where you wait instead:** an action that is expensive, irreversible or destructive — a payment, a
delete, an order, anything the user cannot undo — is confirmed and awaited, with the result shown
honestly. Optimism is for cheap, reversible, high-frequency actions.

**Outside the UI the same rule holds:** a local write mirrored to a remote store, a cache updated
ahead of its source, a multi-step operation — each keeps the compensating action next to the forward
one, so a half-applied change never survives.

| Bad | Good |
| --- | --- |
| `await like(id); isLiked.value = true` | `isLiked.value = true` → `await like(id)` → `catch` restores |
| `catch { isLiked.value = false }` | `catch { isLiked.value = wasLiked; count.value = previousCount; showError(…) }` |
| `catch { count.value -= 1 }` | restore the snapshot `previousCount` |
| `<button :disabled="isSending">` on a like | button stays live; rapid clicks cancel the in-flight request |
| `catch (error) { console.log(error) }` and state left optimistic | restore, warn the user, log the error |

**How to check:** find every user action that triggers a request. For each one: does the state change
before the `await` or after it? Is there a snapshot variable? Does the `catch` restore *and* surface?
Grep for `await` immediately followed by a state assignment, for `isLoading`/`disabled` flags on cheap
actions, and for `catch` blocks in request handlers that touch neither the state nor the user.

**FAIL evidence:** `LikeButton.vue:23 — state is set only after await, so the heart lags the click; and
the catch logs without restoring isLiked or telling the user`.

---

## Finding shape (MUST)

A finding is only a finding when it carries all four:

- **Rule** — which of the fourteen, by number.
- **Where** — `file:line`. Not "the module".
- **What** — one sentence naming the violation.
- **Fix** — the concrete replacement. For a naming rule that means writing the new name out.

No rule number, no finding. No `file:line`, no finding. "Consider maybe tidying this" is not a
finding.

## Verify before reporting (MUST)

Before printing, re-read the code behind **every** FAIL and try to kill it: is that `any` actually
inferred from a typed source? Is that "duplicate" one rule in two places, or two rules that happen to
match today? Is `data` really a boolean? A FAIL that does not survive this pass is dropped, and the
checklist line says it was considered and cleared.

---

## Output

**Do not fix anything.** This skill reviews. Offer the fixes as a closing question; apply them only
if the user says yes, and re-run the affected rules afterwards.

If a `ReportFindings` tool is available in the session, call it **once** with the findings, worst rule
first, then do not repeat them as prose. Otherwise print the tables below.

### 1 — the checklist

Every rule, every time, including the clean ones. A short checklist is a checklist that was not run.

| # | Rule | Verdict | Violations |
| --- | --- | --- | --- |
| 1 | Types everywhere | FAIL | 3 |
| 2 | Meaningful names, no abbreviations | FAIL | 7 |
| 3 | No repetition | PASS | 0 |
| 4 | SOLID — SRP / OCP / LSP / ISP / DIP | FAIL | SRP 1, rest pass |
| 5 | Single entry | PASS | 0 |
| 6 | Test driven | FAIL | 2 behaviours untested |
| 7 | Function names are verbs | PASS | 0 |
| 8 | Variable names are nouns | FAIL | 1 |
| 9 | Booleans prefixed is/has/can | FAIL | 4 |
| 10 | No magic numbers or strings | FAIL | 5 |
| 11 | Blank lines separate blocks, never code | FAIL | 6 |
| 12 | Idiomatic for the language | FAIL | 3 |
| 13 | No defensive guards | FAIL | 4 |
| 14 | Act first, roll back on failure | FAIL | 2 |

### 2 — the findings

| # | Rule | Where | Violation | Fix |
| --- | --- | --- | --- | --- |
| 1 | 1 | `parser.ts:44` | `parse` returns `any` | `parse(input: string): ParseResult` |
| 2 | 2 | `service.ts:12` | `cfg` is an abbreviation | `configuration` |
| 3 | 9 | `user.ts:8` | boolean named `active` | `isActive` |
| 4 | 4 SRP | `Report.ts:1-210` | class parses, formats and writes files | split writing into `ReportWriter` |
| 5 | 6 | `orders.ts:60` | discount branch has no test | test asserting discount at the boundary value |
| 6 | 10 | `orders.ts:60` | bare `0.15` in the price calculation | `const VAT_RATE = 0.15` |
| 7 | 11 | `orders.ts:52` | blank line splitting a body into two jobs | extract the second half as `applyDiscount()` |
| 8 | 11 | `orders.ts:71` | no blank line after the `for` block | one blank line after the closing brace |
| 9 | 12 | `loader.py:88` | `range(len(paths))` index loop building a list | comprehension over `enumerate(paths)` |
| 10 | 13 | `orders.ts:14` | `try/catch` swallowing a parse failure | delete the catch, let it throw |
| 11 | 14 | `LikeButton.vue:23` | state set after the await, catch never restores it | set first, restore the snapshot and warn on failure |

### 3 — the verdict

One line, and it is mechanical: **every rule PASS → ship it. Any rule FAIL → not yet.** Then name the
rules blocking, ordered by how many violations each carries.

Then the honest limits: files not read, rules that could not be checked from source alone (rule 6
usually needs the test suite run), and anything assumed rather than verified.

---

## MUST summary

- Read the whole target — a diff in its surrounding file — before judging.
- Check all fourteen rules against all files. Unchecked is `NOT CHECKED`, never PASS.
- Every finding carries rule number, `file:line`, the violation, and the concrete fix.
- Try to kill every FAIL before printing it; drop the ones that do not survive, and say so.
- Print the full fourteen-row checklist even when rows pass.
- Verdict is mechanical: one FAIL means not yet.
- State what was not checked.
- Review only — fix only if the user asks.
