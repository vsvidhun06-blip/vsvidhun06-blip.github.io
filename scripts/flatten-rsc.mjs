// Next 16 static export writes per-segment prefetch payloads as nested folders,
// e.g. out/archive/__next.archive/__PAGE__.txt, but the client router requests
// the dotted name out/archive/__next.archive.__PAGE__.txt. Static hosts then
// answer 404. This copies each nested payload to its dotted name.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const out = new URL("../out", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
let n = 0;

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      for (const f of files(p)) {
        const flat = join(dir, `${name}.${relative(p, f).split(sep).join(".")}`);
        copyFileSync(f, flat);
        n++;
      }
    } else {
      walk(p);
    }
  }
}

walk(out);
console.log(`flatten-rsc: wrote ${n} prefetch aliases`);
