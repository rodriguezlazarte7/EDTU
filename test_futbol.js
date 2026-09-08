/* 🧪 prueba de THE FOOTBALL RUSH: el tiro que se carga y se apunta, el aro del compañero al
   que vas a pasar, las paradas y los palos, el confeti del gol y la tabla de estadísticas.
   Se ejecuta con:  node test_futbol.js                                                        */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

const nada = () => {};
const pintado = { fill: 0, stroke: 0, fillRect: 0, fillText: 0, ellipse: 0 };
const ctx = new Proxy({}, { get: (o, k) => {
  if (k === "createLinearGradient" || k === "createRadialGradient") return () => ({ addColorStop: nada });
  if (k === "arc") return (x, y, r) => { if (!(r >= 0)) throw new Error("radio negativo"); };
  if (k === "measureText") return t => ({ width: String(t).length * 7 });   /* el de verdad devuelve un objeto */
  if (k in pintado) return () => { pintado[k]++; };
  return nada; }, set: () => true });

const elems = {};
const el = id => elems[id] = elems[id] || { id, textContent: "", innerHTML: "", width: 900, height: 600,
  style: {}, dataset: {},
  classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, toggle(c, v) { v ? this._s.add(c) : this._s.delete(c); }, contains(c) { return this._s.has(c); } },
  getContext: () => ctx, addEventListener: nada, getBoundingClientRect: () => ({ width: 900, height: 600 }),
  querySelector: () => ({ textContent: "" }), querySelectorAll: () => [], requestFullscreen: null };
global.$ = el;
const guardado = {};
global.localStorage = { getItem: k => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); } };
global.document = { getElementById: el, querySelectorAll: () => [], addEventListener: nada, fullscreenElement: null, exitFullscreen: () => Promise.resolve() };
global.navigator = { getGamepads: () => [] };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = nada;
global.setTimeout = (fn) => { return 0; };
global.window = {}; global.innerWidth = 900; global.innerHeight = 600;
global.SFX = { ensure: nada, beep: nada };
global.edtuPlayDay = nada;

/* el juego y sus constantes viven en el mismo <script> */
const consts = html.slice(html.indexOf("const PW=68, PL=105"), html.indexOf("const Foot = {"));
const ini = html.indexOf("const Foot = {"), fin = html.indexOf("\n// integra movimiento por toque", ini);
const Foot = new Function("$", "localStorage", "document", "navigator", "performance",
  "requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "SFX", "edtuPlayDay",
  consts + html.slice(ini, fin) + "\nreturn Foot;")($, localStorage, document, navigator, performance,
  requestAnimationFrame, cancelAnimationFrame, setTimeout, SFX, edtuPlayDay);

/* --- montamos un partido, sin tocar el DOM de verdad --- */
Foot.cv = el("footCanvas"); Foot.ctx = ctx;
Foot.mins = 2; Foot.mode = "1p";
Foot.start();
Foot.kickPause = 0;
const PWc = 68;                              /* el ancho del campo, igual que en el juego */

/* ---------- 1) EL TIRO SE CARGA ---------- */
const conBalon = t => { const o = Foot.players.find(p => p.team === t && p.role === "out");
  o.wx = Foot.ball.wx; o.wy = Foot.ball.wy; Foot.ball.owner = o; Foot.ball.cd = 0; Foot.active[t] = o; return o; };
conBalon(0);
Foot.carga = [0, 0];
/* mantengo apretado medio segundo (30 fotogramas). Hay que sujetarle el balón en cada vuelta:
   si no, el rival se lo quita a los pocos fotogramas (que es lo suyo) y la medición se va al garete */
Foot.readHuman = () => ({ dx: 0, dy: 0, sprint: false, pass: false, shoot: false, tackle: false, sw: false, cargando: true });
for (let i = 0; i < 30; i++) { conBalon(0); Foot.update(1); }
const cargaMedia = Foot.carga[0];
for (let i = 0; i < 60; i++) { conBalon(0); Foot.update(1); }
const cargaLlena = Foot.carga[0];
console.log("  la barra de fuerza sube al mantener: medio segundo → " + cargaMedia.toFixed(2) + " · un segundo y medio → " + cargaLlena.toFixed(2));
if (!(cargaMedia > 0.05 && cargaMedia < 0.95)) MAL("la barra no va cargando poco a poco");
if (cargaLlena !== 1) MAL("la barra no llega al máximo (o se pasa)");

/* al SOLTAR sale el disparo, y con más carga sale más fuerte */
function tira(carga, dx) {
  Foot.resetPositions(); Foot.kickPause = 0;
  const o = conBalon(0);
  Foot.carga = [carga, 0];
  Foot.readHuman = () => ({ dx: dx || 0, dy: 0, sprint: false, pass: false, shoot: false, tackle: false, sw: false, cargando: false });
  Foot.update(1);
  return { vx: Foot.ball.vx, vy: Foot.ball.vy, vz: Foot.ball.vz, o };
}
const flojo = tira(0.35), fuerte = tira(1.0);
const vel = b => Math.hypot(b.vx, b.vy);
console.log("  tiro flojito: velocidad " + vel(flojo).toFixed(2) + " y altura " + flojo.vz.toFixed(2) +
            " · tiro a tope: velocidad " + vel(fuerte).toFixed(2) + " y altura " + fuerte.vz.toFixed(2));
if (!(vel(fuerte) > vel(flojo) * 1.2)) MAL("cargar el tiro no lo hace más fuerte");
if (!(fuerte.vz > flojo.vz)) MAL("el tiro cargado no sale más alto");
if (Foot.carga[0] !== 0) MAL("la barra no se vacía al disparar");

/* ---------- 2) APUNTAS TÚ ---------- */
const izq = [], der = [];
for (let i = 0; i < 12; i++) { izq.push(tira(1, -1).vx); der.push(tira(1, 1).vx); }
const media = a => a.reduce((x, y) => x + y, 0) / a.length;
console.log("  apuntando a la izquierda el balón sale con vx " + media(izq).toFixed(2) + " · a la derecha " + media(der).toFixed(2));
if (!(media(izq) < 0 && media(der) > 0)) MAL("las teclas no colocan el tiro a un lado o a otro");
/* y sin tocar nada va bastante centrado */
const centro = []; for (let i = 0; i < 12; i++) centro.push(Math.abs(tira(1, 0).vx));
console.log("  sin apuntar, el tiro va al centro (desvío medio " + media(centro).toFixed(2) + ")");
if (!(media(centro) < Math.abs(media(der)) / 2)) MAL("sin apuntar no va al centro");

/* ---------- 3) SE CUENTAN LOS TIROS ---------- */
const antesTiros = Foot.stats.tiros[0];
tira(1, 0);
console.log("  cada disparo se apunta en las estadísticas: " + antesTiros + " → " + Foot.stats.tiros[0] + " · a puerta: " + Foot.stats.puerta[0]);
if (Foot.stats.tiros[0] !== antesTiros + 1) MAL("no cuenta los tiros");
if (!Foot.stats.puerta[0]) MAL("no cuenta los tiros a puerta");

/* ---------- 3b) ¿SE PUEDE MARCAR? ----------
   De poco sirve un tiro bonito si nunca entra: se tira desde el borde del área, con el arquero
   apartado, y se deja rodar el balón hasta la línea a ver por dónde cruza */
function tiraYMira(carga, dx) {
  Foot.resetPositions(); Foot.kickPause = 0;
  const gk = Foot.players.find(p => p.team === 1 && p.role === "gk"); gk.wx = 200;   /* fuera del medio */
  const o = Foot.players.find(p => p.team === 0 && p.role === "out");
  o.wx = PWc / 2; o.wy = 88;                                     /* borde del área rival */
  Foot.ball.wx = o.wx; Foot.ball.wy = o.wy; Foot.ball.wz = 0; Foot.ball.owner = o; Foot.ball.cd = 0;
  Foot.active[0] = o;
  Foot.carga = [carga, 0];
  Foot.readHuman = () => ({ dx: dx || 0, dy: 0, sprint: false, pass: false, shoot: false, tackle: false, sw: false, cargando: false });
  Foot.update(1);
  /* que ruede solo hasta cruzar la línea */
  for (let i = 0; i < 300 && Foot.ball.wy < 105; i++) { Foot.updateBall(1); }
  return { x: Foot.ball.wx - PWc / 2, z: Foot.ball.wz, y: Foot.ball.wy };
}
let dentro = 0, alto = 0;
for (let i = 0; i < 20; i++) { const r = tiraYMira(1, 0); if (Math.abs(r.x) < 13 / 2 && r.z < 2.6) dentro++; else if (r.z >= 2.6) alto++; }
console.log("  20 tiros cargados a puerta desde el área (sin arquero): " + dentro + " entran · " + alto + " se van por arriba");
if (dentro < 10) MAL("con el arco vacío y tiro cargado casi no entra: es injugable");

/* ---------- 4) A QUIÉN LE PASO ---------- */
Foot.resetPositions(); Foot.kickPause = 0;
const o = conBalon(0);
const destino = Foot.aQuienPaso(0);
console.log("  el compañero señalado para el pase: el número " + (destino ? destino.num : "ninguno") + " (de tu equipo: " + (destino && destino.team === 0) + ")");
if (!destino) MAL("no señala a ningún compañero");
if (destino && destino.team !== 0) MAL("¡señala a un rival!");
if (destino === o) MAL("se señala a sí mismo");
/* y es EXACTAMENTE al que le llega el pase */
const antes = { x: destino.wx, y: destino.wy };
Foot.doPass(0);
const dirPase = Math.atan2(Foot.ball.vy, Foot.ball.vx);
const dirBueno = Math.atan2(antes.y - o.wy, antes.x - o.wx);
console.log("  y el pase sale justo hacia él (diferencia de " + Math.round(Math.abs(dirPase - dirBueno) * 180 / Math.PI) + "°)");
if (Math.abs(dirPase - dirBueno) > 0.05) MAL("el aro señala a uno y el pase va a otro");

/* ---------- 5) PARADAS Y PALOS ---------- */
Foot.resetPositions(); Foot.kickPause = 0;
const arquero = Foot.players.find(p => p.team === 1 && p.role === "gk");
Foot.ball.owner = arquero; Foot.ball.tiro = 0; Foot.ball.fuerza = 0.9;
const paradasAntes = Foot.stats.paradas[1];
Foot.moveGK(arquero, 1);
console.log("  el arquero atrapa un tiro tuyo → paradas del rival: " + paradasAntes + " → " + Foot.stats.paradas[1] + " · rótulo: «" + Foot.grito + "»");
if (Foot.stats.paradas[1] !== paradasAntes + 1) MAL("no cuenta las paradas");
if (!/PARAD/.test(Foot.grito)) MAL("no canta el paradón");
/* el palo: el balón cruza la línea pegado al poste */
Foot.palo = 0; Foot.grito = "";
Foot.ball = { wx: PWc / 2 + 7.4, wy: 0.3, wz: 0.5, vx: 0, vy: -1, vz: 0, owner: null, cd: 0, tiro: 0, fuerza: 1 };
const palosAntes = Foot.stats.palos[0];
Foot.checkGoal();
console.log("  balón pegadito al poste (a " + (Foot.ball.wx - PWc / 2).toFixed(1) + " del centro) → «" + Foot.grito + "» · palos: " + palosAntes + " → " + Foot.stats.palos[0]);
if (!/PALO/.test(Foot.grito)) MAL("no avisa del palo");
/* y un balón que entra es GOL, no palo */
Foot.grito = ""; Foot.palo = 0;
const golesAntes = Foot.score[1];
Foot.ball = { wx: PWc / 2, wy: -0.1, wz: 0.5, vx: 0, vy: -1, vz: 0, owner: null, cd: 0, tiro: 0 };
Foot.checkGoal();
console.log("  balón por el centro del arco → goles del rival: " + golesAntes + " → " + Foot.score[1] + " · confeti: " + Foot.confeti.length + " papelitos");
if (Foot.score[1] !== golesAntes + 1) MAL("un balón dentro del arco no es gol");
if (!Foot.confeti.length) MAL("el gol no tira confeti");

/* el confeti cae y desaparece solo */
for (let i = 0; i < 200; i++) Foot.update(1);
console.log("  unos segundos después: " + Foot.confeti.length + " papelitos (se limpian solos)");
if (Foot.confeti.length) MAL("el confeti no se limpia: se acumularía partido tras partido");

/* ---------- 6) LA TABLA DEL FINAL ---------- */
Foot.stats.pos = [70, 30];
const tabla = Foot.tablaStats();
console.log("  la tabla del final incluye: " + ["POSESIÓN", "TIROS", "A PUERTA", "PARADAS", "PASES"].filter(x => tabla.includes(x)).join(" · "));
if (!/70%/.test(tabla)) MAL("la posesión no sale bien (debería ser 70%)");
if (!/30%/.test(tabla)) MAL("la posesión del rival no cuadra");
["POSESIÓN", "TIROS", "A PUERTA", "PARADAS", "PASES"].forEach(x => { if (!tabla.includes(x)) MAL("falta " + x + " en la tabla"); });

/* ---------- 7) el partido entero, sin reventar ---------- */
Foot.start(); Foot.kickPause = 0;
Foot.readHuman = () => ({ dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1, sprint: Math.random() < 0.3,
  pass: Math.random() < 0.02, shoot: false, tackle: Math.random() < 0.05, sw: Math.random() < 0.01,
  cargando: Math.random() < 0.25 });
let fallo = null;
for (let i = 0; i < 4000 && Foot.running; i++) {
  try { Foot.update(1); Foot.draw(); }
  catch (e) { fallo = i + ": " + e.message + "\n      " + (e.stack || "").split("\n")[1]; break; }
}
console.log("  partido completo simulado (" + (fallo ? "💥 " + fallo : "sin un solo error") + ") · marcador " + Foot.score.join("-") +
            " · tiros " + Foot.stats.tiros.join("/") + " · posesión " + Foot.stats.pos.map(x => Math.round(x)).join("/"));
if (fallo) MAL("el partido revienta: " + fallo);
if (!(Foot.stats.tiros[0] > 0)) MAL("en todo el partido no salió ni un tiro");
if (Foot.confeti.length > 400) MAL("el confeti se acumula sin control");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ FÚTBOL: el tiro se carga y se apunta, el pase se ve venir, hay paradas, palos, confeti y tabla de estadísticas");
