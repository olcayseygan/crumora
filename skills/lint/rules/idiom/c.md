# idiom — C

`idiom` is a full-level rule, so this file is not read on a lite run.

**Does the language already have a built-in way to say this, and did the author use it?** C's standard
library is small, so the idiom question here is less "did you use the library" and more "did you use the
language" — `sizeof` on the object, designated initialisers, `static` linkage, fixed-width types, a
single cleanup path. Hand-rolling what the language already expresses is this rule and `repetition`
both.

**`guards` outranks this file, and the boundary sits differently in C.** C has no exceptions, so a
returned status *is* the error mechanism, not a defensive habit. Checking what `malloc`, `fopen`,
`read`, `ioctl` or any syscall handed back is a genuine external risk and PASSes — never delete one.
What FAILs is the same reflex `guards` names everywhere else: re-checking a pointer the caller
guaranteed, an `if (!p) return;` with no handling behind it, a `memset` to zero "just in case", a
wrapper that swallows a status code and returns `0`. If a contract says the pointer is valid, trust it
and let it segfault where the bug is.

## C here

Size the allocation from the object, never the type: `node = malloc(sizeof *node)` and
`items = malloc(count * sizeof *items)`, so the line stays correct when the type changes. Initialise
with designated initialisers and compound literals — `struct Config configuration = { .retryCount = 3 }`
— which also zero every field you did not name, and pass a small struct by value where it is genuinely
small.

Linkage is C's access modifier: everything not used outside its translation unit is `static`, which is
`single-entry` and `dead-code` in one keyword. Headers declare only what is exported, include what they
use, and carry a guard or `#pragma once`.

Types come from `<stdint.h>` and `<stdbool.h>`: `uint32_t`, `int64_t`, `bool` — never an `int` standing
in for a boolean, which is `booleans` too. Sizes and indices are `size_t`, pointer differences are
`ptrdiff_t`, and bit work is done on unsigned types where the shift and the overflow are defined.
Pointer parameters the function does not write through are `const`, and `restrict` goes where the
no-alias promise actually holds.

Constants are `enum` values or `static const`, not `#define`, so they carry a type and a scope — which
is `literals` too. Prefer a `static inline` function to a function-like macro; when a macro must exist,
parenthesise every parameter and the whole body, and never use a parameter twice.

Resource release is one path, and `goto cleanup` is the idiomatic way to write it, not spaghetti: each
acquisition jumps to the label that releases what has been acquired so far, and there is one `return`
at the bottom. That is how `teardown` is satisfied in C, and a nested `if` ladder that frees the same
buffer in four places is the FAIL it replaces.

String and buffer work is bounded and explicit. `snprintf` with `sizeof buffer` replaces `sprintf`;
`memcpy` with a computed length replaces `strcpy` and `strcat`; `strncpy` is not a safe `strcpy`,
because it may not terminate. `gets` is gone from the language, `alloca` and a variable-length array
sized by anything a caller controls are a stack overflow waiting to be triggered, which is `injection`
territory. `strtol` with an end pointer and `errno` replaces `atoi`, which cannot report failure. Read
`errno` immediately after the call that set it, never after a second one.

Switch over an enum without a `default`, so the compiler names the case you forgot. Use `memmove` when
the regions can overlap. Use a flexible array member for a header-plus-payload struct instead of a
second allocation nobody frees. Reach for `qsort` with a real comparator rather than a hand-written
sort, and `assert` for invariants — an assertion aborts, so it is a `guards` PASS.

**Not C, and it shows:** a vtable struct and an "object" pointer simulating classes where three plain
functions would do; a `typedef` that hides pointer-ness, as in `typedef struct foo *Foo`, so the reader
cannot see what owns what; Hungarian notation; `#define TRUE 1` next to `<stdbool.h>`; and a header
that defines rather than declares.

**The limit:** idiomatic is not clever. A macro that expands into a control structure, a pointer cast
chain that only works on one ABI, bit-fiddling that saves four bytes and costs an afternoon — all FAIL
here. Clever C is the kind that compiles today and breaks under the next optimiser.

So `malloc(sizeof(struct node))` becomes `malloc(sizeof *node)`; `char buffer[64]; strcpy(buffer, input);`
becomes `snprintf(buffer, sizeof buffer, "%s", input)`; `#define MAX 10` becomes
`enum { MAX_RETRY_COUNT = 10 };`; `int is_ready` becomes `bool isReady`; `unsigned long length` for a
size becomes `size_t length`; `void print(char *text)` that never writes becomes
`void print(const char *text)`; a helper visible to the whole program becomes `static`; a cleanup ladder
that frees in four branches becomes one `goto cleanup` label; `#define SQUARE(x) x*x` becomes
`static inline int square(int value)`; and `int count = atoi(argument)` becomes `strtol` with an end
pointer and an `errno` check.

**grep:** `strcpy`, `strcat`, `sprintf`, `gets`, `alloca`, `atoi`, `atof`; `malloc(sizeof(` followed by
a type name; `#define` lines carrying a value or a parameter list; `int` variables and fields used as
booleans; non-`static` functions absent from every header; `char *` parameters never written through;
`free(` appearing more than once in a function; `[` with a runtime length in a declaration; `memcpy`
where the ranges may overlap; and `errno` read after a second library call. Then take the longest
function and ask how a fluent C programmer would write it — if the answer is one `goto cleanup` and
half the body deleted, the current version FAILs.
