// Screenshot helper that drives a real (GPU-backed) Chrome window over the
// DevTools protocol. No Puppeteer dependency: Node's built-in WebSocket is used.
//
// Usage:
//   node scripts/capture.mjs <url> <out.png> [width] [height] [waitMs] [fullPage] [mobile] [scrollY] [clickSelector]
//
// Example:
//   node scripts/capture.mjs http://localhost:3000/ shots/home.png 1440 900 2500 true
import { spawn } from "node:child_process";
import { mkdir, writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const [, , url, out, w = "1440", h = "900", wait = "2500", full = "false", mobile = "false", scrollY = "0", clickSel = ""] =
  process.argv;
if (!url || !out) {
  console.error("usage: capture.mjs <url> <out.png> [width] [height] [waitMs] [fullPage] [mobile] [scrollY] [clickSelector]");
  process.exit(1);
}

const CHROME =
  process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9300 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(path.join(tmpdir(), "cap-"));
const chrome = spawn(
  CHROME,
  [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--enable-unsafe-webgpu",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--window-position=-2400,0",
    `--window-size=${Number(w) + 16},${Number(h) + 140}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targetWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome did not expose a debugging target");
}

const ws = new WebSocket(await targetWs());
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const consoleErrors = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method === "Runtime.exceptionThrown") {
    consoleErrors.push(msg.params.exceptionDetails?.exception?.description ?? msg.params.exceptionDetails?.text);
  } else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(" "));
  } else if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
    consoleErrors.push(`${msg.params.entry.text} ${msg.params.entry.url ?? ""}`);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m) => (m.error ? reject(new Error(m.error.message)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: Number(w),
  height: Number(h),
  deviceScaleFactor: mobile === "true" ? 2 : 1,
  mobile: mobile === "true",
});
if (mobile === "true") {
  await send("Emulation.setTouchEmulationEnabled", { enabled: true });
}
await send("Page.navigate", { url });
await sleep(Number(wait));
if (Number(scrollY) > 0) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${Number(scrollY)})` });
  await sleep(1200);
}
// Optional: HOLD_KEY="83:2500" holds a key (keyCode 83 = S) for 2.5 s, for 3D demos.
if (process.env.HOLD_KEY) {
  const [code, ms] = process.env.HOLD_KEY.split(":").map(Number);
  const key = String.fromCharCode(code);
  await send("Input.dispatchKeyEvent", { type: "keyDown", windowsVirtualKeyCode: code, key, code: `Key${key}` });
  await sleep(ms);
  await send("Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: code, key, code: `Key${key}` });
  await sleep(800);
}
if (clickSel) {
  await send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(clickSel)})?.click()` });
  await sleep(1500);
}

// Optional: EVAL="js" runs a snippet in the page (e.g. to open a menu) before the shot.
if (process.env.EVAL) {
  const r = await send("Runtime.evaluate", { expression: process.env.EVAL, awaitPromise: true, returnByValue: true });
  if (r.result?.value !== undefined) console.log("eval:", JSON.stringify(r.result.value));
  await sleep(1200);
}

let clip;
if (full === "true") {
  // Scroll through the page so lazy sections and reveal animations run.
  const { result } = await send("Runtime.evaluate", {
    expression: "document.documentElement.scrollHeight",
    returnByValue: true,
  });
  const total = result.value;
  for (let y = 0; y < total; y += Math.floor(Number(h) * 0.8)) {
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` });
    await sleep(400);
  }
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
  await sleep(900);
  const rv = await send("Runtime.evaluate", {
    expression: "[document.querySelectorAll('.reveal.in').length, document.querySelectorAll('.reveal').length].join('/')",
    returnByValue: true,
  });
  console.log("revealed", rv.result.value);
  const m = await send("Page.getLayoutMetrics");
  clip = { x: 0, y: 0, width: Number(w), height: Math.min(m.cssContentSize.height, 16000), scale: 1 };
}

const shot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: full === "true",
  ...(clip ? { clip } : {}),
});
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, Buffer.from(shot.data, "base64"));
console.log(`saved ${out}`);
if (consoleErrors.length) {
  console.log("console errors:");
  for (const e of consoleErrors) console.log("  " + e);
} else {
  console.log("console errors: none");
}
ws.close();
chrome.kill();
