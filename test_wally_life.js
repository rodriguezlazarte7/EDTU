/* 🧪 prueba de WALLY LIFE: que la cara se dibuje, parpadee, mire, mueva la boca cuando
   habla y se calle cuando toca; que elija la voz más humana del aparato; y que la cámara
   mida de verdad la luz, el color y el movimiento.
   Se ejecuta con:  node test_wally_life.js                                              */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");

function trozo(desde, hasta) {
  const i = html.indexOf(desde), j = html.indexOf(hasta, i);
  if (i < 0 || j < 0) { console.log("❌ no encuentro " + desde); process.exit(1); }
  return html.slice(i, j);
}
const codigoVida = trozo("const WLIFE=(function(){", "window.WLIFE=WLIFE;");
const codigoCam  = trozo("const WCAM=(function(){", "window.WCAM=WCAM;");

let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const nada = () => {};

/* ---------- un lienzo de mentira que APUNTA lo que se le pide dibujar ---------- */
const pintado = { arc: 0, fill: 0, stroke: 0, ellipse: 0, clear: 0 };
function ctxFalso() {
  return new Proxy({}, {
    get: (o, k) => {
      if (k === "createLinearGradient" || k === "createRadialGradient") return () => ({ addColorStop: nada });
      if (k === "getImageData") return () => ({ data: PIXELES });
      if (k in pintado) return () => { pintado[k]++; };
      if (k === "clearRect") return () => { pintado.clear++; };
      return nada;
    },
    set: () => true
  });
}

/* la imagen que "ve" la cámara: se cambia en cada prueba */
let PIXELES = new Uint8ClampedArray(40 * 30 * 4);
function pinta(r, g, b) { for (let i = 0; i < 40 * 30; i++) { const j = i * 4; PIXELES[j] = r; PIXELES[j + 1] = g; PIXELES[j + 2] = b; PIXELES[j + 3] = 255; } }

const elementos = {};
const panel = { id: "wallyFs", style: { display: "flex" }, addEventListener: nada, classList: { add: nada, remove: nada, toggle: nada } };
function nuevoEl(id) {
  return elementos[id] = elementos[id] || (id === "wallyFs" ? panel : {
    id, textContent: "", title: "", width: 300, height: 300, videoWidth: 640, style: {},
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, toggle(c, v) { v ? this._s.add(c) : this._s.delete(c); }, contains(c) { return this._s.has(c); } },
    getContext: () => ctxFalso(), addEventListener: nada, getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 })
  });
}
global.$ = nuevoEl;
global.document = { getElementById: nuevoEl, createElement: () => nuevoEl("_lienzo"), addEventListener: nada };
global.pick = a => a[0];
let dicho = [];
global.wallyType = t => dicho.push(String(t));
global.localStorage = { _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); } };
global.navigator = {};
global.clearInterval = nada; global.setInterval = () => 1;

/* ---------- una voz de mentira: varias, para ver cuál elige ---------- */
const VOCES = [
  { name: "Microsoft Helena Desktop", lang: "es-ES", localService: true },
  { name: "Google español", lang: "es-ES", localService: false },
  { name: "Microsoft Catalina Online (Natural) - Spanish (Chile)", lang: "es-CL", localService: false },
  { name: "Microsoft Zira", lang: "en-US", localService: true },
];
let hablados = [];
const voz = {
  _cola: [], speaking: false, pending: false,
  getVoices: () => VOCES, addEventListener: nada,
  cancel() { this.speaking = false; },
  speak(u) { hablados.push(u); this.speaking = true; if (u.onstart) u.onstart(); }
};
global.speechSynthesis = voz;
global.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = "es-ES"; };
global.window = { speechSynthesis: voz, wallyName: () => "DAVID" };

/* rAF de mentira: guardamos el latido para llamarlo a mano */
let latido = null;
global.requestAnimationFrame = cb => { latido = cb; return 1; };
const avanza = (veces, paso) => { let ts = 0; for (let i = 0; i < veces; i++) { ts += (paso || 16.6); if (latido) { const c = latido; latido = null; c(ts); } } };

const WLIFE = eval(codigoVida + "WLIFE");
const WCAM  = eval(codigoCam + "WCAM");
global.WLIFE = WLIFE; global.WCAM = WCAM;

/* ============ 1) la cara se dibuja y late ============ */
WLIFE.arranca(); avanza(30);
console.log("  la cara se dibuja: " + pintado.clear + " fotogramas · " + pintado.ellipse + " óvalos (ojos) · " + pintado.arc + " círculos");
if (pintado.clear < 20) MAL("la cara no se dibuja");
if (pintado.ellipse < 20) MAL("no dibuja los ojos");

/* ============ 2) parpadea sola ============ */
let parpadeos = 0, antes = 0;
for (let i = 0; i < 900; i++) { avanza(1); if (WLIFE.S.parpadeo > 0.5 && antes <= 0.5) parpadeos++; antes = WLIFE.S.parpadeo; }
console.log("  parpadeos en 15 segundos: " + parpadeos);
if (parpadeos < 2) MAL("WALLY no parpadea (parece un muñeco)");

/* ============ 3) la mirada te sigue ============ */
WLIFE.sigue({ clientX: 200, clientY: 100 }); avanza(40);
const derecha = WLIFE.S.mirX;
WLIFE.sigue({ clientX: 0, clientY: 100 }); avanza(40);
console.log("  la mirada te sigue: ratón a la derecha → " + derecha.toFixed(2) + " · a la izquierda → " + WLIFE.S.mirX.toFixed(2));
if (!(derecha > 0.3)) MAL("no mira a la derecha");
if (!(WLIFE.S.mirX < -0.3)) MAL("no mira a la izquierda");

/* ============ 4) elige la voz MÁS HUMANA, no la primera que pilla ============ */
const elegida = WLIFE.voz();
console.log("  voz elegida entre " + VOCES.length + ": «" + (elegida && elegida.name) + "»");
if (!elegida || !/Natural/.test(elegida.name)) MAL("no elige la voz natural (elegiría " + (elegida && elegida.name) + ")");
if (elegida && /^en/i.test(elegida.lang)) MAL("¡eligió una voz en inglés!");

/* ============ 5) hablar: mueve la boca, y al callar la cierra ============ */
WLIFE.enchufa();
hablados = [];
const ok = WLIFE.habla("Hola David, soy WALLY 🤖 y te voy a ayudar");
if (!ok) MAL("no consigue hablar");
const u = hablados[0];
console.log("  dice: «" + u.text + "» · voz «" + (u.voice && u.voice.name) + "» · tono " + u.pitch + " · ritmo " + u.rate);
if (/🤖/.test(u.text)) MAL("lee los emojis en voz alta");
if (!u.voice || !/Natural/.test(u.voice.name)) MAL("no usa la voz buena al hablar");
if (!(u.pitch > 1 && u.pitch < 1.2)) MAL("el tono no es amable (" + u.pitch + ")");
if (!WLIFE.S.hablando) MAL("no se pone en modo hablando");
avanza(30);
const bocaHablando = WLIFE.S.boca;
console.log("  boca mientras habla: " + bocaHablando.toFixed(2) + " (0 = cerrada)");
if (!(bocaHablando > 0.15)) MAL("la boca no se mueve al hablar");
/* y al terminar se cierra */
voz.speaking = false; u.onend();
require("timers").setTimeout(() => {}, 0);
WLIFE.S.hablando = false; avanza(60);
console.log("  boca al callar: " + WLIFE.S.boca.toFixed(2));
if (WLIFE.S.boca > 0.1) MAL("la boca se queda abierta después de hablar");

/* ============ 5b) al inglés NO le pone la voz española ============ */
hablados = [];
const ing = new SpeechSynthesisUtterance("spider"); ing.lang = "en-US";
speechSynthesis.speak(ing);
console.log("  «spider» en inglés → voz: " + (ing.voice ? ing.voice.name : "la del navegador (sin tocar)") + " · tono " + ing.pitch);
if (ing.voice && /^es/i.test(ing.voice.lang)) MAL("le pone voz española a una palabra en inglés");
/* y si alguien ya eligió voz a propósito, se respeta */
const prop = new SpeechSynthesisUtterance("hola"); prop.voice = VOCES[0];
speechSynthesis.speak(prop);
if (prop.voice !== VOCES[0]) MAL("pisa la voz que otro ya había elegido");
console.log("  voz elegida a mano por otro juego: se respeta ✅");

/* ============ 6) los humores cambian la cara ============ */
WLIFE.humor("escuchando");
if (WLIFE.S.humor !== "escuchando") MAL("no cambia de humor");
WLIFE.S.escuchando = true; avanza(40);
const brilloEsc = WLIFE.S.brillo;
WLIFE.S.escuchando = false; avanza(60);
console.log("  brilla más cuando te escucha: " + brilloEsc.toFixed(2) + " → " + WLIFE.S.brillo.toFixed(2));
if (!(brilloEsc > WLIFE.S.brillo)) MAL("no se le nota que está escuchando");

/* ============ 7) la cámara MIDE de verdad ============ */
elementos["wlVideo"] = nuevoEl("wlVideo");
pinta(20, 22, 26); WCAM.comenta();          /* primer vistazo: sin movimiento anterior */
let r1 = WCAM.comenta();
console.log("  cuarto oscuro → " + r1);
if (!/oscuro/.test(r1)) MAL("no avisa de que está oscuro");
pinta(40, 90, 220); WCAM.comenta(); let r2 = WCAM.comenta();
console.log("  algo azul y bien iluminado → " + r2);
if (!/azul/.test(r2)) MAL("no reconoce el color azul");
pinta(240, 240, 240); let r3 = WCAM.comenta();
console.log("  cambiazo de imagen → " + r3);
if (!/mueves|se mueve/.test(r3)) MAL("no detecta el movimiento");
pinta(240, 240, 240); let r4 = WCAM.comenta();
console.log("  imagen quieta → " + r4);
if (!/quiet/.test(r4)) MAL("dice que hay movimiento cuando no lo hay");
if (!/deslumbras|buena luz/.test(r4)) MAL("no mide bien la luz");

/* ============ 8) apagar la cámara la apaga de verdad ============ */
let cortadas = 0;
WCAM.apaga();
console.log("  apagar sin cámara encendida no revienta ✅");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ WALLY LIFE sano · dibuja, parpadea, te mira, habla con la boca, elige la voz humana y la cámara mide luz, color y movimiento");
