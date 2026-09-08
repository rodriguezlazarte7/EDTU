/* 🧪 prueba del TONEL (lo que encontró David: giraba al revés).
   Se coge la función de giro DE VERDAD del juego y la línea que la llama con tu nave, y se mira
   hacia dónde acaba inclinada la cabina al apretar cada tecla.
   Se ejecuta con:  node test_starwars_tonel.js                                                  */
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

/* la línea exacta con la que el juego mueve TU nave */
const linea = html.match(/  girar\(G\.base, G\.yaw\*G\.giro[^\n]*\n/)[0];
console.log("  la línea del juego: " + linea.trim().slice(0, 96) + "…");
const vuela = new Function("girar", "G", "cerrado", "finura", "dt", linea);

function pruebaTonel(roll) {
  const G = { base: { r: v3(1, 0, 0), u: v3(0, 1, 0), f: v3(0, 0, 1) }, yaw: 0, pitch: 0, roll, giro: 1 };
  for (let i = 0; i < 12; i++) vuela(girar, G, 1, 1, 1 / 60);
  return G.base;
}

/* ---------- el tonel a la derecha ---------- */
const der = pruebaTonel(1);
console.log("  aprieto D (o RB, el de la DERECHA): el techo de la cabina se va a x=" + der.u.x.toFixed(2) +
            " (" + (der.u.x > 0 ? "→ a la derecha ✅" : "← a la izquierda ❌") + ") · el ala derecha a y=" + der.r.y.toFixed(2) +
            " (" + (der.r.y < 0 ? "baja ✅" : "sube ❌") + ")");
if (!(der.u.x > 0.05)) MAL("apretando a la DERECHA la nave sigue girando a la izquierda");
if (!(der.r.y < -0.05)) MAL("el ala derecha sube en vez de bajar al girar a la derecha");

/* ---------- y a la izquierda ---------- */
const izq = pruebaTonel(-1);
console.log("  aprieto A (o LB, el de la IZQUIERDA): el techo se va a x=" + izq.u.x.toFixed(2) +
            " (" + (izq.u.x < 0 ? "← a la izquierda ✅" : "→ a la derecha ❌") + ")");
if (!(izq.u.x < -0.05)) MAL("apretando a la IZQUIERDA la nave gira a la derecha");

/* ---------- y sin tocar nada, no gira sola ---------- */
const quieto = pruebaTonel(0);
console.log("  sin tocar nada: el techo sigue en x=" + quieto.u.x.toFixed(3) + " (la nave no rueda sola)");
if (Math.abs(quieto.u.x) > 0.001) MAL("la nave hace el tonel ella sola");

/* ---------- los dos botones del mando, cada uno al suyo ---------- */
const mando = html.match(/const rl=\(b\(4\)\?(-?\d)\:0\)\+\(b\(5\)\?(-?\d)\:0\);/);
console.log("  el mando: LB (el de la izquierda) manda " + mando[1] + " y RB (el de la derecha) manda " + mando[2]);
const conLB = pruebaTonel(parseInt(mando[1], 10));
const conRB = pruebaTonel(parseInt(mando[2], 10));
console.log("  con LB la nave gira a la " + (conLB.u.x < 0 ? "izquierda ✅" : "derecha ❌") +
            " y con RB a la " + (conRB.u.x > 0 ? "derecha ✅" : "izquierda ❌"));
if (!(conLB.u.x < 0)) MAL("LB (izquierda) gira a la derecha");
if (!(conRB.u.x > 0)) MAL("RB (derecha) gira a la izquierda");

/* ---------- y de paso: que girar y subir el morro NO estén invertidos ---------- */
const b1 = { r: v3(1, 0, 0), u: v3(0, 1, 0), f: v3(0, 0, 1) };
girar(b1, 0.3, 0, 0);
console.log("  moviendo el ratón a la DERECHA (yaw positivo), el morro se va a x=" + b1.f.x.toFixed(2) + " (" + (b1.f.x > 0 ? "derecha ✅" : "izquierda ❌") + ")");
if (!(b1.f.x > 0)) MAL("girar con el ratón está invertido");
const b2 = { r: v3(1, 0, 0), u: v3(0, 1, 0), f: v3(0, 0, 1) };
girar(b2, 0, 0.3, 0);
console.log("  bajando el ratón (pitch positivo), el morro se va a y=" + b2.f.y.toFixed(2) + " (" + (b2.f.y < 0 ? "abajo ✅" : "arriba ❌") + ")");
if (!(b2.f.y < 0)) MAL("el morro sube cuando bajas el ratón");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ el tonel gira hacia donde aprietas: D y RB a la derecha, A y LB a la izquierda");
