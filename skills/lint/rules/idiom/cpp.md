# idiom — C++

`idiom` is a full-level rule, so this file is not read on a lite run.

**Does the language already have a built-in way to say this, and did the author use it?** The loudest
non-idiom in C++ is **C with classes**: `new` and `delete` by hand, owning raw pointers, C arrays,
`char*` strings, `#define` constants, `printf`, index loops. If the file would compile as C with a few
`class` keywords added, that is this rule and `repetition` both — the standard library already ships
what it is re-implementing. For a file that genuinely is C, read `c.md` instead.

**`guards` outranks this file.** A null check on a pointer the contract says is valid FAILs and the fix
is deletion; if a thing must exist, take a reference and the question disappears. A `catch (...)` that
logs and continues is the swallowing catch under a different syntax. What PASSes is the same as
everywhere: a boundary with a real external source, a check that *is* the business rule, an `assert`,
and RAII cleanup, which never swallows.

## Ownership and lifetime

RAII carries every resource, so `teardown` is satisfied by a type rather than by remembering. An owning
raw pointer FAILs: `std::unique_ptr` is the default, made with `std::make_unique`, and
`std::shared_ptr` appears only where ownership is genuinely shared — `shared_ptr` used as "the safe
pointer" is ownership nobody thought about, not RAII. A raw pointer or reference means non-owning
observer and nothing else.

Follow the rule of zero: write no destructor, copy or move at all, and let members own what they own.
The moment you write one of the five, write all five, mark the move operations `noexcept`, and give any
base class with virtual functions a virtual or protected destructor.

Locks are `std::scoped_lock` or `std::lock_guard`, never a manual `.lock()` and `.unlock()` pair with a
`return` in between. Files, sockets and handles get a wrapper type or `std::fstream`, not an acquire
here and a release three branches later.

## The library instead of the hand-rolled version

`std::vector`, `std::array` and `std::string` replace C arrays and `char*` buffers; `std::string_view`
and `std::span` are the non-owning parameter types, which removes a pointer-plus-length pair from every
signature. Range-based `for` and `<algorithm>` — `std::find_if`, `std::any_of`, `std::accumulate`,
`std::ranges::sort` — replace index loops, and they also remove the signed/unsigned comparison against
`.size()`.

`std::optional`, `std::variant` and `std::expected` replace sentinel returns like `-1` and `nullptr`
and replace out-parameters, which is `errors` and `flags` at the same time. Structured bindings replace
`.first` and `.second`. `<chrono>` types replace a bare `int` holding milliseconds, which is `types` and
`clock` both. `std::format` or streams replace `printf`, and `constexpr` replaces `#define` for a
constant, which is `literals`.

`enum class` replaces a plain `enum`, `nullptr` replaces `NULL` and `0`, `override` and `final` go on
every overriding member, and `= default` and `= delete` say what the compiler should and should not
generate. Templates with concepts, and `if constexpr`, replace macros that pretend to be generic. Use
`auto` where the type is obvious from the initialiser or unspellable, not as a way to avoid naming
anything. Pass a sink parameter by value and `std::move` into place, and never `std::move` a local on
the `return` line, which blocks the copy elision it was meant to help.

`using namespace std;` never appears in a header.

**A framework's model wins over the standard library's.** Qt parent-child ownership, Unreal's `UObject`
lifecycle and `TArray`, a game engine's own allocator — inside those, the framework's containers and
ownership rules are the idiom, and forcing `std::unique_ptr` into them is the FAIL. Say which model the
file lives in before judging it.

**The limit:** idiomatic is not clever. Template metaprogramming nobody can step through, a five-stage
`ranges` pipeline replacing a readable loop, SFINAE where two overloads would do, `auto` so pervasive
that no type is visible anywhere — all FAIL here. In a hot path, a plain loop over contiguous memory is
the idiomatic answer, not the prettiest abstraction.

So a raw `Foo* member` assigned from `new Foo()` becomes a `std::unique_ptr<Foo>` from
`std::make_unique`; a destructor that exists only to `delete` a member disappears under the rule of
zero; `for (int i = 0; i < items.size(); ++i)` becomes `for (const auto& item : items)`;
`char name[64]` with a `strcpy` becomes `std::string`; a `void find(int& outIndex)` becomes a function
returning `std::optional<std::size_t>`; a function returning `-1` for "not found" becomes the same;
`#define PI 3.14159` becomes `constexpr double Pi = 3.14159;`; `enum Color { Red }` becomes
`enum class Color { Red }`; `NULL` becomes `nullptr`; `mutex.lock()` with a later `mutex.unlock()`
becomes `std::scoped_lock lock(mutex);`; `pair->first` and `pair->second` become a structured binding;
and `void sleep(int milliseconds)` becomes `void sleep(std::chrono::milliseconds duration)`.

**grep:** `new `, `delete `, `malloc`, `free(`; raw pointer members in a class that also allocates;
`char ` followed by `[`, plus `strcpy`, `strcat` and `sprintf`; `printf`; `#define` lines carrying a
value; `NULL`; `using namespace std;` in a `.h` or `.hpp`; `.lock()` and `.unlock()`; `for (int i =`
next to `.size()`; a class with a `virtual` member and no virtual destructor; `catch (...)`;
`std::move(` on a `return` line; `shared_ptr` where only one owner ever exists; and out-parameters
passed by non-const reference. Then take the largest class and ask how a fluent modern C++ developer
would write it — if the answer deletes the destructor, the copy constructor and half the members, the
current version FAILs.
