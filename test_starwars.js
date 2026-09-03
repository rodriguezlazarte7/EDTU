/* 🧪 prueba automática de STAR WARS: hace volar el juego sin pantalla y avisa si algo
   peta, si un número se vuelve NaN o si se disparan las partículas. Se ejecuta con:
     node test_starwars.js                                                            */
const fs = require("fs"), vm = require("vm"), path = require("path");
const HTML = fs.readFileSync(path.join(__dirname, "starwars.html"), "utf8");

/* --- el guion del juego, sacado del HTML --- */
const trozos = [...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!trozos.length) { console.error("❌ no encontré el <script> del juego"); process.exit(1); }
/* las cosas declaradas con const/let no salen solas del guion: se piden al final */
const CODIGO = trozos.join("\n;\n") +
  "\n;globalThis.__G=G; globalThis.__NAVES=NAVES; globalThis.__CLASES=CLASES; globalThis.__MOD=MOD;\n";

/* --- una pantalla y un navegador de mentira --- */
const nada = () => {};
let lienzo;
const ctxFalso = new Proxy({}, {
  get: (o, k) => {
    if (k === "canvas") return lienzo;
    if (k === "measureText") return () => ({ width: 10 });
    if (k === "createLinearGradient" || k === "createRadialGradient") return () => ({ addColorStop: nada });
    if (k in o) return o[k];
    return nada;
  },
  set: (o, k, v) => { o[k] = v; return true; }
});
function nuevoElemento(id) {
  return {
    id, style: {}, dataset: {}, textContent: "", innerHTML: "", value: "",
    width: 1280, height: 720, clientWidth: 1280, clientHeight: 720, hijos: [],
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, v) { if (v === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); } else { v ? this._s.add(c) : this._s.delete(c); } },
      contains(c) { return this._s.has(c); }
    },
    getContext: () => ctxFalso, addEventListener: nada, removeEventListener: nada,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720 }),
    appendChild(c) { this.hijos.push(c); return c; },
    querySelector: () => null, querySelectorAll: () => [],
    requestPointerLock: nada, focus: nada, click: nada, onclick: null
  };
}
const elementos = new Map();
const doc = {
  getElementById: id => { if (!elementos.has(id)) elementos.set(id, nuevoElemento(id)); return elementos.get(id); },
  createElement: t => nuevoElemento(t),
  querySelector: () => null, querySelectorAll: () => [], addEventListener: nada,
  documentElement: nuevoElemento("html"), body: nuevoElemento("body"),
  exitPointerLock: nada, pointerLockElement: null
};
lienzo = doc.getElementById("cv");

function audioFalso() {
  const nodo = () => ({
    connect: () => nodo(), disconnect: nada, start: nada, stop: nada, type: "",
    frequency: { setValueAtTime: nada, exponentialRampToValueAtTime: nada, setTargetAtTime: nada, value: 0 },
    gain: { setValueAtTime: nada, linearRampToValueAtTime: nada, exponentialRampToValueAtTime: nada, cancelScheduledValues: nada, setTargetAtTime: nada, value: 0 },
    pan: { setValueAtTime: nada, value: 0 }
  });
  return {
    currentTime: 0, state: "running", resume: nada, destination: nodo(),
    createOscillator: nodo, createGain: nodo, createBiquadFilter: nodo, createStereoPanner: nodo
  };
}
const almacen = {};
const ventana = {
  document: doc, innerWidth: 1280, innerHeight: 720, devicePixelRatio: 2,
  addEventListener: nada, removeEventListener: nada, requestAnimationFrame: () => 0, cancelAnimationFrame: nada,
  setTimeout: () => 0, clearTimeout: nada, setInterval: () => 0, clearInterval: nada,
  localStorage: {
    getItem: k => (k in almacen ? almacen[k] : null),
    setItem: (k, v) => { almacen[k] = String(v); },
    removeItem: k => { delete almacen[k]; }
  },
  performance: { now: () => Date.now() },
  navigator: { getGamepads: () => [], maxTouchPoints: 0, userAgent: "node" },
  screen: { orientation: null }, location: { href: "" }, parent: null,
  console, Math, Date, JSON, isNaN, isFinite, parseInt, parseFloat, Proxy, Map, Set, Number, Object, Array, String,
  AudioContext: audioFalso, webkitAudioContext: audioFalso
};
ventana.window = ventana; ventana.self = ventana; ventana.globalThis = ventana;

const ctxVM = vm.createContext(ventana);
let fallos = 0;
const F = m => { fallos++; console.log("❌ " + m); };

try { vm.runInContext(CODIGO, ctxVM, { filename: "starwars.html" }); }
catch (e) { console.log("❌ el guion no llega ni a cargar: " + e.message); console.log(e.stack); process.exit(1); }
console.log("✅ el guion carga sin reventar");

/* --- que las piezas estén todas --- */
for (const nombre of ["nuevaPartida", "update", "render", "disparar", "lanzaTorpedo", "nuevoEnemigo",
  "misionNueva", "pintaRadar", "buscaBlanco", "seIncendia", "trincheraNueva", "colorLuz", "sfx", "musArranca"])
  if (typeof ctxVM[nombre] !== "function") F("falta la función " + nombre);

const NAVES = ctxVM.__NAVES, G = ctxVM.__G;
if (!NAVES || Object.keys(NAVES).length < 6) F("deberían poder elegirse 6 naves");
else console.log("🚀 naves: " + Object.keys(NAVES).map(b => NAVES[b].nom).join(", "));

/* --- que ningún número se vuelva NaN y que la nave no se deforme --- */
const finito = (v, q) => { if (typeof v === "number" && !Number.isFinite(v)) F(q + " se volvió " + v); };
function revisa(etapa) {
  finito(G.pos.x, etapa + ": la posición x"); finito(G.pos.y, etapa + ": la posición y"); finito(G.pos.z, etapa + ": la posición z");
  finito(G.shield, etapa + ": el escudo"); finito(G.score, etapa + ": los puntos"); finito(G.gas, etapa + ": el acelerador");
  for (const b of ["r", "u", "f"]) {
    const v = G.base[b]; finito(v.x, etapa + ": el eje " + b);
    const l = Math.hypot(v.x, v.y, v.z);
    if (Math.abs(l - 1) > 0.02) F(etapa + ": el eje " + b + " de la nave mide " + l.toFixed(4) + " y debería medir 1");
  }
}

/* --- se juega una partida con cada nave --- */
const DT = 1 / 60, SEG = 40;
for (const bando of Object.keys(NAVES)) {
  G.bando = bando;
  try { ctxVM.nuevaPartida(); } catch (e) { F(bando + ": nuevaPartida peta: " + e.message); continue; }
  G.run = true; G.over = false; G.paused = false;
  let maxBalas = 0, maxChispas = 0, roto = false;
  for (let i = 0; i < SEG / DT; i++) {
    /* se pilota "al azar" pero siempre igual, para que la prueba sea repetible */
    G.yaw = Math.sin(i * 0.013) * 2.4; G.pitch = Math.cos(i * 0.021) * 2.0; G.roll = Math.sin(i * 0.007);
    G.gasObj = (i % 900 < 450) ? 1 : 0.15;
    G.disparando = (i % 7) < 4;
    if (i % 180 === 0) { try { ctxVM.lanzaTorpedo(); } catch (e) { F(bando + ": los torpedos petan: " + e.message); } }
    if (i % 240 === 0) G.shield = G.vidaMax;
    try { ctxVM.update(DT); } catch (e) { F(bando + ": update peta en el segundo " + (i * DT).toFixed(1) + ": " + e.message); console.log(e.stack); roto = true; break; }
    try { ctxVM.render(); } catch (e) { F(bando + ": render peta en el segundo " + (i * DT).toFixed(1) + ": " + e.message); console.log(e.stack); roto = true; break; }
    maxBalas = Math.max(maxBalas, G.balas.length); maxChispas = Math.max(maxChispas, G.chispas.length);
    if (i % 600 === 0) revisa(bando + " seg " + (i * DT).toFixed(0));
  }
  if (roto) continue;
  revisa(bando + " final");
  if (maxBalas > 1500) F(bando + ": demasiados láseres a la vez (" + maxBalas + ")");
  if (maxChispas > 8000) F(bando + ": demasiadas partículas a la vez (" + maxChispas + ")");
  console.log("  " + NAVES[bando].nom.padEnd(16) + " oleada " + G.wave + " · " + G.kills + " derribos · " +
    maxBalas + " láseres y " + maxChispas + " partículas como mucho");
}

/* --- las misiones, una por una --- */
const vistas = new Set();
for (let w = 1; w <= 12; w++) {
  G.wave = w;
  try { ctxVM.misionNueva(); } catch (e) { F("la misión de la oleada " + w + " peta: " + e.message); continue; }
  const m = G.mision;
  if (!m) { console.log("  oleada " + w + ": sin misión"); continue; }
  vistas.add(m.tipo);
  if (!m.texto || !m.meta) F("la misión de la oleada " + w + " está incompleta");
  for (let i = 0; i < 240; i++) {
    try { ctxVM.update(DT); ctxVM.render(); }
    catch (e) { F("la misión '" + m.tipo + "' peta: " + e.message); console.log(e.stack); break; }
  }
  console.log("  oleada " + w + ": " + m.tipo + " · " + m.texto.replace(/<[^>]+>/g, ""));
}
for (const t of ["protege", "torres", "trinchera", "rapido", "jefe"])
  if (!vistas.has(t)) F("en 12 oleadas nunca salió la misión '" + t + "'");

/* --- que se pueda perder y volver a empezar --- */
try { G.shield = -1; ctxVM.update(DT); ctxVM.render(); } catch (e) { F("morir peta: " + e.message); }
try { ctxVM.nuevaPartida(); ctxVM.update(DT); } catch (e) { F("volver a empezar peta: " + e.message); }

console.log("");
if (fallos) { console.log("❌ " + fallos + " fallo(s)"); process.exit(1); }
console.log("✅ STAR WARS sano · 6 naves, 4 minutos de vuelo simulado y 12 oleadas de misiones sin un solo error");
