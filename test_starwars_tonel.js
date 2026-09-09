/* 🧪 prueba del TONEL.
   Historia: David dijo que iba invertido, se lo di la vuelta, lo probó... y prefiere el de SIEMPRE.
   Así que esta prueba NO decide cuál es "el bueno": comprueba que el sentido sea el que dice
   TONEL_SIGNO, que los dos lados sean contrarios entre sí, que el mando vaya igual que el teclado
   y que la nave no ruede sola. Si algún día se le da la vuelta, se cambia esa constante y ya.
   Se ejecuta con:  node test_starwars_tonel.js                                                   */
const fs = require("fs");
const html = fs.readFileSync("starwars.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const trozo = (a, b) => { const i = html.indexOf(a), j = html.indexOf(b, i); if (i < 0 || j < 0) { console.log("❌ no encuentro " + a); process.exit(1); } return html.slice(i, j); };

/* las cuentas de vectores, igual que en el juego */
const v3 = (x, y, z) => ({ x, y, z });
const add = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z);
const sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const mul = (v, k) => v3(v.x * k, v.y * k, v.z * k);
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const norm = a => { const l = Math.hypot(a.x, a.y, a.z) || 1; return v3(a.x / l, a.y / l, a.z / l); };
const cross = (a, b) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);

const girar = new Function("add", "sub", "mul", "norm", "dot", "cross",
  trozo("function girar(b,dYaw,dPitch,dRoll){", "\n}") + "\n}; return girar;")(add, sub, mul, norm, dot, cross);

const TONEL_SIGNO = parseInt(html.match(/const TONEL_SIGNO=([+-]?\d);/)[1], 10);
const comoSiempre = TONEL_SIGNO > 0;
console.log("  TONEL_SIGNO = " + (TONEL_SIGNO > 0 ? "+1" : "-1") + " → " +
            (comoSiempre ? "el de SIEMPRE (con D el ala derecha SUBE)" : "hacia donde aprietas (con D el ala derecha baja)"));

/* la línea exacta con la que el juego mueve TU nave */
const linea = html.match(/  girar\(G\.base, G\.yaw\*G\.giro[^\n]*\n/)[0];
console.log("  la línea del juego: " + linea.trim().slice(0, 92) + "…");
if (!linea.includes("TONEL_SIGNO")) MAL("la línea de vuelo ya no usa TONEL_SIGNO: cambiar el sentido dejaría de funcionar");
const vuela = new Function("girar", "G", "cerrado", "finura", "dt", "TONEL_SIGNO", linea);

function tonel(roll) {
  const G = { base: { r: v3(1, 0, 0), u: v3(0, 1, 0), f: v3(0, 0, 1) }, yaw: 0, pitch: 0, roll, giro: 1 };
  for (let i = 0; i < 12; i++) vuela(girar, G, 1, 1, 1 / 60, TONEL_SIGNO);
  return G.base;
}
const lado = b => b.u.x > 0.05 ? "derecha" : b.u.x < -0.05 ? "izquierda" : "ninguna";

/* ---------- 1) cada tecla rueda hacia el lado elegido ---------- */
const conD = tonel(1), conA = tonel(-1);
console.log("  aprieto D (o RB): la nave rueda hacia la " + lado(conD) + " (el ala derecha " + (conD.r.y > 0 ? "SUBE" : "baja") + ")");
console.log("  aprieto A (o LB): la nave rueda hacia la " + lado(conA) + " (el ala derecha " + (conA.r.y > 0 ? "sube" : "BAJA") + ")");
const esperadoD = comoSiempre ? "izquierda" : "derecha";
if (lado(conD) !== esperadoD) MAL("con D la nave rueda hacia la " + lado(conD) + ", y con este TONEL_SIGNO debería ir hacia la " + esperadoD);
if (lado(conA) === lado(conD)) MAL("las dos teclas ruedan hacia el mismo lado");
if (!(conD.r.y * conA.r.y < 0)) MAL("las dos teclas hacen lo mismo con el ala");

/* ---------- 2) sin tocar nada no rueda sola ---------- */
const quieto = tonel(0);
console.log("  sin tocar nada: el techo sigue en x=" + quieto.u.x.toFixed(3) + " (no rueda sola)");
if (Math.abs(quieto.u.x) > 0.001) MAL("la nave hace el tonel ella sola");

/* ---------- 3) el mando va igual que el teclado ---------- */
const mando = html.match(/const rl=\(b\(4\)\?(-?\d)\:0\)\+\(b\(5\)\?(-?\d)\:0\);/);
const conLB = tonel(parseInt(mando[1], 10)), conRB = tonel(parseInt(mando[2], 10));
console.log("  el mando: LB manda " + mando[1] + " y RB manda " + mando[2] + " → LB rueda como " + (lado(conLB) === lado(conA) ? "la A ✅" : "la D ❌") +
            " y RB como " + (lado(conRB) === lado(conD) ? "la D ✅" : "la A ❌"));
if (lado(conLB) !== lado(conA)) MAL("LB no hace lo mismo que la tecla A");
if (lado(conRB) !== lado(conD)) MAL("RB no hace lo mismo que la tecla D");

/* ---------- 4) y lo demás sigue sin estar invertido ---------- */
const b1 = { r: v3(1, 0, 0), u: v3(0, 1, 0), f: v3(0, 0, 1) };
girar(b1, 0.3, 0, 0);
console.log("  ratón a la derecha → el morro se va a x=" + b1.f.x.toFixed(2) + " (" + (b1.f.x > 0 ? "derecha ✅" : "izquierda ❌") + ")");
if (!(b1.f.x > 0)) MAL("girar con el ratón está invertido");
const b2 = { r: v3(1, 0, 0), u: v3(0, 1, 0), f: v3(0, 0, 1) };
girar(b2, 0, 0.3, 0);
console.log("  bajando el ratón → el morro se va a y=" + b2.f.y.toFixed(2) + " (" + (b2.f.y < 0 ? "abajo ✅" : "arriba ❌") + ")");
if (!(b2.f.y < 0)) MAL("el morro sube cuando bajas el ratón");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ el tonel va en el sentido elegido (TONEL_SIGNO " + (TONEL_SIGNO > 0 ? "+1" : "-1") + "), los dos lados son contrarios y el mando va igual que el teclado");
