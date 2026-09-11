/* 🧪 prueba de los JUGADORES 3D y de la calidad 2K de EDTU TENNIS.
   Aquí no se trocea nada: se ejecuta el juego ENTERO en un navegador de mentira, cuyo lienzo
   apunta todo lo que se dibuja y avisa si algo sale con coordenadas rotas (NaN) o con radios
   negativos, que en un navegador de verdad cortan el dibujo a medias.
   Se ejecuta con:  node test_tennis_3d.js                                                     */
const fs = require("fs"), vm = require("vm");
const html = fs.readFileSync("tennis.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };

/* ---------- el navegador de mentira ---------- */
const chivato = { nan: 0, negativos: 0, dibujos: 0, textos: [] };
const numero = v => { if (typeof v === "number" && !Number.isFinite(v)) chivato.nan++; };
const guardaCtx = {};
const ctx = new Proxy(guardaCtx, {
  get: (o, k) => {
    if (k === "createLinearGradient") return (...a) => { a.forEach(numero); return { addColorStop: () => {} }; };
    if (k === "createRadialGradient") return (...a) => { a.forEach(numero); if (a[2] < 0 || a[5] < 0) chivato.negativos++; return { addColorStop: () => {} }; };
    if (k === "arc") return (x, y, r) => { numero(x); numero(y); numero(r); if (!(r >= 0)) chivato.negativos++; chivato.dibujos++; };
    if (k === "ellipse") return (x, y, rx, ry) => { [x, y, rx, ry].forEach(numero); if (!(rx >= 0) || !(ry >= 0)) chivato.negativos++; chivato.dibujos++; };
    if (k === "moveTo" || k === "lineTo") return (x, y) => { numero(x); numero(y); };
    if (k === "stroke" || k === "fill") return () => { chivato.dibujos++; };
    if (k === "fillText" || k === "strokeText") return (t, x, y) => { numero(x); numero(y); chivato.textos.push(String(t)); };
    if (k === "measureText") return () => ({ width: 10 });
    if (k in o) return o[k];
    return () => {};
  },
  set: (o, k, v) => { if (k === "lineWidth") numero(v); o[k] = v; return true; }
});
const elementos = {};
const elemento = id => elementos[id] = elementos[id] || {
  id, innerHTML: "", textContent: "", style: {}, width: 0, height: 0,
  classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, toggle(c, v) { v ? this._s.add(c) : this._s.delete(c); }, contains(c) { return this._s.has(c); } },
  addEventListener() {}, querySelectorAll: () => [], getContext: () => ctx, focus() {}
};
const guardado = {};
let fotogramas = [];
function navegador(ancho, alto, dpr, tactil) {
  const env = {
    innerWidth: ancho, innerHeight: alto, devicePixelRatio: dpr,
    document: { getElementById: elemento },
    localStorage: { getItem: k => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); } },
    navigator: { getGamepads: () => [], maxTouchPoints: tactil ? 5 : 0 },
    matchMedia: q => ({ matches: !!tactil && q.indexOf("coarse") >= 0 }),
    performance: { now: () => 0 },
    addEventListener() {}, requestAnimationFrame: cb => { fotogramas.push(cb); return 1; },
    location: { href: "" }, console, Math, Date, JSON, parseInt, parseFloat, String, Number, Array, Object, Set, Map
  };
  if (tactil) env.ontouchstart = null;
  env.window = env; env.parent = env; env.globalThis = env;
  return env;
}
const codigo = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>")) +
  "\n;globalThis.__T={G,CAM,PUBLICO,GENTE,esqueleto,pintaJugador,animaJugador,escalaRender,vigilaRendimiento,resize,dibuja,HUESO,nuevoPartido,preparaSaque,golpea," +
  "calidad:()=>CALIDAD,ponCalidad:c=>{CALIDAD=c},ancho:()=>W,alto:()=>H};";
function arranca(ancho, alto, dpr, tactil) {
  const env = navegador(ancho, alto, dpr, tactil);
  vm.createContext(env);
  fotogramas = [];
  vm.runInContext(codigo, env);
  return env.__T;
}

/* ---------- 1) 🖥️ LA CALIDAD: 2K de verdad ---------- */
for (const k in guardado) delete guardado[k];
const T = arranca(1920, 1080, 1, false);
console.log("  en un PC con pantalla 1920×1080, la calidad por defecto es «" + T.calidad() + "» y el lienzo se dibuja a " + T.ancho() + "×" + T.alto());
if (T.calidad() !== "k2") MAL("en el ordenador no arranca en 2K");
if (T.ancho() < 2560 || T.alto() < 1440) MAL("el 2K no llega a 2560×1440");
const casos = [
  ["NORMAL en 1080p", "normal", 1920, 1080, 1, [1920, 1080]],
  ["ALTA en 1080p", "alta", 1920, 1080, 1, [2400, 1350]],
  ["2K en 1080p", "k2", 1920, 1080, 1, [2560, 1440]],
  /* 1366×768 no es exactamente 16:9: al llegar a 1440 de alto, el ancho pasa a 2561. Bien: el requisito es "por lo menos 2K" */
  ["2K en un portátil 1366×768", "k2", 1366, 768, 1, [2561, 1440]],
  ["2K en un monitor 4K", "k2", 3840, 2160, 1, [3840, 2160]],
  ["2K en un celular 390×844 (x3)", "k2", 390, 844, 3, [1170, 2532]]
];
for (const [nom, cal, w, h, d, esperado] of casos) {
  const k = T.escalaRender(cal, w, h, d);
  const res = [Math.round(w * k), Math.round(h * k)];
  console.log("    " + nom.padEnd(32) + " → " + res.join("×"));
  if (res[0] !== esperado[0] || res[1] !== esperado[1]) MAL(nom + ": sale " + res.join("×") + " y debería ser " + esperado.join("×"));
}
/* 🪜 la escalera NUNCA se da la vuelta: en ninguna pantalla ALTA puede dar más que 2K (el menú
      llegó a enseñar "ALTA 2847×1473" y "2K 2783×1440", que no tiene sentido) */
let escalonesMal = 0;
for (const [w, h] of [[1920, 1080], [1898, 982], [1366, 768], [2560, 1440], [3840, 2160], [1280, 800], [390, 844], [820, 1180], [5120, 2880]])
  for (const d of [1, 1.25, 1.5, 2, 3]) {
    const [kn, ka, kk] = ["normal", "alta", "k2"].map(c => T.escalaRender(c, w, h, d));
    if (!(kn <= ka + 1e-9 && ka <= kk + 1e-9)) { escalonesMal++; if (escalonesMal < 4) console.log("    ✗ " + w + "×" + h + " x" + d + ": normal " + kn.toFixed(2) + " · alta " + ka.toFixed(2) + " · 2K " + kk.toFixed(2)); }
  }
console.log("  la escalera NORMAL ≤ ALTA ≤ 2K se cumple en 45 pantallas distintas: " + (escalonesMal === 0 ? "sí ✅" : "NO, falla en " + escalonesMal));
if (escalonesMal) MAL("hay pantallas donde ALTA da más que 2K, o NORMAL más que ALTA");
/* un portátil con pantalla táctil sigue siendo un ordenador: arranca en 2K */
for (const k in guardado) delete guardado[k];
{ const env = navegador(1920, 1080, 1, false); env.navigator.maxTouchPoints = 10; vm.createContext(env); vm.runInContext(codigo, env);
  console.log("  un portátil con pantalla táctil (pero ratón y teclado) arranca en «" + env.__T.calidad() + "»");
  if (env.__T.calidad() !== "k2") MAL("un portátil táctil se trata como un celular"); }
/* en el celular arranca en ALTA para no gastar batería */
for (const k in guardado) delete guardado[k];
const Tcel = arranca(390, 844, 3, true);
console.log("  en un celular arranca en «" + Tcel.calidad() + "» (para no gastar batería), a " + Tcel.ancho() + "×" + Tcel.alto());
if (Tcel.calidad() !== "alta") MAL("en el celular arranca en " + Tcel.calidad() + " en vez de ALTA");

/* si va a tirones, baja sola un escalón... pero solo si va a tirones de verdad */
for (const k in guardado) delete guardado[k];
const Tr = arranca(1920, 1080, 1, false);
Tr.G.run = true;
for (let i = 0; i < 400; i++) Tr.vigilaRendimiento(16.7);
console.log("  jugando fluido (60 fps, 400 fotogramas): sigue en «" + Tr.calidad() + "»");
if (Tr.calidad() !== "k2") MAL("baja la calidad aunque vaya fluido");
for (let i = 0; i < 100; i++) Tr.vigilaRendimiento(40);
console.log("  a tirones (25 fps, 4 segundos): baja a «" + Tr.calidad() + "» y el lienzo pasa a " + Tr.ancho() + "×" + Tr.alto() + " · aviso: «" + Tr.G.msg + "»");
if (Tr.calidad() !== "alta") MAL("no baja la calidad cuando va a tirones");
for (let i = 0; i < 100; i++) Tr.vigilaRendimiento(900);
console.log("  con la pestaña escondida (fotogramas de 900 ms): se queda en «" + Tr.calidad() + "» (eso no es ir lento)");
if (Tr.calidad() !== "alta") MAL("confunde la pestaña escondida con ir lento");

/* ---------- 2) 🦴 EL ESQUELETO: los huesos nunca se estiran ---------- */
T.nuevoPartido();
let J = T.G.jug, IA = T.G.ia;                             /* DESPUÉS de nuevoPartido: crea jugadores nuevos */
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
let peorHueso = 0, poses = 0, conNaN = 0, piesMal = 0, cabezaMal = 0, raquetaSuelta = 0;
const alturasCabeza = [];
function revisa(p) {
  const S = T.esqueleto(p);
  poses++;
  const nums = JSON.stringify(S).match(/-?\d+\.?\d*(e-?\d+)?|null|NaN/g) || [];
  if (JSON.stringify(S).includes("null")) conNaN++;
  const huesos = [
    [S.caderaD, S.rodD, T.HUESO.muslo], [S.rodD, S.pieD, T.HUESO.pierna],
    [S.caderaI, S.rodI, T.HUESO.muslo], [S.rodI, S.pieI, T.HUESO.pierna],
    [S.hombroD, S.codoD, T.HUESO.brazo], [S.codoD, S.manoD, T.HUESO.antebrazo],
    [S.hombroI, S.codoI, T.HUESO.brazo], [S.codoI, S.manoI, T.HUESO.antebrazo]];
  for (const [a, b, l] of huesos) {
    const d = dist(a, b);
    if (!Number.isFinite(d)) { conNaN++; continue; }
    peorHueso = Math.max(peorHueso, Math.abs(d - l));
  }
  if (S.pieD.y < -0.001 || S.pieD.y > 0.40 || S.pieI.y < -0.001 || S.pieI.y > 0.40) piesMal++;
  alturasCabeza.push(S.cabeza.y);
  if (S.cabeza.y < 1.40 || S.cabeza.y > 1.95) cabezaMal++;
  if (dist(S.raqueta.mango, S.manoD) > 1e-9) raquetaSuelta++;
  return S;
}
for (const p of [J, IA]) {
  for (const velA of [0, 3, 6.5, 9]) for (let fase = 0; fase < 6.3; fase += 0.35) {
    p.velA = velA; p.zancada = fase;
    for (const carga of [0, 0.5, 1]) { p.cargando = carga > 0; p.carga = carga; p.swing = 0; revisa(p); }
    p.cargando = false;
    for (const lado of [1, -1]) for (const sw of [0.30, 0.2, 0.1, 0.01]) { p.swing = sw; p._swingIni = 0.30; p.ladoGolpe = lado; p.fueSaque = false; revisa(p); }
    for (const sw of [0.30, 0.15, 0.01]) { p.swing = sw; p._swingIni = 0.30; p.fueSaque = true; revisa(p); }
    p.swing = 0; p.fueSaque = false;
    p.salto = 0.14; revisa(p); p.salto = 0;
  }
}
console.log("  " + poses + " posturas revisadas (corriendo, esperando, cargando, derecha, revés, saque, saltito)");
console.log("    lo que más se estira un hueso: " + (peorHueso * 1000).toFixed(3) + " mm · posturas con números rotos: " + conNaN);
if (peorHueso > 0.001) MAL("hay huesos que se estiran " + (peorHueso * 1000).toFixed(1) + " mm (las rodillas o los codos se deforman)");
if (conNaN) MAL("hay posturas con coordenadas rotas");
console.log("    pies por debajo del suelo o volando: " + piesMal + " · la cabeza va de " + Math.min(...alturasCabeza).toFixed(2) + " a " + Math.max(...alturasCabeza).toFixed(2) + " m de alto");
if (piesMal) MAL(piesMal + " posturas con los pies bajo tierra o por los aires");
if (cabezaMal) MAL(cabezaMal + " posturas con la cabeza a una altura imposible");
console.log("    raquetas que se sueltan de la mano: " + raquetaSuelta);
if (raquetaSuelta) MAL("la raqueta no va pegada a la mano");

/* ---------- 3) 🏃 la animación se MUEVE de verdad ---------- */
const reset = p => { p.velA = 0; p.zancada = 0; p.cargando = false; p.carga = 0; p.swing = 0; p.salto = 0; p.fueSaque = false; };
reset(J);
const quieto = T.esqueleto(J);
J.velA = 6.5; J.zancada = 0; const corriendoA = T.esqueleto(J);
J.zancada = Math.PI / 2; const corriendoB = T.esqueleto(J);
console.log("  corriendo, el pie derecho avanza " + (dist(corriendoA.pieD, corriendoB.pieD) * 100).toFixed(0) + " cm en media zancada (quieto no se mueve)");
if (dist(corriendoA.pieD, corriendoB.pieD) < 0.15) MAL("al correr las piernas no se mueven");
reset(J); J.ladoGolpe = 1; J.swing = 0.30; J._swingIni = 0.30;
const derechaIni = T.esqueleto(J); J.swing = 0.01; const derechaFin = T.esqueleto(J);
reset(J); J.ladoGolpe = -1; J.swing = 0.30; J._swingIni = 0.30;
const revesIni = T.esqueleto(J);
const recorrido = dist(derechaIni.manoD, derechaFin.manoD);
console.log("  en una DERECHA la mano recorre " + (recorrido * 100).toFixed(0) + " cm · empieza atrás por la derecha (x=" + (derechaIni.manoD.x - J.x).toFixed(2) +
            ") y en el REVÉS empieza por la izquierda (x=" + (revesIni.manoD.x - J.x).toFixed(2) + ")");
if (recorrido < 0.5) MAL("el golpe casi no mueve el brazo");
if (!((derechaIni.manoD.x - J.x) > (revesIni.manoD.x - J.x))) MAL("la derecha y el revés salen por el mismo lado");
/* el tronco gira al cargar */
reset(J); const sinCargar = T.esqueleto(J); J.cargando = true; J.carga = 1; J.ladoGolpe = 1; const cargado = T.esqueleto(J);
const giroHombros = Math.atan2(cargado.hombroD.z - cargado.hombroI.z, cargado.hombroD.x - cargado.hombroI.x) -
                    Math.atan2(sinCargar.hombroD.z - sinCargar.hombroI.z, sinCargar.hombroD.x - sinCargar.hombroI.x);
console.log("  al cargar, los hombros se enrollan " + Math.abs(giroHombros * 180 / Math.PI).toFixed(0) + "° (y la raqueta se va atrás: z=" + (cargado.manoD.z - J.z).toFixed(2) + ")");
if (Math.abs(giroHombros) < 0.5) MAL("al cargar el tronco no gira");
if (!(cargado.manoD.z < J.z)) MAL("al cargar la raqueta no se va hacia atrás");
/* cada uno mira hacia la red */
reset(J); reset(IA);
const Sj = T.esqueleto(J), Si = T.esqueleto(IA);
console.log("  tú miras hacia la red (adelante z=" + Sj.fZ.toFixed(2) + ") y el rival hacia ti (z=" + Si.fZ.toFixed(2) + ")");
if (!(Sj.fZ > 0.8) || !(Si.fZ < -0.8)) MAL("algún jugador está de espaldas a la red");
/* el saltito del rival cuando le pegas */
reset(IA); T.G.bola.x = J.x; T.G.bola.z = J.z; T.G.bola.y = 1;
T.golpea(J, "plano", 0.6, 0, false, 0.5);
console.log("  en cuanto le pegas, el rival hace el saltito de espera: salto=" + (IA.salto || 0).toFixed(2));
if (!(IA.salto > 0)) MAL("el rival no hace el split step");
/* y el saltito se nota en el cuerpo: a mitad de salto, la pelvis está más alta */
reset(IA); const enSuelo = T.esqueleto(IA).pelvis.y;
IA.salto = 0.14; const enAire = T.esqueleto(IA).pelvis.y;
console.log("  a mitad del saltito la pelvis sube " + ((enAire - enSuelo) * 100).toFixed(1) + " cm");
if (!(enAire > enSuelo + 0.05)) MAL("el saltito no levanta al jugador");
IA.salto = 0;

/* ---------- 4) 🎨 pintar de verdad: nada roto en ninguna postura ---------- */
chivato.nan = 0; chivato.negativos = 0; chivato.dibujos = 0; chivato.textos = [];
T.nuevoPartido();
let pintadas = 0;
for (const p of [J, IA]) for (let fase = 0; fase < 6.3; fase += 0.6) for (const sw of [0, 0.25, 0.05]) for (const lado of [1, -1]) {
  p.velA = 5; p.zancada = fase; p.swing = sw; p._swingIni = 0.3; p.ladoGolpe = lado; p.cargando = sw === 0 && fase > 3; p.carga = 0.7;
  chivato.dibujos = 0;
  T.pintaJugador(p, p === J ? "#4fd97a" : "#d94f4f", p === J ? "#1e6a35" : "#7a2020", p === J);
  if (chivato.dibujos < 40) MAL("un jugador casi no se dibuja (" + chivato.dibujos + " trazos)");
  pintadas++;
}
console.log("  " + pintadas + " jugadores pintados en posturas distintas: " + chivato.nan + " números rotos · " + chivato.negativos + " radios negativos");
if (chivato.nan) MAL("al pintar salen coordenadas rotas (NaN)");
if (chivato.negativos) MAL("al pintar salen radios negativos: el navegador cortaría el dibujo");
console.log("  el número de la espalda se pinta: " + chivato.textos.includes("7"));
if (!chivato.textos.includes("7")) MAL("no se ve el número en la espalda");
/* y la escena entera, en el menú y jugando */
chivato.nan = 0; chivato.negativos = 0;
T.dibuja();
T.G.run = true; T.nuevoPartido();
J = T.G.jug; IA = T.G.ia;
for (let i = 0; i < 90; i++) { T.animaJugador(J, 1 / 60); T.animaJugador(IA, 1 / 60); T.dibuja(); }
console.log("  la escena entera, 90 fotogramas: " + chivato.nan + " números rotos · " + chivato.negativos + " radios negativos");
if (chivato.nan || chivato.negativos) MAL("la escena completa dibuja cosas rotas");

/* ---------- 5) 🎥 EL ENCUADRE: tu jugador se ve ENTERO ----------
   La primera captura a 2K enseñó que tu jugador salía CORTADO por abajo (solo se le veía la
   gorra), porque la cámara estaba demasiado cerca. Ninguna prueba lo había visto: todas medían
   el cuerpo, ninguna miraba si cabía en la pantalla. Aquí se proyectan los pies y la cabeza de
   los dos jugadores en todos los sitios a los que pueden llegar, con la cámara en sus extremos */
{
  for (const k in guardado) delete guardado[k];
  const envF = navegador(1920, 1080, 1, false); vm.createContext(envF); vm.runInContext(codigo, envF);
  const TF = envF.__T, Wf = TF.ancho(), Hf = TF.alto();
  let fuera = [], vistos = 0;
  const cabe = (etiqueta, x, y, z) => {
    const q = envF.proyecta(x, y, z); vistos++;
    if (!q || q.x < 0 || q.x > Wf || q.y < 0 || q.y > Hf) fuera.push(etiqueta + " (" + (q ? Math.round(q.x) + "," + Math.round(q.y) : "detrás de la cámara") + ")");
  };
  const camX = TF.CAM.x, camY = TF.CAM.y;
  for (const cx of [-3.4, 0, 3.4]) {
    TF.CAM.x = cx;
    for (const x of [-6.5, 0, 6.5]) {
      for (const z of [-4.0, -1.4, 5, 11]) { cabe("tú pies x=" + x + " z=" + z, x, 0, z); cabe("tú cabeza x=" + x + " z=" + z, x, 1.9, z); }
      for (const z of [17.8, 24.8, 25.9]) { cabe("rival pies x=" + x + " z=" + z, x, 0, z); cabe("rival cabeza x=" + x + " z=" + z, x, 1.9, z); }
    }
  }
  TF.CAM.x = camX;
  console.log("  el encuadre: " + vistos + " puntos de los dos jugadores (pies y cabeza, en todos sus sitios, con la cámara a los dos lados) · fuera de la pantalla: " + fuera.length);
  if (fuera.length) { MAL("hay jugadores que se salen de la pantalla: " + fuera.slice(0, 4).join(" · ")); }
  /* y la pista llena bien la pantalla, como en la tele */
  const fondoRival = envF.proyecta(0, 0, 23.77).y / Hf, tuFondo = envF.proyecta(0, 0, 0).y / Hf, pies = envF.proyecta(0, 0, -1.4).y / Hf, cabeza = envF.proyecta(0, 1.75, -1.4).y / Hf;
  console.log("  en la pantalla: la línea del rival al " + Math.round(fondoRival * 100) + "% de la altura, la tuya al " + Math.round(tuFondo * 100) +
              "% · tu jugador va del " + Math.round(cabeza * 100) + "% (cabeza) al " + Math.round(pies * 100) + "% (pies)");
  if (!(fondoRival > 0.10 && fondoRival < 0.35)) MAL("la línea de fondo del rival queda en un sitio raro (" + Math.round(fondoRival * 100) + "%)");
  if (!(tuFondo > 0.60 && tuFondo < 0.88)) MAL("tu línea de fondo queda en un sitio raro (" + Math.round(tuFondo * 100) + "%)");
  if (!(pies < 0.97)) MAL("tus pies quedan pegados al borde de abajo");
  if (!(pies - cabeza > 0.07)) MAL("tu jugador sale diminuto (" + Math.round((pies - cabeza) * 100) + "% de la altura)");
}

/* ---------- 6) 🏟️ EL PÚBLICO Y LOS JUECES ----------
   La captura enseñó un juez plantado DELANTE de tu jugador (entre la cámara y tú), una valla
   oscura cruzando la parte de abajo, jueces con forma de bolo y un público de puntitos sobre una
   pared gris. Aquí se exige lo contrario */
{
  for (const k in guardado) delete guardado[k];
  const envP = navegador(1920, 1080, 1, false); vm.createContext(envP); vm.runInContext(codigo, envP);
  const TP = envP.__T, P = TP.PUBLICO, GE = TP.GENTE;
  const filas = new Set(P.map(q => q.fila + "|" + q.grada)).size;
  console.log("  en las gradas hay " + P.length + " personas, sentadas en " + filas + " filas de escalones");
  if (P.length < 1500) MAL("hay muy poco público (" + P.length + ")");
  if (filas < 20) MAL("las gradas no tienen escalones de verdad");
  const enPista = P.filter(q => Math.abs(q.x) < 10.97 / 2 + 2 && q.z > -4 && q.z < 23.77 + 4).length;
  console.log("  público sentado dentro de la pista: " + enPista);
  if (enPista) MAL("hay público sentado dentro de la pista");
  const estorban = GE.filter(g => Math.abs(g.x) < 3.5 && g.z < 0.5);
  console.log("  jueces o recogepelotas entre la cámara y tu jugador: " + estorban.length);
  if (estorban.length) MAL("hay alguien plantado entre la cámara y tu jugador");
  if (html.includes("{z:-3.4, x0:-13")) MAL("sigue la valla de tu lado cruzando la parte de abajo de la pantalla");
  if (!html.includes("function pintaPersona(")) MAL("los jueces siguen siendo cápsulas sueltas (falta pintaPersona)");
  const tramoEstadio = html.slice(html.indexOf("function pintaEstadio("), html.indexOf("function pintaCielo("));
  if (!tramoEstadio.includes("G.msgT")) MAL("el público no celebra los puntos");
  /* y pintar a toda esa gente tiene que ser barato: se agrupa por colores en vez de rellenar uno a uno */
  chivato.nan = 0; chivato.negativos = 0;
  envP.pintaEstadio();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 60; i++) { TP.G.t += 1 / 60; envP.pintaEstadio(); }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 60;
  console.log("  pintar las gradas con toda la gente cuesta " + ms.toFixed(2) + " ms por fotograma (hay 16,6 para ir a 60 fps)");
  if (ms > 4) MAL("el público es demasiado caro de pintar (" + ms.toFixed(1) + " ms)");
  if (chivato.nan || chivato.negativos) MAL("el público dibuja cosas rotas (" + chivato.nan + " NaN, " + chivato.negativos + " radios negativos)");
  /* los jueces, pintados como personas: sin nada roto */
  chivato.nan = 0; chivato.negativos = 0;
  envP.pintaGente();
  console.log("  " + GE.length + " jueces, recogepelotas y el juez de silla, pintados como personas: " + chivato.nan + " NaN · " + chivato.negativos + " radios negativos");
  if (chivato.nan || chivato.negativos) MAL("los jueces dibujan cosas rotas");
}

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ jugadores con esqueleto de verdad (huesos que no se estiran, derecha, revés, saque, carrera y saltito) y calidad 2K comprobada");
