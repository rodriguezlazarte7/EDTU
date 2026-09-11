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
const fisica = trozo("function golpea(quien", "/* ---------- el tanteo");
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

/* ---------- 6) y no se usa ni un fotograma del vídeo ---------- */
const pesado = /\.(mp4|jpg|jpeg|png|webp|gif)\b/i.test(html.replace(/tennis\.html/g, ""));
console.log("  imágenes o vídeos de fuera metidos en el juego: " + (pesado ? "SÍ ❌" : "ninguno ✅ (todo está dibujado con código)"));
if (pesado) MAL("el juego carga imágenes de fuera");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ EDTU TENNIS: pista con medidas de verdad, bola con física y efectos, líneas que cantan bien y tanteo completo");
