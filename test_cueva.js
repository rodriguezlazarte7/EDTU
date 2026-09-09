/* 🧪 prueba de CUEVA: que el túnel se cierre, que los cristales den 5, que los murciélagos
   aparezcan solo cuando toca y solo te ASUSTEN (no te matan: lo pidió David), que la roca mordida
   NO se meta en el hueco (lo que ves tiene que ser más generoso que lo que te mata), y que al
   chocar contra la roca la nave reviente sin colgarse.
   Se ejecuta con:  node test_cueva.js                                                          */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

const nada = () => {};
const pintado = { fill: 0, stroke: 0, fillRect: 0 };
const ctx = new Proxy({}, { get: (o, k) => {
  if (k === "createLinearGradient" || k === "createRadialGradient") return () => ({ addColorStop: nada });
  /* 🐛 el lienzo DE VERDAD lanza un error si le pides un círculo de radio negativo, y eso corta
        el dibujo a medias (fue justo el bug de la nave que desaparecía al coger un cristal).
        El de mentira hace lo mismo, para que las pruebas lo cacen */
  if (k === "arc") return (x, y, r) => { if (!(r >= 0)) throw new Error("IndexSizeError: radio negativo (" + r + ")"); pintado.arc = (pintado.arc || 0) + 1; };
  if (k in pintado) return () => { pintado[k]++; };
  return nada; }, set: () => true });
const guardado = {};
const elems = {};
const el = id => elems[id] = elems[id] || { id, textContent: "", innerHTML: "", width: 380, height: 520,
  classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); } },
  getContext: () => ctx, addEventListener: nada };
global.$ = el;
global.localStorage = { getItem: k => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); } };
global.innerWidth = 400; global.innerHeight = 800;
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = nada;
global.gBeep = nada; global.edtuPlayDay = nada; global.edtuMiniAvg = () => "";
global.navigator = {}; global.setTimeout = () => 0;
let relojes = 0; global.setInterval = () => { relojes++; return 1; }; global.clearInterval = () => { relojes--; };
global.window = { AudioContext: function () {
  const par = () => ({ setValueAtTime: nada, linearRampToValueAtTime: nada, exponentialRampToValueAtTime: nada, cancelScheduledValues: nada, value: 0 });
  const nodo = () => ({ connect: nada, disconnect: nada, start: nada, stop: nada, type: "", frequency: par(), gain: par() });
  return { currentTime: 0, state: "running", resume: nada, destination: nodo(), createOscillator: nodo, createGain: nodo }; } };

const ini = html.indexOf('const Cue=miniArma({'), fin = html.indexOf('},"cue");', ini);
const codigo = html.slice(ini, fin);
const marco = html.slice(html.indexOf("function miniArma(J,id,ancho,alto){"), html.indexOf("\n/* 🌩️ TORMENTA"));
const musica = html.slice(html.indexOf("function miniMus("), html.indexOf("function miniArma("));
const limpieza = html.slice(fin, html.indexOf("\n\n", fin));
const Cue = new Function(musica + marco + "\n" + codigo + limpieza + "\nreturn Cue;")();

Cue.open(); Cue.start();

/* ---------- 1) el túnel se va cerrando ---------- */
const hueco0 = Cue.hueco;
for (let i = 0; i < 400; i++) { Cue.cristales = []; Cue.murcis = []; Cue.estala = []; Cue.y = Cue.pared[10].c; Cue.vy = 0; Cue.tick(); }
console.log("  el túnel se cierra: de " + Math.round(hueco0) + " a " + Math.round(Cue.hueco) + " en 400 fotogramas (y NUNCA baja del 30% de " + Cue.H + " = " + Math.round(Cue.H * 0.3) + ")");
if (!(Cue.hueco < hueco0)) MAL("el túnel no se estrecha");
/* se aprieta hasta el fondo para ver dónde para de verdad */
for (let i = 0; i < 6000; i++) { Cue.cristales = []; Cue.murcis = []; Cue.estala = []; const c = Cue.pared.find(p => Math.abs(p.x - 60) < 4); if (c) { Cue.y = c.c; Cue.vy = 0; } if (Cue.boom) break; Cue.tick(); }
console.log("  jugando 100 segundos seguidos, el hueco se queda en " + Math.round(Cue.hueco) + " (el 30% es " + Math.round(Cue.H * 0.3) + "): ahí deja de cerrarse");
if (Cue.hueco < Cue.H * 0.299) MAL("el túnel se cierra más de lo permitido: sería injugable");
/* y la velocidad tampoco se dispara */
const velMax = 2.4 + Math.min(1.5, Cue.score * 0.012);
console.log("  con " + Cue.score + " puntos la cueva corre a " + velMax.toFixed(2) + " (el tope es 3,9; antes era 4,8)");
if (velMax > 3.91) MAL("se acelera más de lo previsto");

/* ---------- 2) la roca mordida nunca se mete en el hueco ---------- */
const mordidas = Cue.pared.filter(p => p.ja !== undefined);
const malos2 = Cue.pared.filter(p => p.ja < 0 || p.jb < 0).length;
console.log("  roca mordida: " + mordidas.length + " columnas · dientes hacia el hueco: " + malos2 + " (tienen que ser 0)");
if (!mordidas.length) MAL("la roca no tiene mordidas: sigue siendo una línea lisa");
if (malos2) MAL("hay dientes metidos en el hueco: te mataría algo que NO se ve");
const maxDiente = Math.max(...Cue.pared.map(p => Math.max(p.ja, p.jb)));
console.log("  el diente más grande mide " + maxDiente.toFixed(1) + " px, y va SIEMPRE hacia dentro de la piedra");

/* ---------- 3) los cristales dan 5 ---------- */
Cue.setup(); Cue.run = true; Cue.estala = []; Cue.murcis = [];
Cue.cristales = [{ x: 60, y: Cue.y, br: 0 }];
const antes = Cue.score;
Cue.tick();
console.log("  cojo un cristal: +" + (Cue.score - antes) + " puntos · cristales que quedan: " + Cue.cristales.length + " · chispas: " + Cue.chispas.filter(c => c.cr).length);
if (Cue.score - antes < 5) MAL("el cristal no da 5 puntos");
if (Cue.cristales.length) MAL("el cristal no desaparece al cogerlo");
if (!Cue.chispas.some(c => c.cr)) MAL("coger el cristal no suelta chispas");

/* ---------- 4) los murciélagos: solo a partir de 40 puntos, y solo asustan ---------- */
/* volando se van sumando puntos solos, así que hay que fijar el marcador en cada vuelta:
   si no, en 240 fotogramas pasa de 10 a 50 y la prueba se engaña sola */
Cue.setup(); Cue.run = true; Cue.estala = []; Cue.cristales = [];
for (let i = 0; i < 240; i++) { Cue.score = 10; Cue.y = Cue.pared[10].c; Cue.vy = 0; Cue.cristales = []; Cue.tick(); }
const conPocos = Cue.murcis.length;
Cue.setup(); Cue.run = true; Cue.estala = []; Cue.cristales = [];
for (let i = 0; i < 240; i++) { Cue.score = 60; Cue.y = Cue.pared[10].c; Cue.vy = 0; Cue.cristales = []; Cue.tick(); }
console.log("  murciélagos con 10 puntos: " + conPocos + " · con 60 puntos: " + Cue.murcis.length);
if (conPocos !== 0) MAL("salen murciélagos antes de los 40 puntos");
if (!Cue.murcis.length) MAL("no salen murciélagos ni pasados los 40 puntos");
/* y hacen eses, no van rectos */
const m = Cue.murcis[0]; const ys = [];
for (let i = 0; i < 40; i++) { Cue.tick(); if (Cue.murcis.includes(m)) ys.push(m.y); }
console.log("  vuelan haciendo eses: entre " + Math.round(Math.min(...ys)) + " y " + Math.round(Math.max(...ys)) + " de alto");
if (Math.max(...ys) - Math.min(...ys) < 10) MAL("los murciélagos van en línea recta");
/* 🦇 chocar con uno ASUSTA, pero no mata (David lo pidió así) */
Cue.setup(); Cue.run = true; Cue.estala = []; Cue.cristales = []; Cue.score = 20;
Cue.murcis = [{ x: 60, y: Cue.y, base: Cue.y, fase: 0, al: 1 }];
const vyAntes = Cue.vy;
Cue.tick();
console.log("  choco con un murciélago: ¿revienta? " + !!Cue.boom + " · ¿sigo volando? " + Cue.run +
            " · puntos " + Cue.score + " (tenía 20) · murciélagos que quedan: " + Cue.murcis.length +
            " · rótulo: «" + Cue.aviso + "»");
if (Cue.boom) MAL("¡el murciélago te sigue reventando!");
if (!Cue.run) MAL("el murciélago acaba la partida");
if (Cue.score !== 17) MAL("el susto no cuesta los 3 puntos");
if (Cue.murcis.length) MAL("el murciélago no sale espantado");
if (Cue.vy === vyAntes) MAL("el susto no te empuja");
if (!/susto/.test(Cue.aviso)) MAL("no avisa del susto");
if (!(Cue.sacude > 0)) MAL("el susto no sacude la cámara");
/* y el temblor se pasa solo */
for (let i = 0; i < 90; i++) { Cue.murcis = []; Cue.estala = []; const c = Cue.pared.find(p => Math.abs(p.x - 60) < 4); if (c) { Cue.y = c.c; Cue.vy = 0; } Cue.tick(); }
console.log("  segundo y medio después, el temblor está en " + Cue.sacude.toFixed(2) + " (se pasa solo)");
if (Cue.sacude !== 0) MAL("la pantalla se queda temblando para siempre");
/* pero las estalactitas SÍ siguen matando */
Cue.setup(); Cue.run = true; Cue.murcis = []; Cue.cristales = [];
const col2 = Cue.pared.find(p => Math.abs(p.x - 60) < 4);
Cue.y = col2.c - col2.h / 2 + 40;
Cue.estala = [{ x: 60, arriba: true, l: 60, gota: 0 }];
Cue.tick();
console.log("  y una estalactita: " + (Cue.boom ? "sigue reventando ✅" : "ya no mata ❌"));
if (!Cue.boom) MAL("las estalactitas dejaron de matar");

/* ---------- 5) al chocar, la nave revienta y se recupera ---------- */
const tipos = t => Cue.boom.P.filter(p => p.t === t).length;
console.log("  la explosión: " + tipos("fuego") + " de fuego · " + tipos("roca") + " trozos de roca · " + tipos("humo") + " de humo · sacudida " + Cue.sacude);
if (!tipos("fuego") || !tipos("roca") || !tipos("humo")) MAL("a la explosión le falta alguna parte");
console.log("  la partida acabó: " + !Cue.run + " · el bucle sigue para ver la explosión: " + Cue.sigue());
if (Cue.run) MAL("la partida sigue mientras revienta");
if (!Cue.sigue()) MAL("el bucle se corta y no se ve la explosión");
let vueltas = 0; while (Cue.boom && vueltas < 400) { Cue.tick(); vueltas++; }
console.log("  la explosión dura " + vueltas + " fotogramas y se apaga sola");
if (vueltas < 30 || vueltas >= 400) MAL("la explosión no dura lo que debe");

/* ---------- 6) el fondo con profundidad y la linterna ---------- */
console.log("  capas de fondo: " + Cue.fondo.length + " (a " + Cue.fondo.map(f => f.vel).join(" y ") + " de velocidad, más lentas que la pared) · motas de polvo: " + Cue.polvo.length);
if (Cue.fondo.length < 2) MAL("no hay fondo con profundidad");
if (Cue.fondo.some(f => f.vel >= 2.6)) MAL("el fondo va tan rápido como la pared: no se notaría la profundidad");
if (!/LA LINTERNA de la nave/.test(codigo)) MAL("la nave no lleva linterna");
if (!/gotas/.test(codigo)) MAL("no caen gotas de las estalactitas");

/* ---------- 6b) 🐛 EL BUG DE LA NAVE QUE DESAPARECÍA ----------
   Lo encontró David: al coger un cristal, la nave se esfumaba. Entraban 10 chispas de golpe,
   la lista pasaba de 14 a 24, y como solo se quitaba UNA por fotograma las chispas viejas
   vivían el doble y su brillo se iba a NEGATIVO. Un círculo de radio negativo hace saltar al
   lienzo de verdad, y el dibujo se cortaba justo antes de pintar la nave.
   Aquí se juega una partida larga cogiendo cristales sin parar: si el radio se va a negativo,
   el lienzo de mentira lanza el mismo error y esta prueba se cae. */
Cue.setup(); Cue.run = true;
let reventones = 0, fotograma = 0;
for (let i = 0; i < 3000 && !Cue.boom; i++) {
  Cue.murcis = []; Cue.estala = [];
  const col = Cue.pared.find(p => Math.abs(p.x - 60) < 4);
  if (col) { Cue.y = col.c; Cue.vy = 0; }
  if (i % 50 === 0) Cue.cristales.push({ x: 60, y: Cue.y, br: 0 });   /* un cristal cada 50 fotogramas */
  try { Cue.tick(); } catch (e) { reventones++; fotograma = i; break; }
}
console.log("  50 segundos cogiendo cristales sin parar: " + (reventones ? "💥 el dibujo revienta en el fotograma " + fotograma : "sin un solo fallo de dibujo") +
            " · chispas vivas: " + Cue.chispas.length + " · el brillo más bajo es " + Math.min(...Cue.chispas.map(c => c.v)).toFixed(2));
if (reventones) MAL("¡vuelve el bug de la nave que desaparece al coger un cristal!");
if (Cue.chispas.some(c => c.v <= 0)) MAL("quedan chispas ya apagadas en la lista: acabarían en radio negativo");

/* ---------- 7) nada se acumula ni queda colgado ---------- */
Cue.setup(); Cue.run = true;
for (let i = 0; i < 900; i++) { Cue.y = Cue.pared[10] ? Cue.pared[10].c : Cue.y; Cue.vy = 0; if (Cue.boom) break; Cue.tick(); }
const tam = { pared: Cue.pared.length, estala: Cue.estala.length, cristales: Cue.cristales.length, murcis: Cue.murcis.length, gotas: Cue.gotas.length, chispas: Cue.chispas.length };
console.log("  tras 15 segundos: " + Object.entries(tam).map(([k, v]) => k + " " + v).join(" · "));
Object.entries(tam).forEach(([k, v]) => { if (v > 200) MAL(k + " crece sin parar (" + v + ")"); });
Cue.close();
console.log("  al salir: explosión " + !!Cue.boom + " · relojes de música " + relojes);
if (Cue.boom) MAL("la explosión se queda a medias al salir");
if (relojes !== 0) MAL("quedan " + relojes + " reloj(es) corriendo");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ CUEVA: se cierra, la roca muerde sin trampas, los cristales dan 5, los murciélagos asustan pero no matan, y contra la roca la nave revienta como debe");
