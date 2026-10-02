# idiom — C++

House picks on top of `idiom` in `core.md`. Everything else, judge as a fluent modern C++ developer
would.

- **Say which ownership model the file lives in first.** Inside Qt parent-child, Unreal `UObject` /
  `TArray` or an engine allocator, the framework's containers and ownership are the idiom, and forcing
  `std::unique_ptr` into them FAILs.
- Constants are SCREAMING_CASE, or `kConstant` where the file already uses it — one style per file.
- Outside a framework: no owning raw pointer; `std::shared_ptr` only where ownership is really shared.
- If a thing must exist, take a reference — the null check disappears with the pointer.
- Sentinel returns (`-1`, `nullptr`) and out-parameters become `std::optional` or `std::expected`.
- Durations are `<chrono>` types, never a bare `int` of milliseconds.
- `auto` only where the type is obvious from the initialiser or unspellable.
- In a hot path a plain loop over contiguous memory beats a `ranges` pipeline. Template metaprogramming
  or SFINAE where two overloads would do FAILs.
