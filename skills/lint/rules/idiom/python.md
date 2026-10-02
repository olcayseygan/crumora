# idiom — Python

House picks on top of `idiom` in `core.md`. Everything else, judge as a fluent Python programmer would.

- Constants are SCREAMING_CASE.
- Built-in generics: `list[str]`, `dict[str, int]`, `X | None`; `typing.List`, `Dict`, `Optional` FAIL.
- f-strings only; `%` and `.format(` FAIL.
- EAFP — try and catch the specific exception — only at an IO or third-party boundary. At an input
  boundary, convert once to a typed value as `guards` says. Inside the boundary, neither pre-check nor
  catch.
- A comprehension that needs a conditional expression and a nested loop at once becomes an explicit
  `for` block.
