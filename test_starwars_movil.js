/* 🧪 prueba de los mandos del celular, del cielo lleno de disparos y del reventón del misil:
   · arrastrar el dedo GIRA la nave (y también dirige el misil, sin soltarlo)
   · el dedo NO dispara: eso es del botón 🔫, y mantenido dispara sin parar
   · el 🔫 es el que suelta el misil
   · los enemigos disparan muchísimo más y desde más lejos
   · al reventar el misil salen fuego, metralla, humo, ondas y fogonazo, y la cámara se queda
   Se ejecuta con:  node test_starwars_movil.js                                                */
const fs = require("fs");
const html = fs.readFileSync("starwars.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

/* ---------- 1) los mandos del celular, leídos del propio archivo ---------- */
const tactil = html.slice(html.indexOf("/* 📱 táctil:"), html.indexOf("addEventListener(\"keydown\"", html.indexOf("/* 📱 táctil:")));
if (!tactil) { console.log("❌ no encuentro los mandos táctiles"); process.exit(1); }

/* los montamos de verdad, con un lienzo y unos toques de mentira */
const oyentes = {};
const cv = { addEventListener: (ev, fn) => { (oyentes[ev] = oyentes[ev] || []).push(fn); } };
const G = { yaw: 0, pitch: 0, misil: null, disparando: false, run: true, paused: false, over: false };
let disparos = 0, misilesSoltados = 0;
const ctx = { cv, G, disparar: () => disparos++, abortaMisil: () => { misilesSoltados++; G.misil = null; }, e: null };
new Function("cv", "G", "disparar", "abortaMisil", tactil)(cv, G, ctx.disparar, ctx.abortaMisil);

const toque = (id, x, y) => ({ identifier: id, clientX: x, clientY: y });
const dispara = (ev, e) => (oyentes[ev] || []).forEach(f => f(e));
const evt = (dedos, cambiados) => ({ target: cv, touches: dedos, changedTouches: cambiados || dedos, preventDefault() {}, stopPropagation() {} });

/* --- el dedo gira la nave --- */
dispara("touchstart", evt([toque(1, 100, 100)]));
console.log("  al posar el dedo: disparos = " + disparos + " (tiene que ser 0)");
if (disparos !== 0) MAL("posar el dedo dispara (eso ya no debe pasar)");
if (G.disparando) MAL("posar el dedo deja el gatillo apretado");
dispara("touchmove", evt([toque(1, 180, 100)]));
console.log("  arrastro el dedo 80 px a la derecha → giro " + G.yaw.toFixed(2));
if (!(G.yaw > 1)) MAL("el dedo no gira la nave a la derecha");
dispara("touchmove", evt([toque(1, 180, 170)]));
console.log("  y 70 px hacia abajo → morro " + G.pitch.toFixed(2));
if (!(G.pitch > 1)) MAL("el dedo no baja el morro");

/* --- un segundo dedo (el del botón) no roba el volante --- */
const yawAntes = G.yaw;
dispara("touchstart", evt([toque(1, 180, 170), toque(2, 500, 400)], [toque(2, 500, 400)]));
dispara("touchmove", evt([toque(1, 200, 170), toque(2, 900, 400)]));
console.log("  con un segundo dedo en el botón: el volante sigue siendo el primero (giro " + G.yaw.toFixed(2) + ", subió " + (G.yaw - yawAntes).toFixed(2) + ")");
if (Math.abs(G.yaw - yawAntes - 20 * 0.024) > 0.2) MAL("el segundo dedo le roba el volante al primero");

/* --- soltar el dedo bueno suelta el volante --- */
dispara("touchend", evt([], [toque(1, 200, 170)]));
const yawTrasSoltar = G.yaw;
dispara("touchmove", evt([toque(2, 900, 400)]));
if (G.yaw !== yawTrasSoltar) MAL("sigue girando después de levantar el dedo");
console.log("  al levantar el dedo, la nave deja de girar ✅");

/* --- con el misil en marcha, el dedo lo DIRIGE (antes lo soltaba) --- */
G.misil = { p: {}, b: {} }; G.yaw = 0; misilesSoltados = 0;
dispara("touchstart", evt([toque(9, 100, 100)]));
dispara("touchmove", evt([toque(9, 160, 100)]));
console.log("  con el misil: el dedo lo dirige (giro " + G.yaw.toFixed(2) + ") y NO lo suelta (soltados: " + misilesSoltados + ")");
if (misilesSoltados !== 0) MAL("tocar la pantalla suelta el misil (ese era el bug)");
if (!(G.yaw > 1)) MAL("el dedo no dirige el misil");

/* ---------- 2) el botón 🔫: mantenido dispara, y suelta el misil ---------- */
const btn = html.slice(html.indexOf('pega("tbFuego"'), html.indexOf('pega("tbTurbo"'));
console.log("  botón 🔫: " + btn.trim().replace(/\s+/g, " ").slice(0, 96));
if (!/G\.disparando=true/.test(btn)) MAL("el botón no deja el gatillo apretado");
if (!/G\.disparando=false/.test(btn)) MAL("el botón no suelta el gatillo");
if (!/G\.misil.*abortaMisil/.test(btn)) MAL("el botón 🔫 no suelta el misil");
if (!/if\(G\.disparando\) disparar\(\)/.test(html)) MAL("el bucle no dispara solo mientras mantienes");
console.log("  ✅ mantenido dispara a la cadencia de tu nave, y es el que suelta el misil");

/* ---------- 3) los enemigos disparan muchísimo más ---------- */
const linea = html.match(/if\(e\.fuego<=0 && d<\(bomba\?(\d+):(\d+)\) && alTiro>([\d.]+)\)\{\s*\n\s*e\.fuego=\(([\d.]+)\+Math\.random\(\)\*([\d.]+)\)/);
if (!linea) { MAL("no encuentro la regla de disparo enemigo"); }
else {
  const [, alcB, alc, mira, base, extra] = linea;
  const antes = { alc: 900, mira: 0.90, base: 1.0, extra: 1.6 };
  console.log("  enemigos: alcance " + antes.alc + " → " + alc + " · puntería exigida " + antes.mira + " → " + mira +
              " · una ráfaga cada " + antes.base + "-" + (antes.base + antes.extra) + " s → cada " + base + "-" + (+base + +extra) + " s");
  if (!(+alc > antes.alc * 1.4)) MAL("no disparan desde más lejos");
  if (!(+mira < antes.mira)) MAL("siguen necesitando tenerte clavado en la mira");
  const ritmoAntes = antes.base + antes.extra / 2, ritmoAhora = +base + +extra / 2;
  console.log("  → disparan " + (ritmoAntes / ritmoAhora).toFixed(1) + " veces más seguido");
  if (!(ritmoAhora < ritmoAntes / 2.5)) MAL("no disparan mucho más seguido");
  if (+alcB <= +alc) MAL("el bombardero ya no tira desde más lejos que los cazas");
}
/* y hay más naves peleando a la vez */
const tope = html.match(/const tope=Math\.min\((\d+), (\d+)\+Math\.floor\(min\*([\d.]+)\)/);
console.log("  supervivencia: caben " + tope[1] + " naves a la vez (antes 14), empezando por " + tope[2] + " (antes 4)");
if (!(+tope[1] > 14 && +tope[2] > 4)) MAL("no hay más naves a la vez");
const ola = html.match(/G\.wave\+\+; G\.quedan=Math\.max\(2, (\d+)\+G\.wave\*(\d+)/);
console.log("  campaña: cada oleada trae " + ola[1] + "+" + ola[2] + " por número de oleada (antes 3+1)");
if (!(+ola[2] >= 2)) MAL("las oleadas no son más grandes");

/* ---------- 4) el reventón del misil ---------- */
const bum = html.slice(html.indexOf("function bumMisil("), html.indexOf("function ondasCorren("));
const cuenta = re => { const m = bum.match(re); return m ? +m[1] : 0; };
const fuego = cuenta(/for\(let i=0;i<(\d+);i\+\+\).*t:"fuego"/), humo = cuenta(/for\(let i=0;i<(\d+);i\+\+\).*t:"humo"/);
const ondas = (bum.match(/G\.ondas\.push/g) || []).length;
console.log("  el misil al reventar: " + fuego + " llamas · " + humo + " de humo · " + ondas + " ondas expansivas · fogonazo: " + /G\.fogonazo/.test(bum) + " · sacudida: " + /sacude\(/.test(bum));
if (fuego < 20) MAL("poca bola de fuego");
if (humo < 10) MAL("no deja humo");
if (ondas < 2) MAL("faltan las ondas expansivas");
if (!/G\.fogonazo/.test(bum)) MAL("no hay fogonazo");
if (!/sacude\(/.test(bum)) MAL("no sacude la cámara");
/* la cámara se queda a verlo */
if (!/G\.eco=\{ p:m\.p, b:m\.b, t:0\.9 \}/.test(html)) MAL("la cámara no se queda viendo el estallido");
if (!/else if\(G\.eco&&G\.eco\.t>0\)\{ G\.pos=G\.eco\.p/.test(html)) MAL("el render no usa la cámara del eco");
console.log("  ✅ y la cámara se queda 0,9 s en el sitio para que lo veas");

/* las ondas se abren y se apagan de verdad */
const corren = html.slice(html.indexOf("function ondasCorren("), html.indexOf("let ptsTimer=0;"));
const est = { ondas: [{ p: {}, r: 6, v: 520, vida: .75, max: .75, c: "1" }], fogonazo: 1, eco: { t: 0.9 } };
const fn = new Function("G", corren + "; return ondasCorren;")(est);
for (let i = 0; i < 30; i++) fn(1 / 30);
console.log("  tras 1 segundo: ondas vivas " + est.ondas.length + " · fogonazo " + est.fogonazo.toFixed(2) + " · eco " + est.eco.t.toFixed(2));
if (est.ondas.length !== 0) MAL("las ondas no se apagan (se acumularían para siempre)");
if (est.fogonazo !== 0) MAL("el fogonazo no se apaga");
if (est.eco.t > 0) MAL("la cámara no vuelve a tu nave");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ el celular vuela con el dedo, el 🔫 dispara sin parar, el cielo está lleno de disparos y el misil revienta como debe");
