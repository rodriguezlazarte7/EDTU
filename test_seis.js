/* 🧪 prueba de los SEIS juegos nuevos: TORMENTA, ABDUCCIÓN, IMÁN, CUEVA, FRANCOTIRADOR
   y ATERRIZAJE. Comprueba lo que hace especial a cada uno, que ninguno se queda colgado
   y que ninguno deja relojes de música corriendo.  Se ejecuta con:  node test_seis.js   */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

/* ---- navegador de mentira ---- */
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
  getContext: () => ctxFalso, addEventListener: nada, onclick: null
});
let intervalos = 0;
const ctx = {
  $: el,
  localStorage: { getItem: k => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); } },
  innerWidth: 400, innerHeight: 800,
  requestAnimationFrame: () => 0, cancelAnimationFrame: nada,
  gBeep: nada, edtuPlayDay: nada, edtuMiniAvg: () => "",
  relX: () => 0, relY: () => 0,
  setInterval: () => { intervalos++; return 1; }, clearInterval: () => { intervalos--; },
  setTimeout: () => 0, addEventListener: nada, console, Math, Date, JSON, Set, Proxy
};
ctx.window = { AudioContext: function () {
  const par = () => ({ setValueAtTime: nada, linearRampToValueAtTime: nada, exponentialRampToValueAtTime: nada, cancelScheduledValues: nada, value: 0 });
  const nodo = () => ({ connect: nada, disconnect: nada, start: nada, stop: nada, type: "", frequency: par(), gain: par() });
  return { currentTime: 0, state: "running", resume: nada, destination: nodo(), createOscillator: nodo, createGain: nodo };
} };

/* se saca del index desde el ayudante de música hasta justo antes de TORRE */
const ini = html.indexOf("function miniMus(");
const fin = html.indexOf("/* 🏗️ TORRE — un bloque se pasea", ini);
if (ini < 0 || fin < 0) { console.log("❌ no encuentro los juegos nuevos"); process.exit(1); }
const codigo = html.slice(ini, fin) + "\n;this.__J={Tor,Abd,Ima,Cue,Fra,Atz};";
require("vm").runInNewContext(codigo, ctx, { filename: "seis" });
const { Tor, Abd, Ima, Cue, Fra, Atz } = ctx.__J;

let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const corre = (J, n) => { for (let i = 0; i < n && J.run; i++) J.tick(); };

/* ================= 🌩️ TORMENTA ================= */
{
  Tor.open(); Tor.start();
  Tor.teclas.der = true; const x0 = Tor.x;
  for (let i = 0; i < 30; i++) { Tor.rayos.length = 0; Tor.tick(); }
  if (!(Tor.x > x0 + 10)) MAL("TORMENTA: no te mueves");
  Tor.teclas = {};
  /* el rayo AVISA antes de caer */
  Tor.setup(); Tor.run = true;
  Tor.rayos = [{ x: Tor.x, aviso: 20, t: 0, ancho: 20, cayo: false }];
  corre(Tor, 10);
  console.log("  🌩️ TORMENTA: a mitad del aviso, ¿sigues vivo? " + Tor.run + " (el rayo avisa antes de caer)");
  if (!Tor.run) MAL("TORMENTA: el rayo mata durante el aviso, sin dar tiempo");
  corre(Tor, 15);
  if (Tor.run) MAL("TORMENTA: el rayo no te alcanza aunque estés en su columna");
  /* y si te apartas, te lo saltas y puntúas */
  Tor.setup(); Tor.run = true; Tor.x = 20;
  Tor.rayos = [{ x: Tor.W - 20, aviso: 5, t: 0, ancho: 20, cayo: false }];
  corre(Tor, 12);
  console.log("     apartándote: sigues vivo (" + Tor.run + ") y sumas " + Tor.score);
  if (!Tor.run || Tor.score < 1) MAL("TORMENTA: esquivar no puntúa");
}

/* ================= 🛸 ABDUCCIÓN ================= */
{
  Abd.open(); Abd.start();
  Abd.focos.forEach(f => f.x = -999);                          /* focos lejos, para probar el rayo */
  Abd.vacas = [{ x: Abd.x, v: 0, y: Abd.suelo() - 8 }];
  Abd.rayo = true;
  let ciclos = 0;
  while (Abd.score === 0 && ciclos < 400 && Abd.run) { Abd.tick(); ciclos++; }
  console.log("  🛸 ABDUCCIÓN: vaca subida en " + ciclos + " fotogramas · vacas: " + Abd.score);
  if (Abd.score !== 1) MAL("ABDUCCIÓN: el rayo no sube las vacas");
  /* el foco te pilla SOLO si tienes el rayo encendido */
  Abd.setup(); Abd.run = true; Abd.focos = [{ x: Abd.x, dir: 1, v: 0 }]; Abd.rayo = false;
  const vidas0 = Abd.vidas; corre(Abd, 5);
  if (Abd.vidas !== vidas0) MAL("ABDUCCIÓN: te pillan con el rayo apagado");
  Abd.rayo = true; Abd.tick();
  console.log("     con el rayo encendido bajo un foco: vidas " + vidas0 + " → " + Abd.vidas);
  if (Abd.vidas !== vidas0 - 1) MAL("ABDUCCIÓN: el foco no te descubre");
  Abd.vidas = 1; Abd.rayo = true; Abd.focos = [{ x: Abd.x, dir: 1, v: 0 }]; Abd.tick();
  if (Abd.run) MAL("ABDUCCIÓN: no se acaba al quedarte sin vidas");
}

/* ================= 🧲 IMÁN ================= */
{
  Ima.open(); Ima.start();
  Ima.pinchos = []; Ima.estrellas = [];
  const y0 = Ima.y; corre(Ima, 20);
  if (!(Ima.y > y0)) MAL("IMÁN: sin apretar no cae");
  /* apretando, vuela hacia el puntero */
  Ima.setup(); Ima.run = true; Ima.pinchos = []; Ima.estrellas = [];
  Ima.iman = true; Ima.dedo = { x: Ima.x, y: 20 };
  corre(Ima, 25);
  console.log("  🧲 IMÁN: apretando hacia arriba sube a y=" + Math.round(Ima.y) + " (empezó en " + Math.round(Ima.H / 2) + ")");
  if (!(Ima.y < Ima.H / 2)) MAL("IMÁN: el imán no atrae la bola");
  /* las estrellas suman y los pinchos matan */
  Ima.setup(); Ima.run = true; Ima.iman = false; Ima.dedo = null;
  Ima.estrellas = [{ x: Ima.x, y: Ima.y }]; Ima.pinchos = [];
  Ima.tick();
  if (Ima.score !== 1) MAL("IMÁN: las estrellas no suman");
  Ima.setup(); Ima.run = true; Ima.pinchos = [{ x: Ima.x, y: Ima.y, r: 12, gir: 0 }]; Ima.estrellas = [];
  Ima.tick();
  console.log("     tras tocar un pincho, ¿sigue? " + Ima.run);
  if (Ima.run) MAL("IMÁN: los pinchos no matan");
}

/* ================= 🐉 CUEVA ================= */
{
  Cue.open(); Cue.start();
  const hueco0 = Cue.hueco;
  Cue.sube = true;
  for (let i = 0; i < 120 && Cue.run; i++) { Cue.y = Cue.H / 2; Cue.tick(); }   /* centrado, sin chocar */
  console.log("  🐉 CUEVA: el túnel se cierra de " + Math.round(hueco0) + " a " + Math.round(Cue.hueco) + " · llevas " + Cue.score + " pts");
  if (!(Cue.hueco < hueco0)) MAL("CUEVA: el túnel no se estrecha");
  if (Cue.score < 1) MAL("CUEVA: no puntúa mientras avanzas");
  /* chocar con la pared acaba la partida */
  Cue.setup(); Cue.run = true; Cue.y = 2;
  corre(Cue, 5);
  console.log("     pegado al techo, ¿sigue? " + Cue.run);
  if (Cue.run) MAL("CUEVA: se puede atravesar la pared");
}

/* ================= 🎯 FRANCOTIRADOR ================= */
{
  Fra.open(); Fra.start();
  /* disparar a donde ESTÁ un blanco quieto: debe acertar */
  Fra.setup(); Fra.run = true;
  Fra.blancos = [{ x: 150, y: 150, v: 0, r: 15, bal: 0 }];
  Fra.mira = { x: 150, y: 150 }; Fra.dispara();
  corre(Fra, 20);
  console.log("  🎯 FRANCOTIRADOR: al blanco quieto → " + Fra.score + " punto(s), " + Fra.fallos + " fallo(s)");
  if (Fra.score !== 1) MAL("FRANCOTIRADOR: no acierta a un blanco quieto");
  /* la bala TARDA: si el blanco se mueve rápido y disparas a donde está, fallas */
  Fra.setup(); Fra.run = true;
  Fra.blancos = [{ x: 100, y: 150, v: 6, r: 13, bal: 0 }];
  Fra.mira = { x: 100, y: 150 }; Fra.dispara();
  corre(Fra, 20);
  console.log("     a un blanco veloz, apuntando donde ESTABA: " + Fra.score + " punto(s) (hay que adelantarse)");
  if (Fra.score !== 0) MAL("FRANCOTIRADOR: la bala llega instantánea, no hay que adelantarse");
  /* cinco fallos y se acaba */
  Fra.setup(); Fra.run = true; Fra.score = 6; Fra.fallos = 4;
  Fra.blancos = []; Fra.mira = { x: 5, y: 5 }; Fra.dispara();
  corre(Fra, 30);
  if (Fra.run) MAL("FRANCOTIRADOR: no se acaba a los 5 fallos");
  if (guardado["edtu_fra_best"] !== "6") MAL("FRANCOTIRADOR: no guarda el récord");
}

/* ================= 🪂 ATERRIZAJE ================= */
{
  Atz.open(); Atz.start();
  /* clavar el centro: 10 puntos y ronda nueva */
  Atz.setup(); Atz.run = true; Atz.dv = 0;
  Atz.x = Atz.diana; Atz.y = Atz.suelo();
  Atz.tick();
  console.log("  🪂 ATERRIZAJE: en el centro → " + Atz.score + " puntos (" + (Atz.posado ? Atz.posado.txt : "?") + ")");
  if (Atz.score !== 10) MAL("ATERRIZAJE: el centro no da 10");
  const ronda0 = Atz.ronda;
  for (let i = 0; i < 70 && Atz.run; i++) Atz.tick();
  console.log("     pasa a la ronda " + Atz.ronda + " y el viento cambia");
  if (Atz.ronda !== ronda0 + 1) MAL("ATERRIZAJE: no pasa de ronda al acertar");
  /* caer fuera acaba la partida */
  Atz.setup(); Atz.run = true; Atz.dv = 0; Atz.score = 21;
  Atz.x = Atz.diana + 120; Atz.y = Atz.suelo();
  Atz.tick();
  for (let i = 0; i < 70 && Atz.run; i++) Atz.tick();
  console.log("     cayendo lejos de la diana, ¿sigue? " + Atz.run);
  if (Atz.run) MAL("ATERRIZAJE: fallar la diana no acaba la partida");
  if (guardado["edtu_atz_best"] !== "21") MAL("ATERRIZAJE: no guarda el récord");
}

/* ================= la música de los seis ================= */
for (const [nom, J] of [["TORMENTA", Tor], ["ABDUCCIÓN", Abd], ["IMÁN", Ima], ["CUEVA", Cue], ["FRANCOTIRADOR", Fra], ["ATERRIZAJE", Atz]]) {
  J.setup(); J.musOn();
  if (!J.mus) MAL(nom + ": la música no arranca");
  J.musOff();
  if (J.mus) MAL(nom + ": la música no se calla");
}
console.log("  🎵 los seis: la música arranca y se calla · relojes que quedan corriendo: " + intervalos);
if (intervalos !== 0) MAL("quedan " + intervalos + " reloj(es) de música corriendo");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ los SEIS juegos nuevos funcionan");
