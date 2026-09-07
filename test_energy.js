/* 🧪 prueba de ENERGY (el antiguo IMÁN): que el nombre esté cambiado en todos lados, que el
   récord de David NO se pierda, que todo se pinte en azul y rojo, y que al morir el núcleo
   REVIENTE como el avión de FLY (fuego, humo y trozos girando) pero SIN paracaidistas.
   Se ejecuta con:  node test_energy.js                                                        */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

/* ---------- 1) el nombre nuevo, en todos los sitios ---------- */
const sitios = [
  ["el botón del menú", /id="pickIma"[^>]*>⚡ ENERGY/],
  ["la pantalla del juego", /<div id="imaFs" class="gfull"><h2>⚡ ENERGY<\/h2>/],
  ["el nombre interno", /NOM:"⚡ ENERGY"/],
  ["la lista de récords", /\["⚡ ENERGY","edtu_ima_best"/],
  ["el marcador de la partida", /\$\("imaHud"\)\.textContent="⚡ "/]
];
sitios.forEach(([q, re]) => { const ok = re.test(html); console.log("  " + q + ": " + (ok ? "⚡ ENERGY" : "❌ sigue con el nombre viejo")); if (!ok) MAL("falta el nombre nuevo en " + q); });
if (/🧲 IMÁN|MAGNETRÓN/.test(html)) MAL("queda algún nombre viejo suelto por ahí");
/* y lo más importante: la clave del récord NO cambia */
console.log("  la clave del récord sigue siendo edtu_ima_best: " + /LS:"edtu_ima_best"/.test(html) + " (el récord de David se conserva)");
if (!/LS:"edtu_ima_best"/.test(html)) MAL("¡cambió la clave del récord! David perdería su marca");

/* ---------- 2) el juego, en azul y rojo ---------- */
const ini = html.indexOf('const Ima=miniArma({'), fin = html.indexOf('},"ima");', ini);
const codigo = html.slice(ini, fin);
const colores = (codigo.match(/#[0-9a-f]{6}|rgba?\([^)]*\)/gi) || []);
const rgb = c => {
  let m = c.match(/^#(..)(..)(..)$/); if (m) return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  m = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/); return m ? [+m[1], +m[2], +m[3]] : null;
};
let azules = 0, rojos = 0, otros = [];
for (const c of colores) {
  const v = rgb(c); if (!v) continue;
  const [r, g, b] = v;
  if (Math.max(r, g, b) - Math.min(r, g, b) < 40) continue;      /* blancos y grises: no cuentan */
  if (b > r + 25) azules++;
  else if (r > b + 25) rojos++;
  else otros.push(c);
}
console.log("  colores del juego: " + azules + " azules · " + rojos + " rojos · " + otros.length + " de otro color" + (otros.length ? " (" + otros.slice(0, 4).join(", ") + ")" : ""));
if (!azules || !rojos) MAL("no usa los dos colores");
if (otros.length > 2) MAL("quedan colores que no son ni azul ni rojo: " + otros.slice(0, 5).join(", "));
if (/#ff6ec7|#1b0620|#3d0f31|#ffe066/.test(codigo)) MAL("quedan los rosas y amarillos del diseño viejo");

/* ---------- 2b) ni un paréntesis en los botones del menú ---------- */
const botones = [...html.matchAll(/class="btn pickgame"[^>]*>([^<]*)</g)].map(m => m[1].trim());
const conParentesis = botones.filter(b => /\(/.test(b));
console.log("  botones del menú: " + botones.length + " · con paréntesis: " + conParentesis.length + (conParentesis.length ? " (" + conParentesis.join(" · ") + ")" : ""));
if (conParentesis.length) MAL("quedan paréntesis en los botones: " + conParentesis.join(" · "));

/* ---------- 2c) fuera los círculos de atracción, pero el difuminado rojo se queda ---------- */
/* solo el trozo que DIBUJA el campo (el primer "if(this.iman" es el de la física, no vale) */
const haz = codigo.slice(codigo.indexOf("/* ---- el campo magnético"), codigo.indexOf("/* ---- las CÉLULAS"));
const arcos = (haz.match(/c\.arc\(/g) || []).length;
const rellenos = (haz.match(/c\.fill\(\)/g) || []).length;
console.log("  el campo magnético dibuja " + arcos + " círculo(s) y " + rellenos + " difuminado(s)");
if (/for\(let i=0;i<3;i\+\+\)/.test(haz)) MAL("siguen los tres círculos viajando por el haz");
if (/Math\.sin\(t\*0\.22\)|Math\.sin\(t\*0\.3\)/.test(haz)) MAL("siguen los anillos latiendo");
if ((haz.match(/c\.stroke\(\)/g) || []).length > 1) MAL("quedan circulitos dibujados con línea");
if (!/createRadialGradient/.test(haz) || !/255,\s*(120|60)/.test(haz)) MAL("se perdió el difuminado rojo, que David quería conservar");
console.log("  ✅ sin circulitos girando, con el difuminado rojo intacto");

/* ---------- 3) lo ponemos a correr de verdad ---------- */
const nada = () => {};
const pintado = { fill: 0, stroke: 0, fillRect: 0, translate: 0 };
const ctx = new Proxy({}, { get: (o, k) => {
  if (k === "createLinearGradient" || k === "createRadialGradient") return () => ({ addColorStop: nada });
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

/* el armazón compartido, la música, el juego y el remate que limpia la explosión al salir */
const marco = html.slice(html.indexOf("function miniArma(J,id,ancho,alto){"), html.indexOf("\n/* 🌩️ TORMENTA"));
const musica = html.slice(html.indexOf("function miniMus("), html.indexOf("function miniArma("));
const limpieza = html.slice(fin, html.indexOf("\n\n", fin));
const Ima = new Function(musica + marco + "\n" + codigo + limpieza + "\nreturn Ima;")();

Ima.open(); Ima.start();
const arriba = Ima.y;
Ima.pinchos = []; Ima.estrellas = [];
Ima.iman = true; Ima.dedo = { x: Ima.x, y: 20 };
for (let i = 0; i < 40; i++) Ima.tick();
console.log("  el campo magnético tira del núcleo: y " + Math.round(arriba) + " → " + Math.round(Ima.y));
if (!(Ima.y < arriba)) MAL("el campo ya no atrae el núcleo");

/* ---------- 3b) la CADENA: encadenar células multiplica ---------- */
const coge = (veces) => { for (let i = 0; i < veces; i++) { Ima.estrellas = [{ x: Ima.x, y: Ima.y }]; Ima.tick(); } };
Ima.setup(); Ima.run = true; Ima.pinchos = [];
coge(3);
const con3 = { score: Ima.score, multi: Ima.multi };
coge(1); const con4 = { score: Ima.score, multi: Ima.multi };
coge(4); const con8 = Ima.multi;
coge(4); const con12 = Ima.multi;
console.log("  la cadena: 3 células → x" + con3.multi + " · 4 → x" + con4.multi + " · 8 → x" + con8 + " · 12 → x" + con12);
if (!(con3.multi === 1 && con4.multi === 2 && con8 === 3 && con12 === 4)) MAL("los multiplicadores no van como deben (x2 a las 4, x3 a las 8, x4 a las 12)");
console.log("  y cada célula vale por el multiplicador: la 4ª sumó " + (con4.score - con3.score) + " puntos");
if (con4.score - con3.score !== 2) MAL("la célula no vale por el multiplicador");
/* si dejas escapar una célula, la cadena se rompe */
Ima.estrellas = [{ x: -30, y: Ima.y }]; Ima.tick();
console.log("  dejo escapar una célula por la izquierda → cadena " + Ima.cadena + " · multiplicador x" + Ima.multi);
if (Ima.multi !== 1) MAL("dejar escapar una célula no rompe la cadena");
/* y si tardas demasiado, se enfría sola */
Ima.setup(); Ima.run = true; Ima.pinchos = []; coge(5);
const antesFrio = Ima.multi;
/* vaciando las células y sujetando el núcleo en el aire (si no, se estrella y ya no cuenta
   nada): así lo único que puede romper la cadena es el reloj */
for (let i = 0; i < 200; i++) { Ima.estrellas = []; Ima.pinchos = []; Ima.y = Ima.H / 2; Ima.vy = 0; Ima.tick(); }
console.log("  espero 200 fotogramas sin coger nada → x" + antesFrio + " se enfría a x" + Ima.multi);
if (Ima.multi !== 1) MAL("la cadena no se enfría sola");

/* ---------- 3c) el ROCE: pasar cerca de una mina sin tocarla ---------- */
Ima.setup(); Ima.run = true; Ima.estrellas = [];
Ima.pinchos = [{ x: Ima.x - 4, y: Ima.y + 26, r: 11, gir: 0, rozada: false }];
const puntosAntes = Ima.score;
Ima.tick();
console.log("  paso rozando una mina (a 26 px): +" + (Ima.score - puntosAntes) + " punto · destello rojo " + Ima.rojo.toFixed(2) + " · sigo vivo " + Ima.run);
if (Ima.score - puntosAntes !== 1) MAL("rozar la mina no da el punto");
if (!(Ima.rojo > 0)) MAL("el roce no enciende el destello rojo");
if (!Ima.run) MAL("¡el roce te mata! tiene que ser solo un susto");
/* y no se puede farmear la misma mina dos veces */
const trasRoce = Ima.score; Ima.tick();
console.log("  la misma mina, otra vez: +" + (Ima.score - trasRoce) + " (no se puede repetir)");
if (Ima.score !== trasRoce) MAL("la misma mina da puntos una y otra vez");
/* pero tocarla de verdad sigue matando */
Ima.setup(); Ima.run = true; Ima.estrellas = [];
Ima.pinchos = [{ x: Ima.x, y: Ima.y, r: 11, gir: 0, rozada: false }];
Ima.tick();
console.log("  tocarla de verdad: " + (Ima.boom ? "revienta ✅" : "no pasa nada ❌"));
if (!Ima.boom) MAL("tocar la mina ya no mata");
Ima.boom = null; Ima.sacude = 0;

/* ---------- 4) al morir, REVIENTA ---------- */
Ima.setup(); Ima.run = true; Ima.score = 7; Ima.estrellas = [];
Ima.pinchos = [{ x: Ima.x, y: Ima.y, r: 12, gir: 0 }];
Ima.tick();                                                     /* choca con la mina */
const b = Ima.boom;
console.log("  al chocar: " + (b ? b.P.length + " pedazos volando" : "nada") + " · sacudida " + Ima.sacude);
if (!b) MAL("el núcleo no revienta");
else {
  const tipos = t => b.P.filter(p => p.t === t).length;
  console.log("  la explosión del avión, igual: " + tipos("fuego") + " de fuego · " + tipos("humo") + " de humo · " + tipos("trozo") + " trozos girando");
  if (!tipos("fuego") || !tipos("humo") || !tipos("trozo")) MAL("le falta alguna parte de la explosión");
}
/* sin los comentarios: si no, el propio comentario "sin paracaidistas" daría un falso positivo */
const codigoSinComentarios = codigo.replace(/\/\*[\s\S]*?\*\//g, "");
if (/saltaGente|pintaGente|genteTick|this\.gente/.test(codigoSinComentarios)) MAL("¡salen paracaidistas! David los quería solo en FLY");
console.log("  paracaidistas: ninguno (eso se queda en FLY) ✅");
/* el récord se guarda YA, sin esperar a que acabe la película */
console.log("  récord guardado al momento: " + guardado["edtu_ima_best"] + " · la partida ya terminó: " + !Ima.run + " · pero el bucle sigue vivo: " + Ima.sigue());
if (guardado["edtu_ima_best"] !== "7") MAL("no guarda el récord al reventar");
if (Ima.run) MAL("la partida sigue corriendo mientras revienta");
if (!Ima.sigue()) MAL("el bucle se corta y no se vería la explosión");

/* ---------- 5) la explosión se ve, se acaba y no deja nada colgado ---------- */
pintado.fill = 0;
let vueltas = 0;
while (Ima.boom && vueltas < 400) { Ima.tick(); vueltas++; }
console.log("  la explosión dura " + vueltas + " fotogramas (" + (vueltas / 60).toFixed(1) + " s) y se apaga sola · " + pintado.fill + " manchas pintadas");
if (vueltas < 30) MAL("la explosión se acaba en un suspiro");
if (vueltas >= 400) MAL("¡la explosión no se acaba nunca!");
if (pintado.fill < 100) MAL("la explosión casi no se dibuja");
console.log("  al acabar: sacudida " + Ima.sacude + " · ¿sigue pidiendo fotogramas? " + Ima.sigue());
if (Ima.sacude !== 0) MAL("se queda temblando");
if (Ima.sigue()) MAL("el bucle no se para al acabar la explosión");

/* y si sales a mitad de la explosión, se limpia */
Ima.setup(); Ima.run = true; Ima.pinchos = [{ x: Ima.x, y: Ima.y, r: 12, gir: 0 }]; Ima.tick();
Ima.close();
console.log("  salgo a mitad de la explosión → queda explosión: " + !!Ima.boom + " · relojes de música: " + relojes);
if (Ima.boom) MAL("la explosión se queda a medias al salir");
if (relojes !== 0) MAL("quedan " + relojes + " reloj(es) de música corriendo");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ ENERGY: nombre nuevo, récord intacto, todo azul y rojo, y el núcleo revienta como el avión (sin paracaídas)");
