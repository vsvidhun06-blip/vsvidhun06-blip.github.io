// Fails if user-facing text contains an em dash or a double hyphen.
// Scans the built HTML (visible text only) plus content and component sources.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const problems = [];

function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(p))) out.push(p);
  }
  return out;
}

// 1. Rendered pages: strip scripts, styles, tags, then look at visible text.
for (const file of walk(join(root, "out"), [".html"])) {
  if (file.includes(`${join("out", "demos")}`)) continue;
  const html = readFileSync(file, "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const text = html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
  const attrs = [...html.matchAll(/(?:alt|title|aria-label|content|placeholder)="([^"]*)"/g)].map((m) => m[1]);
  for (const chunk of [text, ...attrs]) {
    for (const m of chunk.matchAll(/.{0,40}(—|--).{0,40}/g)) {
      problems.push(`${file.slice(root.length)}: ${m[0].trim()}`);
    }
  }
}

// 2. Source strings in content files (catches text not yet rendered).
for (const file of walk(join(root, "content"), [".ts"])) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (/^\s*\/\//.test(line)) return;
      if (line.includes("—")) problems.push(`${file.slice(root.length)}:${i + 1}: em dash`);
      for (const m of line.matchAll(/["'`][^"'`]*--[^"'`]*["'`]/g)) problems.push(`${file.slice(root.length)}:${i + 1}: ${m[0]}`);
    });
}

if (problems.length) {
  console.error(`Copy check failed (${problems.length}):`);
  for (const p of [...new Set(problems)]) console.error("  " + p);
  process.exit(1);
}
console.log("Copy check passed: no em dashes or double hyphens in user-facing text.");
