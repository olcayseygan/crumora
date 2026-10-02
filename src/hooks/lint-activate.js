#!/usr/bin/env node
// crumora — lint SessionStart activation hook
//
// Runs on every session start, resume and compaction:
//   1. Resolves the lint level (env > nearest .lint.md up to the repo root > full)
//   2. Emits a thin always-on directive as hidden SessionStart context
//
// This injects a writing standard, not the rule set. The full rules live in
// skills/lint/rules/core.md and are read only when the lint skill runs, so the
// per-session cost stays a dozen lines instead of five hundred.

const fs = require('fs');
const path = require('path');

const LEVEL = Object.freeze({ OFF: 'off', LITE: 'lite', FULL: 'full', ULTRA: 'ultra' });
const VALID_LEVELS = Object.values(LEVEL);
const DEFAULT_LEVEL = LEVEL.FULL;
const LEVEL_ENVIRONMENT_VARIABLE = 'CRUMORA_LINT_LEVEL';
const OVERRIDE_FILE_NAME = '.lint.md';
const REPOSITORY_MARKER = '.git';
const LEVEL_LINE_PATTERN = /^\s*level\s+(\S+)/im;
const TEXT_ENCODING = 'utf8';
const STDIN_FILE_DESCRIPTOR = 0;
const SILENT_OUTPUT = 'OK';

// SessionStart hands the hook a JSON payload on stdin carrying the project cwd.
// Reading fd 0 is a genuine IO boundary: no stdin on a manual run, so fall back.
function getProjectDirectory() {
  try {
    const payload = JSON.parse(fs.readFileSync(STDIN_FILE_DESCRIPTOR, TEXT_ENCODING));
    if (payload.cwd) return payload.cwd;
  } catch (error) { /* no stdin, or not JSON */ }
  return process.cwd();
}

function findOverrideFile(startDirectory) {
  let directory = startDirectory;
  for (;;) {
    const candidate = path.join(directory, OVERRIDE_FILE_NAME);
    if (fs.existsSync(candidate)) return candidate;
    if (fs.existsSync(path.join(directory, REPOSITORY_MARKER))) return null;
    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

function readLevelFromOverrideFile(startDirectory) {
  const overridePath = findOverrideFile(startDirectory);
  if (!overridePath) return null;
  const match = fs.readFileSync(overridePath, TEXT_ENCODING).match(LEVEL_LINE_PATTERN);
  if (!match) return null;
  const level = match[1].toLowerCase();
  return VALID_LEVELS.includes(level) ? level : null;
}

function resolveLevel(projectDirectory) {
  const environmentLevel = (process.env[LEVEL_ENVIRONMENT_VARIABLE] || '').toLowerCase();
  if (VALID_LEVELS.includes(environmentLevel)) return environmentLevel;
  return readLevelFromOverrideFile(projectDirectory) || DEFAULT_LEVEL;
}

const SURFACE = 'names, verbs, nouns, booleans, literals, comments, spacing';
const BEHAVIOUR =
  'types, repetition, idiom, guards, teardown, dead-code, mutation, errors, flags, floating, clock';
const ARCHITECTURE = 'solid, single-entry, tests, direction';

const SURFACE_COST =
  'Name things for what they hold, no abbreviations and no type suffixes. Verbs do, nouns hold, ' +
  'booleans read as assertions. No magic number or bare string outside a named constant. No comment ' +
  'restating the code. One blank line where a thought ends, none inside one.';
const BEHAVIOUR_COST =
  'Typed signatures, no untyped escape hatch. No defensive null check and no swallowing catch outside ' +
  'a real IO, user or third-party boundary — let the error surface. Every resource acquired is released ' +
  'on every path. No dead code left behind, no hidden mutation of an argument, no unawaited promise. ' +
  'Errors name the value and the expectation. Time and randomness come in as dependencies.';
const ARCHITECTURE_COST =
  'One reason to change per unit, one entry point per behaviour, dependencies pointing inward, and a ' +
  'test for every behaviour added or changed.';
const FLOOR_GATE = 'floor, at every level — injection, and never a hardcoded secret';
const FLOOR_COST =
  'Anything crossing into SQL, a shell, HTML or a path is parameterised or escaped. A key, token, ' +
  'password or connection string is never written into the source — it is read from the environment.';

const projectDirectory = getProjectDirectory();
const level = resolveLevel(projectDirectory);

if (level === LEVEL.OFF) {
  process.stdout.write(SILENT_OUTPUT);
  process.exit(0);
}

const gate = [`surface — ${SURFACE}`];
const cost = [SURFACE_COST];
if (level === LEVEL.FULL || level === LEVEL.ULTRA) {
  gate.push(`behaviour — ${BEHAVIOUR}`);
  cost.push(BEHAVIOUR_COST);
}
if (level === LEVEL.ULTRA) {
  gate.push(`architecture — ${ARCHITECTURE}`);
  cost.push(ARCHITECTURE_COST);
}
gate.push(FLOOR_GATE);
cost.push(FLOOR_COST);

process.stdout.write(
  `LINT ALWAYS ON — level: ${level}\n\n` +
  'Code you write here passes the lint gate at this level before you hand it over. The gate:\n' +
  gate.map((line) => `  ${line}`).join('\n') + '\n\n' +
  'What that costs at writing time. ' + cost.join(' ') + '\n\n' +
  'This is a writing standard, not a command: never run the lint skill on your own initiative — the ' +
  'user runs it. When it does run, the full rules are in the lint skill under rules/core.md, and it ' +
  'runs at this level unless the invocation names another. Switch level with ' +
  `${LEVEL_ENVIRONMENT_VARIABLE}, or with a \`level lite\` line in the nearest ${OVERRIDE_FILE_NAME} ` +
  'up to the repository root; `off` silences this block only, and the skill then runs at full.'
);
