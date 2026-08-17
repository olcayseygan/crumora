---
name: report
description: Runs a data, measurement, root-cause or comparison study and delivers it as a dated, self-contained single-file HTML report. Use when the user says "/report", "analyse this data", "write a report", "measure this", "compare A and B", "find the root cause", "characterise this", "which one is better", "summarise these logs", or the Turkish equivalents "analiz et", "rapor çıkar", "raporla", "ölç", "karşılaştır", "kök neden bul". Fits log/CSV/raw-data studies, A-B comparisons, tuning, performance measurement, regression investigation, survey and metric summaries. Do NOT use for reviewing source code — that is audit — or for plain reading and searching a codebase.
---

# report — measure it and write it up

Answer a question **with numbers you can defend**, then hand back a single HTML file anyone can open.

The fifth sibling of **rewrite**, **refactor**, **reskin** and **audit**. Those four act on code;
this one acts on *data*. Same house discipline — evidence over vibes, stated limits, no pretending to
be more certain than the measurement allows — but the artefact is a report rather than a diff.

Domain-agnostic. Two outputs: **(1)** a verified set of findings, **(2)** a shareable single-file
HTML report. The report goes to a mixed audience — someone with no background in the subject and the
engineer who has to reproduce it read the same document, so it is written in three layers.

The two failure modes it exists to prevent:

- **The confounded result** — a real difference measured, attributed to the wrong cause. Condition B
  looks 20% better because it ran on twice the sample, not because it is better.
- **The trusted label** — a column called `duration_ms` that holds seconds, a file named
  `run-30fps-high` recorded at a different setting. The name is a hint; only the content is evidence.

---

## Invariants

- **Work read-only.** Never modify the source data or the runtime code of the project under study.
  Temporary scripts and intermediates go to the scratchpad directory.
- **Verify the input; do not trust the name (MUST).** Open a field, column, flag or file and confirm
  what it actually carries. A field called `roll` may not be roll.
- **Never present a confound as a result.** Normalise the effects that are not the thing being asked
  about — sample count, duration, volume, season, version drift. If you cannot normalise one, say so
  explicitly in Notes.
- **Do not force a dirty metric.** If a metric carries leakage or an artefact, say so and change the
  metric. A conclusion drawn from a bad metric is worse than no conclusion.
- **Report language = the language the user is speaking** (their language, not necessarily English).
  Translate the template headings into it. The prose and headings follow the user; code, identifiers
  and commits still follow the project's own rules.
- Raw charts and analysis scripts are copied to a **visible** folder. The user does not go looking in
  the scratchpad.

## Flow

### 1. Pin the scope (short)

Decide: which question, which data, which metric, is there a decision to make. If different readings
lead to different work, ask; if they don't, state the assumption and continue.

- **Decision study** (which is better, which setting, what should we do) → a **Recommendation** box
  in the report is mandatory.
- **Descriptive study** (characterisation, measurement, inventory) → no box, Conclusion only.

### 2. Find the data and inventory it

List the folder or source: file types, sizes, date ranges, row and record counts. Which file belongs
to which condition — confirm that **from the content, not the name** (header, first N rows, metadata,
schema).

If you do not recognise a format, decode a small sample and write down its structure *before*
measuring anything.

### 3. Choose the metric

Pick **one** primary metric that isolates the question being asked. Write down: why this metric, what
it normalises, what it is blind to. One primary plus at most 2-3 supporting metrics — metric
inflation makes a report unreadable.

For any numeric comparison: give the ratio or multiple alongside the absolute value, always show the
sample count, and never build a claim on a single sample.

### 4. Probe → visualise → narrow

Get the first chart out fast, look at it, fix the filter or the metric, plot again. Do not wait for
the right chart on the first attempt.

Keep out-of-range data out of the measurement — the region where the system was not running, the
warm-up period, a partial final day — and **say in the report which range you measured over**.

### 5. Produce the charts

`scripts/chart.py` — matplotlib Agg, styled to match the report palette; both embeds base64 and
writes a PNG to the visible folder.

```python
import sys, os; sys.path.insert(0, os.path.join(SKILL_DIR, "scripts"))
from chart import setup_style, save_and_embed
import matplotlib.pyplot as plt

setup_style()
fig, ax = plt.subplots(figsize=(10, 5))
# ... plot ...
img_tag = save_and_embed(fig, "short-name", ANALYSIS_DIR)   # returns <img src="data:...">
```

`SKILL_DIR` is this skill's own folder: `${CLAUDE_PLUGIN_ROOT}/skills/report` when installed as a
plugin, `~/.claude/skills/report` when copied in by hand. Resolve it once, do not hardcode it.

If matplotlib is missing, use the project's existing Python environment before reaching for
`pip install`; if there is none, tell the user and fall back to inline SVG or an HTML table.

Chart rules: axis labels carry units and are in the report language, one explanatory sentence under
every chart (`.cap`), and more than 6 series or bars means small multiples (`small_multiples`). If
the `dataviz` skill is available in the session, follow it for categorical colour choices.

**Each chart belongs to one layer** (see below) and carries one idea. A chart that needs a paragraph
of setup is in the wrong layer. Never repeat the same chart at two resolutions in two layers.

- Layer one: a single at-a-glance shape — the comparison, the trend, the pass/fail band. No axis a
  reader has to decode. Often no chart at all is the right call here.
- Layer two: distribution and comparison — per condition, per group, per period; ratios with their
  sample counts.
- Layer three: mechanism and diagnostics — raw traces, residuals, the confound that had to be
  normalised, the range that was cut and why.

### 6. Write the report

Copy `references/report-template.html` and fill it in. It runs in **three layers, three readers**,
each readable on its own — someone who stops after layer one still knows what was decided, someone
who starts at layer three does not have to scroll back. Nothing is said twice in three registers.

**Layer one — anyone.** The answer up front: what was asked, what came out, what it means in
practice. Plain language, no jargon, no method, no units a reader has to decode. If there is a
decision, the **Recommendation** box sits here.

**Layer two — people who know the field but not this study.** The question in its context, the
numbers — KPIs, charts, tables, a sentence of interpretation under every visual — and the conclusion
with its level of certainty.

**Layer three — engineers.** How it was measured and why that measurement is sound, what was
normalised, the range it was measured over, assumptions, limits, confounds, what was not measured,
and the data detail: dates, durations, source names, sample counts, script path. Someone must be able
to reproduce the study from this layer alone.

**Headings name their own content (MUST)** — the subject, the number, the decision. They follow this
particular study, not a template. **Banned outright:** "executive summary", "management summary",
"yönetici özeti", "yönetim özeti", "easy summary", "kolay özet", "quick summary", "TL;DR",
"overview", "genel bakış", and any heading whose whole content is *summary* plus an audience name.
Label a layer with its finding — *"B setting halves the drop rate"* — not with its abstraction level.

Explain jargon in one parenthesised word the first time it appears.

### 7. Deliver

- Report → `<delivery-folder>/YYYY-MM-DD_<subject>.html`; today's date, `<subject>` in kebab-case.
  To resolve the delivery folder: `references/paths.md`.
- Raw PNGs and analysis scripts → a visible `<subject>-analysis/` folder next to the data; show that
  path in the report footer.
- **Verify it is self-contained (MUST):** `grep -o 'src="[^d]' report.html` must come back empty (all
  `src` base64), and there must be no `<link` or `<script src`.
- If a reusable lesson came out of it (a method trap, a data-format surprise, a conclusion), write a
  short **project memory**; update the existing memory rather than opening a duplicate.

Closing message: the report path, one sentence of conclusion, and the recommendation if there is one.
Do not dump the report body back into the chat.

## Checklist

Walk `references/checklist.md` before delivering.

---

## MUST summary

- Read-only: source data and project runtime code come out unchanged.
- Confirm what every field, column and file actually contains — the name is a hint, the content is
  the evidence.
- One primary metric that isolates the question; sample counts always visible; no claim from a single
  sample.
- Normalise confounds, or state the ones you couldn't in Notes.
- State the range you measured over and why.
- Decision study → a Recommendation box backed by a number.
- Three layers — anyone, then the informed, then engineers — each standing on its own, nothing
  repeated between them; every chart belongs to exactly one layer.
- Headings name their own content; generic summary labels are banned.
- Report language follows the user; headings get translated.
- The HTML is self-contained — no external `link`, `script src` or remote images — and verified so.
- Raw charts and scripts land in a visible folder, referenced from the footer.
- Closing message is a path plus one sentence, not the report.
