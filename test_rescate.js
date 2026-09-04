/* 🧪 prueba de RESCATE (el helicóptero): que vuela sin salirse, que recoge paracaidistas,
   que los que llegan al suelo se pierden, que a las 3 vidas se acaba y que guarda el récord.
   Se ejecuta con:  node test_rescate.js                                                    */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

const ini = html.indexOf("const Rsc={");
const fin = html.indexOf("\n$(\"pickRsc\").onclick", ini);
if (ini < 0 || fin < 0) { console.log("❌ no encuentro el juego RESCATE en index.html"); process.exit(1); }
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
global.relX = () => 0; global.relY = () => 0;
let intervalos = 0;
global.setInterval = () => { intervalos++; return 1; };
global.clearInterval = () => { intervalos--; };
global.setTimeout = () => 0;
global.window = { AudioContext: function () {
  const par = () => ({ setValueAtTime: nada, linearRampToValueAtTime: nada, exponentialRampToValueAtTime: nada, cancelScheduledValues: nada, value: 0 });
  const nodo = () => ({ connect: nada, disconnect: nada, start: nada, stop: nada, type: "", frequency: par(), gain: par() });
  return { currentTime: 0, state: "running", resume: nada, destination: nodo(), createOscillator: nodo, createGain: nodo };
} };

const Rsc = eval("(" + codigo.slice(codigo.indexOf("{"), codigo.lastIndexOf("};") + 1) + ")");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

/* --- 1) vuela en las cuatro direcciones y no se sale --- */
Rsc.open(); Rsc.start();
const x0 = Rsc.x, y0 = Rsc.y;
Rsc.teclas.der = true; Rsc.teclas.arr = true;
for (let i = 0; i < 40; i++) { Rsc.gente.length = 0; Rsc.tick(); }
console.log("  volando arriba-derecha: de (" + Math.round(x0) + "," + Math.round(y0) + ") a (" + Math.round(Rsc.x) + "," + Math.round(Rsc.y) + ")");
if (!(Rsc.x > x0 + 15)) MAL("no vuela a la derecha");
if (!(Rsc.y < y0 - 15)) MAL("no sube");
Rsc.teclas = { izq: true, aba: true };
for (let i = 0; i < 300; i++) { Rsc.gente.length = 0; Rsc.tick(); if (!Rsc.run) break; }
console.log("  a tope abajo-izquierda: x=" + Math.round(Rsc.x) + " y=" + Math.round(Rsc.y) + " (suelo en " + Rsc.suelo() + ")");
if (Rsc.x < 21) MAL("se sale por la izquierda");
if (Rsc.y > Rsc.suelo() - 13) MAL("el helicóptero se mete en el suelo");
Rsc.teclas = {};

/* --- 2) recoge a un paracaidista al tocarlo --- */
Rsc.setup(); Rsc.run = true;
Rsc.gente = [{ x: Rsc.x, y: Rsc.y, vy: 0, bal: 0, col: "#fff", salvado: false }];
Rsc.tick();
console.log("  al tocarlo: " + Rsc.salvados + " salvado(s), quedan " + Rsc.gente.length + " en el aire");
if (Rsc.salvados !== 1) MAL("no recoge a los paracaidistas");

/* --- 3) el que llega al suelo se pierde --- */
Rsc.setup(); Rsc.run = true;
Rsc.x = 20; Rsc.y = 30;                                       /* el helicóptero, lejos */
Rsc.gente = [{ x: 300, y: Rsc.suelo() - 5, vy: 2, bal: 0, col: "#fff", salvado: false }];
Rsc.tick();
console.log("  uno toca el suelo: perdidos = " + Rsc.perdidos);
if (Rsc.perdidos !== 1) MAL("los que llegan al suelo no cuentan como perdidos");

/* --- 4) a los 3 perdidos, se acaba --- */
Rsc.setup(); Rsc.run = true; Rsc.perdidos = 2; Rsc.salvados = 12;
Rsc.x = 20; Rsc.y = 30;
Rsc.gente = [{ x: 300, y: Rsc.suelo() - 5, vy: 2, bal: 0, col: "#fff", salvado: false }];
Rsc.tick();
console.log("  con 3 perdidos: ¿sigue el juego? " + Rsc.run);
if (Rsc.run) MAL("no se acaba al perder 3");
console.log("  récord guardado: " + guardado["edtu_rsc_best"]);
if (guardado["edtu_rsc_best"] !== "12") MAL("no guarda el récord");

/* --- 5) siempre hay alguien a quien salvar --- */
Rsc.setup(); Rsc.run = true;
let vacio = 0;
for (let i = 0; i < 400 && Rsc.run; i++) { Rsc.tick(); if (!Rsc.gente.length) vacio++; }
console.log("  fotogramas sin nadie en pantalla: " + vacio + " de 400");
if (vacio > 40) MAL("se queda mucho rato sin paracaidistas: el juego se para");

/* --- 6) la música arranca, se calla y no deja relojes --- */
Rsc.setup(); Rsc.start();
if (!Rsc.mus) MAL("la música no arranca");
Rsc.fin();
if (Rsc.mus) MAL("la música sigue después de acabar");
Rsc.start(); Rsc.close();
if (Rsc.mus) MAL("la música sigue después de salir");
if (intervalos !== 0) MAL("quedan " + intervalos + " reloj(es) de música corriendo");
else console.log("  ✅ música: arranca, se calla al acabar y al salir, sin relojes colgando");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ RESCATE sano · vuela, recoge, pierde vidas, se acaba a las 3 y guarda el récord");
