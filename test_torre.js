/* 🧪 prueba de TORRE: que el bloque se pasea y rebota, que al soltarlo se recorta lo que
   sobresale, que clavarlo da más puntos, que fallar del todo acaba la partida y que sube la torre.
   Se ejecuta con:  node test_torre.js                                                            */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

const ini = html.indexOf("const Trr={");
const fin = html.indexOf("\n$(\"pickTrr\").onclick", ini);
if (ini < 0 || fin < 0) { console.log("❌ no encuentro el juego TORRE en index.html"); process.exit(1); }
const codigo = html.slice(ini, fin);

const nada = () => {};
const ctxFalso = new Proxy({}, {
  get: (o, k) => ((k === "createLinearGradient" || k === "createRadialGradient")
    ? () => ({ addColorStop: nada }) : nada),
  set: () => true
});
const guardado = {};
const elems = {};
const el = id => (elems[id] = elems[id] || {
  id, textContent: "", innerHTML: "", width: 380, height: 520,
  classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); } },
  getContext: () => ctxFalso, addEventListener: nada
});
global.$ = el;
global.localStorage = { getItem: k => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); } };
global.innerWidth = 400; global.innerHeight = 800;
global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = nada;
global.gBeep = nada; global.edtuPlayDay = nada; global.edtuMiniAvg = () => "";
let intervalos = 0;
global.setInterval = () => { intervalos++; return 1; };
global.clearInterval = () => { intervalos--; };
global.setTimeout = () => 0;
global.window = { AudioContext: function () {
  const par = () => ({ setValueAtTime: nada, linearRampToValueAtTime: nada, exponentialRampToValueAtTime: nada, cancelScheduledValues: nada, value: 0 });
  const nodo = () => ({ connect: nada, disconnect: nada, start: nada, stop: nada, type: "", frequency: par(), gain: par() });
  return { currentTime: 0, state: "running", resume: nada, destination: nodo(), createOscillator: nodo, createGain: nodo };
} };

const Trr = eval("(" + codigo.slice(codigo.indexOf("{"), codigo.lastIndexOf("};") + 1) + ")");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

/* --- 1) el bloque se pasea de lado a lado y rebota en los bordes --- */
Trr.open(); Trr.start();
const x0 = Trr.mov.x;
for (let i = 0; i < 10; i++) Trr.tick();
if (Trr.mov.x === x0) MAL("el bloque no se mueve");
let rebota = false, dir0 = Trr.mov.dir;
for (let i = 0; i < 600; i++) { Trr.tick(); if (Trr.mov.dir !== dir0) { rebota = true; break; } }
console.log("  el bloque se pasea y rebota en el borde: " + rebota);
if (!rebota) MAL("el bloque no rebota en los bordes");
if (Trr.mov.x < 3 || Trr.mov.x + Trr.mov.w > Trr.W - 3) MAL("el bloque se sale de la pantalla");

/* --- 2) al soltarlo desplazado, se recorta lo que sobresale --- */
Trr.setup(); Trr.run = true;
const anchoAntes = Trr.base[0].w;
Trr.mov.x = Trr.base[0].x + 30;                                /* 30 px corrido */
Trr.suelta();
const nuevo = Trr.base[Trr.base.length - 1];
console.log("  soltado 30 px corrido: el bloque pasa de " + Math.round(anchoAntes) + " a " + Math.round(nuevo.w) + " de ancho");
if (Math.abs(nuevo.w - (anchoAntes - 30)) > 1) MAL("no recorta bien lo que sobresale");
if (!Trr.cae.length) MAL("el trozo que sobra no se cae");
else console.log("  ✅ y el trozo que sobra se cae (" + Trr.cae.length + " pedazo)");

/* --- 3) clavarlo no recorta nada y da más puntos --- */
Trr.setup(); Trr.run = true;
Trr.mov.x = Trr.base[0].x;                                     /* justo encima */
const pts0 = Trr.score;
Trr.suelta();
console.log("  clavado: ancho " + Math.round(Trr.base[Trr.base.length - 1].w) + " (igual) · +" + (Trr.score - pts0) + " puntos · clavados: " + Trr.perfectos);
if (Trr.base[Trr.base.length - 1].w !== Trr.base[0].w) MAL("al clavarlo también recorta");
if (Trr.score - pts0 < 2) MAL("clavarlo no da más puntos que fallar");
if (Trr.perfectos !== 1) MAL("no cuenta los clavados");
/* y encadenar clavados da todavía más */
const antesCombo = Trr.score;
Trr.mov.x = Trr.base[Trr.base.length - 1].x; Trr.suelta();
console.log("  segundo clavado seguido: +" + (Trr.score - antesCombo) + " puntos (combo " + Trr.combo + ")");
if (Trr.score - antesCombo <= 2 + 1) MAL("encadenar clavados no da más");

/* --- 4) fallar del todo acaba la partida --- */
Trr.setup(); Trr.run = true; Trr.score = 14;
Trr.mov.x = 4; Trr.base[0].x = Trr.W - 60; Trr.base[0].w = 50;  /* sin nada debajo */
Trr.suelta();
console.log("  fallando del todo: ¿sigue el juego? " + Trr.run);
if (Trr.run) MAL("fallar del todo no acaba la partida");
console.log("  récord guardado: " + guardado["edtu_trr_best"]);
if (guardado["edtu_trr_best"] !== "14") MAL("no guarda el récord");

/* --- 5) la torre sube y la cámara la sigue --- */
Trr.setup(); Trr.run = true;
for (let i = 0; i < 12; i++) { Trr.mov.x = Trr.base[Trr.base.length - 1].x; Trr.suelta(); }
console.log("  tras 12 bloques: " + Trr.base.length + " pisos · la cámara sube a " + Math.round(Trr.camObj));
if (Trr.base.length !== 13) MAL("la torre no crece");
if (!(Trr.camObj > 0)) MAL("la cámara no sube con la torre");
/* y el bloque va cada vez más rápido */
const vel13 = Trr.mov.v;
Trr.setup();
console.log("  velocidad del bloque: " + Trr.mov.v.toFixed(1) + " al empezar y " + vel13.toFixed(1) + " en el piso 13");
if (!(vel13 > Trr.mov.v)) MAL("el juego no se pone más difícil");

/* --- 6) la música arranca, se calla y no deja relojes --- */
Trr.setup(); Trr.start();
if (!Trr.mus) MAL("la música no arranca");
Trr.fin();
if (Trr.mus) MAL("la música sigue después de acabar");
Trr.start(); Trr.close();
if (Trr.mus) MAL("la música sigue después de salir");
if (intervalos !== 0) MAL("quedan " + intervalos + " reloj(es) de música corriendo");
else console.log("  ✅ música: arranca, se calla al caerse y al salir, sin relojes colgando");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ TORRE sana · se pasea, recorta, premia los clavados, se acaba al fallar y sube la cámara");
