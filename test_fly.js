/* 🧪 prueba de FLY (el avión): que MANTENIENDO apretado sube y soltando baja, que el vuelo
   es suave (nada de escalones), que choca con los pilares, que puntúa y que guarda el récord.
   Se ejecuta con:  node test_fly.js                                                          */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

/* se saca del index solo el trozo del juego */
const ini = html.indexOf("const Fly={");
const fin = html.indexOf("$(\"pickFly\").onclick");
if (ini < 0 || fin < 0) { console.log("❌ no encuentro el juego FLY en index.html"); process.exit(1); }
const codigo = html.slice(ini, fin);

/* un navegador de mentira, solo lo que FLY usa */
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

const Fly = eval("(" + codigo.slice(codigo.indexOf("{"), codigo.lastIndexOf("};") + 1) + ")");

let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

/* --- 1) manteniendo apretado, SUBE --- */
Fly.open(); Fly.start();
const y0 = Fly.y;
Fly.sube = true;
for (let i = 0; i < 30; i++) Fly.tick();
const subida = y0 - Fly.y;                                   /* en pantalla, menos y = más arriba */
console.log("  manteniendo apretado 30 fotogramas: subió " + Math.round(subida) + " píxeles");
if (subida < 25) MAL("manteniendo apretado no sube");

/* --- 2) al soltar, BAJA (y reacciona rápido) --- */
Fly.sube = false;
const y1 = Fly.y;
let frenoEn = -1;
for (let i = 0; i < 60; i++) { Fly.tick(); if (frenoEn < 0 && Fly.vy > 0) frenoEn = i; }
const bajada = Fly.y - y1;
console.log("  al soltar tarda " + (frenoEn / 60).toFixed(2) + " s en empezar a caer, y en 1 s baja " + Math.round(bajada) + " píxeles");
if (frenoEn < 0 || frenoEn > 20) MAL("al soltar tarda demasiado en empezar a bajar (" + frenoEn + " fotogramas)");
if (bajada < 25) MAL("al soltar no baja");

/* --- 3) el vuelo es SUAVE: no hay saltos de golpe como en Flappy --- */
Fly.setup(); Fly.run = true; Fly.sube = true;
let saltoMax = 0, yAnt = Fly.y;
for (let i = 0; i < 90; i++) { Fly.tick(); saltoMax = Math.max(saltoMax, Math.abs(Fly.y - yAnt)); yAnt = Fly.y; }
console.log("  lo más que se mueve de un fotograma a otro: " + saltoMax.toFixed(1) + " píxeles");
if (saltoMax > 7) MAL("el vuelo da saltos: no es suave");

/* comparación con FLAPPY, que salta de golpe al aletear */
const iniF = html.indexOf("const Flap={");
const finF = html.indexOf("\n\n/*", iniF);          /* hasta el comentario del juego siguiente */
const trozoF = html.slice(iniF, finF);
const Flap = eval("(" + trozoF.slice(trozoF.indexOf("{"), trozoF.lastIndexOf("};") + 1) + ")");
Flap.open(); Flap.start(); Flap.flap();
const fy = Flap.by; Flap.tick();
console.log("  (FLAPPY, al aletear, salta " + Math.abs(Flap.by - fy).toFixed(1) + " píxeles de golpe: eso es lo que se quería evitar)");

/* --- 4) choca con los pilares --- */
Fly.setup(); Fly.run = true;
Fly.pipes = [{ x: 46, top: 300, scored: false }];             /* un pilar justo encima del avión */
Fly.y = 100;                                                  /* muy por encima del hueco */
Fly.tick();
console.log("  contra un pilar: ¿sigue volando? " + Fly.run);
if (Fly.run) MAL("atraviesa los pilares");

/* --- 5) puntúa al pasar y guarda el récord --- */
Fly.setup(); Fly.run = true;
Fly.pipes = [{ x: 40, top: Fly.H / 2 - 75, scored: false }];   /* pilar ya pasado, con el hueco centrado */
Fly.y = Fly.H / 2; Fly.vy = 0;
Fly.tick();
console.log("  al pasar un pilar: " + Fly.score + " punto(s)");
if (Fly.score !== 1) MAL("no puntúa al pasar un pilar");
Fly.score = 7; Fly.dead();
console.log("  récord guardado: " + guardado["edtu_fly_best"]);
if (guardado["edtu_fly_best"] !== "7") MAL("no guarda el récord");

/* --- 6) al morir deja de volar y suelta el acelerador --- */
if (Fly.run || Fly.sube) MAL("tras morir sigue en marcha");
else console.log("  ✅ al chocar se detiene y suelta el acelerador");

/* --- 7) LA EXPLOSIÓN: salta al chocar, se mueve y se acaba sola --- */
Fly.setup(); Fly.run = true;
Fly.pipes = [{ x: 46, top: 300, scored: false }];
Fly.y = 100;
Fly.tick();                                                   /* choca */
if (!Fly.boom) MAL("al chocar no hay explosión");
else {
  const trozos = Fly.boom.P.length;
  const fuego = Fly.boom.P.filter(p => p.t === "fuego").length;
  const humo = Fly.boom.P.filter(p => p.t === "humo").length;
  const restos = Fly.boom.P.filter(p => p.t === "trozo").length;
  console.log("  explosión: " + trozos + " pedazos (" + fuego + " de fuego, " + humo + " de humo, " + restos + " trozos del avión) · sacudida " + Fly.sacude.toFixed(0));
  if (fuego < 10 || humo < 5 || restos < 5) MAL("la explosión no tiene de todo");
  if (!(Fly.sacude > 3)) MAL("la pantalla no se sacude al explotar");
  const x0 = Fly.boom.P[0].x, y0 = Fly.boom.P[0].y;
  Fly.boomTick();
  if (Fly.boom && Fly.boom.P[0] && Fly.boom.P[0].x === x0 && Fly.boom.P[0].y === y0) MAL("los pedazos no se mueven");
  else console.log("  ✅ los pedazos salen despedidos");
  let cuadros = 1;
  while (Fly.boom && cuadros < 400) { Fly.boomTick(); cuadros++; }
  console.log("  la explosión dura " + cuadros + " fotogramas (" + (cuadros / 60).toFixed(1) + " s) y se acaba sola");
  if (Fly.boom) MAL("la explosión no se acaba nunca");
  if (Fly.raf) MAL("tras la explosión el juego sigue dibujando para siempre");
}

/* --- 8) LA GENTE que salta del avión, con paracaídas --- */
Fly.setup(); Fly.run = true;
Fly.pipes = [{ x: 46, top: 300, scored: false }];
Fly.y = 100;
Fly.tick();                                                   /* choca */
console.log("  saltan " + Fly.gente.length + " personitas del avión");
if (Fly.gente.length < 3) MAL("no salta nadie del avión");
else {
  const caeAntes = Fly.gente[0].y;
  for (let i = 0; i < 10; i++) Fly.genteTick();
  if (Fly.gente[0] && Fly.gente[0].para) MAL("el paracaídas se abre de inmediato: no da tiempo a ver la caída");
  let abiertos = 0, cuadros = 0;
  while (cuadros < 90) { Fly.genteTick(); cuadros++; abiertos = Fly.gente.filter(g => g.para).length; if (abiertos && cuadros > 45) break; }
  console.log("  a los " + cuadros + " fotogramas ya hay " + abiertos + " paracaídas abiertos");
  if (!abiertos) MAL("los paracaídas no se abren nunca");
  const g = Fly.gente[0];
  if (g && g.vy > 2.2) MAL("con el paracaídas abierto siguen cayendo como piedras (" + g.vy.toFixed(1) + ")");
  else console.log("  ✅ con el paracaídas abierto bajan despacito");
  let seg = 0;
  while (Fly.gente.length && seg < 900) { Fly.genteTick(); seg++; }
  if (Fly.gente.length) MAL("las personitas no desaparecen nunca de la pantalla");
  else console.log("  ✅ y acaban saliendo de la pantalla (no se acumulan)");
}

/* --- 9) LA MÚSICA: arranca al jugar y se calla al morir y al salir --- */
{
  let intervalos = 0;
  const si = global.setInterval, ci = global.clearInterval;
  global.setInterval = () => { intervalos++; return 123; };
  global.clearInterval = () => { intervalos--; };
  global.window = { AudioContext: function () {
    const par = () => ({ setValueAtTime: nada, linearRampToValueAtTime: nada, exponentialRampToValueAtTime: nada, cancelScheduledValues: nada, value: 0 });
    const nodo = () => ({ connect: nada, disconnect: nada, start: nada, stop: nada, type: "", frequency: par(), gain: par() });
    return { currentTime: 0, state: "running", resume: nada, destination: nodo(), createOscillator: nodo, createGain: nodo };
  } };
  global.setTimeout = () => 0;
  Fly.setup(); Fly.start();
  console.log("  al empezar a jugar, ¿suena la música? " + (!!Fly.mus));
  if (!Fly.mus) MAL("la música no arranca");
  Fly.dead();
  console.log("  al chocar, ¿se calla? " + (!Fly.mus));
  if (Fly.mus) MAL("la música sigue sonando después de morir");
  Fly.start(); Fly.close();
  if (Fly.mus) MAL("la música sigue sonando después de salir del juego");
  else console.log("  ✅ y también se calla al salir del juego");
  if (intervalos !== 0) MAL("la música deja " + intervalos + " reloj(es) corriendo para siempre");
  else console.log("  ✅ sin relojes de música colgando");
  global.setInterval = si; global.clearInterval = ci;
}

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ FLY sano · mantener sube, soltar baja, vuelo suave, choca, puntúa y guarda el récord");
