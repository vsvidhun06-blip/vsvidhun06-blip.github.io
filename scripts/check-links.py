"""Checks internal links and in-page anchors across the static export in out/.

Usage: python scripts/check-links.py   (run after npm run build)
Prints broken internal links and the list of external URLs for a manual check.
"""
import glob
import html
import os
import re

ROOT = "out"
bad = set()
external = set()
ids_cache = {}


def ids_in(path):
    if path not in ids_cache:
        with open(path, encoding="utf-8") as fh:
            ids_cache[path] = set(re.findall(r'id="([^"]+)"', fh.read()))
    return ids_cache[path]


for f in glob.glob(f"{ROOT}/**/*.html", recursive=True):
    norm = f.replace(os.sep, "/")
    if "/demos/" in norm:
        continue
    with open(f, encoding="utf-8") as fh:
        src = fh.read()
    for h in re.findall(r'href="([^"]+)"', src):
        h = html.unescape(h)
        if h.startswith("http"):
            external.add(h)
            continue
        if h.startswith(("mailto:", "/_next")):
            continue
        path, _, anchor = h.partition("#")
        if not path:
            target = f
        else:
            target = ROOT + path.split("?")[0]
            if target.endswith("/"):
                target += "index.html"
            if not os.path.exists(target):
                bad.add((norm, h))
                continue
        if anchor and target.endswith(".html") and anchor not in ids_in(target):
            bad.add((norm, h))

print("broken internal links:", sorted(bad) or "none")
print("external links:")
for e in sorted(external):
    print("  " + e)
