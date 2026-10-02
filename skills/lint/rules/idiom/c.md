# idiom — C

House picks on top of `idiom` in `core.md`. Everything else, judge as a fluent C programmer would.

- **`guards` sits differently in C.** A returned status is the error mechanism: checking what `malloc`,
  `fopen`, `read`, `ioctl` or any syscall returned PASSes and is never deleted. Re-checking a pointer the
  caller guaranteed, `if (!p) return;` with nothing behind it, a "just in case" `memset`, and a wrapper
  that swallows a status and returns `0` FAIL.
- Allocation is sized from the object: `malloc(sizeof *node)`, never `sizeof(struct node)`.
- Everything not used outside its translation unit is `static`.
- `<stdint.h>` and `<stdbool.h>` types; never an `int` standing in for a boolean. Sizes and indices are
  `size_t`.
- Constants are SCREAMING_CASE, and `enum` or `static const`, not `#define`. A function-like macro becomes `static inline`.
- One release path per function, written as `goto cleanup`; `free(` of the same buffer in several
  branches FAILs.
- Banned: `strcpy`, `strcat`, `sprintf`, `gets`, `atoi`, `atof`, `alloca`, and a VLA sized by anything a
  caller controls.
- A `switch` over an enum has no `default`, so the compiler names the missing case.
- Not C: a vtable struct simulating classes, a `typedef` that hides a pointer, Hungarian notation,
  `#define TRUE 1`, a header that defines rather than declares.
