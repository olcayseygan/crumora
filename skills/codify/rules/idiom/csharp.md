# rule 12 — C# and Unity

**Does the language or the engine already have a built-in way to say this, and did the author use
it?** Rule 13 outranks this file: `?.`, `??`, `??=` and `if (x != null) return;` read as modern C# and
are still defensive guards. Keep them only at a genuine boundary; elsewhere the fix is deletion.

## C#

- **LINQ over manual loops** where it stays readable — `Any`, `All`, `First`, `Where`, `Select`,
  `GroupBy`, `Sum`, `OrderBy`. A loop whose whole body is an `if` and an `Add` is a `Where`.
- **`foreach` over index loops** when the index is not used.
- **Pattern matching and `switch` expressions** over `if`/`is`/cast ladders — `is Dog dog`, property
  patterns, relational and `or` patterns, `switch` expressions with `_`.
- **`using` declarations** (`using var stream = …`) over manual `Dispose` and nested `try/finally` —
  rule 17 too.
- **`IEnumerable<T>` and `yield return`** over building a throwaway `List<T>` just to return it.
- **Properties and expression-bodied members** over `GetX()`/`SetX()` pairs.
- **`nameof`** over string literals for member names — rule 10 too.
- **`record`/`record struct`** with `with` expressions instead of hand-written copy constructors.
- **`async`/`await` all the way down.** `.Result` and `.Wait()` are deadlock bugs, not style; an
  `async void` that is not an event handler FAILs.
- **String handling** — interpolation over concatenation, `StringBuilder` in a loop,
  `string.IsNullOrWhiteSpace`, `Span<T>` where the hot path justifies it.
- **Collection expressions, target-typed `new`, named tuples**, `ArgumentNullException.ThrowIfNull` at
  real boundaries.

## Unity

- **`TryGetComponent`** over `GetComponent` plus a null check (a rule 13 FAIL as well).
- **`[SerializeField] private`** over public fields for inspector wiring.
- **`CompareTag("Player")`** over `tag == "Player"` — the string comparison allocates and the literal
  is a rule 10 hit.
- **Cached components** assigned in `Awake`/`Start`, never `GetComponent` inside `Update`.
- **`Time.deltaTime`** in `Update`, `Time.fixedDeltaTime` and physics in `FixedUpdate`.
- **Coroutines, `UniTask` or `Awaitable`** over hand-rolled timer floats counting up in `Update`.
- **Object pooling** over `Instantiate`/`Destroy` on anything spawned per-frame or per-shot.
- **`ScriptableObject`** for shared configuration over static classes full of constants.
- **`sqrMagnitude`** over `magnitude` in comparisons; `Vector3.Distance` only when the real distance
  is needed.
- **`OnEnable`/`OnDisable`** as the subscription pair — every `+=` has a `-=` (rule 17).
- A destroyed `UnityEngine.Object` compares equal to null through an overloaded operator, so `?.` on
  one is misleading as well as defensive — another reason rule 13 deletes it.

**The limit:** idiomatic is not clever. A LINQ chain no one can read, a `switch` expression with eight
nested patterns, a one-line lambda hiding a database call — all FAIL here. LINQ inside `Update`, or
any per-frame allocation, is a performance FAIL even when it reads beautifully; in the hot path the
plain `for` loop is the idiomatic answer.

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

**grep:** `for (int i`, a `(Cast)` after an `is`, `.Result`, `.Wait()`, `async void`, `GetComponent<`
inside `Update`/`LateUpdate`/`FixedUpdate`, `tag ==`, `+` string building in a loop, hand-called
`Dispose()`, `GetX()`/`SetX()` pairs, string literals naming members. Then take the largest method and
ask how a fluent C# developer would write it — in Unity ask twice, once for readability and once for
what it costs per frame.
