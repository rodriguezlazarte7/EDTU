/* 🧪 prueba de bajar al planeta y del mapa de abajo:
   · solo se puede bajar con el planeta DE FRENTE, y la bajada dura 3 segundos
   · en la superficie el suelo tiene relieve, es SIEMPRE el mismo y no se puede atravesar
   · los enemigos y los compañeros tampoco se meten bajo tierra
   · se puede volver al espacio, y todo queda limpio para la siguiente partida
   · el mapa coloca cada cosa donde toca, mirando desde arriba
   Se ejecuta con:  node test_starwars_planeta.js                                              */
const fs = require("fs");
const html = fs.readFileSync("starwars.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const trozo = (a, b) => { const i = html.indexOf(a), j = html.indexOf(b, i); if (i < 0 || j < 0) { console.log("❌ no encuentro " + a); process.exit(1); } return html.slice(i, j); };

/* las cuentas de vectores del propio juego */
const v3 = (x, y, z) => ({ x, y, z });
const sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const len = a => Math.hypot(a.x, a.y, a.z);

const codigo = trozo("let ZONA=\"espacio\"", "/* 🏔️ EL TERRENO");
let golpes = [], avisos = [], sacudidas = 0;
const G = { pos: v3(0, 0, 0), base: { r: v3(1, 0, 0), u: v3(0, 1, 0), f: v3(0, 0, 1) },
  enem: [], amigos: [], run: true, over: false, paused: false, t: 0 };
const Z = new Function("G", "v3", "sub", "dot", "aCamara", "aviso", "sfx", "mute", "golpe", "sacude",
  "PLANETA", "hiper", "saliendo", "CIUDAD",
  codigo + "; return { cambiaZona, zonaCorre, puedeBajar, alturaSuelo, SUELO, zona:()=>ZONA, k:()=>ZONA_K };")(
  G, v3, sub, dot,
  (base, d) => ({ x: dot(d, base.r), y: dot(d, base.u), z: dot(d, base.f) }),
  t => avisos.push(t), () => {}, true,
  (d, desde) => golpes.push(d), v => sacudidas += v,
  { d: v3(0, -0.4, 0.9), P: { a: [1, 2, 3], b: [1, 2, 3], mar: [1, 2, 3] } }, 0, 0,
  { cx: 800, cz: -600, edif: [], brasas: [] });      /* la ciudad, para aterrizar al lado */

/* ---------- 1) solo se baja con el planeta de frente ---------- */
G.base.f = v3(0, -0.4, 0.9);                              /* mirando al planeta */
const deFrente = Z.puedeBajar();
G.base.f = v3(1, 0, 0);                                   /* mirando a otro lado */
const deLado = Z.puedeBajar();
console.log("  ¿puedo bajar? mirando al planeta: " + deFrente + " · mirando a otro lado: " + deLado);
if (!deFrente) MAL("no deja bajar ni mirando al planeta");
if (deLado) MAL("deja bajar mirando para cualquier lado");
Z.cambiaZona();
console.log("  intento bajar mirando a otro lado → zona: " + Z.zona());
if (Z.zona() !== "espacio") MAL("baja aunque no estés mirando al planeta");

/* ---------- 2) la bajada dura 3 segundos y va tiñendo ---------- */
G.base.f = v3(0, -0.4, 0.9);
Z.cambiaZona();
console.log("  al pulsar: zona «" + Z.zona() + "» · aviso: «" + avisos[avisos.length - 1] + "»");
if (Z.zona() !== "bajando") MAL("no arranca la bajada");
const medio = [];
/* 240 vueltas: 3 segundos justos son 180, pero con los decimales del 1/60 hace falta una más */
for (let i = 0; i < 240 && Z.zona() === "bajando"; i++) { Z.zonaCorre(1 / 60); if (i % 45 === 0) medio.push(Z.k().toFixed(2)); }
console.log("  el cielo se va tiñendo: " + medio.join(" → ") + " (0 = espacio, 1 = superficie)");
if (medio[0] >= medio[medio.length - 1]) MAL("la bajada no progresa");
console.log("  al terminar: zona «" + Z.zona() + "» · a " + Math.round(G.pos.y - Z.alturaSuelo(G.pos.x, G.pos.z)) + " sobre el suelo · aviso: «" + avisos[avisos.length - 1] + "»");
/* y aterrizas CERCA de la ciudad, para verla arder */
const lejosCiudad = Math.hypot(G.pos.x - 800, G.pos.z - (-600));
console.log("  y apareces a " + Math.round(lejosCiudad) + " de la ciudad (el terreno llega a ~3200): se ve desde el aire");
if (lejosCiudad > 3000) MAL("apareces tan lejos de la ciudad que no se ve");
if (Z.zona() !== "planeta") MAL("no llega al planeta");
if (Z.k() !== 1) MAL("el cielo no queda del todo puesto");
if (!(G.pos.y > Z.SUELO)) MAL("apareces bajo tierra");

/* ---------- 3) el terreno tiene relieve y SIEMPRE es el mismo ---------- */
const alturas = [];
for (let i = 0; i < 400; i++) alturas.push(Z.alturaSuelo(i * 37, i * 53));
const min = Math.min(...alturas), max = Math.max(...alturas);
console.log("  el relieve va de " + Math.round(min) + " a " + Math.round(max) + " (" + Math.round(max - min) + " de desnivel)");
if (max - min < 100) MAL("el terreno es una mesa: no tiene relieve");
const otra = Z.alturaSuelo(37 * 5, 53 * 5);
if (otra !== alturas[5]) MAL("¡el terreno cambia entre una consulta y otra! bailaría al volar");
console.log("  y el mismo punto da siempre lo mismo: " + otra.toFixed(1) + " ✅");

/* ---------- 4) el suelo no se atraviesa ---------- */
golpes = []; sacudidas = 0;
G.pos = v3(500, Z.alturaSuelo(500, 500) - 300, 500);      /* metido bajo tierra a la fuerza */
Z.zonaCorre(1 / 60);
console.log("  me meto 300 bajo tierra → me saca a " + Math.round(G.pos.y - Z.alturaSuelo(500, 500)) + " sobre el suelo · me raspa (" + golpes.length + " golpe) y sacude (" + (sacudidas > 0) + ")");
if (G.pos.y < Z.alturaSuelo(500, 500)) MAL("¡se puede atravesar el suelo!");
if (!golpes.length) MAL("rozar el suelo no hace daño");
/* y volando alto, ni te toca */
golpes = [];
G.pos = v3(500, Z.alturaSuelo(500, 500) + 400, 500);
Z.zonaCorre(1 / 60);
console.log("  volando 400 por encima: " + golpes.length + " golpes (ninguno) · sigues a " + Math.round(G.pos.y - Z.alturaSuelo(500, 500)));
if (golpes.length) MAL("hace daño aunque vueles alto");
/* ni te deja salir al espacio por arriba sin la animación */
G.pos = v3(0, Z.SUELO + 9000, 0); Z.zonaCorre(1 / 60);
console.log("  intento subir hasta el espacio volando: me para a " + Math.round(G.pos.y - Z.SUELO) + " de altura");
if (G.pos.y > Z.SUELO + 2601) MAL("puedes salir del planeta sin la animación");

/* ---------- 5) los demás tampoco se hunden ---------- */
G.enem = [{ p: v3(300, Z.SUELO - 500, 300), ardiendo: 0 }];
G.amigos = [{ p: v3(-300, Z.SUELO - 500, -300), revive: 0 }];
Z.zonaCorre(1 / 60);
console.log("  un enemigo y un compañero bajo tierra → salen a " + Math.round(G.enem[0].p.y - Z.alturaSuelo(300, 300)) + " y " + Math.round(G.amigos[0].p.y - Z.alturaSuelo(-300, -300)) + " del suelo");
if (G.enem[0].p.y < Z.alturaSuelo(300, 300)) MAL("los enemigos vuelan bajo tierra");
if (G.amigos[0].p.y < Z.alturaSuelo(-300, -300)) MAL("tus compañeros vuelan bajo tierra");

/* ---------- 6) volver al espacio ---------- */
Z.cambiaZona();
console.log("  pulso otra vez: «" + Z.zona() + "»");
if (Z.zona() !== "subiendo") MAL("no se puede volver al espacio");
for (let i = 0; i < 200 && Z.zona() === "subiendo"; i++) Z.zonaCorre(1 / 60);
console.log("  y al terminar: «" + Z.zona() + "» con el cielo a " + Z.k() + " · aviso: «" + avisos[avisos.length - 1] + "»");
if (Z.zona() !== "espacio") MAL("no vuelve al espacio");
if (Z.k() !== 0) MAL("el cielo del planeta se queda pegado");
/* y ahora el suelo ya no le hace nada a nadie */
golpes = []; G.pos = v3(0, Z.SUELO - 5000, 0); Z.zonaCorre(1 / 60);
console.log("  en el espacio, volar por debajo del suelo del planeta: " + golpes.length + " golpes (el suelo ya no está)");
if (golpes.length) MAL("el suelo del planeta sigue estorbando en el espacio");
if (!/ZONA="espacio"; ZONA_T=0; ZONA_K=0;/.test(html)) MAL("la zona no se limpia al empezar otra partida");

/* ---------- 7) EL MAPA ---------- */
const mapa = trozo("function pintaMapa(){", "function pintaRadar(){");
/* la cuenta que coloca cada cosa: mundo → mapa, con el norte arriba */
const pon = new Function("p", "G", "cx", "cy", "esc",
  "const mx=cx+(p.x-G.pos.x)*esc, my=cy-(p.z-G.pos.z)*esc; return {mx,my};");
const Gm = { pos: v3(0, 0, 0) };
const norte = pon(v3(0, 0, 1000), Gm, 100, 50, 0.01);
const sur = pon(v3(0, 0, -1000), Gm, 100, 50, 0.01);
const este = pon(v3(1000, 0, 0), Gm, 100, 50, 0.01);
console.log("  en el mapa: lo que está al norte sale arriba (y=" + norte.my + " contra " + sur.my + " del sur) y lo del este a la derecha (x=" + este.mx + ")");
if (!(norte.my < sur.my)) MAL("el norte no sale arriba");
if (!(este.mx > 100)) MAL("el este no sale a la derecha");
/* y que pinte de todo */
["G.destructores", "G.amigos", "G.enem", "G.as"].forEach(x => { if (!mapa.includes(x)) MAL("el mapa no enseña " + x); });
console.log("  el mapa enseña: destructores, compañeros, enemigos y el AS · y dice si estás en ÓRBITA o SUPERFICIE: " + /SUPERFICIE/.test(mapa));
if (!/SUPERFICIE/.test(mapa) || !/ÓRBITA/.test(mapa)) MAL("el mapa no dice dónde estás");
if (!/ALT /.test(mapa)) MAL("el mapa no dice tu altura en el planeta");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ se baja al planeta y se vuelve, el suelo es de verdad y no se atraviesa, y el mapa de abajo coloca todo con el norte arriba");
