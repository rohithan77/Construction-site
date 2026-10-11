// Renders the intro film frame-by-frame.
//
//   node render.mjs --preview [--times 2,10,18] [--out dir]   → PNG stills
//   node render.mjs [--fps 24] [--workers 2] [--from 0 --to 66] [--out file.mp4]
//
// Each worker opens its own headless Chromium, renders a contiguous frame range
// and pipes JPEG frames (PNG for previews) into ffmpeg. Segments are then concatenated and muxed with the
// soundtrack (soundtrack.wav, produced by soundtrack.py) if present.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { ({ chromium } = await import("/opt/node-tools/node_modules/playwright/index.mjs")); }

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]);
    return acc;
  }, []),
);
const FPS = Number(args.fps ?? 24);
const WORKERS = Number(args.workers ?? 2);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".woff2": "font/woff2", ".json": "application/json" };
function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "Content-Type": MIME[path.extname(p)] ?? "application/octet-stream" });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });
}

async function openPage(port) {
  const opts = { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--disable-background-timer-throttling"] };
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH;
  else if (fs.existsSync("/opt/pw-browsers/chromium")) opts.executablePath = "/opt/pw-browsers/chromium";
  const browser = await chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("[page]", e.message));
  page.on("console", (m) => { if (m.type() === "error") console.error("[console]", m.text()); });
  await page.goto(`http://127.0.0.1:${port}/index.html`);
  await page.waitForFunction(() => window.__ready !== undefined);
  await page.evaluate(() => window.__ready);
  return { browser, page };
}

async function frame(page, t) {
  await page.evaluate((tt) => window.setTime(tt), t);
  return page.screenshot({ type: args.preview ? "png" : "jpeg", quality: args.preview ? undefined : 95 });
}

function run(cmd, argv, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, argv, { stdio: ["pipe", "inherit", "inherit"], ...opts });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
    if (opts.feed) opts.feed(p.stdin);
  });
}

const srv = await serve();
const port = srv.address().port;

if (args.preview) {
  const times = String(args.times ?? "2,5.7,9,13,18,21,25,29,32,36,39,41,45,49,53,56,60,64").split(",").map(Number);
  const out = path.resolve(String(args.out ?? path.join(ROOT, "out", "stills")));
  fs.mkdirSync(out, { recursive: true });
  const { browser, page } = await openPage(port);
  for (const t of times) {
    const t0 = Date.now();
    const buf = await frame(page, t);
    const f = path.join(out, `t${String(t.toFixed(2)).padStart(6, "0")}.png`);
    fs.writeFileSync(f, buf);
    console.log(`t=${t}s → ${f} (${Date.now() - t0}ms)`);
  }
  await browser.close();
  srv.close();
  process.exit(0);
}

const DURATION = Number(args.to ?? 66), FROM = Number(args.from ?? 0);
const total = Math.round((DURATION - FROM) * FPS);
const outFile = path.resolve(String(args.out ?? path.join(ROOT, "out", "root-and-rise-intro.mp4")));
const segDir = path.join(ROOT, "out", "segments");
fs.mkdirSync(segDir, { recursive: true });

const chunk = Math.ceil(total / WORKERS);
const started = Date.now();
let done = 0;
const segs = [];
await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const a = w * chunk, b = Math.min(total, a + chunk);
  if (a >= b) return;
  const seg = path.join(segDir, `seg${w}.mkv`);
  segs[w] = seg;
  const { browser, page } = await openPage(port);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv444p", seg], { stdio: ["pipe", "inherit", "inherit"] });
  const ffDone = new Promise((res, rej) => ff.on("exit", (c) => (c === 0 ? res() : rej(new Error("ffmpeg segment failed")))));
  for (let i = a; i < b; i++) {
    const buf = await frame(page, FROM + i / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    done++;
    if (done % 30 === 0) {
      const el = (Date.now() - started) / 1000;
      console.log(`${done}/${total} frames · ${(el / done).toFixed(2)}s/frame · ETA ${((total - done) * el / done / 60).toFixed(1)} min`);
    }
  }
  ff.stdin.end();
  await ffDone;
  await browser.close();
}));
srv.close();

const list = path.join(segDir, "list.txt");
fs.writeFileSync(list, segs.filter(Boolean).map((s) => `file '${s}'`).join("\n"));
const wav = path.join(ROOT, "out", "soundtrack.wav");
const hasAudio = fs.existsSync(wav);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
await run("ffmpeg", [
  "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list,
  ...(hasAudio ? ["-i", wav] : []),
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high", "-tune", "film",
  "-movflags", "+faststart",
  ...(hasAudio ? ["-c:a", "aac", "-b:a", "192k", "-shortest"] : []),
  outFile,
]);
console.log(`✓ ${outFile} (${((Date.now() - started) / 60000).toFixed(1)} min)`);
