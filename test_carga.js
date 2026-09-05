/* 🧪 prueba del cargador futurista: que se abra al entrar a un mundo, que la barra avance
   sin mentir, que se cierre cuando el mundo termina de cargar, que no deje encerrado a nadie
   si el mundo nunca llega, y que no queden relojes corriendo.
   Se ejecuta con:  node test_carga.js                                                        */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

/* ---------- el motor, sacado del propio archivo ---------- */
const ini = html.indexOf("const Carga=(function(){");
const fin = html.indexOf('$("pickNag").onclick', ini);
if (ini < 0 || fin < 0) { console.log("❌ no encuentro el cargador"); process.exit(1); }
const codigo = html.slice(ini, fin);

/* ---------- un navegador de mentira con reloj propio ---------- */
let ahora = 0; const relojes = new Map(); let sig = 1;
global.setInterval = (fn, ms) => { relojes.set(sig, { fn, ms, prox: ahora + ms, rep: true }); return sig++; };
global.setTimeout  = (fn, ms) => { relojes.set(sig, { fn, ms, prox: ahora + ms, rep: false }); return sig++; };
global.clearInterval = id => relojes.delete(id);
global.clearTimeout  = id => relojes.delete(id);
const correr = ms => { const meta = ahora + ms;
  while (true) {
    let sigId = null, sigT = Infinity;
    for (const [id, r] of relojes) if (r.prox < sigT) { sigT = r.prox; sigId = id; }
    if (sigId === null || sigT > meta) break;
    ahora = sigT; const r = relojes.get(sigId);
    if (r.rep) r.prox = ahora + r.ms; else relojes.delete(sigId);
    r.fn();
  }
  ahora = meta;
};

const el = {};
const nuevo = id => el[id] = el[id] || { id, textContent: "", style: {},
  classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); } },
  addEventListener(ev, fn) { (this._l = this._l || {})[ev] = fn; }, removeEventListener(ev) { if (this._l) delete this._l[ev]; } };
global.document = { getElementById: nuevo };
global.$ = nuevo;
global.window = {};
["edtuCarga", "ecTitulo", "ecEstado", "ecBarra", "ecPct", "gamePick", "swFrame", "swFs"].forEach(nuevo);

const Carga = eval(codigo + "Carga");
const abierto = () => el.edtuCarga.classList.contains("on");
const pct = () => parseFloat(el.ecPct.textContent);

/* ---------- 1) se abre con su título y su primer paso ---------- */
Carga.abre("STAR WARS", ["calentando motores…", "cargando los cañones…", "abriendo el hangar…"]);
console.log("  se abre: " + abierto() + " · título «" + el.ecTitulo.textContent + "» · estado «" + el.ecEstado.textContent + "» · " + pct() + "%");
if (!abierto()) MAL("no se abre");
if (el.ecTitulo.textContent !== "STAR WARS") MAL("no pone el nombre del mundo");
if (pct() !== 0) MAL("no empieza en 0%");

/* ---------- 2) la barra avanza rápido al principio y luego frena ---------- */
correr(300); const p3 = pct();
correr(700); const p1s = pct();
correr(2000); const p3s = pct();
correr(20000); const pFin = pct();
console.log("  la barra: 0,3 s → " + p3 + "% · 1 s → " + p1s + "% · 3 s → " + p3s + "% · 23 s → " + pFin + "%");
if (!(p3 > 0 && p3 < p1s && p1s < p3s)) MAL("la barra no avanza");
if (!(p1s - p3 > p3s - p1s)) MAL("la barra no frena (avanzaría mintiendo)");
if (pFin > 92) MAL("la barra llega al " + pFin + "% sin que haya llegado el mundo: eso es mentir");
console.log("  ✅ nunca pasa del 92% hasta que el mundo llega de verdad");

/* ---------- 3) los pasos van cambiando ---------- */
const vistos = new Set();
for (let i = 0; i < 12; i++) { correr(900); vistos.add(el.ecEstado.textContent); }
console.log("  pasos distintos que se ven: " + vistos.size + " (" + [...vistos].join(" · ") + ")");
if (vistos.size < 3) MAL("los pasos no van cambiando");

/* ---------- 4) al llegar el mundo: 100% y se cierra ---------- */
Carga.cierra();
console.log("  al llegar el mundo: " + pct() + "% · «" + el.ecEstado.textContent + "» · sigue abierto: " + abierto());
if (pct() !== 100) MAL("no llega al 100%");
correr(400);
console.log("  y se quita solo: cerrado = " + !abierto());
if (abierto()) MAL("no se cierra");
if (relojes.size !== 0) MAL("quedan " + relojes.size + " reloj(es) corriendo");
else console.log("  ✅ sin relojes colgando");

/* ---------- 5) el seguro: si el mundo NUNCA carga, no te deja encerrado ---------- */
const abre = html.slice(html.indexOf("function abreMundo("), html.indexOf("function cierraMundo("));
const fn = new Function("$", "Carga", abre + "; return abreMundo;")(nuevo, Carga);
fn("swFrame", "swFs", "starwars.html", "STAR WARS", ["…"]);
console.log("  entro a STAR WARS: cargador " + abierto() + " · el marco apunta a «" + el.swFrame.src + "» · panel abierto " + el.swFs.classList.contains("open"));
if (!abierto()) MAL("entrar a un mundo no muestra el cargador");
if (el.swFrame.src !== "starwars.html") MAL("no carga el archivo del mundo");
correr(11000);
if (!abierto()) MAL("se cierra antes de tiempo");
correr(2000);
console.log("  si el mundo no llega nunca, a los 12 s el cargador se quita igual: " + !abierto());
if (abierto()) MAL("¡te deja encerrado en la pantalla de carga!");

/* ---------- 6) y si el mundo llega, se cierra al momento (una sola vez) ---------- */
correr(1000);
fn("swFrame", "swFs", "starwars.html", "STAR WARS", ["…"]);
el.swFrame._l.load();            /* el iframe avisa: ya cargué */
correr(400);
console.log("  cuando el mundo avisa que cargó, el cargador se quita al momento: " + !abierto());
if (abierto()) MAL("no se cierra cuando el mundo carga");
el.swFrame._l && el.swFrame._l.load && MAL("no quita el oyente del iframe (se acumularían)");
correr(20000);
if (relojes.size !== 0) MAL("quedan " + relojes.size + " reloj(es) corriendo al final");

/* ---------- 7) los cinco mundos usan el cargador ---------- */
const mundos = ["nagFrame", "rkFrame", "swFrame", "jpFrame", "scrFrame"];
const faltan = mundos.filter(m => !new RegExp('abreMundo\\("' + m + '"').test(html));
console.log("  mundos con cargador: " + (mundos.length - faltan.length) + "/5" + (faltan.length ? " (faltan " + faltan.join(", ") + ")" : ""));
if (faltan.length) MAL("hay mundos sin cargador");
if (!/window\.EDTUCarga=Carga/.test(html)) MAL("el cargador no queda disponible para el resto de EDTU");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ cargador sano · se abre, avanza sin mentir, cuenta lo que hace, se cierra al llegar el mundo y nunca deja a nadie encerrado");
