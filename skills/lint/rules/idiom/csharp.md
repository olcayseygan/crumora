# idiom — C# and Unity

`idiom` is a full-level rule, so this file is not read on a lite run.

**Does the language or the engine already have a built-in way to say this, and did the author use it?**
`guards` outranks this file: `?.`, `??`, `??=` and `if (x != null) return;` read as modern C# and are still
defensive guards. Keep them only at a genuine boundary; elsewhere the fix is deletion.

## C#

LINQ replaces manual loops where it stays readable — `Any`, `All`, `First`, `Where`, `Select`, `GroupBy`,
`Sum`, `OrderBy` — and a loop whose whole body is an `if` and an `Add` is a `Where`. `foreach` replaces
index loops when the index is not used. Pattern matching and `switch` expressions replace `if`/`is`/cast
ladders, so `is Dog dog`, property patterns, relational and `or` patterns, and `switch` expressions with
`_`. `using` declarations (`using var stream = …`) replace manual `Dispose` and nested `try/finally`,
which is `teardown` too. `IEnumerable<T>` and `yield return` replace building a throwaway `List<T>` just to
return it. Properties and expression-bodied members replace `GetX()` and `SetX()` pairs. `nameof`
replaces string literals for member names, which is `literals` too. `record` and `record struct` with `with`
expressions replace hand-written copy constructors.

`async`/`await` goes all the way down: `.Result` and `.Wait()` are deadlock bugs rather than style, and an
`async void` that is not an event handler FAILs. String handling means interpolation over concatenation,
`StringBuilder` in a loop, `string.IsNullOrWhiteSpace`, and `Span<T>` where the hot path justifies it.
Collection expressions, target-typed `new`, named tuples and `ArgumentNullException.ThrowIfNull` at real
boundaries all count as current idiom.

## Unity

`TryGetComponent` replaces `GetComponent` plus a null check, which is a `guards` FAIL as well.
`[SerializeField] private` replaces public fields for inspector wiring. `CompareTag("Player")` replaces
`tag == "Player"`, since the string comparison allocates and the literal is a `literals` hit. Components are
cached in `Awake` or `Start`, never fetched with `GetComponent` inside `Update`. `Time.deltaTime` belongs
in `Update`, while `Time.fixedDeltaTime` and physics belong in `FixedUpdate`. Coroutines, `UniTask` or
`Awaitable` replace hand-rolled timer floats counting up in `Update`. Object pooling replaces `Instantiate`
and `Destroy` on anything spawned per-frame or per-shot. `ScriptableObject` replaces static classes full of
constants for shared configuration. `sqrMagnitude` replaces `magnitude` in comparisons, and
`Vector3.Distance` is used only when the real distance is needed. `OnEnable` and `OnDisable` are the
subscription pair, so every `+=` has a `-=`, which is `teardown`. And because a destroyed `UnityEngine.Object`
compares equal to null through an overloaded operator, `?.` on one is misleading as well as defensive —
another reason `guards` deletes it.

**The limit:** idiomatic is not clever. A LINQ chain no one can read, a `switch` expression with eight
nested patterns, a one-line lambda hiding a database call — all FAIL here. LINQ inside `Update`, or any
per-frame allocation, is a performance FAIL even when it reads beautifully; in the hot path the plain `for`
loop is the idiomatic answer.

So `if (obj is Dog) { var dog = (Dog)obj; … }` becomes `if (obj is Dog dog) { … }`;
`for (int i = 0; i < items.Count; i++)` becomes `foreach (var item in items)`; a `new List<X>()` filled by
a `foreach` and an `if` becomes `items.Where(item => item.IsActive).ToList()`; a
`name == null || name.Trim() == ""` check becomes `string.IsNullOrWhiteSpace(name)`; a `GetTotal()` method
becomes `public decimal Total => …`; `PropertyChanged("UserName")` becomes
`PropertyChanged(nameof(UserName))`; `var data = FetchAsync().Result;` becomes
`var data = await FetchAsync();`; a `GetComponent<Rigidbody>()` in `Update` becomes a cached field assigned
in `Awake`; `if (gameObject.tag == "Player")` becomes `if (gameObject.CompareTag(PlayerTag))`; a
`timer += Time.deltaTime; if (timer > 2f)` becomes a coroutine with `WaitForSeconds(ReloadDelay)`; and
`if (Vector3.Distance(a, b) < r)` becomes `if ((a - b).sqrMagnitude < r * r)`.

**grep:** `for (int i`, a `(Cast)` after an `is`, `.Result`, `.Wait()`, `async void`, `GetComponent<`
inside `Update`, `LateUpdate` or `FixedUpdate`, `tag ==`, `+` string building in a loop, hand-called
`Dispose()`, `GetX()`/`SetX()` pairs, and string literals naming members. Then take the largest method and
ask how a fluent C# developer would write it — in Unity ask twice, once for readability and once for what
it costs per frame.
