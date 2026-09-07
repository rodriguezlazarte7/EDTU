/* 🧪 prueba de las ayudas de combate nuevas de STAR WARS:
   · el aviso del borde te dice POR DÓNDE te acaban de dar (y no se amontona)
   · la mira marca cuando aciertas, y de otro color cuando derribas
   · las naves revientan con onda expansiva (más gorda la de los jefes)
   · el aviso de "te tienen a la cola" se enciende solo si te apuntan DESDE ATRÁS
   Se ejecuta con:  node test_starwars_combate.js                                              */
const fs = require("fs");
const html = fs.readFileSync("starwars.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const trozo = (a, b) => { const i = html.indexOf(a), j = html.indexOf(b, i); if (i < 0 || j < 0) { console.log("❌ no encuentro " + a); process.exit(1); } return html.slice(i, j); };

/* ---------- las matemáticas de vectores del propio juego ---------- */
const v3 = (x, y, z) => ({ x, y, z });
const sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const len = a => Math.hypot(a.x, a.y, a.z);
const norm = a => { const l = len(a) || 1; return v3(a.x / l, a.y / l, a.z / l); };

/* la nave mirando hacia +z, con la derecha en +x y arriba en +y */
const G = { pos: v3(0, 0, 0), base: { r: v3(1, 0, 0), u: v3(0, 1, 0), f: v3(0, 0, 1) }, enem: [], t: 0, cola: 0 };

/* ---------- 1) el aviso de POR DÓNDE te dan ---------- */
const codigoAviso = trozo("const DANOS_DIR=[];", "function pintaDanos(){");
const A = new Function("G", "sub", "dot", "v3", codigoAviso + "; return { DANOS_DIR, avisoDano, danosCorren };")(G, sub, dot, v3);

const grados = a => Math.round(((a * 180 / Math.PI) + 360) % 360);
A.avisoDano(v3(500, 0, 500));            /* delante y a la DERECHA */
const derecha = grados(A.DANOS_DIR[A.DANOS_DIR.length - 1].ang);
A.avisoDano(v3(-500, 0, 500));           /* delante y a la IZQUIERDA */
const izquierda = grados(A.DANOS_DIR[A.DANOS_DIR.length - 1].ang);
A.avisoDano(v3(0, 500, 500));            /* desde ARRIBA */
const arriba = grados(A.DANOS_DIR[A.DANOS_DIR.length - 1].ang);
console.log("  el arco del aviso: desde la derecha " + derecha + "° · desde la izquierda " + izquierda + "° · desde arriba " + arriba + "°");
if (!(derecha > 45 && derecha < 135)) MAL("el disparo de la derecha no marca la derecha");
if (!(izquierda > 225 && izquierda < 315)) MAL("el disparo de la izquierda no marca la izquierda");
if (!(arriba < 20 || arriba > 340)) MAL("el disparo de arriba no marca arriba");
/* uno de detrás se marca abajo y se pinta distinto */
A.DANOS_DIR.length = 0;
A.avisoDano(v3(0, 0, -600));
console.log("  desde ATRÁS: se marca a " + grados(A.DANOS_DIR[0].ang) + "° y sale con el color de 'por detrás': " + A.DANOS_DIR[0].detras);
if (!A.DANOS_DIR[0].detras) MAL("no distingue los disparos de la espalda");

/* no se amontonan: diez tiros del mismo sitio son UN aviso */
A.DANOS_DIR.length = 0;
for (let i = 0; i < 10; i++) A.avisoDano(v3(500, 0, 500));
console.log("  diez tiros desde el mismo sitio → " + A.DANOS_DIR.length + " aviso(s) en pantalla, no diez");
if (A.DANOS_DIR.length !== 1) MAL("se amontonan los avisos del mismo sitio");
/* y desde cuatro sitios distintos, cuatro avisos */
A.DANOS_DIR.length = 0;
[[500, 0, 500], [-500, 0, 500], [0, 500, 500], [0, -500, 500]].forEach(p => A.avisoDano(v3(...p)));
console.log("  cuatro tiros desde cuatro sitios → " + A.DANOS_DIR.length + " avisos");
if (A.DANOS_DIR.length !== 4) MAL("no marca cada dirección por separado");
/* nunca crecen sin control */
for (let i = 0; i < 200; i++) A.avisoDano(v3(Math.random() * 1000 - 500, Math.random() * 1000 - 500, Math.random() * 1000 - 500));
console.log("  200 tiros de todas partes → " + A.DANOS_DIR.length + " avisos como mucho");
if (A.DANOS_DIR.length > 6) MAL("los avisos crecen sin control");
/* y se apagan solos */
for (let i = 0; i < 120; i++) A.danosCorren(1 / 60);
console.log("  dos segundos después: " + A.DANOS_DIR.length + " avisos (se apagan solos)");
if (A.DANOS_DIR.length) MAL("los avisos no se apagan");

/* ---------- 2) la mira marca los aciertos ---------- */
const codigoHit = trozo("let HIT_T=0, HIT_KILL=0;", "function golpe(d,desde)");
let dibujos = 0;
const ctx = new Proxy({}, { get: (o, k) => (k === "stroke" ? () => dibujos++ : () => {}), set: () => true });
const M = new Function("ctx", "CX", "CY", codigoHit + "; return { marcaImpacto, pintaImpacto, ver:()=>[HIT_T,HIT_KILL] };")(ctx, 100, 100);
M.pintaImpacto(1 / 60);
console.log("  sin acertar nada, la mira no dibuja marcas: " + (dibujos === 0));
if (dibujos) MAL("dibuja la marca sin haber acertado");
M.marcaImpacto(false); dibujos = 0; M.pintaImpacto(1 / 60);
console.log("  al acertar: " + dibujos + " palitos alrededor de la mira");
if (dibujos !== 4) MAL("la marca de acierto no son cuatro palitos");
M.marcaImpacto(true);
const [t1, k1] = M.ver();
console.log("  al DERRIBAR: la marca dura más (" + k1.toFixed(2) + " s contra " + t1.toFixed(2) + " s) y sale en rojo");
if (!(k1 > t1)) MAL("derribar no se nota más que acertar");
let vueltas = 0; while (M.ver().some(v => v > 0) && vueltas < 200) { M.pintaImpacto(1 / 60); vueltas++; }
console.log("  y se apaga sola en " + vueltas + " fotogramas");
if (vueltas >= 200) MAL("la marca no se apaga");

/* ---------- 3) las naves revientan con onda expansiva ---------- */
const muerte = trozo("if(e.ardiendo>0){ if(agoniza(e,dt)){", "} continue; }");
/* se cuentan las ondas que se sueltan de verdad: una siempre, y otra más si es un jefe */
const ondasCaza = (muerte.match(/G\.ondas\.push/g) || []).length - (/if\(grande\) G\.ondas\.push/.test(muerte) ? 1 : 0);
const ondasJefe = (muerte.match(/G\.ondas\.push/g) || []).length;
console.log("  al reventar: " + ondasCaza + " onda para un caza · " + ondasJefe + " para un jefe, y la suya viaja a " +
            (muerte.match(/grande\?(\d+):(\d+)/) || [, "?", "?"])[1] + " en vez de a " + (muerte.match(/grande\?(\d+):(\d+)/) || [, , "?"])[2]);
if (ondasJefe <= ondasCaza) MAL("el jefe no revienta más fuerte que un caza");
if (!/G\.ondas\.push/.test(muerte)) MAL("las naves ya no sueltan onda expansiva");
if (!/const grande=\(e\.k===CLASES\.jefe\|\|e\.k===CLASES\.nodriza\)/.test(muerte)) MAL("el jefe revienta igual que un caza cualquiera");
if (!/grande\?420:240/.test(muerte)) MAL("la onda del jefe no es más grande");

/* ---------- 4) "te tienen a la cola" ---------- */
const cola = trozo("{ let cola=null, peor=0;", "buscaBlanco();");
const C = new Function("G", "sub", "norm", "dot", "len", "dt",
  cola.replace("buscaBlanco();", "") + "; return G.cola;");
/* un enemigo pegado a tu espalda y apuntándote */
G.enem = [{ ardiendo: 0, p: v3(0, 0, -300), b: { f: v3(0, 0, 1) } }];   /* detrás, mirando hacia ti */
console.log("  enemigo a la espalda apuntándote → aviso: " + C(G, sub, norm, dot, len, 1 / 60));
if (C(G, sub, norm, dot, len, 1 / 60) !== 1) MAL("no avisa del que te tiene a la cola");
/* uno delante, aunque te apunte, no cuenta: a ese ya lo ves */
G.cola = 0;
G.enem = [{ ardiendo: 0, p: v3(0, 0, 400), b: { f: v3(0, 0, -1) } }];
console.log("  enemigo de frente apuntándote → aviso: " + C(G, sub, norm, dot, len, 1 / 60) + " (a ese ya lo ves)");
if (C(G, sub, norm, dot, len, 1 / 60) !== 0) MAL("avisa de los de delante, que ya se ven");
/* uno detrás pero mirando para otro lado, tampoco */
G.cola = 0;
G.enem = [{ ardiendo: 0, p: v3(0, 0, -300), b: { f: v3(1, 0, 0) } }];
console.log("  enemigo detrás pero mirando a otro lado → aviso: " + C(G, sub, norm, dot, len, 1 / 60));
if (C(G, sub, norm, dot, len, 1 / 60) !== 0) MAL("avisa aunque no te esté apuntando");
/* uno detrás y apuntando, pero lejísimos, tampoco */
G.cola = 0;
G.enem = [{ ardiendo: 0, p: v3(0, 0, -2000), b: { f: v3(0, 0, 1) } }];
console.log("  enemigo detrás apuntando pero a 2000 de distancia → aviso: " + C(G, sub, norm, dot, len, 1 / 60));
if (C(G, sub, norm, dot, len, 1 / 60) !== 0) MAL("avisa de enemigos lejísimos");
/* y el aviso se va apagando cuando te lo quitas de encima */
G.cola = 1; G.enem = [];
const apaga = []; for (let i = 0; i < 40; i++) apaga.push(C(G, sub, norm, dot, len, 1 / 60));
console.log("  te lo quitas de encima: el aviso baja de 1 a " + G.cola.toFixed(2) + " y se apaga");
if (G.cola > 0.01) MAL("el aviso se queda encendido para siempre");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ combate: sabes por dónde te dan, la mira te confirma los aciertos, las naves revientan con onda y te avisan si te tienen a la cola");
