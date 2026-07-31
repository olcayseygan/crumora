# Resolving paths (delivery + artefacts)

This skill is user-level; it carries no path belonging to any project. Resolve each of the following
in order, every run. Do not guess.

## 1. Report delivery folder

Try in order, take the first that holds:

1. The user named a path in this conversation → that one.
2. A report delivery folder is defined in the project's `CLAUDE.md` / `AGENTS.md` / `README` → that
   one.
3. A folder that already exists at the project root and already contains similar reports: `docs/`,
   `reports/`, `analysis/`, `dokumanlar/`, `raporlar/`, `analiz/`.
4. None of the above → ask the user. Do not decide to create a new folder on your own.

If older reports already live in that folder, **follow their naming and style** — filename pattern,
language, heading format. Consistency beats the template.

## 2. Raw data root

The folder the user pointed at. If they didn't point at one, look for the project's data or recording
folder (`data/`, `logs/`, `recordings/`, `exports/`, `veriler/`, `kayitlar/`) and have your find
confirmed.

**Do not accept parameters in a folder or file name as data.** Long filenames that bake the setting
or condition in (`test-v2-30fps-quality_high-...`) are a hint, not evidence; nothing enters the report
until it is confirmed from the content. Where the name and the content disagree, the content wins and
the disagreement goes into Notes.

## 3. Analysis artefacts

Raw PNGs and the scripts that produced them go into a folder **visible, next to the data**:

```
<data-root>/<date-or-recording-name>/<subject>-analysis/
    coverage.png
    decode_and_measure.py
```

If the data root is not writable (read-only mount, network share, inside the repo) → create
`<date>_<subject>-analysis/` next to the delivery folder instead, and say so in the report.

Intermediates stay in the scratchpad; only the final charts and the working script are copied here.

## 4. Python environment

If the project ships an environment, use it (`environment.yaml`, `requirements*.txt`, `.venv`,
`pyproject.toml`). Do not change the project's dependencies for an analysis and do not install
packages on your own — if a package is missing, tell the user.
