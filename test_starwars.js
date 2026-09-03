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
  "\n;globalThis.__G=G; globalThis.__NAVES=NAVES; globalThis.__CLASES=CLASES; globalThis.__MOD=MOD; globalThis.__jefeVivo=jefeVivo; globalThis.__hiperEmpieza=hiperEmpieza; globalThis.__nodrizaVive=nodrizaVive; globalThis.__MODOS=MODOS; globalThis.__nodrizaGolpe=nodrizaGolpe; globalThis.__hiper=()=>hiper;\n";

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
  /* un parámetro de sonido de mentira (frecuencia, volumen, filtro...) */
  const par = () => ({
    setValueAtTime: nada, linearRampToValueAtTime: nada, exponentialRampToValueAtTime: nada,
    cancelScheduledValues: nada, setTargetAtTime: nada, value: 0
  });
  const nodo = () => ({
    connect: () => nodo(), disconnect: nada, start: nada, stop: nada, type: "", loop: false, buffer: null,
    frequency: par(), gain: par(), pan: par(), Q: par(), detune: par(), playbackRate: par()
  });
  return {
    currentTime: 0, state: "running", resume: nada, destination: nodo(), sampleRate: 44100,
    createOscillator: nodo, createGain: nodo, createBiquadFilter: nodo, createStereoPanner: nodo,
    createBufferSource: nodo, createDynamicsCompressor: nodo, createConvolver: nodo,
    createBuffer: (canales, n) => ({ length: n, numberOfChannels: canales, getChannelData: () => new Float32Array(n) })
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
for (const nombre of ["nuevaPartida", "update", "render", "disparar", "lanzaTorpedo", "nuevoEnemigo", "cambiaOrden", "objetivoDe",
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
  let maxBalas = 0, maxChispas = 0, maxCaras = 0, roto = false;
  for (let i = 0; i < SEG / DT; i++) {
    /* se pilota "al azar" pero siempre igual, para que la prueba sea repetible */
    G.yaw = Math.sin(i * 0.013) * 2.4; G.pitch = Math.cos(i * 0.021) * 2.0; G.roll = Math.sin(i * 0.007);
    G.gasObj = (i % 900 < 450) ? 1 : 0.15;
    G.disparando = (i % 7) < 4;
    if (i % 180 === 0) { try { ctxVM.lanzaTorpedo(); } catch (e) { F(bando + ": los torpedos petan: " + e.message); } }
    if (i % 500 === 0) { try { ctxVM.cambiaOrden(); } catch (e) { F(bando + ": las órdenes al escuadrón petan: " + e.message); } }
    if (i % 240 === 0) G.shield = G.vidaMax;
    try { ctxVM.update(DT); } catch (e) { F(bando + ": update peta en el segundo " + (i * DT).toFixed(1) + ": " + e.message); console.log(e.stack); roto = true; break; }
    try { ctxVM.render(); } catch (e) { F(bando + ": render peta en el segundo " + (i * DT).toFixed(1) + ": " + e.message); console.log(e.stack); roto = true; break; }
    maxBalas = Math.max(maxBalas, G.balas.length); maxChispas = Math.max(maxChispas, G.chispas.length);
    if (ctxVM.costeFotograma) maxCaras = Math.max(maxCaras, ctxVM.costeFotograma().caras);
    if (i % 600 === 0) revisa(bando + " seg " + (i * DT).toFixed(0));
  }
  if (roto) continue;
  revisa(bando + " final");
  if (maxBalas > 1500) F(bando + ": demasiados láseres a la vez (" + maxBalas + ")");
  if (maxChispas > 8000) F(bando + ": demasiadas partículas a la vez (" + maxChispas + ")");
  if (maxCaras > 4000) F(bando + ": demasiadas caras que pintar en un fotograma (" + maxCaras + ")");
  console.log("  " + NAVES[bando].nom.padEnd(16) + " oleada " + G.wave + " · " + G.kills + " derribos · " +
    maxBalas + " láseres, " + maxChispas + " partículas y " + maxCaras + " caras como mucho");
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

/* --- el salto del hiperespacio --- */
{
  G.bando = "x"; ctxVM.nuevaPartida(); G.run = true;
  const antesPos = { x: G.pos.x, y: G.pos.y, z: G.pos.z };
  ctxVM.__hiperEmpieza();
  if (!(ctxVM.__hiper() > 0)) F("el salto del hiperespacio no arranca");
  let tocado = false;
  for (let i = 0; i < 3 / DT; i++) {                          /* 3 segundos: dura 1,7 */
    G.shield = G.vidaMax;
    ctxVM.update(DT); ctxVM.render();
    if (ctxVM.__hiper() > 0) { ctxVM.golpe(50); if (G.shield < G.vidaMax) tocado = true; }
  }
  const recorrido = Math.hypot(G.pos.x - antesPos.x, G.pos.y - antesPos.y, G.pos.z - antesPos.z);
  if (ctxVM.__hiper() !== 0) F("el salto del hiperespacio no se termina nunca");
  if (tocado) F("te pueden dar mientras sales del hiperespacio, y no deberían");
  if (recorrido < 500) F("durante el salto casi no te mueves (" + Math.round(recorrido) + ")");
  console.log("  🌠 hiperespacio: dura " + (1.7) + " s, recorres " + Math.round(recorrido) +
    " unidades y eres intocable mientras sales");
}

/* --- la nave jefe: rayo, fases y escoltas --- */
{
  G.bando = "x"; G.dif = "normal"; ctxVM.nuevaPartida();
  G.run = true; G.wave = 5;
  try { ctxVM.nuevoEnemigo("jefe"); } catch (e) { F("no se puede crear la nave jefe: " + e.message); }
  const jefe = ctxVM.__jefeVivo();
  if (!jefe) F("la nave jefe no aparece");
  else {
    const fases = new Set();
    let furia = false, dañoRayo = 0;
    for (let i = 0; i < 45 / DT; i++) {                       /* 45 segundos peleando con él */
      G.shield = G.vidaMax;                                   /* que no muera el jugador */
      const antes = G.shield;
      /* colocarse justo delante de su morro para comerse el rayo */
      if (i % 120 < 60) {
        const d = jefe.b.f;
        G.pos = { x: jefe.p.x + d.x * 400, y: jefe.p.y + d.y * 400, z: jefe.p.z + d.z * 400 };
      }
      try { ctxVM.update(DT); ctxVM.render(); }
      catch (e) { F("la nave jefe peta en el segundo " + (i * DT).toFixed(1) + ": " + e.message); console.log(e.stack); break; }
      if (jefe.rayoFase) fases.add(jefe.rayoFase);
      if (G.shield < antes) dañoRayo++;
      if (i === Math.round(20 / DT)) { jefe.vida = jefe.vidaMax * 0.4; }   /* forzar la segunda fase */
      if (jefe.furia) furia = true;
    }
    for (const q of ["espera", "carga", "dispara"])
      if (!fases.has(q)) F("la nave jefe nunca llegó a la fase '" + q + "' del rayo");
    if (!furia) F("la nave jefe nunca se enfureció al bajar de la mitad de vida");
    if (!dañoRayo) F("el rayo de la nave jefe no hace daño nunca");
    console.log("  ☠️ nave jefe: fases del rayo " + [...fases].join(" → ") +
      " · se enfurece: " + (furia ? "sí" : "no") + " · te alcanza el rayo: " + dañoRayo + " veces");
  }
}

/* --- la NODRIZA: escudo, generadores y hangares --- */
{
  G.bando = "x"; G.dif = "normal"; ctxVM.nuevaPartida(); G.run = true; G.wave = 10;
  try { ctxVM.nuevoEnemigo("nodriza"); } catch (e) { F("no se puede crear la nodriza: " + e.message); }
  const nod = ctxVM.__nodrizaVive();
  if (!nod) F("la nodriza no aparece");
  else {
    ctxVM.update(DT);                                        /* un fotograma para que se prepare */
    if (!nod.gens || nod.gens.length !== 4) F("la nodriza no tiene sus 4 generadores");
    const vidaAntes = nod.vida;

    /* 1) con el escudo puesto, dispararle al casco NO le hace nada */
    const paro = ctxVM.__nodrizaGolpe(nod, nod.p, 500);
    if (!paro) F("el escudo de la nodriza no para los disparos");
    if (nod.vida !== vidaAntes) F("la nodriza pierde vida con el escudo puesto");

    /* 2) suelta cazas por los hangares */
    const antesEnem = G.enem.length;
    for (let i = 0; i < 12 / DT; i++) { ctxVM.update(DT); ctxVM.render(); }
    if (G.enem.length <= antesEnem) F("la nodriza no suelta cazas por sus hangares");
    const soltados = G.enem.length - antesEnem;

    /* 3) reventar los 4 generadores le quita el escudo */
    for (const g of nod.gens) ctxVM.__nodrizaGolpe(nod, g.p, 9999);
    ctxVM.update(DT);
    if (nod.escudo) F("la nodriza sigue con escudo tras reventar los 4 generadores");

    /* 4) y ahora sí se le puede hacer daño */
    const paro2 = ctxVM.__nodrizaGolpe(nod, nod.p, 300);
    if (paro2) F("sin generadores, la nodriza sigue parando los disparos");

    console.log("  🛰️ nodriza: 4 generadores · escudo aguanta con ellos puestos · soltó " + soltados +
      " cazas en 12 s · sin generadores se le puede dar");
  }
  for (let i = 0; i < 3 / DT; i++) { try { ctxVM.update(DT); ctxVM.render(); } catch (e) { F("la nodriza peta: " + e.message); break; } }
}

/* --- modo SUPERVIVENCIA --- */
{
  G.bando = "x"; G.dif = "normal"; G.modo = "super";
  ctxVM.nuevaPartida(); G.run = true;
  const foto = [];
  /* se simulan 5 minutos moviendo el reloj hacia atrás, para ver cómo aprieta */
  for (let minuto = 0; minuto < 5; minuto++) {
    G.inicio = Date.now() - minuto * 60000;
    G.enem.length = 0; G.spawn = 0;
    for (let i = 0; i < 20 / DT; i++) {                       /* 20 s de cada minuto */
      G.shield = G.vidaMax;
      try { ctxVM.update(DT); ctxVM.render(); }
      catch (e) { F("supervivencia peta en el minuto " + minuto + ": " + e.message); console.log(e.stack); break; }
    }
    foto.push({ min: minuto, enem: G.enem.length });
  }
  if (G.mision) F("en supervivencia no debería haber misiones y hay una: " + G.mision.tipo);
  if (!(foto[4].enem > foto[0].enem)) F("en supervivencia no vienen más enemigos con el tiempo (" +
    foto.map(x => x.min + "min:" + x.enem).join(" ") + ")");
  console.log("  ♾️ supervivencia: enemigos a la vez → " + foto.map(x => x.min + " min: " + x.enem).join(" · ") +
    " · sin misiones");
  /* y que la campaña sigue teniendo sus oleadas y sus misiones */
  G.modo = "campana"; ctxVM.nuevaPartida(); G.run = true;
  for (let i = 0; i < 4 / DT; i++) { ctxVM.update(DT); ctxVM.render(); }
  if (G.wave < 1) F("la campaña ya no arranca las oleadas");
  if (!G.mision) F("la campaña se quedó sin misiones");
  console.log("  ⚔️ campaña intacta: oleada " + G.wave + " y misión '" + (G.mision ? G.mision.tipo : "—") + "'");
}

/* --- que se pueda perder y volver a empezar --- */
try { G.shield = -1; ctxVM.update(DT); ctxVM.render(); } catch (e) { F("morir peta: " + e.message); }
try { ctxVM.nuevaPartida(); ctxVM.update(DT); } catch (e) { F("volver a empezar peta: " + e.message); }

console.log("");
if (fallos) { console.log("❌ " + fallos + " fallo(s)"); process.exit(1); }
console.log("✅ STAR WARS sano · 6 naves, 4 minutos de vuelo simulado y 12 oleadas de misiones sin un solo error");
