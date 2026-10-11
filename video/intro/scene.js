// Root & Rise — intro film.
// Every visual is a pure function of time `t` (seconds), so any frame can be
// rendered in any order: window.setTime(t) draws exactly that frame.

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

export const DURATION = 66;
const W = 1920, H = 1080;

/* ───────────────────────── helpers ───────────────────────── */
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (t, a, b) => clamp01((t - a) / (b - a));
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeOutBack = (x) => { const c = 1.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
// in/out envelope: 0 → 1 over [a,b], 1 → 0 over [c,d]
const env = (t, a, b, c, d) => Math.min(easeInOut(range(t, a, b)), 1 - easeInOut(range(t, c, d)));

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const C = (hex) => new THREE.Color(hex);
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

/* ───────────────────────── renderer ───────────────────────── */
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 500);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const fog = new THREE.Fog(0x000000, 70, 190);
scene.fog = fog;

/* ───────────────────────── procedural textures ───────────────────────── */
function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  return tex;
}
function speckle(g, w, h, n, colors, rmin, rmax, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[Math.floor(r() * colors.length)];
    g.globalAlpha = 0.25 + r() * 0.5;
    g.beginPath(); g.arc(r() * w, r() * h, rmin + r() * (rmax - rmin), 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
}

const strataTex = canvasTex(1024, 1024, (g, w, h) => {
  const bands = [
    [0.0, "#4a3426"], [0.10, "#6e4d35"], [0.30, "#8f6a47"], [0.52, "#a98a62"], [0.74, "#b8a07c"], [0.88, "#6c675f"], [1.0, "#5d5852"],
  ];
  const r = rng(7);
  for (let i = 0; i < bands.length - 1; i++) {
    const y0 = bands[i][0] * h, y1 = bands[i + 1][0] * h;
    g.fillStyle = bands[i][1];
    g.beginPath(); g.moveTo(0, y0);
    for (let x = 0; x <= w; x += 32) g.lineTo(x, y0 + Math.sin(x * 0.012 + i) * 9 + (r() - 0.5) * 6);
    g.lineTo(w, y1 + 12); g.lineTo(0, y1 + 12); g.fill();
  }
  speckle(g, w, h, 9000, ["#2e2119", "#c9b28c", "#7b5a3e", "#d8c8a6"], 0.5, 2.6, 11);
  // pebbles in lower strata
  const rp = rng(21);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = ["#857d71", "#9b9283", "#6a645b"][i % 3];
    g.globalAlpha = 0.7;
    g.beginPath(); g.ellipse(rp() * w, h * (0.55 + rp() * 0.45), 3 + rp() * 9, 2 + rp() * 6, rp() * 3, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
}, [3, 1]);

const soilTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#5e4432"; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 7000, ["#3d2b20", "#7a5a40", "#8b6b4c", "#4c372a"], 0.6, 2.4, 3);
}, [6, 6]);

const grassTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#6c7c4d"; g.fillRect(0, 0, w, h);
  const r = rng(5);
  for (let i = 0; i < 16000; i++) {
    const x = r() * w, y = r() * h;
    g.strokeStyle = ["#5a6a3e", "#7f8f5c", "#8e9c68", "#4f5e36"][Math.floor(r() * 4)];
    g.globalAlpha = 0.5;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 2 - r() * 5); g.stroke();
  }
  g.globalAlpha = 1;
}, [8, 8]);

const concreteTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#c2bcb1"; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 5000, ["#a9a397", "#d2cdc3", "#b5afa4"], 0.4, 1.8, 9);
}, [2, 2]);

const timberTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#8a5d3f"; g.fillRect(0, 0, w, h);
  const r = rng(13);
  for (let x = 0; x < w; x += 16) {
    g.fillStyle = ["#7d5337", "#94654a", "#86593c", "#9b6c4f"][Math.floor(r() * 4)];
    g.fillRect(x, 0, 14, h);
    g.fillStyle = "rgba(30,18,10,0.55)"; g.fillRect(x + 14, 0, 2, h);
    for (let k = 0; k < 6; k++) { g.fillStyle = "rgba(60,36,20,0.25)"; g.fillRect(x + r() * 12, 0, 1, h); }
  }
}, [3, 1]);

const renderTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#ece6da"; g.fillRect(0, 0, w, h);
  speckle(g, w, h, 3000, ["#e0d9cb", "#f4efe6"], 0.5, 2, 17);
}, [2, 1]);

const brickTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#d8cdbd"; g.fillRect(0, 0, w, h);
  const r = rng(19); const bh = 16, bw = 48;
  for (let row = 0; row * bh < h; row++) {
    const off = row % 2 ? bw / 2 : 0;
    for (let x = -bw; x < w + bw; x += bw) {
      g.fillStyle = ["#b5694a", "#a85f42", "#bf7454", "#9e5a3f"][Math.floor(r() * 4)];
      g.fillRect(x + off + 1.5, row * bh + 1.5, bw - 3, bh - 3);
    }
  }
}, [2, 2]);

function radialSprite(inner = "rgba(255,255,255,1)", mid = "rgba(255,220,180,0.35)") {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, inner); gr.addColorStop(0.18, mid); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const glowTex = radialSprite();

/* ───────────────────────── sky dome ───────────────────────── */
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {
    top: { value: C("#05070b") }, horizon: { value: C("#0d1117") }, bottom: { value: C("#030303") },
    sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunColor: { value: C("#ffffff") }, sunGlow: { value: 0 },
  },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor; uniform float sunGlow;
    varying vec3 vDir;
    void main(){
      float h = vDir.y;
      vec3 col = h > 0.0 ? mix(horizon, top, pow(clamp(h,0.0,1.0), 0.55)) : mix(horizon, bottom, pow(clamp(-h,0.0,1.0), 0.4));
      float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
      col += sunColor * sunGlow * (pow(s, 12.0) * 0.6 + pow(s, 400.0) * 3.0);
      gl_FragColor = vec4(col, 1.0);
    }`,
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 48, 24), skyMat));

/* ───────────────────────── lights ───────────────────────── */
const hemi = new THREE.HemisphereLight(0xbcd0e0, 0x4a3a2c, 0.2);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -24;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 120;
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
sun.shadow.radius = 4;
scene.add(sun, sun.target);
sun.target.position.set(0, 1, 0);

const sparkLight = new THREE.PointLight(0xffc48a, 0, 30, 2);
scene.add(sparkLight);
const interiorLightA = new THREE.PointLight(0xffb066, 0, 14, 2);
interiorLightA.position.set(-2, 2.2, 1.5);
const interiorLightB = new THREE.PointLight(0xffb066, 0, 14, 2);
interiorLightB.position.set(2, 5.6, 2);
scene.add(interiorLightA, interiorLightB);

/* ───────────────────────── diorama earth block ───────────────────────── */
const BW = 36, BD = 36, BH = 9;
const soilSideMat = new THREE.MeshStandardMaterial({ map: strataTex, roughness: 1, side: THREE.DoubleSide, transparent: true });
const soilTopMat = new THREE.MeshStandardMaterial({ map: soilTex, roughness: 1 });
const soilBottomMat = new THREE.MeshStandardMaterial({ color: 0x3a342e, roughness: 1, side: THREE.DoubleSide, transparent: true });
const earth = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, BD), [soilSideMat, soilSideMat, soilTopMat, soilBottomMat, soilSideMat, soilSideMat]);
earth.position.y = -BH / 2;
earth.receiveShadow = true;
earth.renderOrder = 5;
scene.add(earth);

const grassMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95, transparent: true, opacity: 0 });
const grass = new THREE.Mesh(new THREE.PlaneGeometry(BW, BD), grassMat);
grass.rotation.x = -Math.PI / 2; grass.position.y = 0.012; grass.receiveShadow = true;
scene.add(grass);

// turf edge rim to sell the "model" look once the lawn is in
const rimMat = new THREE.MeshStandardMaterial({ color: 0x55653c, roughness: 1, transparent: true, opacity: 0 });
const rim = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.02, 0.25, BD + 0.02), rimMat);
rim.position.y = -0.11;
scene.add(rim);

/* ───────────────────────── fat-line helpers ───────────────────────── */
const lineMats = [];
function lineMat(color, width, opts = {}) {
  const m = new LineMaterial({ color, linewidth: width, transparent: true, opacity: 1, depthWrite: false, worldUnits: false, ...opts });
  m.resolution.set(W, H);
  lineMats.push(m);
  return m;
}
function resample(points, step = 0.25) {
  const out = [points[0].clone()];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const n = Math.max(1, Math.ceil(a.distanceTo(b) / step));
    for (let k = 1; k <= n; k++) out.push(a.clone().lerp(b, k / n));
  }
  return out;
}
// a progressively drawable polyline
function drawLine(points, mat, step) {
  const pts = resample(points, step);
  const geo = new LineGeometry();
  geo.setPositions(pts.flatMap((p) => [p.x, p.y, p.z]));
  const line = new Line2(geo, mat);
  line.computeLineDistances();
  line.userData.segs = pts.length - 1;
  line.setProgress = (p) => { geo.instanceCount = Math.floor(line.userData.segs * clamp01(p)); line.visible = p > 0; };
  return line;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const rect = (x0, z0, x1, z1, y) => [V(x0, y, z0), V(x1, y, z0), V(x1, y, z1), V(x0, y, z1), V(x0, y, z0)];

/* ───────────────────────── 01 · the idea (spark) ───────────────────────── */
const spark = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 12), new THREE.MeshBasicMaterial({ color: hdr("#ffe3c0", 6) }));
const sparkGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: hdr("#ffb27a", 2.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
sparkGlow.scale.setScalar(2.4);
const sparkHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: hdr("#ff9a5c", 0.6), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
sparkHalo.scale.setScalar(9);
const sparkGroup = new THREE.Group();
sparkGroup.add(spark, sparkGlow, sparkHalo);
scene.add(sparkGroup);

const rippleMats = [];
const ripples = [0, 0.35, 0.7].map((d) => {
  const m = new THREE.MeshBasicMaterial({ color: hdr("#ffb27a", 3), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  rippleMats.push(m);
  const r = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 128), m);
  r.rotation.x = -Math.PI / 2; r.position.y = 0.03; r.userData.delay = d;
  scene.add(r);
  return r;
});

/* ───────────────────────── 02 · the land (survey lines) ───────────────────────── */
const PLOT = { x0: -12, z0: -9, x1: 12, z1: 11 };
const surveyMat = lineMat(hdr("#e9a27c", 2.2), 2.4);
const surveyFaint = lineMat(hdr("#e9a27c", 1.1), 1.2, { opacity: 0.6 });
const footprintMat = lineMat(hdr("#c9d6b4", 2.0), 2.0, { dashed: true, dashSize: 0.45, gapSize: 0.3 });
const plotLine = drawLine(rect(PLOT.x0, PLOT.z0, PLOT.x1, PLOT.z1, 0.03), surveyMat);
const footprint = drawLine(rect(-7, -5, 7, 5, 0.035), footprintMat, 0.1);
scene.add(plotLine, footprint);
const gridLines = [];
for (let x = -10; x <= 10; x += 2.5) gridLines.push(drawLine([V(x, 0.025, PLOT.z0), V(x, 0.025, PLOT.z1)], surveyFaint));
for (let z = -7.5; z <= 10; z += 2.5) gridLines.push(drawLine([V(PLOT.x0, 0.025, z), V(PLOT.x1, 0.025, z)], surveyFaint));
gridLines.forEach((l) => scene.add(l));
// survey pegs at the corners
const pegMat = new THREE.MeshStandardMaterial({ color: 0xd8b48a, roughness: 0.7 });
const pegTipMat = new THREE.MeshBasicMaterial({ color: hdr("#ff8f5a", 3) });
const pegs = [[PLOT.x0, PLOT.z0], [PLOT.x1, PLOT.z0], [PLOT.x1, PLOT.z1], [PLOT.x0, PLOT.z1], [-7, -5], [7, -5], [7, 5], [-7, 5]].map(([x, z], i) => {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), pegMat); p.position.y = 0.45; p.castShadow = true;
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), pegTipMat); tip.position.y = 0.92;
  g.add(p, tip); g.position.set(x, 0, z); g.userData.i = i;
  scene.add(g);
  return g;
});

/* ───────────────────────── 03 · the roots & foundations ───────────────────────── */
const TREES = [
  [-12.5, 8.5, 1.15], [-14, -3, 1.0], [-9.5, -12.5, 0.9], [15.5, 8.5, 1.2], [15, -7, 0.95],
  [8.5, -13, 1.05], [-15, 14, 0.85], [-6, -15, 0.8], [1.5, -14.5, 0.75], [-4, 14.5, 0.7],
];
const rootMat = new THREE.MeshBasicMaterial({ color: hdr("#f0a86e", 1.3), transparent: true, opacity: 1 });
const roots = [];
{
  const r = rng(42);
  function branch(start, dir, len, radius, gen, t0) {
    const pts = [start.clone()];
    let p = start.clone(); const d = dir.clone();
    const n = 7;
    for (let i = 0; i < n; i++) {
      d.x += (r() - 0.5) * 0.5; d.z += (r() - 0.5) * 0.5; d.y -= 0.08 + r() * 0.1;
      d.normalize();
      p = p.clone().addScaledVector(d, len / n);
      p.y = Math.max(p.y, -BH + 0.6);
      p.x = THREE.MathUtils.clamp(p.x, -BW / 2 + 0.3, BW / 2 - 0.3);
      p.z = THREE.MathUtils.clamp(p.z, -BD / 2 + 0.3, BD / 2 - 0.3);
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 40, radius, 5, false);
    const mesh = new THREE.Mesh(geo, rootMat);
    mesh.userData = { t0, dur: 1.6 + len * 0.18, total: geo.index.count };
    geo.setDrawRange(0, 0);
    roots.push(mesh); scene.add(mesh);
    if (gen < 3) {
      const kids = gen === 0 ? 3 : 2;
      for (let k = 0; k < kids; k++) {
        const at = 0.35 + r() * 0.5;
        const sp = curve.getPoint(at);
        const nd = curve.getTangent(at).clone();
        nd.x += (r() - 0.5) * 1.6; nd.z += (r() - 0.5) * 1.6; nd.y -= 0.2; nd.normalize();
        branch(sp, nd, len * (0.5 + r() * 0.2), radius * 0.62, gen + 1, t0 + mesh.userData.dur * at);
      }
    }
  }
  TREES.forEach(([x, z, s], i) => {
    const mains = 4;
    for (let k = 0; k < mains; k++) {
      const a = (k / mains) * Math.PI * 2 + r();
      branch(V(x, -0.15, z), V(Math.cos(a) * 0.6, -1, Math.sin(a) * 0.6).normalize(), 3.2 + s * 1.6, 0.07 * s + 0.03, 0, 14.6 + i * 0.22 + r() * 0.3);
    }
  });
}

const concreteMat = new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.85, color: 0xcfcac2 });
const GCOLS = [];
for (const x of [-6.85, -3.45, 0, 3.45, 6.85]) for (const z of [-4.85, 0, 4.85]) GCOLS.push([x, z]);
const piers = GCOLS.map(([x, z], i) => {
  const geo = new THREE.CylinderGeometry(0.3, 0.34, 1, 20); geo.translate(0, -0.5, 0);
  const m = new THREE.Mesh(geo, concreteMat); m.position.set(x, -0.01, z); m.scale.y = 0.0001;
  m.castShadow = true; m.userData.t0 = 16.2 + (i % 5) * 0.28 + Math.floor(i / 5) * 0.12;
  scene.add(m); return m;
});
const pierGlowMat = lineMat(hdr("#e9a27c", 1.8), 1.6);
const pierEdges = piers.map((p) => {
  const e = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(p.geometry, 30)), pierGlowMat);
  p.add(e); return e;
});
const footings = [
  [-7, -5, 7, -5], [7, -5, 7, 5], [7, 5, -7, 5], [-7, 5, -7, -5], [0, -5, 0, 5], [-3.45, -5, -3.45, 5], [3.45, -5, 3.45, 5],
].map(([x0, z0, x1, z1], i) => {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const geo = new THREE.BoxGeometry(len, 0.7, 0.6); geo.translate(len / 2, -0.35, 0);
  const m = new THREE.Mesh(geo, concreteMat);
  m.position.set(x0, 0, z0); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  m.scale.x = 0.0001; m.castShadow = true; m.receiveShadow = true;
  m.userData.t0 = 19.0 + i * 0.16;
  scene.add(m); return m;
});
const slabGeo = new THREE.BoxGeometry(14.3, 0.38, 10.3); slabGeo.translate(0, 0.19, 0);
const groundSlab = new THREE.Mesh(slabGeo, concreteMat);
groundSlab.scale.y = 0.0001; groundSlab.castShadow = groundSlab.receiveShadow = true;
scene.add(groundSlab);

/* ───────────────────────── 04 · the rise (structure) ───────────────────────── */
const edgeMat = lineMat(hdr("#efa27a", 2.4), 1.8);
const members = [];
function member(x0, y0, z0, x1, y1, z1, axis, t0, dur = 0.9, mat = concreteMat, opts = {}) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), dz = Math.abs(z1 - z0);
  const geo = new THREE.BoxGeometry(dx, dy, dz);
  const pos = V((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  if (axis === "y") { geo.translate(0, dy / 2, 0); pos.y = Math.min(y0, y1); }
  if (axis === "x") { geo.translate(dx / 2, 0, 0); pos.x = Math.min(x0, x1); }
  if (axis === "z") { geo.translate(0, 0, dz / 2); pos.z = Math.min(z0, z1); }
  if (axis === "-y") { geo.translate(0, -dy / 2, 0); pos.y = Math.max(y0, y1); }
  const m = mat.clone(); m.transparent = true; m.opacity = 0;
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.copy(pos); mesh.castShadow = true; mesh.receiveShadow = true;
  if (opts.edges !== false) {
    const e = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geo)), opts.edgeMat || edgeMat);
    mesh.add(e);
  }
  mesh.userData = { axis: axis.replace("-", ""), t0, dur, solidAt: opts.solidAt ?? t0 + dur * 0.6, solidDur: opts.solidDur ?? 1.1, back: opts.back };
  mesh.visible = false;
  scene.add(mesh); members.push(mesh);
  return mesh;
}
// ground floor columns
GCOLS.forEach(([x, z], i) => member(x - 0.17, 0.38, z - 0.17, x + 0.17, 3.45, z + 0.17, "y", 24.2 + (i % 5) * 0.22 + Math.floor(i / 5) * 0.3, 1.0));
// ground floor beams
[[-7, -4.85, 7, -4.85], [-7, 0, 7, 0], [-7, 4.85, 7, 4.85]].forEach(([x0, z, x1], i) =>
  member(x0, 3.1, z - 0.2, x1, 3.45, z + 0.2, "x", 26.0 + i * 0.25, 1.1));
[-6.85, -3.45, 0, 3.45, 6.85].forEach((x, i) => member(x - 0.2, 3.1, -5, x + 0.2, 3.45, 5, "z", 26.4 + i * 0.12, 1.0));
// first floor slab (cantilevers north / +z) with a stair void cut around it
const FF = { y0: 3.45, y1: 3.8 };
member(-6.6, FF.y0, -4.3, 7.4, FF.y1, -1.7, "x", 27.4, 1.0);
member(-6.6, FF.y0, -0.4, 7.4, FF.y1, 6.3, "x", 27.6, 1.0);
member(-6.6, FF.y0, -1.7, 2.0, FF.y1, -0.4, "x", 27.8, 0.8);
member(5.7, FF.y0, -1.7, 7.4, FF.y1, -0.4, "x", 27.9, 0.6);
// upper columns
const UCOLS = [];
for (const x of [-6.4, -2.0, 2.5, 7.2]) for (const z of [-4.1, 1.0, 6.1]) UCOLS.push([x, z]);
UCOLS.forEach(([x, z], i) => member(x - 0.15, FF.y1, z - 0.15, x + 0.15, 6.9, z + 0.15, "y", 28.5 + (i % 3) * 0.2 + Math.floor(i / 3) * 0.22, 0.9));
// roof beams
[[-6.6, -4.1, 7.4], [-6.6, 1.0, 7.4], [-6.6, 6.1, 7.4]].forEach(([x0, z, x1], i) =>
  member(x0, 6.6, z - 0.17, x1, 6.9, z + 0.17, "x", 30.0 + i * 0.25, 1.0));
[-6.4, -2.0, 2.5, 7.2].forEach((x, i) => member(x - 0.17, 6.6, -4.3, x + 0.17, 6.9, 6.3, "z", 30.3 + i * 0.12, 0.9));

// stair (visible through the glass later; drawn in plan in chapter 05)
const stairMat = new THREE.MeshStandardMaterial({ color: 0x3b3631, roughness: 0.6 });
const stairs = [];
for (let i = 0; i < 13; i++) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.07, 1.1), stairMat);
  s.position.set(2.15 + i * 0.28, 0.38 + (i + 1) * 0.237, -1.05);
  s.castShadow = true; s.scale.setScalar(0.0001);
  s.userData.t0 = 29.0 + i * 0.07;
  scene.add(s); stairs.push(s);
}

/* ───────────────────────── 05 · the light (plan + sun study) ───────────────────────── */
const PY = FF.y1 + 0.03;
const planMat = lineMat(hdr("#f3b08a", 2.4), 2.2);
const planThin = lineMat(hdr("#f3b08a", 1.6), 1.3);
const winMat = lineMat(hdr("#cfe0b6", 3.0), 5.0);
const planLines = [
  drawLine(rect(-6.6, -4.3, 7.4, 6.3, PY), planMat),
  drawLine([V(-1.0, PY, -4.3), V(-1.0, PY, 2.2)], planMat),
  drawLine([V(-6.6, PY, 1.8), V(-1.0, PY, 1.8)], planMat),
  drawLine([V(2.0, PY, 2.2), V(7.4, PY, 2.2)], planMat),
  drawLine([V(2.0, PY, -4.3), V(2.0, PY, -1.7)], planMat),
  drawLine(rect(2.0, -1.7, 5.7, -0.4, PY), planMat),
  ...Array.from({ length: 12 }, (_, i) => drawLine([V(2.28 + i * 0.28, PY, -1.7), V(2.28 + i * 0.28, PY, -0.4)], planThin, 0.1)),
  drawLine([V(2.2, PY, -1.05), V(5.4, PY, -1.05), V(5.1, PY, -0.85), V(5.4, PY, -1.05), V(5.1, PY, -1.25)], planThin, 0.1),
  // door swings
  drawLine(Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI / 2; return V(-1.0 + Math.cos(a) * 0.9, PY, 2.2 - 0.9 + Math.sin(a) * 0.9); }), planThin, 0.05),
  drawLine(Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI / 2; return V(2.0 + Math.sin(a) * 0.9, PY, 2.2 - Math.cos(a) * 0.9 + 0.9 - 0.9); }), planThin, 0.05),
];
const windowMarks = [
  [V(-4.7, PY + 0.01, 6.3), V(-0.7, PY + 0.01, 6.3)], [V(0.5, PY + 0.01, 6.3), V(3.5, PY + 0.01, 6.3)], [V(5.3, PY + 0.01, 6.3), V(7.3, PY + 0.01, 6.3)],
  [V(-6.6, PY + 0.01, -1.1), V(-6.6, PY + 0.01, 2.9)], [V(7.4, PY + 0.01, -0.2), V(7.4, PY + 0.01, 2.2)],
  [V(-3.6, PY + 0.01, -4.3), V(-1.1, PY + 0.01, -4.3)], [V(2.2, PY + 0.01, -4.3), V(4.7, PY + 0.01, -4.3)],
].map((pts) => drawLine(pts, winMat, 0.1));
[...planLines, ...windowMarks].forEach((l) => scene.add(l));

const ARC_C = V(0.5, 3.8, 1), ARC_R = 17;
const sunArcPoint = (a) => V(ARC_C.x + Math.cos(a) * ARC_R, ARC_C.y + Math.sin(a) * ARC_R * 0.78, ARC_C.z + Math.sin(a) * ARC_R * 0.62);
const arcMat = lineMat(hdr("#ffd9a8", 1.8), 1.6, { dashed: true, dashSize: 0.5, gapSize: 0.35 });
const sunArc = drawLine(Array.from({ length: 64 }, (_, i) => sunArcPoint(0.08 + (i / 63) * (Math.PI - 0.16))), arcMat, 0.2);
scene.add(sunArc);
const sunBall = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 12), new THREE.MeshBasicMaterial({ color: hdr("#ffe6bf", 5), transparent: true }));
const sunBallGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: hdr("#ffbe7a", 1.8), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
sunBallGlow.scale.setScalar(7);
const sunViz = new THREE.Group(); sunViz.add(sunBall, sunBallGlow); scene.add(sunViz);
const rayMat = lineMat(hdr("#ffd9a8", 1.6), 1.3, { dashed: true, dashSize: 0.3, gapSize: 0.25, opacity: 0 });
const RAY_TARGETS = [V(-2.7, 2.0, 5.1), V(2.0, 5.2, 6.35), V(-6.7, 5.2, 0.9), V(6.3, 5.2, 6.35)];
const rays = RAY_TARGETS.map(() => { const g = new LineGeometry(); g.setPositions([0, 0, 0, 0, 1, 0]); const l = new Line2(g, rayMat); scene.add(l); return l; });

/* ───────────────────────── 06 · the life (envelope, glass, garden) ───────────────────────── */
const wallRender = new THREE.MeshStandardMaterial({ map: renderTex, roughness: 0.9 });
const wallTimber = new THREE.MeshStandardMaterial({ map: timberTex, roughness: 0.75 });
const wallBrick = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 });
const frameMat = new THREE.MeshStandardMaterial({ color: 0x24221f, roughness: 0.5, metalness: 0.3 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x8fa3a6, roughness: 0.04, metalness: 0.92, transparent: true, opacity: 0, envMapIntensity: 1.6 });
const interiorTex = canvasTex(512, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#ffd9a8"); gr.addColorStop(0.5, "#e9a868"); gr.addColorStop(1, "#6a3c22");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  // pools of lamp light
  [[0.22, 0.25], [0.62, 0.2], [0.86, 0.3]].forEach(([x, y]) => {
    const rg = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, h * 0.7);
    rg.addColorStop(0, "rgba(255,248,230,0.9)"); rg.addColorStop(1, "rgba(255,248,230,0)");
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
  });
  // furniture silhouettes: sofa, shelving, a plant, pendant cords
  g.fillStyle = "rgba(58,36,22,0.82)";
  g.fillRect(w * 0.08, h * 0.68, w * 0.3, h * 0.2); g.fillRect(w * 0.06, h * 0.6, w * 0.05, h * 0.28); g.fillRect(w * 0.35, h * 0.6, w * 0.05, h * 0.28);
  g.fillRect(w * 0.52, h * 0.72, w * 0.2, h * 0.04); g.fillRect(w * 0.54, h * 0.76, w * 0.015, h * 0.14); g.fillRect(w * 0.69, h * 0.76, w * 0.015, h * 0.14);
  g.beginPath(); g.ellipse(w * 0.86, h * 0.62, w * 0.05, h * 0.16, 0, 0, Math.PI * 2); g.fill();
  g.fillRect(w * 0.845, h * 0.74, w * 0.03, h * 0.16);
  g.fillRect(w * 0.22, 0, 2, h * 0.18); g.fillRect(w * 0.62, 0, 2, h * 0.14);
  g.fillStyle = "rgba(255,250,235,1)";
  g.beginPath(); g.arc(w * 0.22, h * 0.2, 7, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(w * 0.62, h * 0.16, 7, 0, Math.PI * 2); g.fill();
});
interiorTex.wrapS = interiorTex.wrapT = THREE.ClampToEdgeWrapping;
const interiorMat = new THREE.MeshStandardMaterial({ color: 0x1a140f, emissive: new THREE.Color("#ffffff"), emissiveMap: interiorTex, emissiveIntensity: 0, roughness: 1 });
const envelope = []; // {mesh, t0}
const glassPanes = [];
const interiorPanels = [];

// facade(run along u from u0, at fixed w; side: 'z+'|'z-'|'x+'|'x-')
function facade(side, fixed, u0, y0, y1, pattern, wallMat, tBase) {
  let u = u0;
  const T = 0.24;
  pattern.forEach(([len, type], idx) => {
    const t0 = tBase + idx * 0.12;
    const a = u, b = u + len; u = b;
    const box = (ua, ub, ya, yb, mat, thick = T, inset = 0) => {
      const geo = side[0] === "z" ? new THREE.BoxGeometry(ub - ua, yb - ya, thick) : new THREE.BoxGeometry(thick, yb - ya, ub - ua);
      geo.translate(0, (yb - ya) / 2, 0);
      const m = new THREE.Mesh(geo, mat);
      const sgn = side[1] === "+" ? -1 : 1;
      if (side[0] === "z") m.position.set((ua + ub) / 2, ya, fixed + sgn * inset);
      else m.position.set(fixed + sgn * inset, ya, (ua + ub) / 2);
      m.castShadow = true; m.receiveShadow = true;
      m.scale.y = 0.0001; m.visible = false;
      scene.add(m);
      return m;
    };
    if (type === "wall") envelope.push({ mesh: box(a, b, y0, y1, wallMat), t0 });
    else if (type === "brick") envelope.push({ mesh: box(a, b, y0, y1, wallBrick), t0 });
    else {
      const sill = type === "win" ? 0.9 : 0, head = type === "win" ? 0.35 : 0.12;
      if (sill) envelope.push({ mesh: box(a, b, y0, y0 + sill, wallMat), t0 });
      envelope.push({ mesh: box(a, b, y1 - head, y1, wallMat), t0: t0 + 0.05 });
      const g = box(a, b, y0 + sill, y1 - head, glassMat, 0.05, 0.05);
      g.castShadow = false; glassPanes.push({ mesh: g, t0: t0 + 0.4 });
      // mullions
      const nm = Math.max(1, Math.round(len / 1.3));
      for (let k = 0; k <= nm; k++) {
        const uu = a + (k / nm) * len;
        envelope.push({ mesh: box(uu - 0.04, uu + 0.04, y0 + sill, y1 - head, frameMat, 0.12, 0.02), t0: t0 + 0.3 });
      }
      // warm interior behind glass
      const ip = box(a + 0.1, b - 0.1, y0 + sill * 0.3, y1 - head - 0.05, interiorMat, 0.04, 1.4);
      ip.castShadow = false; interiorPanels.push({ mesh: ip, t0: t0 + 0.4 });
    }
  });
}
// ground floor (y 0.38 → 3.45)
facade("z+", 5.0, -7, 0.38, 3.45, [[2, "brick"], [5.5, "glass"], [1, "wall"], [1.2, "door"], [1.3, "wall"], [2, "glass"], [1, "wall"]], wallRender, 43.4);
facade("z-", -5.0, -7, 0.38, 3.45, [[3, "wall"], [3, "glass"], [2, "wall"], [4, "glass"], [2, "wall"]], wallRender, 43.7);
facade("x-", -7.0, -5, 0.38, 3.45, [[3, "wall"], [4, "glass"], [3, "wall"]], wallRender, 43.5);
facade("x+", 7.0, -5, 0.38, 3.45, [[10, "wall"]], wallRender, 43.8);
// upper floor (y 3.8 → 6.6)
facade("z+", 6.3, -6.6, 3.8, 6.6, [[1.9, "wall"], [4, "win"], [1.2, "wall"], [3, "win"], [1.8, "wall"], [2, "win"], [0.1, "wall"]], wallTimber, 44.6);
facade("z-", -4.3, -6.6, 3.8, 6.6, [[3, "wall"], [2.5, "win"], [3.3, "wall"], [2.5, "win"], [2.7, "wall"]], wallTimber, 44.9);
facade("x-", -6.6, -4.3, 3.8, 6.6, [[3.2, "wall"], [4, "win"], [3.4, "wall"]], wallTimber, 44.7);
facade("x+", 7.4, -4.3, 3.8, 6.6, [[4.1, "wall"], [2.4, "win"], [4.1, "wall"]], wallTimber, 45.0);
// door leaf (timber) inside the 'door' opening is the glass pane tinted by interior; add a solid leaf
{
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.7, 0.08), wallTimber);
  leaf.geometry.translate(0, 1.35, 0); leaf.position.set(2.1, 0.38, 5.02); leaf.scale.y = 0.0001; leaf.visible = false; leaf.castShadow = true;
  scene.add(leaf); envelope.push({ mesh: leaf, t0: 44.5 });
}
// roof slab + fascia
const roofSlab = member(-7.0, 6.9, -4.7, 7.9, 7.2, 6.8, "x", 45.6, 1.2, new THREE.MeshStandardMaterial({ color: 0x3a3733, roughness: 0.7 }), { edges: false, solidAt: 45.6, solidDur: 0.6 });
const fascia = member(-7.05, 6.85, 6.75, 7.95, 7.3, 6.95, "x", 45.8, 1.2, new THREE.MeshStandardMaterial({ color: 0x24221f, roughness: 0.6 }), { edges: false, solidAt: 45.8, solidDur: 0.6 });
// upper-floor balcony glass balustrade on the cantilever roof over entry
const deckEdge = member(-6.6, 3.8, 6.25, 7.4, 3.92, 6.6, "x", 44.0, 1.0, frameMat, { edges: false, solidAt: 44.0, solidDur: 0.4 });

// garden: trees, shrubs, path
const foliageMats = ["#7f8f6a", "#9ca88a", "#6e7e5c", "#8a9a70"].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true }));
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4434, roughness: 1 });
const trees = TREES.map(([x, z, s], i) => {
  const r = rng(100 + i);
  const g = new THREE.Group();
  const h = 2.6 + s * 1.6;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.17 * s, h, 7), trunkMat);
  trunk.position.y = h / 2; trunk.castShadow = true; g.add(trunk);
  const blobs = 5 + Math.floor(r() * 3);
  for (let k = 0; k < blobs; k++) {
    const rad = (0.9 + r() * 0.8) * s;
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(rad, 1), foliageMats[Math.floor(r() * foliageMats.length)]);
    b.position.set((r() - 0.5) * 1.9 * s, h + (r() - 0.2) * 1.3 * s, (r() - 0.5) * 1.9 * s);
    b.castShadow = true; b.receiveShadow = true; g.add(b);
  }
  g.position.set(x, 0, z); g.rotation.y = r() * 6;
  g.userData.t0 = 44.6 + i * 0.32; g.scale.setScalar(0.0001); g.visible = false;
  scene.add(g); return g;
});
const shrubs = [];
{
  const r = rng(77);
  const spots = [];
  for (let x = -6.5; x <= 6.5; x += 1.15) if (Math.abs(x - 2.1) > 1.0) spots.push([x, 6.9 + r() * 0.4]);
  for (let z = -4; z <= 4; z += 1.4) spots.push([-8.0 - r() * 0.3, z]);
  for (let x = -6; x <= 6; x += 1.6) spots.push([x, -6.1 - r() * 0.3]);
  spots.forEach(([x, z], i) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42 + r() * 0.25, 1), foliageMats[i % 4]);
    m.position.set(x, 0.3, z); m.castShadow = true; m.scale.setScalar(0.0001); m.visible = false;
    m.userData.t0 = 45.0 + i * 0.05;
    scene.add(m); shrubs.push(m);
  });
}
const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd9d1c3, roughness: 0.9 });
const stones = [];
for (let i = 0; i < 9; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.7), stoneMat);
  m.position.set(2.1 + Math.sin(i * 0.7) * 0.25, 0.04, 6.3 + i * 1.15); m.receiveShadow = true;
  m.scale.setScalar(0.0001); m.visible = false; m.userData.t0 = 45.4 + i * 0.08;
  scene.add(m); stones.push(m);
}
const drive = new THREE.Mesh(new THREE.BoxGeometry(4, 0.05, 11.5), new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.95, color: 0xd8d2c8, transparent: true, opacity: 0 }));
drive.position.set(9.5, 0.03, 11.5); drive.receiveShadow = true; scene.add(drive);

// floating dust motes catching the light
const DUST = 420;
const dustBase = new Float32Array(DUST * 3), dustSeed = new Float32Array(DUST);
{
  const r = rng(9);
  for (let i = 0; i < DUST; i++) { dustBase[i * 3] = (r() - 0.5) * 40; dustBase[i * 3 + 1] = r() * 14 - 2; dustBase[i * 3 + 2] = (r() - 0.5) * 40; dustSeed[i] = r() * 100; }
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(DUST * 3), 3));
const dustMat = new THREE.PointsMaterial({ map: glowTex, color: hdr("#ffd9b0", 1.4), size: 0.16, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 });
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

/* ───────────────────────── sustainability: site study, breeze, solar, water ───────────────────────── */
const windMat = lineMat(hdr("#cfe0b6", 1.9), 1.8, { dashed: true, dashSize: 0.9, gapSize: 0.55, opacity: 0 });
const windLines = [-11, -6, -1, 4, 9, 13].map((z0, i) => {
  const pts = Array.from({ length: 40 }, (_, k) => {
    const x = -17 + (k / 39) * 34;
    return V(x, 0.5 + Math.sin(k * 0.35 + i) * 0.12, z0 + Math.sin(x * 0.18 + i * 1.3) * 1.1 - x * 0.12);
  });
  const l = drawLine(pts, windMat, 0.2); scene.add(l); return l;
});
const treeRingMat = lineMat(hdr("#cfe0b6", 2.0), 1.8, { dashed: true, dashSize: 0.35, gapSize: 0.25, opacity: 0 });
const treeRings = TREES.map(([x, z, s]) => {
  const r = 1.3 + s * 0.6;
  const l = drawLine(Array.from({ length: 49 }, (_, k) => V(x + Math.cos((k / 48) * Math.PI * 2) * r, 0.04, z + Math.sin((k / 48) * Math.PI * 2) * r)), treeRingMat, 0.1);
  scene.add(l); return l;
});
const treeDotMat = new THREE.MeshBasicMaterial({ color: hdr("#cfe0b6", 2.4), transparent: true, opacity: 0 });
const treeDots = TREES.map(([x, z]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), treeDotMat); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.05, z); scene.add(m); return m; });
// breeze through the upper floor (ch5)
const breezeMat = lineMat(hdr("#cfe0b6", 2.2), 2.0, { dashed: true, dashSize: 0.6, gapSize: 0.4, opacity: 0 });
const breezeLines = [-0.2, 1.0, 2.2].map((z0, i) => {
  const pts = Array.from({ length: 40 }, (_, k) => { const x = -13 + (k / 39) * 26; return V(x, 5.1 + Math.sin(k * 0.4 + i) * 0.15, z0 + Math.sin(x * 0.25 + i) * 0.35); });
  const l = drawLine(pts, breezeMat, 0.2); scene.add(l); return l;
});
// solar array on the roof
const solarMat = new THREE.MeshStandardMaterial({ color: 0x1d2633, roughness: 0.25, metalness: 0.6, envMapIntensity: 1.4 });
const solarFrame = new THREE.MeshStandardMaterial({ color: 0xb9b4ab, roughness: 0.5, metalness: 0.5 });
const solar = [];
{
  let i = 0;
  for (let row = 0; row < 3; row++) for (let col = 0; col < 6; col++) {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.06, 1.15), solarFrame);
    const cell = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.07, 1.05), solarMat);
    cell.position.y = 0.01; frame.castShadow = true;
    g.add(frame, cell);
    // faint cell grid
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0, 1, 1), new THREE.MeshBasicMaterial({ color: 0x5b7aa0, transparent: true, opacity: 0.18, wireframe: true }));
    grid.rotation.x = -Math.PI / 2; grid.position.y = 0.05; g.add(grid);
    g.position.set(-4.6 + col * 1.9, 7.6, -2.8 + row * 1.5);
    g.rotation.x = 0.35; // faces north, toward the sun
    g.userData.t0 = 46.6 + i * 0.05; g.scale.setScalar(0.0001); g.visible = false;
    scene.add(g); solar.push(g); i++;
  }
}
// rainwater tank beside the house
const tankMat = new THREE.MeshStandardMaterial({ color: 0x9aa58a, roughness: 0.6, metalness: 0.2 });
const tank = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.3, 32, 8), tankMat); body.position.y = 1.15; body.castShadow = body.receiveShadow = true;
  for (let k = 0; k < 7; k++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.025, 6, 40), tankMat); rib.rotation.x = Math.PI / 2; rib.position.y = 0.3 + k * 0.3; tank.add(rib); }
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.08, 32), tankMat); lid.position.y = 2.33;
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.6, 8), frameMat); pipe.position.set(-0.75, 4.6, 0);
  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), frameMat); elbow.rotation.z = Math.PI / 2; elbow.position.set(-0.4, 2.35, 0);
  tank.add(body, lid, pipe, elbow);
}
tank.position.set(8.6, 0, -1.6); tank.scale.setScalar(0.0001); tank.visible = false;
scene.add(tank);

/* ───────────────────────── post ───────────────────────── */
const Q = new URLSearchParams(location.search);
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: Number(Q.get("samples") ?? 4) });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.55, 0.55, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const finish = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, vig: { value: 0.32 }, grain: { value: 0.045 }, ca: { value: 0.0012 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time; uniform float vig; uniform float grain; uniform float ca; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p*vec2(443.897,441.423)); p += dot(p, p.yx+19.19); return fract((p.x+p.y)*p.x); }
    void main(){
      vec2 d = vUv - 0.5;
      float r2 = dot(d,d);
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + d*ca*r2*8.0).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - d*ca*r2*8.0).b;
      col *= 1.0 - vig * smoothstep(0.08, 0.62, r2*1.6);
      float n = hash(vUv*vec2(1920.0,1080.0) + fract(time*7.31)*113.0) - 0.5;
      col += n * grain;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
composer.addPass(finish);

/* ───────────────────────── look development: time-of-day ───────────────────────── */
// [t, skyTop, skyHorizon, sunColor, sunI, hemiI, exposure, elev, envI]
const LOOK = [
  [0.0, "#030407", "#07090c", "#ffb27a", 0.0, 0.05, 1.0, 0.25, 0.05],
  [6.0, "#04060a", "#0b0e13", "#ffb27a", 0.0, 0.06, 1.0, 0.25, 0.06],
  [9.5, "#1a2233", "#c98a6a", "#ffb385", 1.2, 0.35, 1.0, 0.12, 0.25],
  [13.5, "#5d7590", "#ebc4a2", "#ffd0a8", 2.4, 0.55, 1.0, 0.32, 0.5],
  [16.0, "#283245", "#7c6a5c", "#ffd2aa", 1.1, 0.35, 0.95, 0.5, 0.35],
  [22.5, "#283245", "#7c6a5c", "#ffd2aa", 1.1, 0.35, 0.95, 0.5, 0.35],
  [26.0, "#86a6c4", "#f3e3cc", "#fff0dc", 2.5, 0.45, 0.92, 0.7, 0.55],
  [33.0, "#86a6c4", "#f3e3cc", "#fff0dc", 2.5, 0.45, 0.92, 0.7, 0.55],
  [35.0, "#7598ba", "#f1dcc0", "#fff0da", 2.7, 0.4, 0.92, 0.75, 0.5],
  [42.5, "#7598ba", "#f1dcc0", "#fff0da", 2.7, 0.4, 0.92, 0.75, 0.5],
  [46.0, "#56698a", "#f2b07c", "#ffbf80", 3.2, 0.5, 1.05, 0.28, 0.55],
  [51.0, "#3f4b66", "#e79560", "#ffa865", 2.6, 0.4, 1.05, 0.16, 0.45],
  [55.0, "#151b2b", "#a85c3f", "#ff8a4a", 0.9, 0.22, 1.1, 0.05, 0.25],
  [66.0, "#0d111c", "#6e3e2d", "#ff8a4a", 0.5, 0.18, 1.1, 0.03, 0.2],
];
const lookCache = LOOK.map((k) => ({ t: k[0], top: C(k[1]), hor: C(k[2]), sunC: C(k[3]), sunI: k[4], hemiI: k[5], exp: k[6], elev: k[7], envI: k[8] }));
const tmpA = new THREE.Color(), tmpB = new THREE.Color(), tmpC = new THREE.Color();
function look(t) {
  let i = 0;
  while (i < lookCache.length - 2 && t > lookCache[i + 1].t) i++;
  const a = lookCache[i], b = lookCache[i + 1];
  const k = easeInOut(range(t, a.t, b.t));
  return {
    top: tmpA.copy(a.top).lerp(b.top, k), hor: tmpB.copy(a.hor).lerp(b.hor, k), sunC: tmpC.copy(a.sunC).lerp(b.sunC, k),
    sunI: lerp(a.sunI, b.sunI, k), hemiI: lerp(a.hemiI, b.hemiI, k), exp: lerp(a.exp, b.exp, k), elev: lerp(a.elev, b.elev, k), envI: lerp(a.envI, b.envI, k),
  };
}

/* ───────────────────────── camera path ───────────────────────── */
// [t, pos, target, fov]
const CAM = [
  [0.0, [0.8, 7.0, 10.5], [0, 6.0, 0], 32],
  [3.5, [0.2, 6.2, 11.5], [0, 4.4, 0], 32],
  [6.0, [0, 3.4, 14.5], [0, 0.5, 0], 34],
  [9.5, [9, 9, 26], [0, -0.5, 0], 36],
  [13.5, [24, 17, 28], [0, -1, 0], 36],
  [16.5, [10, -1.5, 33], [0, -3.4, 0], 34],
  [22.5, [-7, -2.0, 31], [0, -3.0, 0], 34],
  [25.5, [-17, 4.5, 24], [0, 2.0, 0], 35],
  [29.5, [-22, 9.5, 12], [0, 3.0, 0], 35],
  [33.0, [-15, 25, 19], [0, 3.0, 1], 35],
  [36.0, [-1, 33, 13], [0.5, 3.0, 1.5], 36],
  [42.5, [5, 32, 14], [0.5, 3.0, 1.5], 36],
  [46.5, [21, 14.5, 17], [0, 3.6, 0], 34],
  [51.0, [17, 4.6, 21], [0, 3.2, 1], 34],
  [54.5, [10, 2.4, 19.5], [0, 3.4, 1], 33],
  [58.5, [5, 2.8, 23], [0, 3.6, 1], 30],
  [66.0, [3, 4.0, 30], [0, 3.6, 0], 30],
];
const camPos = new THREE.CatmullRomCurve3(CAM.map((k) => V(...k[1])), false, "centripetal");
const camTgt = new THREE.CatmullRomCurve3(CAM.map((k) => V(...k[2])), false, "centripetal");
function camU(t) {
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const k = clamp01((t - CAM[i][0]) / (CAM[i + 1][0] - CAM[i][0]));
  // gentle ease at each knot keeps moves deliberate without full stops
  const kk = lerp(k, easeInOut(k), 0.55);
  return { u: (i + kk) / (CAM.length - 1), fov: lerp(CAM[i][3], CAM[i + 1][3], easeInOut(k)) };
}

/* ───────────────────────── captions & callouts (DOM) ───────────────────────── */
const CAPTIONS = [
  { t0: 1.2, t1: 6.6, pos: "bl", ch: ["01", "The Dream"], lines: ["Every home begins", "as a <em>dream.</em>"] },
  { t0: 8.2, t1: 14.0, pos: "bl", ch: ["02", "The Land"], lines: ["First, we listen to the land —", "its <em>sun,</em> its winds, its trees."] },
  { t0: 15.6, t1: 23.0, pos: "bl", ch: ["03", "The Roots"], lines: ["We build beneath the surface,", "<em>alongside the roots</em> already here."], sub: "Foundations shaped around the soil and the trees, so both can stand for generations." },
  { t0: 24.4, t1: 32.8, pos: "bl", ch: ["04", "The Rise"], lines: ["A structure shaped by", "<em>what this place needs.</em>"] },
  { t0: 34.2, t1: 42.8, pos: "tl", ch: ["05", "The Light"], lines: ["We follow the <em>sun</em>", "before placing a single window."], sub: "Daylight deep inside. Shade when it's warm. Breezes that keep the home cool and fresh." },
  { t0: 44.6, t1: 51.8, pos: "bl", ch: ["06", "The Life"], lines: ["Built to live <em>with nature,</em>", "around the way you live."], sub: "Sunlight on the roof, rain gathered for the garden, green all around." },
  { t0: 53.0, t1: 58.6, pos: "bl", ch: ["07", "The Sanctuary"], lines: ["A home that cares for you,", "and for <em>the land</em> it stands on."] },
];
const capRoot = document.getElementById("captions");
CAPTIONS.forEach((c) => {
  const el = document.createElement("div");
  el.className = `cap ${c.pos}`;
  el.innerHTML = `
    <div class="chapter"><span class="rule"></span><span class="num">${c.ch[0]}</span><span>${c.ch[1]}</span></div>
    <div class="head">${c.lines.map((l) => `<span class="line"><span>${l}</span></span>`).join("")}</div>
    ${c.sub ? `<div class="sub">${c.sub}</div>` : ""}`;
  capRoot.appendChild(el);
  c.el = el; c.rule = el.querySelector(".rule"); c.chap = el.querySelector(".chapter");
  c.lineEls = [...el.querySelectorAll(".line > span")]; c.subEl = el.querySelector(".sub");
});
function updateCaptions(t) {
  for (const c of CAPTIONS) {
    const active = t > c.t0 - 0.1 && t < c.t1 + 0.1;
    c.el.style.display = active ? "block" : "none";
    if (!active) continue;
    const out = easeInOut(range(t, c.t1 - 0.7, c.t1));
    c.el.style.opacity = String(1 - out);
    c.el.style.filter = out > 0 ? `blur(${out * 10}px)` : "none";
    c.el.style.transform = `translateY(${-out * 18}px)`;
    const r = easeOutExpo(range(t, c.t0, c.t0 + 1.0));
    c.rule.style.transform = `scaleX(${r})`;
    c.chap.style.opacity = String(easeOut(range(t, c.t0 + 0.1, c.t0 + 0.8)));
    c.lineEls.forEach((s, i) => {
      const p = easeOutExpo(range(t, c.t0 + 0.25 + i * 0.22, c.t0 + 1.45 + i * 0.22));
      s.style.transform = `translateY(${(1 - p) * 110}%)`;
    });
    if (c.subEl) {
      const p = easeOut(range(t, c.t0 + 1.1, c.t0 + 2.0));
      c.subEl.style.opacity = String(p);
      c.subEl.style.transform = `translateY(${(1 - p) * 16}px)`;
    }
  }
}

const CALLOUTS = [
  { t0: 36.6, t1: 42.6, at: V(-2.7, 3.9, 6.3), title: "Sun-led living", text: "Winter sun warms the rooms; deep eaves shade the summer." },
  { t0: 37.6, t1: 42.6, at: V(3.85, 3.9, -1.05), title: "A light-filled stair", text: "Daylight carried deep into the heart of the home." },
  { t0: 38.6, t1: 42.6, at: V(7.4, 3.9, 1.0), title: "Natural cross-breeze", text: "Windows placed so the home breathes and cools itself." },
  { t0: 39.6, t1: 42.6, at: V(15.5, 0.3, 8.5), title: "Trees kept and cared for", text: "Shade, shelter, and roots that hold the soil together." },
  { t0: 46.9, t1: 49.9, at: V(2.2, 7.7, 0.2), title: "Sunlight on the roof", text: "Solar energy for everyday living." },
  { t0: 48.6, t1: 51.7, at: V(8.6, 1.6, -1.6), title: "Rain, gathered", text: "Stored to water the garden and serve the home." },
];
const callRoot = document.getElementById("callouts");
CALLOUTS.forEach((c) => {
  const el = document.createElement("div");
  el.className = `callout ${c.side === "left" ? "left" : ""}`;
  el.innerHTML = `<span class="dot"></span><span class="lead"></span><div class="label"><b>${c.title}</b><i>${c.text}</i></div>`;
  callRoot.appendChild(el);
  c.el = el; c.dot = el.querySelector(".dot"); c.lead = el.querySelector(".lead"); c.label = el.querySelector(".label");
});
const proj = new THREE.Vector3();
function updateCallouts(t) {
  for (const c of CALLOUTS) {
    const active = t > c.t0 && t < c.t1 + 0.05;
    c.el.style.display = active ? "block" : "none";
    if (!active) continue;
    proj.copy(c.at).project(camera);
    const x = (proj.x * 0.5 + 0.5) * W, y = (-proj.y * 0.5 + 0.5) * H;
    c.side = x > W - 540 ? "left" : "right";
    c.el.classList.toggle("left", c.side === "left");
    const out = easeInOut(range(t, c.t1 - 0.5, c.t1));
    c.el.style.transform = `translate(${x}px, ${y}px)`;
    c.el.style.opacity = String(1 - out);
    const d = easeOutBack(range(t, c.t0, c.t0 + 0.5));
    c.dot.style.transform = `scale(${d})`;
    const l = easeOutExpo(range(t, c.t0 + 0.2, c.t0 + 0.8));
    c.lead.style.transform = `${c.side === "left" ? "translateX(-90px) " : ""}scaleX(${l})`;
    const lb = easeOut(range(t, c.t0 + 0.45, c.t0 + 1.0));
    c.label.style.opacity = String(lb);
    c.label.style.transform = `translateX(${(1 - lb) * (c.side === "left" ? 20 : -20)}px)`;
  }
}

/* end card */
const endcard = document.getElementById("endcard");
const markPaths = [...document.querySelectorAll("#mark path")].map((p) => {
  const len = p.getTotalLength();
  p.style.strokeDasharray = `${len}`;
  return { p, len, group: p.closest(".roots") ? "roots" : p.classList.contains("ground") ? "ground" : "house" };
});
const reveals = [...document.querySelectorAll("#wordmark .reveal > span")];
function updateEndcard(t) {
  const show = easeInOut(range(t, 58.6, 60.0));
  endcard.style.opacity = String(show);
  endcard.style.display = show > 0 ? "flex" : "none";
  if (show <= 0) return;
  let ri = 0, hi = 0;
  for (const m of markPaths) {
    let p;
    if (m.group === "ground") p = easeInOut(range(t, 59.4, 60.4));
    else if (m.group === "roots") { p = easeOut(range(t, 60.0 + ri * 0.12, 61.2 + ri * 0.12)); ri++; }
    else { p = easeInOut(range(t, 60.9 + hi * 0.16, 61.9 + hi * 0.16)); hi++; }
    m.p.style.strokeDashoffset = String(m.len * (1 - p));
  }
  const drift = easeOut(range(t, 58.6, 66)) * 14;
  document.getElementById("mark").style.transform = `translateY(${10 - drift}px)`;
  reveals.forEach((s, i) => {
    const p = easeOutExpo(range(t, 61.6 + i * 0.45, 63.0 + i * 0.45));
    s.style.transform = `translateY(${(1 - p) * 115}%)`;
  });
}

const fadeEl = document.getElementById("fade");
const scrimTop = document.getElementById("scrimTop");
const scrim = document.getElementById("scrim");

/* ───────────────────────── per-frame update ───────────────────────── */
const sunDir = new THREE.Vector3();
function update(t) {
  /* look */
  const L = look(t);
  skyMat.uniforms.top.value.copy(L.top);
  skyMat.uniforms.horizon.value.copy(L.hor);
  skyMat.uniforms.bottom.value.copy(L.top).multiplyScalar(0.25);
  fog.color.copy(L.hor).lerp(L.top, 0.4);
  renderer.toneMappingExposure = L.exp;
  scene.environmentIntensity = L.envI;
  hemi.intensity = L.hemiI;

  // sun direction; in chapter 05 it sweeps east → north → west
  let az = 0.95, elev = L.elev;
  const sweep = range(t, 34.5, 42.3);
  const studyW = env(t, 33.6, 35.0, 42.4, 43.6);
  if (studyW > 0) {
    const a = 0.12 + easeInOut(sweep) * (Math.PI - 0.24);
    const sp = sunArcPoint(a).sub(ARC_C).normalize();
    const base = V(Math.cos(az) * Math.cos(elev), Math.sin(elev), Math.sin(az) * Math.cos(elev));
    sunDir.copy(base).lerp(sp, studyW).normalize();
  } else if (t > 43) {
    az = lerp(2.4, 2.75, range(t, 43, 60)); // late sun from the north-west
    sunDir.set(Math.cos(az) * Math.cos(elev), Math.sin(elev), Math.sin(az) * Math.cos(elev));
  } else {
    sunDir.set(Math.cos(az) * Math.cos(elev), Math.sin(elev), Math.sin(az) * Math.cos(elev));
  }
  sun.position.copy(sun.target.position).addScaledVector(sunDir, 50);
  sun.color.copy(L.sunC);
  sun.intensity = L.sunI;
  skyMat.uniforms.sunDir.value.copy(sunDir);
  skyMat.uniforms.sunColor.value.copy(L.sunC);
  skyMat.uniforms.sunGlow.value = clamp01(L.sunI / 3) * 0.8;

  /* 01 spark */
  const fall = easeInOut(range(t, 3.0, 5.6));
  const sy = lerp(6.0, 0.15, fall) + Math.sin(t * 2.1) * 0.08 * (1 - fall);
  sparkGroup.position.set(Math.sin(t * 0.9) * 0.12 * (1 - fall), sy, 0);
  const sparkOn = easeOut(range(t, 0.3, 1.6)) * (1 - easeInOut(range(t, 5.6, 6.6)));
  const pulse = 1 + Math.sin(t * 5.2) * 0.12;
  sparkGroup.scale.setScalar(Math.max(0.0001, sparkOn * pulse * (1 + 0.8 * easeOut(range(t, 5.45, 5.75)) * (1 - range(t, 5.75, 6.6)))));
  sparkGroup.visible = sparkOn > 0.001;
  sparkLight.position.copy(sparkGroup.position).add(V(0, 0.3, 0));
  sparkLight.intensity = sparkOn * 26 + 60 * Math.max(0, 1 - Math.abs(t - 5.7) / 0.6) * (t > 5.1 ? 1 : 0);
  ripples.forEach((r, i) => {
    const p = range(t, 5.6 + r.userData.delay, 8.2 + r.userData.delay);
    const s = 0.1 + easeOut(p) * 16;
    r.scale.setScalar(s);
    rippleMats[i].opacity = p > 0 && p < 1 ? (1 - p) * 0.9 : 0;
    r.visible = p > 0 && p < 1;
  });

  /* 02 survey */
  const surveyOut = 1 - easeInOut(range(t, 22.5, 25));
  plotLine.setProgress(easeInOut(range(t, 5.9, 8.6)));
  footprint.setProgress(easeInOut(range(t, 8.4, 10.6)));
  gridLines.forEach((l, i) => l.setProgress(easeInOut(range(t, 7.2 + i * 0.09, 8.8 + i * 0.09))));
  surveyMat.opacity = surveyOut; surveyFaint.opacity = 0.55 * surveyOut * (1 - range(t, 15, 17) * 0.6); footprintMat.opacity = surveyOut;
  pegs.forEach((g) => {
    const p = easeOutBack(range(t, 6.6 + g.userData.i * 0.12, 7.3 + g.userData.i * 0.12));
    const o = 1 - range(t, 21.5, 23);
    g.scale.set(1, Math.max(0.0001, p * o), 1);
    g.visible = p * o > 0.001;
  });

  /* 03 x-ray earth, roots, foundations */
  const xray = env(t, 14.4, 16.2, 23.2, 26.0);
  const soilOpacity = lerp(1, 0.1, xray);
  soilSideMat.opacity = soilOpacity; soilBottomMat.opacity = soilOpacity;
  soilSideMat.depthWrite = soilBottomMat.depthWrite = soilOpacity > 0.99;
  const rootGlow = 0.35 + 0.65 * xray;
  rootMat.color.copy(hdr("#e89a62", 1.35 * rootGlow));
  for (const m of roots) {
    const p = easeOut(range(t, m.userData.t0, m.userData.t0 + m.userData.dur));
    const n = Math.floor(m.userData.total * p / 30) * 30; // whole tube rings
    m.geometry.setDrawRange(0, n);
    m.visible = n > 0;
  }
  piers.forEach((p) => {
    const k = easeInOut(range(t, p.userData.t0, p.userData.t0 + 1.4));
    p.scale.y = Math.max(0.0001, k * 3.8); p.visible = k > 0;
  });
  pierGlowMat.opacity = xray;
  footings.forEach((f) => { const k = easeInOut(range(t, f.userData.t0, f.userData.t0 + 1.0)); f.scale.x = Math.max(0.0001, k); f.visible = k > 0; });
  const slabK = easeInOut(range(t, 20.6, 22.4));
  groundSlab.scale.y = Math.max(0.0001, slabK); groundSlab.visible = slabK > 0;

  /* 04 structure */
  const edgeFade = 1 - easeInOut(range(t, 33.0, 36.0)) * 0.85;
  edgeMat.opacity = edgeFade * (1 - range(t, 43.5, 46));
  for (const m of members) {
    const u = m.userData;
    const k = easeInOut(range(t, u.t0, u.t0 + u.dur));
    m.visible = k > 0;
    m.scale[u.axis] = Math.max(0.0001, k);
    const s = easeInOut(range(t, u.solidAt, u.solidAt + u.solidDur));
    m.material.opacity = s;
    m.material.transparent = s < 0.999;
    m.material.depthWrite = s > 0.5;
    m.castShadow = s > 0.5;
  }
  stairs.forEach((s) => { const k = easeOutBack(range(t, s.userData.t0, s.userData.t0 + 0.5)); s.scale.setScalar(Math.max(0.0001, k)); s.visible = k > 0; });

  /* 05 plan + sun study */
  const planOut = 1 - easeInOut(range(t, 42.4, 43.6));
  planLines.forEach((l, i) => l.setProgress(easeInOut(range(t, 33.8 + i * 0.1, 35.4 + i * 0.1))));
  windowMarks.forEach((l, i) => l.setProgress(easeOut(range(t, 35.6 + i * 0.15, 36.2 + i * 0.15))));
  planMat.opacity = planOut; planThin.opacity = planOut * 0.85; winMat.opacity = planOut;
  sunArc.setProgress(easeInOut(range(t, 34.0, 35.6)));
  arcMat.opacity = planOut * 0.8;
  const sunA = 0.12 + easeInOut(sweep) * (Math.PI - 0.24);
  sunViz.position.copy(sunArcPoint(sunA));
  const sunVizOn = easeOut(range(t, 34.6, 35.4)) * planOut;
  sunViz.scale.setScalar(Math.max(0.0001, sunVizOn)); sunViz.visible = sunVizOn > 0.001;
  rayMat.opacity = env(t, 35.6, 36.6, 41.8, 42.8) * 0.75;
  rays.forEach((l, i) => {
    const p = sunViz.position, q = RAY_TARGETS[i];
    l.geometry.setPositions([p.x, p.y, p.z, q.x, q.y, q.z]);
    l.computeLineDistances();
    l.visible = rayMat.opacity > 0.001;
  });
  scrimTop.style.opacity = String(env(t, 33.8, 34.6, 42.6, 43.4));
  scrim.style.opacity = String(1 - env(t, 33.8, 34.6, 42.6, 43.4) * 0.8);

  /* 06 envelope + garden */
  for (const e of envelope) { const k = easeInOut(range(t, e.t0, e.t0 + 1.0)); e.mesh.scale.y = Math.max(0.0001, k); e.mesh.visible = k > 0; }
  for (const g of glassPanes) { const k = easeInOut(range(t, g.t0, g.t0 + 1.2)); g.mesh.scale.y = Math.max(0.0001, Math.min(1, k * 1.5)); g.mesh.visible = k > 0; }
  glassMat.opacity = 0.42 * easeInOut(range(t, 44.0, 46.5));
  const glow = easeInOut(range(t, 46.5, 54.5));
  interiorMat.emissiveIntensity = 0.1 + glow * 1.05;
  for (const p of interiorPanels) { const k = range(t, p.t0, p.t0 + 0.6); p.mesh.scale.y = Math.max(0.0001, k); p.mesh.visible = k > 0; }
  interiorLightA.intensity = interiorLightB.intensity = glow * 40;
  trees.forEach((g) => {
    const k = easeOutBack(range(t, g.userData.t0, g.userData.t0 + 1.6));
    g.scale.setScalar(Math.max(0.0001, k)); g.visible = k > 0.001;
    g.rotation.z = Math.sin(t * 0.9 + g.userData.t0) * 0.012;
  });
  shrubs.forEach((m) => { const k = easeOutBack(range(t, m.userData.t0, m.userData.t0 + 0.8)); m.scale.setScalar(Math.max(0.0001, k)); m.visible = k > 0.001; });
  stones.forEach((m) => { const k = easeOut(range(t, m.userData.t0, m.userData.t0 + 0.5)); m.scale.setScalar(Math.max(0.0001, k)); m.visible = k > 0.001; });
  const lawn = easeInOut(range(t, 43.4, 47.0));
  grassMat.opacity = lawn; rimMat.opacity = lawn; grass.visible = rim.visible = lawn > 0;
  drive.material.opacity = easeInOut(range(t, 45.4, 46.6)); drive.visible = drive.material.opacity > 0;

  /* sustainability layers */
  const siteStudy = env(t, 9.0, 10.6, 21.5, 23.5);
  windMat.opacity = 0.85 * siteStudy; windMat.dashOffset = -t * 1.6;
  windLines.forEach((l, i) => l.setProgress(easeInOut(range(t, 9.2 + i * 0.18, 11.4 + i * 0.18))));
  treeRingMat.opacity = siteStudy; treeDotMat.opacity = siteStudy;
  treeRings.forEach((l, i) => l.setProgress(easeOut(range(t, 10.2 + i * 0.12, 11.2 + i * 0.12))));
  treeDots.forEach((d, i) => { const k = easeOutBack(range(t, 10.0 + i * 0.12, 10.5 + i * 0.12)); d.scale.setScalar(Math.max(0.0001, k)); d.visible = k > 0 && siteStudy > 0; });
  breezeMat.opacity = env(t, 37.6, 38.6, 42.2, 43.2) * 0.9; breezeMat.dashOffset = -t * 2.2;
  breezeLines.forEach((l, i) => l.setProgress(easeInOut(range(t, 37.6 + i * 0.2, 39.2 + i * 0.2))));
  solar.forEach((g) => { const k = easeOutBack(range(t, g.userData.t0, g.userData.t0 + 0.6)); g.scale.setScalar(Math.max(0.0001, k)); g.visible = k > 0.001; });
  { const k = easeOutBack(range(t, 47.6, 48.6)); tank.scale.setScalar(Math.max(0.0001, k)); tank.visible = k > 0.001; }

  /* dust */
  const pos = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST; i++) {
    const s = dustSeed[i];
    pos[i * 3] = dustBase[i * 3] + Math.sin(t * 0.13 + s) * 1.6;
    pos[i * 3 + 1] = dustBase[i * 3 + 1] + Math.sin(t * 0.21 + s * 1.7) * 0.9 + ((t * 0.08 + s) % 3);
    pos[i * 3 + 2] = dustBase[i * 3 + 2] + Math.cos(t * 0.11 + s * 0.6) * 1.6;
  }
  dustGeo.attributes.position.needsUpdate = true;
  dustMat.opacity = 0.25 + 0.5 * clamp01(L.sunI / 3) + 0.35 * env(t, 0.5, 2, 5, 7);

  /* camera */
  const { u, fov } = camU(t);
  camPos.getPoint(u, camera.position);
  const target = camTgt.getPoint(u);
  // subtle handheld drift
  camera.position.x += Math.sin(t * 0.61) * 0.06 + Math.sin(t * 1.37) * 0.025;
  camera.position.y += Math.sin(t * 0.47 + 1.3) * 0.05;
  camera.fov = fov; camera.updateProjectionMatrix();
  camera.lookAt(target);
  camera.updateMatrixWorld();

  /* post */
  bloom.strength = 0.5 + 0.35 * env(t, 0, 1, 6.5, 9) + 0.1 * xray + 0.2 * glow;
  finish.uniforms.time.value = t;

  /* DOM */
  updateCaptions(t);
  updateCallouts(t);
  updateEndcard(t);
  fadeEl.style.opacity = String(Math.max(1 - easeInOut(range(t, 0, 1.4)), easeInOut(range(t, 65.0, 66.0))));
}

window.DURATION = DURATION;
window.setTime = (t) => {
  update(t);
  composer.render();
};
window.__ready = (async () => {
  await document.fonts.load('560 82px "Fraunces"');
  await document.fonts.load('italic 400 82px "Fraunces"');
  await document.fonts.load('900 128px "Fraunces"');
  await document.fonts.ready;
  window.setTime(0);
  return true;
})();

// interactive preview: open index.html?play to watch in real time (low fidelity)
if (location.search.includes("play")) {
  const start = performance.now();
  const loop = () => { window.setTime(((performance.now() - start) / 1000) % DURATION); requestAnimationFrame(loop); };
  window.__ready.then(loop);
}
const qt = new URLSearchParams(location.search).get("t");
if (qt) window.__ready.then(() => window.setTime(parseFloat(qt)));
