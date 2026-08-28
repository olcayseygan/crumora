# rule 12 — C# and Unity

Read alongside rule 12 in `core.md`. The question stays the same: **does the language or the engine
already have a built-in way to say this, and did the author use it?**

Rule 13 outranks this file: `?.`, `??`, `??=` and `if (x != null) return;` read as modern C# and are
still defensive guards. Keep them only at a genuine boundary; elsewhere the fix is deletion.

---

## C#

- **LINQ over manual loops** where it stays readable — `Any`, `All`, `First`, `Where`, `Select`,
  `GroupBy`, `Sum`, `OrderBy`. A loop whose whole body is an `if` and an `Add` is a `Where`.
- **`foreach` over index loops** when the index is not used.
- **Pattern matching and `switch` expressions** over `if`/`is`/cast ladders — `is Dog dog`,
  property patterns, relational and `or` patterns, `switch` expressions with `_`.
- **`using` declarations** (`using var stream = …`) over manual `Dispose` and nested `try/finally`.
  This is also rule 17.
- **`IEnumerable<T>` and `yield return`** over building a throwaway `List<T>` just to return it.
- **Properties, and expression-bodied members**, over `GetX()`/`SetX()` pairs.
- **`nameof`** over string literals for member names — also rule 10.
- **`record` / `record struct`** for value types, with `with` expressions instead of hand-written
  copy constructors.
- **`async` / `await` all the way down.** `.Result` and `.Wait()` are deadlock bugs, not style; an
  `async void` that is not an event handler FAILs.
- **String handling** — interpolation over concatenation, `StringBuilder` in a loop,
  `string.IsNullOrWhiteSpace`, `Span<T>` where the hot path justifies it.
- **Collection expressions, target-typed `new`, tuples with named elements**, `ArgumentNullException.
  ThrowIfNull` at real boundaries.

## Unity

- **`TryGetComponent`** over `GetComponent` followed by a null check (which is also a rule 13 FAIL).
- **`[SerializeField] private`** fields over public fields for inspector wiring.
- **`CompareTag("Player")`** over `tag == "Player"` — the string comparison allocates and the tag
  literal is a rule 10 hit too.
- **Cached components** assigned in `Awake`/`Start`, never `GetComponent` inside `Update`.
- **`Time.deltaTime`** in `Update`, `Time.fixedDeltaTime` and physics in `FixedUpdate`.
- **Coroutines, `UniTask`, or `Awaitable`** over hand-rolled timer floats counting up in `Update`.
- **Object pooling** over `Instantiate`/`Destroy` on anything spawned per-frame or per-shot.
- **`ScriptableObject`** for shared configuration data over static classes full of constants.
- **`sqrMagnitude`** over `magnitude` in comparisons, `Vector3.Distance` only when the real distance
  is needed.
- **`OnEnable` / `OnDisable`** as the pair for event subscription — every `+=` has a `-=` (rule 17).
- Note that a destroyed `UnityEngine.Object` compares equal to null through an overloaded operator, so
  `?.` on one is misleading as well as defensive — another reason rule 13 deletes it.

## The limit

Idiomatic is not clever. A LINQ chain no one can read, a `switch` expression with eight nested
patterns, a one-line lambda that hides a database call — those FAIL under this same rule. LINQ inside
`Update`, or any per-frame allocation, is a performance FAIL even when it reads beautifully; in the
hot path the plain `for` loop is the idiomatic answer.

| Bad | Good |
| --- | --- |
| `if (obj is Dog) { var dog = (Dog)obj; … }` | `if (obj is Dog dog) { … }` |
| `for (int i = 0; i < items.Count; i++)` | `foreach (var item in items)` |
| `var result = new List<X>(); foreach … if … result.Add(x);` | `items.Where(item => item.IsActive).ToList()` |
| `if (name == null \|\| name.Trim() == "")` | `string.IsNullOrWhiteSpace(name)` |
| `GetTotal()` method | `public decimal Total => …` |
| `PropertyChanged("UserName")` | `PropertyChanged(nameof(UserName))` |
| `var data = FetchAsync().Result;` | `var data = await FetchAsync();` |
| `GetComponent<Rigidbody>()` in `Update` | cached field assigned in `Awake` |
| `if (gameObject.tag == "Player")` | `if (gameObject.CompareTag(PlayerTag))` |
| `timer += Time.deltaTime; if (timer > 2f)` | a coroutine with `WaitForSeconds(ReloadDelay)` |
| `if (Vector3.Distance(a, b) < r)` | `if ((a - b).sqrMagnitude < r * r)` |

## How to check

Grep the target for: `for (int i`, `(Cast)` after an `is`, `.Result`, `.Wait()`, `async void`,
`GetComponent<` inside `Update`/`LateUpdate`/`FixedUpdate`, `tag ==`, `+` string building in a loop,
`Dispose()` called by hand, `GetX()`/`SetX()` pairs, and string literals naming members.

Then take the largest method in the file and ask the reverse question: how would a fluent C#
developer write this? In Unity, ask it twice — once for readability, once for what it costs per frame.

**FAIL evidence:** `EnemyController.cs:63 — GetComponent<Animator>() called every Update; cache it in
Awake`.
