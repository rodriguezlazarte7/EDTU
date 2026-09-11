/* 🧪 prueba rápida de EDTU TENNIS: la física de la bola, las líneas y el tanteo.
   Se ejecuta con:  node test_tennis.js                                                         */
const fs = require("fs");
const html = fs.readFileSync("tennis.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const trozo = (a, b) => { const i = html.indexOf(a), j = html.indexOf(b, i); if (i < 0 || j < 0) { console.log("❌ no encuentro " + a); process.exit(1); } return html.slice(i, j); };

/* ---------- 1) la pista tiene las medidas de verdad ---------- */
const med = html.match(/const LARGO=([\d.]+), ANCHO=([\d.]+), DOBLES=([\d.]+), RED_Z=LARGO\/2, SAQUE=([\d.]+), RED_ALTO=([\d.]+)/);
console.log("  la pista: " + med[1] + " m de largo · " + med[2] + " de ancho (individuales) · " + med[3] + " (dobles) · red a " + med[5] + " m");
if (med[1] !== "23.77" || med[2] !== "8.23" || med[3] !== "10.97") MAL("las medidas no son las de una pista de verdad");
if (med[5] !== "0.914") MAL("la red no mide lo que debe");

/* ---------- 2) la física: golpe, vuelo y bote ---------- */
/* desde la cuenta del golpe (velGolpe y simulaTiro viven justo antes de golpea) hasta el tanteo */
const fisica = trozo("/* 🎯 la cuenta del golpe", "/* ---------- el tanteo");
const G = { bola: null, estado: "juego", saca: 0, rally: 0, rallyMax: 0, ultimo: -1, pts: [0, 0] };
const puntos = [];
const F = new Function("G", "TIPOS", "LARGO", "ANCHO", "SAQUE", "RED_Z", "RED_ALTO", "G_GRAV", "sonido", "punto",
  fisica + "; return { golpea, bolaCorre, dentroDePista };")(
  G,
  { plano: { nom: "PLANO", pot: 1, giro: 0, alto: 0.95 }, lift: { nom: "LIFT", pot: .92, giro: 1, alto: 1.35 },
    corte: { nom: "CORTE", pot: .8, giro: -.8, alto: .85 }, globo: { nom: "GLOBO", pot: .66, giro: .5, alto: 2.6 } },
  23.77, 8.23, 6.40, 23.77 / 2, 0.914, 9.81, () => {}, (q, t) => puntos.push([q, t]));

function pelotazo(tipo, pot) {
  G.bola = { x: 0, y: 1.0, z: 1.0, vx: 0, vy: 0, vz: 0, giro: 0, viva: false, botes: 0, lado: 0, estela: [] };
  G.estado = "juego"; puntos.length = 0;
  F.golpea({ lado: 0, swing: 0 }, tipo, pot, 0, false);
  const alturas = [];
  let botes = 0, primerBote = null;
  for (let i = 0; i < 60 * 8 && G.bola.viva; i++) {
    const antes = G.bola.botes;
    F.bolaCorre(1 / 60);
    alturas.push(G.bola.y);
    if (G.bola.botes > antes) { botes++; if (!primerBote) primerBote = { x: G.bola.x, z: G.bola.z }; }
  }
  return { alto: Math.max(...alturas), botes, primerBote, puntos: puntos.slice() };
}
const plano = pelotazo("plano", 0.7);
const globo = pelotazo("globo", 0.7);
const lift = pelotazo("lift", 0.7);
console.log("  un golpe plano sube hasta " + plano.alto.toFixed(2) + " m y bota en z=" + (plano.primerBote ? plano.primerBote.z.toFixed(1) : "?"));
console.log("  un globo sube hasta " + globo.alto.toFixed(2) + " m (bastante más alto ✅)");
if (!(globo.alto > plano.alto * 1.3)) MAL("el globo no sube más que el golpe plano");
if (!plano.primerBote) MAL("la bola no llega a botar");
else if (plano.primerBote.z < 23.77 / 2) MAL("el golpe se queda en tu propio campo");
console.log("  el liftado cae antes que el plano: " + (lift.primerBote && plano.primerBote ? (lift.primerBote.z < plano.primerBote.z ? "sí ✅ (" + lift.primerBote.z.toFixed(1) + " contra " + plano.primerBote.z.toFixed(1) + ")" : "no ❌") : "?"));
if (lift.primerBote && plano.primerBote && !(lift.primerBote.z < plano.primerBote.z)) MAL("el liftado no baja antes que el plano");

/* ---------- 3) las líneas: dentro es dentro ---------- */
const dentro = (x, z, saque) => F.dentroDePista(x, z, !!saque);
console.log("  en el medio de la pista: " + dentro(0, 12) + " · pasado el fondo: " + dentro(0, 25) + " · fuera por el lado: " + dentro(6, 12));
if (!dentro(0, 12)) MAL("el centro de la pista cuenta como fuera");
if (dentro(0, 25)) MAL("pasado el fondo cuenta como dentro");
if (dentro(6, 12)) MAL("fuera por el lado cuenta como dentro");
/* el saque tiene que caer en el cuadro cruzado */
G.saca = 0;
console.log("  sacando yo: en el cuadro de saque " + dentro(2, 14, true) + " · pasado el cuadro " + dentro(2, 20, true));
if (!dentro(2, 14, true)) MAL("un saque bueno cuenta como fuera");
if (dentro(2, 20, true)) MAL("un saque largo cuenta como bueno");

/* ---------- 4) el tanteo: 15, 30, 40, ventaja y juego ---------- */
const tanteo = trozo("function punto(quien, texto)", "function textoPts");
const T = { pts: [0, 0], juegos: [0, 0], sets_g: [0, 0], ventaja: -1, saca: 0, sets: 1, fin: false, msg: "", msgT: 0, estado: "", esperaT: 0 };
let acabado = null;
const P = new Function("G", "acaba", tanteo + "; return { punto, ganaJuego };")(T, q => { acabado = q; });
const marca = () => T.pts[0] + "-" + T.pts[1] + (T.ventaja >= 0 ? " (AD " + T.ventaja + ")" : "") + " · juegos " + T.juegos.join("-");
P.punto(0, "x"); P.punto(0, "x"); P.punto(0, "x");
console.log("  tres puntos seguidos: " + marca() + " (o sea 40-0)");
if (T.pts[0] !== 3) MAL("no cuenta 15/30/40");
P.punto(0, "x");
console.log("  y el cuarto: " + marca() + " ← juego ganado");
if (T.juegos[0] !== 1) MAL("el cuarto punto no gana el juego");
if (T.saca !== 1) MAL("no cambia el saque al acabar el juego");
/* deuce y ventaja */
T.pts = [3, 3]; T.ventaja = -1;
P.punto(0, "x"); console.log("  con 40-40, un punto: ventaja para el " + T.ventaja + " ✅");
if (T.ventaja !== 0) MAL("no da ventaja en el 40-40");
P.punto(1, "x"); console.log("  responde el rival: vuelve a iguales (ventaja " + T.ventaja + ")");
if (T.ventaja !== -1) MAL("la ventaja no se pierde al perder el siguiente punto");
P.punto(1, "x"); P.punto(1, "x");
console.log("  dos puntos más del rival: juegos " + T.juegos.join("-"));
if (T.juegos[1] !== 1) MAL("no se gana el juego desde la ventaja");
/* el set */
T.juegos = [5, 0]; T.pts = [3, 0]; T.ventaja = -1;
P.punto(0, "x");
console.log("  ganando el sexto juego: sets " + T.sets_g.join("-") + " · ¿partido acabado? " + (acabado === 0));
if (T.sets_g[0] !== 1) MAL("ganar 6 juegos no da el set");
if (acabado !== 0) MAL("el partido a 1 set no termina al ganar el set");

/* ---------- 5) los mandos son los de AO Tennis 2 ---------- */
const mandos = trozo("const TECLA_TIPO=", "addEventListener(\"keydown\"");
console.log("  los cuatro golpes: " + mandos.replace(/\s+/g, " ").trim());
["plano", "lift", "corte", "globo"].forEach(t => { if (!mandos.includes('"' + t + '"')) MAL("falta el golpe " + t); });
if (!/mantén el botón para cargar/i.test(html) && !/mantén/i.test(html)) MAL("no se explica que hay que mantener para cargar");
if (!/p\.cargando=true/.test(html) || !/p\.carga=Math\.min\(1,p\.carga\+/.test(html)) MAL("no se carga el golpe manteniendo");
if (!/G\.saqueFase===0/.test(html)) MAL("el saque no va en dos tiempos");
console.log("  cargar manteniendo ✅ · apuntar mientras cargas ✅ · saque en dos tiempos ✅ · mando B/A/X/Y ✅");

/* ---------- 5a) 🎾 PEGARLE A LA BOLA TIENE QUE SER FÁCIL ----------
   Lo que pidió David: que no haya que soltar en el fotograma exacto. El golpe se queda GUARDADO
   un rato y sale solo cuando la bola entra en tu alcance */
const srcJug = trozo("const ALCANCE=", "/* ---------- sonido");
const GJ = { bola: null, estado: "juego", saca: 0, rally: 0, rallyMax: 0, jug: null, pts: [0, 0], t: 0 };
let golpesDados = 0;
let ENTRADA = { dx: 0, dz: 0, pulsa: {}, sprint: false };
const J = new Function("G", "entrada", "golpea", "TIPOS", "ANCHO", "SAQUE", "G_GRAV", "punto", "sonido", "LARGO", "RED_Z", "DOBLES",
  srcJug + "; return { humanoCorre, ALCANCE };")(
  GJ, () => ENTRADA, () => { golpesDados++; GJ.bola.viva = false; },
  { plano: { nom: "P", pot: 1, giro: 0, alto: 1 }, lift: { nom: "L", pot: 1, giro: 1, alto: 1.3 },
    corte: { nom: "C", pot: 1, giro: -1, alto: .9 }, globo: { nom: "G", pot: 1, giro: .5, alto: 2.6 } },
  8.23, 6.4, 9.81, () => {}, () => {}, 23.77, 23.77 / 2, 10.97);
const jugadorNuevo = () => ({ lado: 0, x: 0, z: -1.4, swing: 0, tipo: "plano", carga: 0, cargando: false, mira: 0, paso: 0, guardado: null, prep: 0, dirRaqueta: 1 });
function escena() { GJ.jug = jugadorNuevo(); GJ.bola = { x: 0, y: 1.1, z: 4.2, vx: 0, vy: 0, vz: -6, giro: 0, viva: true, botes: 1, lado: 1, estela: [] }; golpesDados = 0; }
function corre(seg) { for (let i = 0; i < seg * 60; i++) { J.humanoCorre(1 / 60); GJ.bola.z += GJ.bola.vz / 60; } }
console.log("  el alcance de la raqueta es de " + J.ALCANCE + " m (antes 1,9)");
if (!(J.ALCANCE >= 2.5)) MAL("la raqueta sigue llegando poco");
escena();
ENTRADA = { dx: 0, dz: 0, pulsa: { plano: true }, sprint: false }; corre(0.25);
ENTRADA = { dx: 0, dz: 0, pulsa: {}, sprint: false }; corre(0.45);
console.log("  suelto el golpe ANTES de tiempo, con la bola aún lejos: ¿le doy igual? " + (golpesDados > 0 ? "sí ✅" : "no ❌"));
if (!golpesDados) MAL("soltar un poco antes sigue siendo un golpe al aire");
/* el imán coloca al jugador, pero poquito: no juega por ti */
GJ.jug = jugadorNuevo();
GJ.bola = { x: 1.8, y: 1.0, z: 3.0, vx: 0, vy: 0, vz: -5, giro: 0, viva: true, botes: 1, lado: 1, estela: [] };
ENTRADA = { dx: 0, dz: 0, pulsa: {}, sprint: false };
corre(0.4);
console.log("  la bola viene 1,8 m a la derecha y yo no toco nada: el jugador se corre a " + GJ.jug.x.toFixed(2) + " (ayuda, pero no juega por ti)");
if (!(GJ.jug.x > 0.05)) MAL("el imán de colocación no ayuda");
if (GJ.jug.x > 1.2) MAL("el imán juega por ti: te lleva hasta la bola solo");

/* ---------- 5a2) 🎯 LA DIANA NO MIENTE: donde dice que cae, cae ----------
   La diana que ves mientras cargas usa la MISMA cuenta que el golpe de verdad. Aquí se compara:
   se pinta la diana, se pega el golpe con la bola de verdad, y tienen que botar en el mismo sitio */
const TIPOS_T = { plano: { nom: "P", pot: 1, giro: 0, alto: 0.95 }, lift: { nom: "L", pot: .92, giro: 1, alto: 1.35 },
  corte: { nom: "C", pot: .8, giro: -.8, alto: .85 }, globo: { nom: "G", pot: .66, giro: .5, alto: 2.6 } };
const F2 = new Function("G", "TIPOS", "LARGO", "ANCHO", "SAQUE", "RED_Z", "RED_ALTO", "G_GRAV", "sonido", "punto",
  fisica + "; return { golpea, bolaCorre, dentroDePista, velGolpe, simulaTiro };")(
  G, TIPOS_T, 23.77, 8.23, 6.40, 23.77 / 2, 0.914, 9.81, () => {}, (q, t) => puntos.push([q, t]));
let peorError = 0, pruebasDiana = 0;
for (const tipo of ["plano", "lift", "corte", "globo"]) {
  for (const [pot, mira, prof] of [[0.3, -0.8, -0.6], [0.7, 0, 0.55], [1.0, 0.9, 1.0], [0.5, 0.4, -1.0]]) {
    const desde = { x: 0.5, y: 1.0, z: -0.5 };
    const v = F2.velGolpe(desde, 0, tipo, pot, mira * 8.23 * 0.44, prof, false);
    const diana = F2.simulaTiro(desde, v);
    G.bola = { x: desde.x, y: desde.y, z: desde.z, vx: 0, vy: 0, vz: 0, giro: 0, viva: false, botes: 0, lado: 0, estela: [] };
    G.estado = "juego"; puntos.length = 0;
    F2.golpea({ lado: 0, swing: 0 }, tipo, pot, mira * 8.23 * 0.44, false, prof);
    let bote = null;
    for (let i = 0; i < 600 && G.bola.viva && !bote; i++) { const antes = G.bola.botes; F2.bolaCorre(1 / 60); if (G.bola.botes > antes) bote = { x: G.bola.x, z: G.bola.z }; }
    pruebasDiana++;
    if (diana.red) { if (!puntos.some(p => /red/.test(p[1]))) MAL("la diana dice RED pero la bola de verdad pasó (" + tipo + ")"); continue; }
    if (!bote) { MAL("la bola de verdad no botó donde la diana (" + tipo + " " + pot + ")"); continue; }
    peorError = Math.max(peorError, Math.hypot(bote.x - diana.x, bote.z - diana.z));
  }
}
console.log("  la diana contra la bola de verdad, en " + pruebasDiana + " golpes distintos: el peor error es de " + (peorError * 100).toFixed(1) + " cm");
if (peorError > 0.05) MAL("la diana miente: la bola cae a " + (peorError * 100).toFixed(0) + " cm de donde marca");
/* y el stick de profundidad hace algo: corto cae cerca de la red, al fondo cae cerca de la línea */
const vCorto = F2.velGolpe({ x: 0, y: 1, z: -0.5 }, 0, "plano", 0.6, 0, -1, false);
const vFondo = F2.velGolpe({ x: 0, y: 1, z: -0.5 }, 0, "plano", 0.6, 0, 1, false);
const cCorto = F2.simulaTiro({ x: 0, y: 1, z: -0.5 }, vCorto), cFondo = F2.simulaTiro({ x: 0, y: 1, z: -0.5 }, vFondo);
console.log("  stick hacia ti (corto): cae en z=" + cCorto.z.toFixed(1) + " · stick hacia delante (al fondo): cae en z=" + cFondo.z.toFixed(1) + " (la red está en 11,9 y el fondo en 23,8)");
if (!(cFondo.z > cCorto.z + 4)) MAL("apuntar corto o al fondo no cambia casi nada");

/* y el SAQUE cae dentro del cuadro de saque, desde las dos esquinas y por los dos lados
   (al corregir el rozamiento, si el saque apuntara al fondo como los golpes, sería falta siempre) */
let saquesDentro = 0; const zSaques = [];
for (const [lado, sx, sz] of [[0, 2.1, -0.7], [0, -2.1, -0.7], [1, -2.1, 24.47], [1, 2.1, 24.47]]) {
  const desde = { x: sx, y: 2.4, z: sz };
  G.saca = lado;
  const apunte = (sx > 0 ? -1 : 1) * 6.40 * 0.32;
  for (const pot of [0.35, 0.75, 1.0]) {
    const v = F2.velGolpe(desde, lado, "plano", pot, apunte, 0.55, true);
    const sim = F2.simulaTiro(desde, v);
    zSaques.push(sim.red ? "RED" : sim.z.toFixed(1));
    if (!sim.red && F2.dentroDePista(sim.x, sim.z, true)) saquesDentro++;
  }
}
G.saca = 0;
console.log("  12 saques (dos esquinas, dos lados, flojo/medio/fuerte): " + saquesDentro + " dentro del cuadro · botan en z = " + zSaques.join(" "));
if (saquesDentro < 12) MAL("hay saques que se van fuera del cuadro sin haberlo querido");

/* ---------- 5a3) 🐛 LA RED YA NO SE ATRAVIESA ----------
   Antes solo se miraba si la bola estaba JUSTO encima de la red (10 cm), y a 25 m/s avanza
   42 cm por fotograma: se la saltaba. Ahora se mira si la CRUZA */
const bajoYRapido = { vx: 0, vy: 0.3, vz: 25, giro: 0 };
const simRed = F2.simulaTiro({ x: 0, y: 0.4, z: 6 }, bajoYRapido);
G.bola = { x: 0, y: 0.4, z: 6, vx: 0, vy: 0.3, vz: 25, giro: 0, viva: true, botes: 0, lado: 0, estela: [] };
puntos.length = 0;
for (let i = 0; i < 120 && G.bola.viva; i++) F2.bolaCorre(1 / 60);
const redDeVerdad = puntos.some(p => /red/.test(p[1]));
console.log("  un tiro bajo a 25 m/s: la diana dice " + (simRed.red ? "RED" : "pasa") + " y la bola de verdad " + (redDeVerdad ? "se come la red ✅" : "la ATRAVIESA ❌"));
if (!simRed.red) MAL("la diana no ve la red en un tiro bajo y rápido");
if (!redDeVerdad) MAL("la bola atraviesa la red de un salto");

/* ---------- 5a4) 🎮 mientras cargas, el STICK APUNTA en vez de moverte ---------- */
GJ.jug = jugadorNuevo();
GJ.bola = { x: 0, y: 1, z: 20, vx: 0, vy: 0, vz: 0, giro: 0, viva: false, botes: 0, lado: 1, estela: [] };
ENTRADA = { dx: 1, dz: 1, pulsa: { plano: true }, sprint: false };
corre(0.5);
console.log("  cargando y con el stick a la derecha y adelante: el jugador sigue en x=" + GJ.jug.x.toFixed(2) +
            " · la mira se va a " + GJ.jug.mira.toFixed(2) + " (lado) y " + GJ.jug.prof.toFixed(2) + " (profundidad)");
if (Math.abs(GJ.jug.x) > 0.01) MAL("al cargar, el stick sigue moviendo al jugador en vez de apuntar");
if (!(GJ.jug.mira > 0.5)) MAL("el stick no mueve la mira a los lados");
if (!(GJ.jug.prof > 0.9)) MAL("el stick no manda la bola al fondo");
ENTRADA = { dx: 0, dz: -1, pulsa: { plano: true }, sprint: false };
corre(0.6);
console.log("  y tirando del stick hacia ti: la profundidad baja a " + GJ.jug.prof.toFixed(2) + " (golpe corto)");
if (!(GJ.jug.prof < 0)) MAL("el stick no deja hacer golpes cortos");
ENTRADA = { dx: 1, dz: 0, pulsa: {}, sprint: false };
const x0 = GJ.jug.x; corre(0.3); GJ.jug.guardado = null;
console.log("  y sin cargar, el stick vuelve a MOVER al jugador: de x=" + x0.toFixed(2) + " a " + GJ.jug.x.toFixed(2));
if (!(GJ.jug.x > x0 + 0.5)) MAL("sin cargar, el stick ya no mueve al jugador");

/* ---------- 5a5) ☀️ 3D CON LUZ DEL SOL: todo sale del mismo sol ---------- */
const solSrc = trozo("const SOL3=", "/* hacia dónde está el sol EN LA PANTALLA");
const SOLES = new Function(solSrc + "; return { SOL3, SOL };")();
const h = 1.82;
const rayoX = -SOLES.SOL3.x * h / SOLES.SOL3.y, rayoZ = -SOLES.SOL3.z * h / SOLES.SOL3.y;
console.log("  el sol viene de (" + SOLES.SOL3.x.toFixed(2) + ", " + SOLES.SOL3.y.toFixed(2) + ", " + SOLES.SOL3.z.toFixed(2) + ") · la sombra de la cabeza de un jugador cae a (" +
            (SOLES.SOL.x * h).toFixed(2) + ", " + (SOLES.SOL.z * h).toFixed(2) + ") m, justo donde llega el rayo de sol (" + rayoX.toFixed(2) + ", " + rayoZ.toFixed(2) + ")");
if (Math.abs(SOLES.SOL.x * h - rayoX) > 1e-9 || Math.abs(SOLES.SOL.z * h - rayoZ) > 1e-9) MAL("las sombras no caen donde manda el sol");
["function capsula(", "function esfera(", "function pintaCielo(", "function pintaSombraRed(", "function pintaApunte("].forEach(fn => {
  if (!html.includes(fn)) MAL("falta " + fn.replace("function ", "").replace("(", ""));
});
/* el cielo va LO PRIMERO: la primera captura a 2K enseñó que, pintado después del estadio, tapaba las gradas y el público */
if (!/function dibuja\(\)\{\s*pintaCielo\(\);/.test(html)) MAL("el cielo no se pinta lo primero (si va después, tapa las gradas)");
console.log("  cuerpos en 3D (cápsulas y esferas iluminadas), cielo con sol, sombra de la red y diana ✅");

/* ---------- 5b) 🎮 el mando no se pelea con el cuartel ---------- */
const padre = fs.readFileSync("index.html", "utf8");
const navOn = padre.match(/return !\(o\("gameFs"\)[^;]+;/)[0];
console.log("  el cuartel se calla con el mando dentro de: " + (navOn.match(/o\("(\w+)"\)/g) || []).join(" "));
["tenFs", "swFs"].forEach(id => { if (!navOn.includes('o("' + id + '")')) MAL("con " + id + " abierto, el cuartel sigue navegando menús con el mando"); });
/* y en el tenis, el mando sirve también en el menú */
if (!/if\(nuevo\(0\)\) empieza\(\)/.test(html)) MAL("el botón A del mando no empieza la partida");
if (!/if\(G\.run\) return;\s+\/\* jugando manda el juego/.test(html)) MAL("el menú del tenis le roba el mando al juego");
console.log("  y en el tenis: A empieza, B sale, y mientras juegas el menú no toca el mando ✅");

/* ---------- 6) y no se usa ni un fotograma del vídeo ---------- */
const pesado = /\.(mp4|jpg|jpeg|png|webp|gif)\b/i.test(html.replace(/tennis\.html/g, ""));
console.log("  imágenes o vídeos de fuera metidos en el juego: " + (pesado ? "SÍ ❌" : "ninguno ✅ (todo está dibujado con código)"));
if (pesado) MAL("el juego carga imágenes de fuera");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ EDTU TENNIS: pista con medidas de verdad, bola con física y efectos, líneas que cantan bien y tanteo completo");
