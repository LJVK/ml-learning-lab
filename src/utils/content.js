// Content loader — glob-imports every markdown file in ml_learning_lab_content/
// at build time and exposes them by (kind, conceptId) lookup.
//
// This uses Vite's import.meta.glob with { as: 'raw', eager: true } which
// inlines the .md text into the bundle as strings. No runtime fetch, no
// separate build step, and it works with GitHub Pages (fully static).
//
// If content grows large enough to hurt initial bundle size, switch to
// lazy loading: `{ as: 'raw' }` (no `eager`) returns import functions.

const RAW_MODULES = {
  questions: import.meta.glob(
    "../../ml_learning_lab_content/questions/*.md",
    { query: "?raw", import: "default", eager: true }
  ),
  code: import.meta.glob(
    "../../ml_learning_lab_content/code/*.md",
    { query: "?raw", import: "default", eager: true }
  ),
  cheatsheets: import.meta.glob(
    "../../ml_learning_lab_content/cheatsheets/*.md",
    { query: "?raw", import: "default", eager: true }
  ),
};

// Filenames follow the pattern <concept-id>-<kind>.md (e.g.
// self-attention-questions.md). Extract the id so callers can look up by
// concept + kind cleanly.
function stripSuffix(path, kind) {
  // path is like "../../ml_learning_lab_content/questions/self-attention-questions.md"
  const file = path.split("/").pop() || "";
  const bare = file.replace(/\.md$/, "");
  // strip trailing "-<kind>" or "-<kind>s" (cheatsheets/questions plural in dir)
  const singular = kind.endsWith("s") ? kind.slice(0, -1) : kind;
  return bare.replace(new RegExp(`-${singular}$`), "");
}

function buildIndex() {
  const idx = { questions: {}, code: {}, cheatsheets: {} };
  for (const kind of Object.keys(RAW_MODULES)) {
    for (const [path, raw] of Object.entries(RAW_MODULES[kind])) {
      const id = stripSuffix(path, kind);
      idx[kind][id] = raw;
    }
  }
  return idx;
}

// Cheatsheets/questions/code use dir-name plural. The concept file suffix
// uses singular for code/questions/cheatsheet — e.g. `self-attention-code.md`,
// `self-attention-questions.md`, `self-attention-cheatsheet.md`. Handle both.
const CONTENT = buildIndex();

// Very small YAML front-matter parser: supports flat `key: value` pairs and
// simple `key:\n  - item` list syntax. Enough for our files' shape. Returns
// { frontMatter: {...}, body: str }.
export function splitFrontMatter(raw) {
  if (!raw.startsWith("---")) return { frontMatter: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { frontMatter: {}, body: raw };

  const fmBlock = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, "");

  const frontMatter = {};
  let currentListKey = null;
  for (const line of fmBlock.split("\n")) {
    if (!line.trim()) continue;
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentListKey) {
      frontMatter[currentListKey].push(listItem[1].trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, val] = kv;
    if (val === "") {
      // Multi-line list follows
      frontMatter[key] = [];
      currentListKey = key;
    } else {
      frontMatter[key] = val;
      currentListKey = null;
    }
  }
  return { frontMatter, body };
}

// Public API: getContent("questions", "self-attention") → { frontMatter, body }
// or null if missing.
export function getContent(kind, conceptId) {
  const raw = CONTENT[kind]?.[conceptId];
  if (!raw) return null;
  return splitFrontMatter(raw);
}

// List every concept id we have for a given kind. Used to guard routes.
export function listContent(kind) {
  return Object.keys(CONTENT[kind] || {});
}
