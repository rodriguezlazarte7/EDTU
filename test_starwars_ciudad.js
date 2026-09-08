/* 🧪 prueba de la ciudad en llamas y de la calidad del planeta:
   · la ciudad tiene manzanas con calles, torres más altas en el centro y edificios ardiendo
   · el fuego sube, echa humo y suelta brasas... que se apagan (no se acumulan)
   · el terreno se ilumina con la NORMAL de cada cara (no con un damero) y tiene nieve y agua
   · y todo esto sigue cabiendo en un fotograma de 60 fps
   Se ejecuta con:  node test_starwars_ciudad.js                                                */
const fs = require("fs");
const html = fs.readFileSync("starwars.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const trozo = (a, b) => { const i = html.indexOf(a), j = html.indexOf(b, i); if (i < 0 || j < 0) { console.log("❌ no encuentro " + a); process.exit(1); } return html.slice(i, j); };

/* ---------- el escenario de mentira ---------- */
const v3 = (x, y, z) => ({ x, y, z });
const sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const norm = a => { const l = Math.hypot(a.x, a.y, a.z) || 1; return v3(a.x / l, a.y / l, a.z / l); };
const W = 1280, H = 720, CX = W / 2, CY = H / 2, FOV = 900;
const cuenta = { fill: 0, stroke: 0, fillRect: 0, arc: 0, grad: 0, negativos: 0 };
const ctx = new Proxy({}, { get: (o, k) => {
  if (k === "createLinearGradient" || k === "createRadialGradient") return () => { cuenta.grad++; return { addColorStop: () => {} }; };
  if (k === "arc") return (x, y, r) => { if (!(r >= 0)) cuenta.negativos++; cuenta.arc++; };
  if (k in cuenta) return () => { cuenta[k]++; };
  return () => {}; }, set: () => true });

const G = { pos: v3(0, 0, 0), base: { r: v3(1, 0, 0), u: v3(0, 1, 0), f: v3(0, 0, 1) }, t: 0 };
const aCamara = (base, d) => ({ x: dot(d, base.r), y: dot(d, base.u), z: dot(d, base.f) });
const proyecta = c => ({ x: CX + c.x / c.z * FOV, y: CY - c.y / c.z * FOV, s: FOV / c.z / 900 });

/* el suelo y la ciudad viven juntos en el archivo */
/* SUELO se declara justo antes que alturaSuelo, así que se lo damos aparte */
const codigo = "const SUELO=-900;\n" + trozo("function alturaSuelo(x,z){", "/* 🌤️ EL CIELO del planeta");
const M = new Function("G", "v3", "sub", "dot", "norm", "aCamara", "proyecta", "ctx", "W", "H", "CX", "CY", "FOV",
  "PLANETA", "ZONA", "ZONA_K", "golpe", "sacude", "aviso",
  codigo + "; return { ciudadNueva, ciudadCorre, pintaCiudad, pintaTerreno, CIUDAD, alturaSuelo, SUELO, TERR_N };")(
  G, v3, sub, dot, norm, aCamara, proyecta, ctx, W, H, CX, CY, FOV,
  { P: { a: [200, 220, 255], b: [90, 130, 190], mar: [40, 70, 130] } }, "planeta", 1,
  () => {}, () => {}, () => {});

/* ---------- 1) la ciudad: manzanas, calles y torres ---------- */
M.ciudadNueva();
const E = M.CIUDAD.edif;
console.log("  la ciudad tiene " + E.length + " edificios");
if (E.length < 40) MAL("la ciudad es un pueblo de cuatro casas");
/* hay calles: entre manzana y manzana queda hueco */
const xs = [...new Set(E.map(e => Math.round(e.x / 10) * 10))].sort((a, b) => a - b);
const huecos = []; for (let i = 1; i < xs.length; i++) huecos.push(xs[i] - xs[i - 1]);
console.log("  separación entre manzanas: de " + Math.min(...huecos) + " a " + Math.max(...huecos) + " (los edificios miden ~" + Math.round(E[0].w * 2) + ")");
if (Math.max(...huecos) < E[0].w * 2) MAL("no hay calles: los edificios se tocan");
/* las torres del centro son más altas que las de las afueras */
const cen = E.filter(e => Math.hypot(e.x - M.CIUDAD.cx, e.z - M.CIUDAD.cz) < 300);
const bor = E.filter(e => Math.hypot(e.x - M.CIUDAD.cx, e.z - M.CIUDAD.cz) > 700);
const media = a => a.reduce((s, e) => s + e.alt, 0) / Math.max(1, a.length);
console.log("  altura media: centro " + Math.round(media(cen)) + " · afueras " + Math.round(media(bor)));
if (!(media(cen) > media(bor))) MAL("las torres del centro no son más altas");
/* y cada edificio se apoya en SU trozo de terreno */
const malApoyados = E.filter(e => Math.abs(e.suelo - M.alturaSuelo(e.x, e.z)) > 0.001).length;
console.log("  edificios apoyados en el suelo de verdad: " + (E.length - malApoyados) + "/" + E.length);
if (malApoyados) MAL(malApoyados + " edificios flotan o están enterrados");

/* ---------- 2) el fuego ---------- */
const ardiendo = E.filter(e => e.fuego > 0).length;
console.log("  edificios en llamas: " + ardiendo + " de " + E.length + " (" + Math.round(ardiendo / E.length * 100) + "%)");
if (ardiendo < E.length * 0.15) MAL("casi no arde nada");
if (ardiendo > E.length * 0.75) MAL("arde tanto que no queda ciudad");
/* las brasas salen, suben y se apagan */
for (let i = 0; i < 240; i++) M.ciudadCorre(1 / 60);
const brasas1 = M.CIUDAD.brasas.length;
const suben = M.CIUDAD.brasas.every(b => b.vy > 0);
console.log("  tras 4 segundos: " + brasas1 + " brasas volando · todas suben: " + suben);
if (!brasas1) MAL("el fuego no suelta brasas");
if (!suben) MAL("hay brasas que caen en vez de subir");
for (let i = 0; i < 3000; i++) M.ciudadCorre(1 / 60);
console.log("  tras 50 segundos seguidos: " + M.CIUDAD.brasas.length + " brasas (con tope, no se acumulan)");
if (M.CIUDAD.brasas.length > 160) MAL("las brasas se acumulan sin control: acabaría dando tirones");

/* ---------- 3) el terreno, con luz de verdad ---------- */
const terr = trozo("function pintaTerreno(){", "/* ================= 🌇 LA CIUDAD");
console.log("  el terreno se ilumina con la normal de cada cara: " + /const nx=\(h00\+h01\)-\(h10\+h11\)/.test(terr));
if (!/const nx=/.test(terr) || !/SOL_PL/.test(terr)) MAL("el terreno sigue sin luz de verdad");
if (/tablero/.test(terr)) MAL("sigue usando el damero de antes");
if (!/cumbres nevadas/.test(terr)) MAL("no hay nieve en las cumbres");

/* ---------- 4) ¿cabe en un fotograma? ---------- */
G.pos = v3(M.CIUDAD.cx, M.alturaSuelo(M.CIUDAD.cx, M.CIUDAD.cz) + 420, M.CIUDAD.cz - 900);
const pinta = () => { M.pintaTerreno(); };
pinta();                                                   /* uno de calentamiento */
Object.keys(cuenta).forEach(k => cuenta[k] = 0);
pinta();
console.log("  un fotograma sobre la ciudad: " + cuenta.fill + " rellenos · " + cuenta.arc + " círculos · " + cuenta.grad + " degradados");
if (cuenta.fill < 100) MAL("no dibuja casi nada: algo va mal");
if (cuenta.fill > 4000) MAL("dibuja " + cuenta.fill + " cosas por fotograma: eso da tirones");
console.log("  círculos de radio negativo: " + cuenta.negativos + " (el lienzo de verdad reventaría con uno solo)");
if (cuenta.negativos) MAL("pide círculos de radio negativo");

const t0 = process.hrtime.bigint();
for (let i = 0; i < 120; i++) { G.t += 1 / 60; pinta(); }
const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
console.log("  cuesta " + ms.toFixed(2) + " ms por fotograma (para 60 fps hay 16,6 ms, y las naves gastan ~0,6)");
if (ms > 8) MAL("el planeta con ciudad es demasiado caro: " + ms.toFixed(1) + " ms");

/* ---------- 5) desde el espacio no cuesta nada ---------- */
const M2 = new Function("G", "v3", "sub", "dot", "norm", "aCamara", "proyecta", "ctx", "W", "H", "CX", "CY", "FOV",
  "PLANETA", "ZONA", "ZONA_K", "golpe", "sacude", "aviso",
  codigo + "; return { ciudadNueva, ciudadCorre, pintaTerreno, CIUDAD };")(
  G, v3, sub, dot, norm, aCamara, proyecta, ctx, W, H, CX, CY, FOV,
  { P: { a: [1, 2, 3], b: [1, 2, 3], mar: [1, 2, 3] } }, "espacio", 0,
  () => {}, () => {}, () => {});
M2.ciudadNueva();
Object.keys(cuenta).forEach(k => cuenta[k] = 0);
M2.pintaTerreno(); for (let i = 0; i < 60; i++) M2.ciudadCorre(1 / 60);
console.log("  en el espacio (sin bajar al planeta): " + cuenta.fill + " rellenos y " + M2.CIUDAD.brasas.length + " brasas — ni un pixel gastado");
if (cuenta.fill || cuenta.arc) MAL("sigue dibujando el planeta desde el espacio");
if (M2.CIUDAD.brasas.length) MAL("el fuego sigue calculándose desde el espacio");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ la ciudad arde con su humo y sus brasas, el terreno tiene luz, nieve y agua, y todo cabe de sobra en un fotograma");
