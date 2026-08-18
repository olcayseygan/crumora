---
name: review
description: Reviews code against a fixed ten-rule checklist — types everywhere, meaningful unabbreviated names, no duplication, SOLID, one entry point, test-driven, verb function names, noun variable names, boolean names prefixed with is/has/can, no magic numbers or strings. Every rule gets an explicit PASS or FAIL with file:line evidence, and the target ships only when every rule passes. Use when the user says "/review", "review this code", "check the code", "does this follow the rules", "check naming", "is this SOLID", "magic numbers", "checklist review", or the Turkish equivalents "kodu incele", "kontrol et", "kurallara uyuyor mu". For an open-ended multi-perspective critique use audit; for improving code in place use refactor; for rewriting use rewrite.
---

# review — the checklist gate

Ten rules. Each one gets a verdict. **PASS or FAIL, never "mostly".**

Sibling of **audit**, and deliberately the opposite of it. `audit` opens the question — several
lenses hunt for whatever is wrong. `review` closes it: the rules are fixed, known in advance, and the
only output is which ones the code passes.

The two failure modes it exists to prevent:

- **The vibe review** — "looks good, maybe rename that". No rule cited, nothing verifiable, nothing
  the author can argue with or act on.
- **The rule that was never checked** — the reviewer reads for bugs, never actually greps for
  untyped signatures, and reports PASS on a rule they did not test.

---

## 0. Target

If the user passed an argument, that is the target (`/review src/parser.ts`, `/review the diff`). If
not, default to the uncommitted diff; if the tree is clean, ask **one question**.

**Read the whole target first.** For a diff, read the surrounding file too — rule 3 (duplication) and
rule 5 (single entry) are invisible when you only see the changed lines.

Every rule is checked against **every file in the target**. A rule you did not actually look for is
reported as `NOT CHECKED`, never as PASS.

---

## The ten rules

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

---

## Finding shape (MUST)

A finding is only a finding when it carries all four:

- **Rule** — which of the ten, by number.
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

### 2 — the findings

| # | Rule | Where | Violation | Fix |
| --- | --- | --- | --- | --- |
| 1 | 1 | `parser.ts:44` | `parse` returns `any` | `parse(input: string): ParseResult` |
| 2 | 2 | `service.ts:12` | `cfg` is an abbreviation | `configuration` |
| 3 | 9 | `user.ts:8` | boolean named `active` | `isActive` |
| 4 | 4 SRP | `Report.ts:1-210` | class parses, formats and writes files | split writing into `ReportWriter` |
| 5 | 6 | `orders.ts:60` | discount branch has no test | test asserting discount at the boundary value |
| 6 | 10 | `orders.ts:60` | bare `0.15` in the price calculation | `const VAT_RATE = 0.15` |

### 3 — the verdict

One line, and it is mechanical: **every rule PASS → ship it. Any rule FAIL → not yet.** Then name the
rules blocking, ordered by how many violations each carries.

Then the honest limits: files not read, rules that could not be checked from source alone (rule 6
usually needs the test suite run), and anything assumed rather than verified.

---

## MUST summary

- Read the whole target — a diff in its surrounding file — before judging.
- Check all ten rules against all files. Unchecked is `NOT CHECKED`, never PASS.
- Every finding carries rule number, `file:line`, the violation, and the concrete fix.
- Try to kill every FAIL before printing it; drop the ones that do not survive, and say so.
- Print the full ten-row checklist even when rows pass.
- Verdict is mechanical: one FAIL means not yet.
- State what was not checked.
- Review only — fix only if the user asks.
