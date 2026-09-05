/* 🧪 prueba del salto de salida, del menú de pausa dentro del hiperespacio y del bug del ESCAPE:
   · al escapar te quedas 5 segundos en el hiperespacio (y metido en el túnel casi todo el rato)
   · apretar ESCAPE ya NO hace saltar el menú de pausa por detrás
   · en pausa se ve el túnel corriendo detrás del menú, y al seguir se apaga
   · los enemigos disparan en ráfagas de tres
   Se ejecuta con:  node test_starwars_pausa.js                                                  */
const fs = require("fs");
const html = fs.readFileSync("starwars.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const trozo = (a, b) => { const i = html.indexOf(a), j = html.indexOf(b, i); if (i < 0 || j < 0) { console.log("❌ no encuentro " + a); process.exit(1); } return html.slice(i, j); };

/* ---------- 1) el salto dura 5 segundos ---------- */
const DURA = +html.match(/const SALIDA_DURA=([\d.]+);/)[1];
const HIPER = +html.match(/const HIPER_DURA=([\d.]+);/)[1];
console.log("  el salto de salida dura " + DURA + " s (antes 2)");
if (DURA < 5) MAL("el salto no dura los 5 segundos que pidió David");

const G = { pos: { x: 0, y: 0, z: 0 }, base: { f: { x: 0, y: 0, z: 1 } }, vel: 200, yaw: 1, pitch: 1 };
let volvio = -1, hiper = 0, saliendo = 0.0001, t = 0;
const codigo = trozo("function saltoCorre(dt){", "function hiperEmpieza(");
const paso = new Function("G", "add", "mul", "vuelveAlInicio", "HIPER_DURA", "SALIDA_DURA", codigo + `
  return function(dt, est){ saliendo=est.saliendo; hiper=est.hiper; saltoCorre(dt); est.saliendo=saliendo; est.hiper=hiper; };`
)(G, (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }), (v, k) => ({ x: v.x * k, y: v.y * k, z: v.z * k }), () => { volvio = t; }, HIPER, DURA);

const est = { saliendo: 0.0001, hiper: 0 };
const muestras = [];
for (let i = 0; i < 400 && volvio < 0; i++) { t += 1 / 60; paso(1 / 60, est); if (Math.abs(t - Math.round(t * 2) / 2) < 0.009) muestras.push(t.toFixed(1) + "s→" + (est.hiper / HIPER * 100).toFixed(0) + "%"); }
console.log("  metido en el túnel: " + muestras.slice(0, 10).join(" · "));
console.log("  vuelves al cuartel a los " + volvio.toFixed(2) + " s");
if (volvio < 4.8) MAL("vuelve antes de los 5 segundos");
if (volvio > 5.4) MAL("tarda demasiado en volver");
/* y casi todo ese rato estás DENTRO del túnel, no acelerando */
let dentro = 0; volvio = -1; est.saliendo = 0.0001; est.hiper = 0; t = 0;
for (let i = 0; i < 400 && volvio < 0; i++) { t += 1 / 60; paso(1 / 60, est); if (est.hiper >= HIPER * 0.98) dentro += 1 / 60; }
console.log("  de esos " + DURA + " s, " + dentro.toFixed(1) + " s son ya dentro del túnel a tope");
if (dentro < 3) MAL("casi no estás dentro del túnel (solo acelerando)");

/* ---------- 2) el bug del ESCAPE ---------- */
const guardia = html.match(/document\.addEventListener\("pointerlockchange",\(\)=>\{([^}]*)\}\);/)[1];
console.log("  al soltarse el ratón: " + guardia.trim().replace(/\s+/g, " ").slice(0, 92));
if (!/saliendo<=0/.test(guardia)) MAL("apretar ESCAPE seguirá sacando la pausa por detrás del salto");
/* lo probamos de verdad: simulamos que el navegador suelta el ratón mientras saltas */
let pausado = false;
const manejador = new Function("G", "saliendo", "document", "cv", "pausar",
  "return ()=>{ " + guardia + " };");
manejador({ run: true, over: false, paused: false }, 3.0, { pointerLockElement: null }, {}, () => { pausado = true; })();
console.log("  suelto el ratón MIENTRAS salto → ¿sale la pausa? " + pausado + " (tiene que ser false)");
if (pausado) MAL("¡sigue saliendo la pausa encima del salto!");
manejador({ run: true, over: false, paused: false }, 0, { pointerLockElement: null }, {}, () => { pausado = true; })();
console.log("  suelto el ratón volando normal → ¿sale la pausa? " + pausado + " (tiene que ser true)");
if (!pausado) MAL("ahora ya no pausa nunca al soltar el ratón");

/* ---------- 3) la pausa, dentro del hiperespacio ---------- */
const linea = trozo("PAUSA_K += ((G.paused", "if(PAUSA_K>0.004)");
console.log("  el túnel de la pausa: " + linea.trim());
const sube = new Function("G", "PAUSA_K", "return (()=>{ " + linea + " return PAUSA_K; })();");
let K = 0, frames = 0;
while (K < 0.5 && frames < 400) { K = sube({ paused: true, over: false }, K); frames++; }
console.log("  al pausar, el túnel aparece a fondo en " + frames + " fotogramas (" + (frames / 60).toFixed(1) + " s): entra suave, no de golpe");
if (frames < 5) MAL("el túnel aparece de golpe (marea)");
if (frames > 180) MAL("el túnel tarda demasiado en aparecer");
let apaga = 0; while (K > 0.01 && apaga < 400) { K = sube({ paused: false, over: false }, K); apaga++; }
console.log("  al darle a SEGUIR, el túnel se apaga en " + apaga + " fotogramas");
if (apaga >= 400) MAL("el túnel de la pausa no se apaga al seguir jugando");
if (!/if\(!TUNEL\.length\) tunelArranca\(\)/.test(html)) MAL("si no has saltado nunca, la pausa saldría sin túnel");
/* y el menú tiene su caja de cabina */
if (!/<div class="screen hide" id="pause"><div class="caja">/.test(html)) MAL("el menú de pausa no tiene la caja nueva");
if (!/MOTORES EN ESPERA · HIPERESPACIO ESTABLE/.test(html)) MAL("falta el rótulo de la cabina");
for (const b of ["resumeBtn", "quitBtn", "pauseState"]) if (!new RegExp('id="' + b + '"').test(html)) MAL("¡el menú nuevo perdió " + b + "!");
console.log("  ✅ el menú nuevo conserva SEGUIR, SALIR y el marcador (no falla nada de lo de antes)");

/* ---------- 4) ráfagas de tres ---------- */
const fuego = trozo("if(e.fuego<=0 && d<(bomba?", "if(!mute) sfx(\"laser\"");
const raf = +fuego.match(/const RAFAGA=bomba\?\d+:(\d+);/)[1];
const alc = +fuego.match(/d<\(bomba\?\d+:(\d+)\)/)[1];
const mira = +fuego.match(/alTiro>([\d.]+)/)[1];
const cad = fuego.match(/e\.fuego=\(([\d.]+)\+Math\.random\(\)\*([\d.]+)\)/);
console.log("  enemigos: ráfagas de " + raf + " tiros · alcance " + alc + " · puntería exigida " + mira + " · cada " + cad[1] + "-" + (+cad[1] + +cad[2]).toFixed(2) + " s");
if (raf < 3) MAL("no disparan en ráfagas de tres");
if (alc < 1900) MAL("no disparan desde más lejos que antes");
if (mira > 0.62) MAL("no disparan con menos puntería que antes");
const ritmo = +cad[1] + +cad[2] / 2;
console.log("  → cada nave suelta " + (raf / ritmo).toFixed(1) + " tiros por segundo (antes, con una ráfaga cada 1,8 s de un tiro: 0,6)");
if (raf / ritmo < 6) MAL("no hay muchos más disparos");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ cinco segundos de hiperespacio, la pausa dentro del túnel, el ESCAPE ya no saca la pausa vieja y el cielo es una tormenta de rayos");
