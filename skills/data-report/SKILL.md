---
name: data-report
description: Runs a data, measurement, root-cause or comparison study and delivers it as a dated, self-contained single-file HTML report. Use when the user says "/data-report", "analyse this data", "write a report", "measure this", "compare A and B", "find the root cause", "characterise this", "which one is better", "summarise these logs", or the Turkish equivalents "analiz et", "rapor çıkar", "raporla", "ölç", "karşılaştır", "kök neden bul". Fits log/CSV/raw-data studies, A-B comparisons, tuning, performance measurement, regression investigation, survey and metric summaries. Do NOT use for checking source code against a rule set — that is lint — or for plain reading and searching a codebase.
---

# data-report — measure it and write it up

Answer a question with numbers you can defend, then hand back one dated, self-contained HTML file
that a reader with no background and the engineer who has to reproduce it can both use.

## Invariants

- **Read-only.** Source data and the project's runtime code come out unchanged. Temporary scripts and
  intermediates go to the scratchpad.
- **Verify the input; do not trust the name (MUST).** Every field, column, flag and file is confirmed
  from its content before it enters the report.
- **Never present a confound as a result.** Normalise what is not the thing being asked about, or
  state in the report's limits what you could not normalise.
- **Do not force a dirty metric.** If a metric carries leakage or an artefact, say so and change it.
- One primary metric, at most 2-3 supporting ones. Sample counts always visible; no claim from a
  single sample. State the range you measured over.
- **Decision study** (which is better, what should we do) → a **Recommendation** box backed by a
  number. **Descriptive study** → no box, conclusion only.
- **Report language = the language the user is speaking.** Headings are written fresh in it for this
  study — there is no canonical heading set to translate. Code, identifiers and commits follow the
  project's own rules.
- Raw charts and analysis scripts are copied to the **visible** analysis folder defined in
  `references/paths.md`; the user does not go looking in the scratchpad.

## Charts

`scripts/chart.py` — matplotlib Agg in the report palette; embeds base64 and writes a PNG to the
visible folder.

```python
import sys, os; sys.path.insert(0, os.path.join(SKILL_DIR, "scripts"))
from chart import setup_style, save_and_embed
import matplotlib.pyplot as plt

setup_style()
fig, ax = plt.subplots(figsize=(10, 5))
# ... plot ...
img_tag = save_and_embed(fig, "short-name", ANALYSIS_DIR)   # returns <img src="data:...">
```

Also `embed(path)` for an existing PNG and `small_multiples(n)` for a panel grid. `SKILL_DIR` is this
skill's folder: `${CLAUDE_PLUGIN_ROOT}/skills/data-report` as a plugin, `~/.claude/skills/data-report` or
`<repo>/.claude/skills/data-report` when copied by hand. Resolve it once, do not hardcode it.

Python environment: `references/paths.md`. Never install packages; if matplotlib is missing, tell the
user and fall back to inline SVG or an HTML table.

Axis labels carry units and are in the report language; one sentence of interpretation under every
chart (`.cap`); more than 6 series or bars → `small_multiples`. If the `dataviz` skill is available,
follow it for categorical colours.

## The report

Copy `references/report-template.html` and fill it in. It runs in **three layers, three readers**,
each readable on its own, nothing said twice across them:

1. **Anyone** — the answer and what it means in practice; no jargon, no method. The Recommendation box
   sits here.
2. **Knows the field, not this study** — the question in context, the numbers, the conclusion and how
   certain it is.
3. **Engineers** — method, what was normalised, the measured range, assumptions, limits, confounds,
   what was not measured, and the data detail (dates, durations, sources, sample counts, script path).
   The study must be reproducible from this layer alone.

Every chart belongs to exactly one layer and appears once.

**Headings name their own content (MUST)** — the subject, the number, the decision. **Banned
outright:** "summary", "özet", "executive summary", "management summary", "yönetici özeti", "yönetim
özeti", "easy summary", "kolay özet", "quick summary", "TL;DR", "overview", "genel bakış", and any
heading whose whole content is an abstraction level or *summary* plus an audience name. The template
and the checklist defer to this list.

Every fixed label in the template (meta line, table headers, footer) is a placeholder too, written
in the report language; the `lang` attribute matches it.

## Deliver

- Report → the delivery folder from `references/paths.md`. Filename: if older reports already live
  there, follow their pattern; otherwise `YYYY-MM-DD_<subject>.html`, today's date, `<subject>` in
  kebab-case.
- Raw PNGs and analysis scripts → the analysis folder from `references/paths.md`; its path in the
  report footer.
- **Verify it is self-contained (MUST)** — this must print nothing (every `src` and `url()` is
  `data:`, every `href` is `#`, `http(s):` or `mailto:`, no `<link`, no `<script src`):

  ```bash
  grep -Eio "<link|<script[^>]*src|(src|href) *= *[\"']?[^\"' >]+|url\( *[\"']?[^\"') ]+" report.html \
    | grep -Eiv "^(src *= *|url\( *)[\"']?data:|^href *= *[\"']?(#|https?:|mailto:)"
  ```
- Walk `references/checklist.md`.
- A reusable lesson (method trap, data-format surprise, conclusion) → a short **project memory**;
  update the existing one rather than opening a duplicate.

Closing message: the report path, one sentence of conclusion, the recommendation if there is one. Do
not dump the report body into the chat.
