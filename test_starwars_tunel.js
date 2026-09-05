/* 🧪 prueba del túnel del hiperespacio: que dibuje sus paredes, su gas y sus luces, que todo
   se recicle (nada crece sin parar), que a más velocidad las estelas se estiren, y que pintarlo
   siga siendo barato para que no dé tirones.
   Se ejecuta con:  node test_starwars_tunel.js                                                 */
const fs = require("fs");
const html = fs.readFileSync("starwars.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

const ini = html.indexOf("const HIPER_DURA=1.7;");
const fin = html.indexOf("let hiper=0;", ini);
if (ini < 0 || fin < 0) { console.log("❌ no encuentro el túnel"); process.exit(1); }
const codigo = html.slice(ini, fin);

/* ---------- un lienzo de mentira que apunta TODO lo que se le pide ---------- */
const cuenta = { moveTo: 0, lineTo: 0, arc: 0, stroke: 0, fill: 0, fillRect: 0, grad: 0 };
let largos = [], ultimoMove = null, reciénMovido = false;
const ctx = {
  save() {}, restore() {}, beginPath() {}, closePath() {},
  moveTo(x, y) { cuenta.moveTo++; ultimoMove = [x, y]; reciénMovido = true; },
  lineTo(x, y) { cuenta.lineTo++; /* una ESTELA es moveTo+lineTo suelto; una PARED es moveTo y muchos lineTo seguidos */
    if (ultimoMove && reciénMovido) largos.push(Math.hypot(x - ultimoMove[0], y - ultimoMove[1]));
    ultimoMove = [x, y]; reciénMovido = false; },
  arc() { cuenta.arc++; }, stroke() { cuenta.stroke++; }, fill() { cuenta.fill++; }, fillRect() { cuenta.fillRect++; },
  createRadialGradient() { cuenta.grad++; return { addColorStop() {} }; },
  createLinearGradient() { cuenta.grad++; return { addColorStop() {} }; },
  set strokeStyle(v) { this._ss = v; }, get strokeStyle() { return this._ss; },
  set fillStyle(v) { this._fs = v; }, get fillStyle() { return this._fs; },
  lineWidth: 1, lineCap: "", lineJoin: "", globalCompositeOperation: "", globalAlpha: 1
};
const W = 1280, H = 720, CX = W / 2, CY = H / 2, FOV = 900;
const G = { t: 0 };
const ent = new Function("ctx", "W", "H", "CX", "CY", "FOV", "G",
  codigo + "; return { pintaTunel, tunelArranca, TUNEL, TUNEL_FIL, TUNEL_GAS, TUNEL_N, get T(){return TUNEL_T;} };"
)(ctx, W, H, CX, CY, FOV, G);

const cero = () => Object.keys(cuenta).forEach(k => cuenta[k] = 0);

/* ---------- 1) parado (k=0) no dibuja nada: ni un pixel gastado fuera del salto ---------- */
ent.pintaTunel(0, 1 / 60);
console.log("  fuera del salto (k=0): " + (cuenta.stroke + cuenta.fill) + " trazos (tiene que ser 0)");
if (cuenta.stroke + cuenta.fill !== 0) MAL("gasta dibujando cuando no hay hiperespacio");

/* ---------- 2) a fondo dibuja las tres capas ---------- */
ent.tunelArranca();
largos = []; cero(); ent.pintaTunel(1, 1 / 60);
console.log("  a fondo: " + cuenta.stroke + " trazos · " + cuenta.arc + " arcos (gas y anillos) · " +
            cuenta.lineTo + " tramos de línea · " + cuenta.grad + " degradados");
if (cuenta.stroke < 200) MAL("dibuja muy poco: no se vería el tubo");
if (cuenta.arc < 10) MAL("no dibuja el gas ni los anillos");
if (cuenta.grad < 5) MAL("faltan los degradados del núcleo y los rayos");

/* las paredes: 16 filamentos, cada uno una polilínea de varios tramos */
console.log("  paredes: " + ent.TUNEL_FIL.length + " filamentos en espiral · gas: " + ent.TUNEL_GAS.length + " manchones · luces: " + ent.TUNEL.length);
if (ent.TUNEL_FIL.length < 10) MAL("pocas paredes");
if (!ent.TUNEL_GAS.length) MAL("no hay gas");
const tramosPorFilamento = (cuenta.lineTo - largos.length) / ent.TUNEL_FIL.length;   /* los lineTo que NO son estelas */
console.log("  cada filamento se dibuja con ~" + tramosPorFilamento.toFixed(0) + " tramos (una espiral, no una recta)");
if (tramosPorFilamento < 8) MAL("los filamentos son casi rectas: no se ve la espiral");

/* ---------- 3) las estelas se estiran con la velocidad ---------- */
/* el lienzo falso distingue las dos cosas: una ESTELA es un moveTo con UN lineTo detrás,
   mientras que una PARED es un moveTo con veintitantos lineTo seguidos. Así medimos solo estelas */
function largoEstela(k) {
  ent.tunelArranca(); ent.pintaTunel(k, 1 / 60);        /* un fotograma para colocar */
  largos = []; cero(); ent.pintaTunel(k, 1 / 60);
  return largos.reduce((a, b) => a + b, 0) / Math.max(1, largos.length);
}
const lento = largoEstela(0.25), rapido = largoEstela(1.0);
console.log("  largo medio de las ESTELAS (sin contar las paredes): al empezar " + lento.toFixed(0) + " px · a toda velocidad " + rapido.toFixed(0) + " px → x" + (rapido / lento).toFixed(1));
if (!(rapido > lento * 1.5)) MAL("las estelas no se estiran con la velocidad");

/* ---------- 4) todo se recicla: nada crece sin parar ---------- */
ent.tunelArranca();
const antes = { luces: ent.TUNEL.length, fil: ent.TUNEL_FIL.length, gas: ent.TUNEL_GAS.length };
for (let i = 0; i < 600; i++) ent.pintaTunel(1, 1 / 60);   /* 10 segundos a toda máquina */
console.log("  tras 10 s a tope: luces " + ent.TUNEL.length + " · paredes " + ent.TUNEL_FIL.length + " · gas " + ent.TUNEL_GAS.length + " (los mismos de siempre)");
if (ent.TUNEL.length !== antes.luces || ent.TUNEL_FIL.length !== antes.fil || ent.TUNEL_GAS.length !== antes.gas) MAL("algo crece sin parar (se comería la memoria)");
/* y ninguna luz se queda pegada detrás de la cámara */
const malas = ent.TUNEL.filter(p => !(p.z > 0 && p.z <= 2600 + 1)).length;
const gasMalo = ent.TUNEL_GAS.filter(b => !(b.z > 0 && b.z <= 2600 + 1)).length;
console.log("  luces fuera del tubo: " + malas + " · gas fuera del tubo: " + gasMalo);
if (malas || gasMalo) MAL("hay cosas que se salen del tubo y no vuelven");

/* ---------- 5) el reloj propio corre (por eso también late en la pausa) ---------- */
const t0 = ent.T; ent.pintaTunel(0.62, 1 / 60);
console.log("  reloj propio del túnel: " + t0.toFixed(2) + " → " + ent.T.toFixed(2) + " (no depende de G.t, que en pausa está congelado)");
if (!(ent.T > t0)) MAL("el túnel no tiene reloj propio: se quedaría quieto en la pausa");
if (/G\.t\*1\.8/.test(codigo)) MAL("los anillos siguen usando el reloj del juego (se congelan en pausa)");

/* ---------- 6) y sigue siendo barato ---------- */
ent.tunelArranca();
for (let i = 0; i < 60; i++) ent.pintaTunel(1, 1 / 60);
const t1 = process.hrtime.bigint();
for (let i = 0; i < 300; i++) ent.pintaTunel(1, 1 / 60);
const ms = Number(process.hrtime.bigint() - t1) / 1e6 / 300;
console.log("  cuesta " + ms.toFixed(3) + " ms por fotograma (el presupuesto de 60 fps es 16,6 ms)");
if (ms > 4) MAL("el túnel es demasiado caro: daría tirones");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ el túnel tiene paredes, gas y luces, se estira con la velocidad, lo recicla todo, late con su propio reloj y sigue siendo barato");
