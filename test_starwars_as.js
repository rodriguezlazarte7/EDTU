/* 🧪 prueba del AS enemigo: que aparezca cuando toca (y no antes), que sea MEJOR que un caza
   normal, que no te suelte, que el marcador de vuestros duelos se guarde entre partidas y que
   se apunte el tanto correcto tanto si lo derribas como si te derriba.
   Se ejecuta con:  node test_starwars_as.js                                                    */
const fs = require("fs");
const html = fs.readFileSync("starwars.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const trozo = (a, b) => { const i = html.indexOf(a), j = html.indexOf(b, i); if (i < 0 || j < 0) { console.log("❌ no encuentro " + a); process.exit(1); } return html.slice(i, j); };

/* ---------- 1) el AS es MEJOR que los demás, no más gordo ---------- */
const clases = trozo("const CLASES={", "\n};");
const dato = (nom, campo) => { const fila = clases.split("\n").find(l => l.trim().startsWith(nom + ":")); const m = fila && fila.match(new RegExp(campo + ":\\s*\\.?([\\d.]+)")); return m ? parseFloat(fila.match(new RegExp(campo + ":\\s*(\\.?[\\d.]+)"))[1]) : null; };
const caza = { vel: dato("caza", "vel"), giro: dato("caza", "giro"), cad: dato("caza", "cad"), vida: dato("caza", "vida") };
const as = { vel: dato("as", "vel"), giro: dato("as", "giro"), cad: dato("as", "cad"), vida: dato("as", "vida") };
console.log("  el AS contra un caza normal: velocidad " + as.vel + " vs " + caza.vel + " · giro " + as.giro + " vs " + caza.giro +
            " · dispara cada " + as.cad + " vs " + caza.cad + " · vida " + as.vida + " vs " + caza.vida);
if (!(as.vel > caza.vel && as.giro > caza.giro)) MAL("el AS no vuela mejor que un caza cualquiera");
if (!(as.cad < caza.cad)) MAL("el AS no dispara más rápido");
if (as.vida > 12) MAL("el AS es una esponja de balas (" + as.vida + "): tiene que ser bueno, no gordo");

/* ---------- 2) el marcador se guarda entre partidas ---------- */
const guardado = {};
global.localStorage = { getItem: k => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); } };
const marcador = trozo("function asMarcador(){", "function asLlama(){");
const M = new Function("localStorage", marcador + "; return { asMarcador, asApunta };")(localStorage);
console.log("  marcador de salida: " + JSON.stringify(M.asMarcador()));
M.asApunta(true); M.asApunta(true); M.asApunta(false);
console.log("  tras ganarle dos veces y perder una: " + M.asMarcador().g + "-" + M.asMarcador().p + " · guardado en el aparato: " + guardado["edtu_sw_as_g"] + "/" + guardado["edtu_sw_as_p"]);
if (M.asMarcador().g !== 2 || M.asMarcador().p !== 1) MAL("el marcador no cuenta bien");
if (guardado["edtu_sw_as_g"] !== "2") MAL("el marcador no se guarda para la próxima partida");

/* ---------- 3) aparece cuando toca ---------- */
const llamada = trozo("  G.asT=(G.asT||0)-dt;", "\n  }");
console.log("  la regla de aparición: " + llamada.replace(/\s+/g, " ").trim().slice(0, 150));
const G = { as: null, asT: 0, wave: 0, enem: [], inicio: Date.now(), t: 99 };
let llamadas = 0;
const paso = new Function("G", "tutoActivo", "esSuper", "asLlama", "dt",
  llamada + "\n  }" + "; return G.asT;");
const corre = (opts, veces) => { llamadas = 0; Object.assign(G, opts);
  for (let i = 0; i < veces; i++) paso(G, () => G.tuto, () => G.super, () => { llamadas++; G.as = { fake: true }; }, 1 / 60);
  return llamadas; };
console.log("  en la oleada 1: " + corre({ as: null, asT: 0, wave: 1, tuto: false, super: false }, 60) + " apariciones (todavía no)");
if (corre({ as: null, asT: 0, wave: 1, tuto: false, super: false }, 60) !== 0) MAL("el AS aparece demasiado pronto");
console.log("  en la oleada 3: " + corre({ as: null, asT: 0, wave: 3, tuto: false, super: false }, 60) + " aparición");
if (corre({ as: null, asT: 0, wave: 3, tuto: false, super: false }, 60) !== 1) MAL("el AS no aparece en la oleada 3");
console.log("  durante el tutorial: " + corre({ as: null, asT: 0, wave: 5, tuto: true, super: false }, 60) + " (al primer vuelo no se le echa encima)");
if (corre({ as: null, asT: 0, wave: 5, tuto: true, super: false }, 60) !== 0) MAL("el AS se cuela en el tutorial");
console.log("  con el cielo lleno (12 enemigos): " + corre({ as: null, asT: 0, wave: 9, tuto: false, super: false, enem: new Array(12).fill(0) }, 60));
if (corre({ as: null, asT: 0, wave: 9, tuto: false, super: false, enem: new Array(12).fill(0) }, 60) !== 0) MAL("aparece aunque el cielo esté a reventar");
/* y solo uno a la vez */
G.as = null; G.asT = 0; G.wave = 5; G.enem = []; G.tuto = false; G.super = false;
llamadas = 0; for (let i = 0; i < 600; i++) paso(G, () => false, () => false, () => { llamadas++; G.as = { fake: true }; }, 1 / 60);
console.log("  en 10 segundos seguidos: " + llamadas + " AS en total (solo uno a la vez)");
if (llamadas !== 1) MAL("salen varios AS a la vez");

/* ---------- 4) el AS no te suelta ---------- */
const persigue = trozo("    /* 💀 EL AS no se despista", "    /* --- si le tienes fichado");
console.log("  cuando se aleja: " + persigue.replace(/\s+/g, " ").trim().slice(0, 110));
if (!/e\.esAs.*e\.plan="ataca"/s.test(persigue)) MAL("el AS se despista como los demás");
const esquiva = html.match(/e\.zigT=\(fichado\?0\.30:0\.9\)\*\(e\.esAs\?([\d.]+):1\)/);
console.log("  y esquiva: cambia de dirección " + (1 / parseFloat(esquiva[1])).toFixed(1) + " veces más seguido que un caza normal");
if (!(parseFloat(esquiva[1]) < 1)) MAL("el AS no esquiva mejor");

/* ---------- 5) los tantos se apuntan a quien toca ---------- */
const corre5 = trozo("function asCorre(dt){", "function eligeClase(){");
let apuntes = [];
const G2 = { as: null, t: 0, asGanados: 0 };
const A = new Function("G", "asApunta", "aviso", "len", "sub", corre5 + "; return asCorre;")(G2, g => apuntes.push(g), () => {}, () => 500, () => ({}));
/* lo derribas: punto para ti, y solo UNO aunque pasen más fotogramas */
G2.as = { muerto: false, ardiendo: 2, nombre: "GARRA" };
A(1 / 60); A(1 / 60); A(1 / 60);
console.log("  lo derribas → tantos apuntados: " + JSON.stringify(apuntes) + " · derribos en la partida: " + G2.asGanados);
if (apuntes.length !== 1 || apuntes[0] !== true) MAL("derribar al AS no cuenta (o cuenta varias veces)");
if (G2.asGanados !== 1) MAL("no suma el derribo del AS para la medalla");
/* y si te derriba él estando vivo, el punto es suyo */
const muerte = trozo("  /* 💀 si el as seguía vivo", "  G.over=true;");
console.log("  si te derriba estando vivo: " + muerte.replace(/\s+/g, " ").trim().slice(0, 100));
if (!/asApunta\(false\)/.test(muerte)) MAL("si te derriba el AS, no se apunta su tanto");
if (!/!G\.as\.muerto/.test(muerte)) MAL("le apuntaría el tanto incluso estando ya derribado");

/* ---------- 6) la medalla y el resumen ---------- */
if (!/id:"cazador".*asGanados>=1/.test(html)) MAL("falta la medalla por derribar al AS");
if (!/asGanados:G\.asGanados\|\|0,/.test(html)) MAL("la medalla nunca se enteraría: no se pasa el dato");
if (!/G\.as=null; G\.asT=40; G\.asGanados=0;/.test(html)) MAL("el AS no se limpia entre partidas");
console.log("  ✅ medalla 💀 CAZA DEL AS, y todo se limpia al empezar otra partida");

/* ---------- 7) 🪐 EL PLANETA DEL FONDO ---------- */
const codigoPl = trozo("const PLANETAS=[", "function estrellasNuevas(){");
let arcosNeg = 0;
const ctx2 = new Proxy({}, { get: (o, k) => {
  if (k === "createLinearGradient" || k === "createRadialGradient") return () => ({ addColorStop: () => {} });
  if (k === "arc") return (x, y, r) => { if (!(r >= 0)) arcosNeg++; };
  if (k === "ellipse") return (x, y, a, b) => { if (!(a >= 0) || !(b >= 0)) arcosNeg++; };
  return () => {}; }, set: () => true });
const Gp = { base: { r: { x: 1, y: 0, z: 0 }, u: { x: 0, y: 1, z: 0 }, f: { x: 0, y: 0, z: 1 } } };
const v3f = (x, y, z) => ({ x, y, z });
const Pl = new Function("ctx", "W", "H", "G", "v3", "norm", "mul", "aCamara", "proyecta", "performance",
  codigoPl + "; return { planetaNuevo, pintaPlaneta, ver:()=>PLANETA, PLANETAS };")(
  ctx2, 1280, 720, Gp, v3f,
  a => { const l = Math.hypot(a.x, a.y, a.z) || 1; return v3f(a.x / l, a.y / l, a.z / l); },
  (v, k) => v3f(v.x * k, v.y * k, v.z * k),
  (base, d) => ({ x: d.x, y: d.y, z: d.z }),          /* cámara mirando a +z */
  c => ({ x: 640 + c.x * 300, y: 360 - c.y * 300, s: 1 }),
  { now: () => Date.now() });

const tipos = new Set();
for (let i = 0; i < 60; i++) { Pl.planetaNuevo(); tipos.add(Pl.ver().P.nom); }
console.log("  planetas distintos que pueden salir: " + [...tipos].join(", "));
if (tipos.size < 4) MAL("casi siempre sale el mismo planeta");
if (!Pl.PLANETAS.some(p => p.anillo)) MAL("ninguno tiene anillo");

/* está clavado en el cielo: si lo tienes a la espalda, no se pinta */
Pl.planetaNuevo();
const P = Pl.ver();
P.d = { x: 0, y: 0, z: 1 };                            /* justo delante */
let dib = 0; const cuenta = () => { dib = 0; const g = ctx2.arc; };
Pl.pintaPlaneta(1 / 60);
P.d = { x: 0, y: 0, z: -1 };                           /* justo detrás */
const antesNubes = P.nubes[0].x;
Pl.pintaPlaneta(1 / 60);
console.log("  con el planeta a la espalda no se dibuja (y sus nubes no se mueven): " + (P.nubes[0].x === antesNubes));
if (P.nubes[0].x !== antesNubes) MAL("sigue calculando el planeta aunque lo tengas detrás");

/* las nubes y la luna se mueven cuando sí se ve */
P.d = { x: 0, y: 0, z: 1 };
const luna0 = P.lunaA, nube0 = P.nubes[0].x;
for (let i = 0; i < 60; i++) Pl.pintaPlaneta(1 / 60);
console.log("  al verlo: la luna gira (" + luna0.toFixed(2) + " → " + P.lunaA.toFixed(2) + ") y las nubes corren (" + nube0.toFixed(3) + " → " + P.nubes[0].x.toFixed(3) + ")");
if (!(P.lunaA > luna0)) MAL("la luna no da vueltas");
if (P.nubes[0].x === nube0) MAL("las nubes están congeladas");
if (P.nubes.some(nb => nb.x < 0 || nb.x > 1)) MAL("las nubes se salen de su vuelta");
console.log("  nada pide círculos de radio negativo: " + (arcosNeg === 0));
if (arcosNeg) MAL("pide " + arcosNeg + " círculos de radio negativo (el lienzo de verdad reventaría)");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ EL AS aparece cuando toca, vuela mejor que nadie y el marcador se guarda · y el planeta gira ahí abajo con su luna");
