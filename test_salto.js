/* 🧪 prueba de SALTO (el paracaidista): que te mueves, que aparecen otros, que puntúas al
   esquivarlos, que si te chocan te CORTAN el paracaídas y caes, y que la música se calla.
   Se ejecuta con:  node test_salto.js                                                      */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

const ini = html.indexOf("const Sal={");
const fin = html.indexOf("\n$(\"pickSal\").onclick", ini);
if (ini < 0 || fin < 0) { console.log("❌ no encuentro el juego SALTO en index.html"); process.exit(1); }
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
global.relX = () => 0;
let intervalos = 0;
global.setInterval = () => { intervalos++; return 1; };
global.clearInterval = () => { intervalos--; };
global.setTimeout = fn => 0;
global.window = { AudioContext: function () {
  const par = () => ({ setValueAtTime: nada, linearRampToValueAtTime: nada, exponentialRampToValueAtTime: nada, cancelScheduledValues: nada, value: 0 });
  const nodo = () => ({ connect: nada, disconnect: nada, start: nada, stop: nada, type: "", frequency: par(), gain: par() });
  return { currentTime: 0, state: "running", resume: nada, destination: nodo(), createOscillator: nodo, createGain: nodo };
} };

const Sal = eval("(" + codigo.slice(codigo.indexOf("{"), codigo.lastIndexOf("};") + 1) + ")");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

/* --- 1) te mueves a los lados y no te sales de la pantalla --- */
Sal.open(); Sal.start();
const x0 = Sal.x;
Sal.der = true;
for (let i = 0; i < 40; i++) { Sal.otros.length = 0; Sal.tick(); }
console.log("  moviéndote a la derecha 40 fotogramas: de x=" + Math.round(x0) + " a x=" + Math.round(Sal.x));
if (Sal.x <= x0 + 20) MAL("no te mueves a la derecha");
Sal.der = false; Sal.izq = true;
for (let i = 0; i < 200; i++) { Sal.otros.length = 0; Sal.tick(); }
console.log("  y a la izquierda a tope: x=" + Math.round(Sal.x) + " (el borde está en 16)");
if (Sal.x < 15) MAL("te sales de la pantalla por la izquierda");
Sal.izq = false;

/* --- 2) aparecen otros paracaidistas y suben hacia ti --- */
Sal.setup(); Sal.run = true;
for (let i = 0; i < 200; i++) { Sal.tick(); if (!Sal.run) break; }
console.log("  en 200 fotogramas han aparecido " + (Sal.otros.length + Sal.score) + " paracaidistas");
if (Sal.otros.length + Sal.score < 1) MAL("no aparece nadie más");

/* --- 3) puntúas al esquivar a uno --- */
Sal.setup(); Sal.run = true; Sal.score = 0;
Sal.x = 30;                                                   /* tú a un lado */
Sal.otros = [{ x: Sal.W - 30, y: Sal.yo() - 30, v: 2, lado: 0, bal: 0, pasado: false, col: "#fff" }];
Sal.tick();
console.log("  al esquivar a uno: " + Sal.score + " punto(s)");
if (Sal.score !== 1) MAL("no puntúa al esquivar");

/* --- 4) si te chocan, te CORTAN el paracaídas --- */
Sal.setup(); Sal.run = true;
Sal.x = 100;
Sal.otros = [{ x: 100, y: Sal.yo(), v: 0, lado: 0, bal: 0, pasado: false, col: "#fff" }];
Sal.tick();
console.log("  al chocar: ¿sigues volando? " + Sal.run + " · ¿te cortaron? " + !!Sal.cortado);
if (Sal.run) MAL("te atraviesan sin cortarte");
if (!Sal.cortado) MAL("no se corta el paracaídas");
else {
  /* caes dando vueltas y el paracaídas se aleja */
  const py0 = Sal.cortado.py, px0 = Sal.cortado.px;
  for (let i = 0; i < 30; i++) Sal.caidaTick();
  console.log("  cayendo: has bajado " + Math.round(Sal.cortado.caidaY) + " px y giras " + Sal.cortado.giro.toFixed(1) + " rad");
  if (!(Sal.cortado.caidaY > 40)) MAL("no caes al perder el paracaídas");
  if (!(Sal.cortado.giro > 0.5)) MAL("no das vueltas al caer");
  if (Sal.cortado.px === px0 && Sal.cortado.py === py0) MAL("el paracaídas cortado no se aleja");
  else console.log("  ✅ el paracaídas sale volando y tú caes girando");
  let v = 0; while (Sal.cortado && v < 400) { Sal.caidaTick(); v++; }
  console.log("  la caída dura " + v + " fotogramas y se acaba sola");
  if (Sal.cortado) MAL("la caída no termina nunca");
  if (Sal.raf) MAL("tras la caída sigue dibujando para siempre");
}

/* --- 5) el récord se guarda --- */
Sal.setup(); Sal.run = true; Sal.score = 9;
Sal.corte({ x: Sal.x + 5 });
console.log("  récord guardado: " + guardado["edtu_sal_best"]);
if (guardado["edtu_sal_best"] !== "9") MAL("no guarda el récord");

/* --- 6) la música arranca y se calla, sin dejar relojes --- */
Sal.setup(); Sal.start();
if (!Sal.mus) MAL("la música no arranca");
Sal.corte({ x: Sal.x + 5 });
if (Sal.mus) MAL("la música sigue después de que te corten");
Sal.start(); Sal.close();
if (Sal.mus) MAL("la música sigue después de salir");
if (intervalos !== 0) MAL("quedan " + intervalos + " reloj(es) de música corriendo");
else console.log("  ✅ la música arranca, se calla al cortarte y al salir, sin relojes colgando");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ SALTO sano · te mueves, esquivas, puntúas, te cortan el paracaídas y caes girando");
