/* 🧪 prueba de que el panel de WALLY se puede subir y bajar: que tenga scroll, que centre solo
   cuando cabe, que el botón de cerrar NO se vaya con el scroll, que las respuestas largas
   encojan la letra y que la flechita "▼ hay más" aparezca solo cuando hace falta.
   Se ejecuta con:  node test_wally_scroll.js                                                  */
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
let malos = 0; const MAL = m => { malos++; console.log("  FALLO: " + m); };
const regla = sel => { const i = html.indexOf(sel + "{"); if (i < 0) return ""; return html.slice(i, html.indexOf("}", i)); };

/* ---------- 1) el panel tiene scroll de verdad ---------- */
const panel = regla("#wallyFs");
const tiene = p => new RegExp(p).test(panel);
console.log("  #wallyFs → overflow-y:auto " + tiene("overflow-y:auto") + " · justify-content:flex-start " + tiene("justify-content:flex-start") + " · overscroll-behavior " + tiene("overscroll-behavior"));
if (!tiene("overflow-y:auto")) MAL("el panel sigue sin scroll: el texto largo se queda fuera");
if (tiene("justify-content:center")) MAL("sigue centrando con flex: eso RECORTA lo que se sale por arriba y no deja llegar");
if (!tiene("justify-content:flex-start")) MAL("no empieza por arriba");
if (!tiene("-webkit-overflow-scrolling:touch")) MAL("en el celular el scroll irá a tirones");
/* y aun así queda centrado cuando cabe, con el truco de los dos huecos */
const truco = /#wallyFs::before,#wallyFs::after\{content:"";margin:auto;flex:0 0 0\}/.test(html);
console.log("  sigue quedando centrado cuando cabe (truco de los dos huecos con margin:auto): " + truco);
if (!truco) MAL("perdimos el centrado cuando el contenido cabe");
if (!/#wallyFs>\*\{flex-shrink:0/.test(html)) MAL("los hijos se aplastarían en vez de dejar scroll");

/* ---------- 2) el botón de cerrar no se va con el scroll ---------- */
const cerrar = regla("#wallyFsClose");
console.log("  ✕ cerrar → " + (/position:fixed/.test(cerrar) ? "position:fixed (clavado a la pantalla)" : "position:" + (cerrar.match(/position:(\w+)/) || [, "?"])[1]));
if (!/position:fixed/.test(cerrar)) MAL("el ✕ se va con el scroll: por eso había que recargar");
if (!/z-index:[1-9]/.test(cerrar)) MAL("el ✕ puede quedar debajo del contenido");

/* ---------- 3) el texto largo se achica y parte las palabras ---------- */
const habla = regla("#wallyFs #wallySpeech");
console.log("  texto → parte palabras largas: " + /overflow-wrap:anywhere/.test(habla) + " · ancho máximo: " + /max-width/.test(habla));
if (!/overflow-wrap:anywhere/.test(habla)) MAL("una palabra larguísima desbordaría a lo ancho");
if (!/#wallyFs #wallySpeech\.largo\{font-size/.test(html)) MAL("las respuestas largas no achican la letra");
if (!/ws\.classList\.toggle\("largo", String\(txt\)\.length>240\)/.test(html)) MAL("nadie pone la clase 'largo'");
/* la regla, tal cual la aplica el código */
const pone = new Function("txt", 'const ws={cls:null,classList:{toggle:(c,v)=>{ws.cls=v?c:null;}}}; ws.classList.toggle("largo", String(txt).length>240); return ws.cls;');
console.log("  respuesta corta (40 letras) → clase " + pone("x".repeat(40)) + " · respuesta larga (400) → clase " + pone("x".repeat(400)));
if (pone("x".repeat(40)) !== null) MAL("achica la letra aunque la respuesta sea corta");
if (pone("x".repeat(400)) !== "largo") MAL("no achica la letra en las respuestas largas");

/* ---------- 4) la flechita "▼ hay más" ---------- */
const ini = html.indexOf("function wallyMiraSiHayMas(){");
if (ini < 0) { MAL("no existe el aviso de que hay más texto"); }
else {
  const codigo = html.slice(ini, html.indexOf("\n}", ini) + 2);
  const el = {};
  const nuevo = (id, extra) => el[id] = Object.assign({ id, style: {}, classList: { _v: false, toggle(c, v) { this._v = !!v; }, contains() { return this._v; } } }, extra || {});
  const $ = id => el[id];
  const mira = new Function("$", codigo + "; return wallyMiraSiHayMas;")($);

  /* cabe todo: nada de flechita */
  nuevo("wallyFs", { scrollHeight: 500, clientHeight: 800, scrollTop: 0, style: { display: "flex" } }); nuevo("wallyMas");
  mira(); console.log("  el texto cabe entero → flechita: " + el.wallyMas.classList._v);
  if (el.wallyMas.classList._v) MAL("sale la flechita aunque quepa todo");

  /* no cabe: sale */
  nuevo("wallyFs", { scrollHeight: 1600, clientHeight: 800, scrollTop: 0, style: { display: "flex" } }); nuevo("wallyMas");
  mira(); console.log("  hay 800 px de texto por debajo → flechita: " + el.wallyMas.classList._v);
  if (!el.wallyMas.classList._v) MAL("no avisa de que hay más texto abajo");

  /* ya bajaste del todo: se quita */
  nuevo("wallyFs", { scrollHeight: 1600, clientHeight: 800, scrollTop: 800, style: { display: "flex" } }); nuevo("wallyMas");
  mira(); console.log("  ya bajaste del todo → flechita: " + el.wallyMas.classList._v);
  if (el.wallyMas.classList._v) MAL("la flechita se queda puesta al llegar abajo");

  /* con el panel cerrado, jamás */
  nuevo("wallyFs", { scrollHeight: 1600, clientHeight: 800, scrollTop: 0, style: { display: "none" } }); nuevo("wallyMas");
  mira(); console.log("  panel cerrado → flechita: " + el.wallyMas.classList._v);
  if (el.wallyMas.classList._v) MAL("la flechita sale con el panel cerrado");
}

/* ---------- 5) al abrir, empieza por arriba; al contestar, la respuesta queda a la vista ---------- */
if (!/w\.scrollTop=0;/.test(html)) MAL("al abrir el panel no vuelve arriba");
if (!/ws\.scrollIntoView\(\{block:"nearest",behavior:"smooth"\}\)/.test(html)) MAL("la respuesta nueva no se pone a la vista");
console.log("  ✅ se abre por arriba y cada respuesta nueva se pone a la vista sola");

/* ---------- 6) en pantallas bajas la cara se achica para dejar sitio al texto ---------- */
const chica = html.indexOf("@media (max-height:620px)");
console.log("  en pantalla baja (celular tumbado) la cara se achica: " + (chica > 0 && /#wallyCara\{width:clamp\(96px/.test(html.slice(chica, chica + 400))));
if (chica < 0) MAL("en pantallas bajas la cara sigue comiéndose el sitio del texto");

console.log("");
if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
console.log("✅ el panel de WALLY se sube y se baja, el ✕ está siempre a mano, el texto largo cabe y avisa cuando hay más");
