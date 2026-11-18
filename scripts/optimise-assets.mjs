// Converts the verified screenshots in assets-src/ into compressed WebP files
// under public/images/. Run with `npm run assets` after adding a new capture.
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets-src";
const OUT = "public/images";
const MAX_WIDTH = 1600;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

const files = await walk(SRC);
for (const file of files) {
  const rel = path.relative(SRC, file).replace(/\.(png|jpe?g)$/i, ".webp");
  const target = path.join(OUT, rel);
  await mkdir(path.dirname(target), { recursive: true });
  const info = await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(target);
  const before = (await stat(file)).size;
  console.log(
    `${rel.padEnd(52)} ${info.width}x${info.height}  ${(before / 1024).toFixed(0)}KB -> ${(info.size / 1024).toFixed(0)}KB`,
  );
}
