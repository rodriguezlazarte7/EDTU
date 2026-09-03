/* 🧪 prueba del service worker de EDTU: comprueba que una mejora recién publicada
   SE VE, que sin conexión cada página sirve la suya, y que lo de fuera pasa directo.
   Se ejecuta con:  node test_sw.js                                                   */
const fs = require("fs"), vm = require("vm"), path = require("path");

let fallos = 0;
const F = m => { fallos++; console.log("❌ " + m); };
const OK = m => console.log("✅ " + m);

/* --- un navegador de mentira con su almacén de cache --- */
function monta({ conRed = true, guardado = {} } = {}) {
  const guardadas = Object.assign({}, guardado);
  const pedidasALaRed = [];
  const almacen = {
    match: req => Promise.resolve(guardadas[clave(req)]),
    put: (req, res) => { guardadas[clave(req)] = res; return Promise.resolve(); },
    addAll: () => Promise.resolve(), keys: () => Promise.resolve([])
  };
  const clave = req => (typeof req === "string" ? req.replace("./", "https://www.edtu.cl/") : req.url);
  const oyentes = {};
  const self_ = {
    location: { origin: "https://www.edtu.cl" },
    addEventListener: (t, fn) => { oyentes[t] = fn; },
    skipWaiting: () => {}, clients: { claim: () => {} },
    caches: { open: () => Promise.resolve(almacen), match: req => almacen.match(req), keys: () => Promise.resolve([]), delete: () => Promise.resolve() },
    fetch: req => { pedidasALaRed.push(req.url); return conRed ? Promise.resolve({ ok: true, deLaRed: true, url: req.url, clone: () => ({ deLaRed: true, url: req.url }) }) : Promise.reject(new Error("sin conexión")); },
    URL, console
  };
  self_.self = self_;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "sw.js"), "utf8"), self_, { filename: "sw.js" });
  return { oyentes, guardadas, pedidasALaRed, clave, self_ };
}
function pide(mundo, url, mode) {
  const req = { url, method: "GET", mode: mode || "no-cors" };
  let respuesta = null;
  const ev = { request: req, respondWith: p => { respuesta = p; }, waitUntil: () => {} };
  mundo.oyentes.fetch(ev);
  return respuesta;
}

/* --- 1) una página recién publicada tiene que llegar de la RED, no de la copia vieja --- */
{
  const viejo = { deLaRed: false, viejo: true, clone: () => ({}) };
  const m = monta({ guardado: { "https://www.edtu.cl/starwars.html": viejo } });
  const p = pide(m, "https://www.edtu.cl/starwars.html", "navigate");
  if (!p) { F("el service worker ni siquiera responde a starwars.html"); }
  else p.then(r => {
    if (r && r.deLaRed) OK("una mejora recién publicada se ve al momento (starwars.html va a la red primero)");
    else F("starwars.html se sirve de la copia guardada: las mejoras nuevas NO se verían");
    seguir();
  });
  function seguir() {
    /* --- 2) sin conexión, cada página sirve LA SUYA --- */
    const guardadas = {
      "https://www.edtu.cl/index.html": { esIndex: true },
      "https://www.edtu.cl/starwars.html": { esJuego: true }
    };
    const m2 = monta({ conRed: false, guardado: guardadas });
    pide(m2, "https://www.edtu.cl/starwars.html", "navigate").then(r => {
      if (r && r.esJuego) OK("sin conexión, el juego sirve el juego");
      else F("sin conexión, el juego no sirve su propia copia");
      pide(m2, "https://www.edtu.cl/index.html", "navigate").then(r2 => {
        if (r2 && r2.esIndex) OK("sin conexión, el cuartel sirve el cuartel");
        else F("sin conexión, el cuartel no sirve su propia copia");
        tres();
      });
    });
  }
  function tres() {
    /* --- 3) abrir el juego NO puede pisar la copia del cuartel --- */
    const m3 = monta({});
    pide(m3, "https://www.edtu.cl/starwars.html", "navigate").then(() => setTimeout(() => {
      const idx = m3.guardadas["https://www.edtu.cl/index.html"];
      if (idx && idx.url && idx.url.indexOf("starwars") >= 0)
        F("abrir el juego sobreescribe la copia del cuartel (offline saldría el juego en vez del menú)");
      else OK("abrir el juego no pisa la copia guardada del cuartel");
      cuatro();
    }, 20));
  }
  function cuatro() {
    /* --- 4) lo de fuera (Supabase, CDNs) pasa directo, sin tocarlo --- */
    const m4 = monta({});
    const r = pide(m4, "https://algo-de-fuera.supabase.co/rest/v1/tabla", "cors");
    if (r) F("el service worker se mete con peticiones de otros sitios");
    else OK("lo de otros sitios pasa directo a la red");

    /* --- 5) la base de conocimiento de WALLY sí sale de la copia (es enorme y no cambia) --- */
    const m5 = monta({ guardado: { "https://www.edtu.cl/wally-kb.js": { esKB: true } } });
    pide(m5, "https://www.edtu.cl/wally-kb.js", "no-cors").then(rr => {
      if (rr && rr.esKB) OK("la base de conocimiento de WALLY se sirve al instante desde la copia");
      else F("wally-kb.js no se sirve desde la copia");
      fin();
    });
  }
  function fin() {
    /* --- 6) el nombre de la cache tiene que haber cambiado, si no la vieja no se borra --- */
    const txt = fs.readFileSync(path.join(__dirname, "sw.js"), "utf8");
    const v = /const CACHE = "edtu-v(\d+)"/.exec(txt);
    if (!v) F("no encuentro la versión de la cache");
    else if (+v[1] < 3) F("la versión de la cache sigue en v" + v[1] + ": los que ya tenían la vieja no verían los cambios");
    else OK("la cache es edtu-v" + v[1] + ", así que la vieja se borra sola al actualizar");

    console.log("");
    if (fallos) { console.log("❌ " + fallos + " fallo(s)"); process.exit(1); }
    console.log("✅ service worker sano · las mejoras llegan al momento y sin conexión cada página sirve la suya");
  }
}
