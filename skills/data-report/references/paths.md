# Resolving paths

The skill carries no project path. Resolve each of these every run; do not guess.

## 1. Report delivery folder

First that holds:

1. The user named a path in this conversation.
2. A report folder defined in the project's `CLAUDE.md` / `AGENTS.md` / `README`.
3. An existing project-root folder that already holds similar reports: `docs/`, `reports/`,
   `analysis/`, `dokumanlar/`, `raporlar/`, `analiz/`.
4. None → ask the user. Do not create a new folder on your own.

If older reports already live there, follow their style — language, heading format. Consistency
beats the template. Filename rule: `SKILL.md` Deliver.

## 2. Raw data root

The folder the user pointed at; otherwise look for the project's data folder (`data/`, `logs/`,
`recordings/`, `exports/`, `veriler/`, `kayitlar/`) and have your find confirmed.

Parameters baked into folder or file names are a hint, not data. Where name and content disagree,
the content wins and the disagreement is stated in the report's limits.

## 3. Analysis artefacts

Final charts and the working script go to `<data-root>/<date-or-recording-name>/<subject>-analysis/`;
intermediates stay in the scratchpad.

Data root not writable (read-only mount, network share, inside the repo) → `<date>_<subject>-analysis/`
next to the delivery folder, and say so in the report.

## 4. Python environment

Use the project's environment if it ships one (`environment.yaml`, `requirements*.txt`, `.venv`,
`pyproject.toml`). Do not change the project's dependencies or install packages on your own — if a
package is missing, tell the user.
