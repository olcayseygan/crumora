# Syntax minimums

The smallest correct form per library and type. Copy the shape, replace the labels, add nothing —
themes, classes and styling stay out unless a shape carries meaning.

## Mermaid (default)

Flowchart — `TD` top-down for processes, `LR` for pipelines:

```mermaid
flowchart TD
    in[incoming request] --> auth{token valid?}
    auth -->|no| rej[401 returned]
    auth -->|yes| cache{in cache?}
    cache -->|hit| out[response sent]
    cache -->|miss| db[(record store)]
    db --> out
```

Shapes: `[box]` step · `{diamond}` decision · `([stadium])` start/end · `[(cylinder)]` store ·
`[[subroutine]]` a step drawn in detail elsewhere. Dashed edge for unverified: `a -.-> b`.

Sequence — `participant` order is the column order, so put the initiator first:

```mermaid
sequenceDiagram
    participant C as client
    participant A as api
    participant D as store
    C->>A: submit order
    A->>D: write record
    D-->>A: ack
    A-->>C: 201 created
    Note over A,D: retried twice on timeout
```

`->>` call · `-->>` reply · `alt`/`else`/`end` for branches · `loop … end` for repetition.

State — the label on the arrow is the event, not the state:

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> loading: fetch requested
    loading --> ready: data received
    loading --> failed: timeout
    failed --> loading: retry
    ready --> [*]
```

ER:

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
```

Gotchas: quote any label holding `()`, `,` or `:` — `a["step (fast path)"]`; `end` is reserved, write
`End` or `done`; a subgraph is a container, not a node — edges attach to what is inside it.

## Graphviz

```dot
digraph {
    rankdir=TB;
    node [shape=box];
    auth [shape=diamond, label="token valid?"];
    in -> auth;
    auth -> rej [label="no"];
    auth -> out [label="yes"];
    unverified -> out [style=dashed];
}
```

`rankdir=LR` for pipelines · `shape=cylinder` for a store · `subgraph cluster_x { label="…" }` for a
boxed group. Ids with spaces or punctuation must be quoted.

## D2

```d2
direction: down
in: incoming request
auth: token valid?  { shape: diamond }
store: record store { shape: cylinder }

in -> auth
auth -> rej: no
auth -> store: yes
store -> out
```

Nesting is containment — `api.handler -> api.store` draws both inside `api`. Dashed edge:
`a -> b { style.stroke-dash: 4 }`.

## PlantUML

Activity:

```plantuml
@startuml
start
:receive request;
if (token valid?) then (yes)
  :serve response;
else (no)
  :return 401;
endif
stop
@enduml
```

Sequence:

```plantuml
@startuml
client -> api : submit order
api -> store : write record
store --> api : ack
api --> client : 201 created
@enduml
```

Keep `skinparam` out; the default rendering is fine and the diagram is the point.
