# idiom — C# and Unity

House picks on top of `idiom` in `core.md`. Everything else, judge as a fluent C# developer would — in
Unity, once for readability and once for per-frame cost.

## C#

- Constants follow C# convention: PascalCase (`MaxRetryCount`), not SCREAMING_CASE.
- Current C# is the target: collection expressions, target-typed `new`, `record` with `with`.
  `ArgumentNullException.ThrowIfNull` only at a real boundary.
- LINQ where it stays readable; never in a per-frame path.

## Unity

- A component the script cannot work without is `[RequireComponent]` plus plain use; `TryGetComponent`
  only where absence is a valid state.
- Inspector wiring is `[SerializeField] private`, never a public field.
- Nothing allocates per frame: no `GetComponent`, LINQ or string building inside `Update`,
  `LateUpdate` or `FixedUpdate`; the plain `for` loop is the hot-path answer.
- Coroutines, `UniTask` or `Awaitable` replace timer floats counted up in `Update`.
- Anything spawned per frame or per shot is pooled, not `Instantiate`/`Destroy`.
- Shared configuration lives in a `ScriptableObject`, not a static class of constants.
