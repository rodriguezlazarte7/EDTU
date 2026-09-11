/* 🏎️ EDTU TURBO: pruebas
   Ejecuta el juego ENTERO en un navegador de mentira (con una tarjeta gráfica WebGL2 de mentira que
   cuenta lo que se dibuja y avisa de números rotos), conduce con el teclado y comprueba la física
   contra el mundo de verdad */
const fs = require("fs"), vm = require("vm");
const html = fs.readFileSync(__dirname + "/turbo.html", "utf8");
const codigo = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
let malos = 0; const MAL = t => { malos++; console.log("  FALLO: " + t); };

/* 🖥️ el navegador de mentira */
function navegador(hash) {
  const chivato = { nan: 0, dibujos: 0, triangulos: 0, excepciones: [], buffersRotos: 0 };
  const nada = () => {};
  const num = v => { if (typeof v === "number" && !Number.isFinite(v)) chivato.nan++; };
  const ctx2d = new Proxy({}, { get: (o, k) => {
    if (k in o) return o[k];
    if (k === "getImageData" || k === "createImageData") return (a, b, w, h) => { const W = w || a, H = h || b; return { width: W, height: H, data: new Uint8ClampedArray(W * H * 4) }; };
    if (k === "createLinearGradient" || k === "createRadialGradient") return (...a) => { a.forEach(num); return { addColorStop: nada }; };
    if (k === "measureText") return () => ({ width: 10 });
    return (...a) => a.forEach(num);
  }, set: (o, k, v) => { o[k] = v; return true; } });
  const fakeGL = new Proxy({}, { get: (o, k) => {
    if (k in o) return o[k];
    if (typeof k === "string" && /^[A-Z0-9_]+$/.test(k)) return 1;
    if (k === "getParameter") return () => 4;
    if (k === "getExtension") return n => n === "EXT_color_buffer_float" ? {} : null;
    if (k === "getShaderParameter" || k === "getProgramParameter") return () => true;
    if (/^create|getUniformLocation/.test(k)) return () => ({});
    if (k === "bufferData" || k === "bufferSubData") return (t, d) => { if (d && d.length && d instanceof Float32Array) { for (let i = 0; i < d.length; i += 7) if (!Number.isFinite(d[i])) { chivato.buffersRotos++; break; } } };
    if (k === "drawElements" || k === "drawElementsInstanced" || k === "drawArrays") return (m, n, t, off, inst) => { chivato.dibujos++; if (!(n >= 0) || (inst !== undefined && !(inst >= 0))) chivato.nan++; chivato.triangulos += (n / 3) * (inst || 1); };
    if (/^uniform/.test(k)) return (loc, ...a) => { for (const v of a) { if (typeof v === "number") num(v); else if (v && v.length) for (const x of v) num(x); } };
    return nada;
  } });
  const els = {};
  const el = id => els[id] || (els[id] = { id, style: {}, dataset: {}, innerHTML: "", textContent: "", width: 300, height: 150,
    classList: { add: nada, remove: nada, toggle: nada, contains: () => false }, addEventListener: nada, querySelectorAll: () => [], firstElementChild: { style: {} },
    getContext: t => t === "webgl2" ? fakeGL : ctx2d });
  let reloj = 1000; const cola = [];
  const almacen = {};
  const env = { innerWidth: 1920, innerHeight: 1080, devicePixelRatio: 1, console: { log: nada, warn: nada, error: (...a) => chivato.excepciones.push(a.join(" ")) },
    document: { getElementById: el, createElement: () => el("lienzo" + Math.random()) },
    localStorage: { getItem: k => almacen[k] || null, setItem: (k, v) => { almacen[k] = String(v); } },
    navigator: { getGamepads: () => [] }, matchMedia: () => ({ matches: false }), performance: { now: () => reloj },
    addEventListener: nada, requestAnimationFrame: f => { cola.push(f); return cola.length; },
    setTimeout, clearTimeout, location: { hash: hash || "" }, URLSearchParams, Math, JSON, Promise, Float32Array, Uint32Array, Uint16Array, Uint8Array, Uint8ClampedArray, Map, Set };
  env.window = env; env.parent = env; env.globalThis = env;
  vm.createContext(env);
  return { env, chivato, cola, avanza: ms => { reloj += ms; }, ahora: () => reloj };
}
async function arrancaJuego(hash) {
  const N = navegador(hash);
  const errores = [];
  const trampa = e => errores.push(e && e.message ? e.message : String(e));
  process.on("unhandledRejection", trampa);
  try { vm.runInContext(codigo, N.env, { filename: "turbo.html" }); } catch (e) { errores.push(e.message); }
  for (let i = 0; i < 400 && !N.env.__listo && !errores.length; i++) {
    await new Promise(r => setTimeout(r, 5));
    const f = N.cola.splice(0); N.avanza(16.7); for (const g of f) { try { g(N.ahora()); } catch (e) { errores.push(e.message); } }
  }
  process.off("unhandledRejection", trampa);
  return { N, errores };
}
const cuadros = (N, n) => { const err = []; for (let i = 0; i < n; i++) { const f = N.cola.splice(0); N.avanza(16.7); for (const g of f) { try { g(N.ahora()); } catch (e) { err.push(e.message); } } } return err; };   /* como un navegador de verdad: cada fotograma trae su hora */

(async () => {
  /* ---------- 1) 📸 el modo foto, en la zona de derrape ---------- */
  {
    const { N, errores } = await arrancaJuego("#foto&sitio=monte&cal=k4");
    const en = x => vm.runInContext(x, N.env);
    console.log("  modo foto: listo " + !!N.env.__listo + " · errores " + errores.length + (errores.length ? " (" + errores[0] + ")" : "") + " · render " + (N.env.__info && N.env.__info.render));
    if (!N.env.__listo || errores.length) MAL("el juego no arranca en modo foto");
    console.log("  un fotograma a 4K: " + N.chivato.dibujos + " llamadas de dibujo · " + Math.round(N.chivato.triangulos / 20).toLocaleString("es") + " triángulos por fotograma · números rotos " + N.chivato.nan + " · datos rotos subidos " + N.chivato.buffersRotos);
    if (N.chivato.nan || N.chivato.buffersRotos) MAL("se mandan números rotos a la tarjeta gráfica");
    const info = en("({ carreteras:CARRETERAS.length, pinos:ARBOLES.length, edificios:EDIFICIOS.length, eventos:EVENTOS.map(e=>e.tipo).join(','), panel:!!G.evento, w:RENDER.w, h:RENDER.h })");
    console.log("  mundo: " + info.carreteras + " carreteras · " + info.pinos + " pinos · " + info.edificios + " edificios · eventos " + info.eventos + " · panel de derrape " + info.panel);
    if (info.w !== 3840 || info.h !== 2160) MAL("a 4K no dibuja a 3840×2160");
    if (info.pinos < 5000 || info.edificios < 60) MAL("el mundo sale vacío");
    for (const t of ["derrape", "radar", "salto"]) if (!info.eventos.includes(t)) MAL("falta el evento " + t);
  }
  /* ---------- 2) 🎮 del menú a la calle, conduciendo con el teclado ---------- */
  {
    const { N, errores } = await arrancaJuego("");
    const en = x => vm.runInContext(x, N.env);
    const x0 = en("G.coche.x"), z0 = en("G.coche.z");
    en("empieza(); TECLAS.KeyW=true;");
    let err = cuadros(N, 240);
    /* tras 4 s solo con el acelerador (lo que de verdad dice "se mueve con W") */
    const d4 = Math.hypot(en("G.coche.x") - x0, en("G.coche.z") - z0), kmh4 = en("G.coche.kmh");
    en("TECLAS.KeyD=true; TECLAS.Space=true;"); err = err.concat(cuadros(N, 90));
    en("TECLAS.KeyD=false; TECLAS.Space=false; TECLAS.ShiftLeft=true;"); err = err.concat(cuadros(N, 120));
    en("TECLAS.KeyC=true;"); err = err.concat(cuadros(N, 10));
    const d = Math.hypot(en("G.coche.x") - x0, en("G.coche.z") - z0), kmh = en("G.coche.kmh"), derrapo = en("TRUCO.derrape>0||G.trucos.some(t=>t.nombre==='DERRAPE')");
    console.log("  4 s con W: " + d4.toFixed(0) + " m y " + kmh4.toFixed(0) + " km/h · luego derrape a la derecha con freno de mano y nitro (sale al pasto, que frena a propósito)");
    console.log("  10 s de juego con el teclado: errores " + (errores.length + err.length) + (err.length ? " (" + err[0] + ")" : "") + " · recorre " + d.toFixed(0) + " m · va a " + kmh.toFixed(0) + " km/h · estado " + en("G.estado") + " · humo y fuego: " + en("PARTS.length") + " partículas");
    if (errores.length || err.length) MAL("jugando salta un error");
    if (d4 < 60 || kmh4 < 90) MAL("con W el coche casi no acelera (" + d4.toFixed(0) + " m, " + kmh4.toFixed(0) + " km/h en 4 s)");
    if (en("G.estado") !== "juego") MAL("JUGAR no pasa al juego");
  }
  /* ---------- 3) ⚙️ la física contra el mundo de verdad ---------- */
  {
    const { N } = await arrancaJuego("#foto&sitio=lago");
    const en = x => vm.runInContext(x, N.env);
    const r = en(`(()=>{
      const dt=1/120, piloto=(C,mira)=>{ const q=carreteraCerca(C.x,C.z,40); if(!q) return 0;
        const s=Math.sign(Math.sin(C.rumbo)*q.tx+Math.cos(C.rumbo)*q.tz)||1, n=q.c.n, k=q.c.cerrada?((q.i+s*Math.round(mira/4))%n+n)%n:clamp(q.i+s*Math.round(mira/4),0,n-1);
        return clamp(angDif(C.rumbo,Math.atan2(q.c.x[k]-C.x,q.c.z[k]-C.z))*2.2,-1,1); };
      const au=CARRETERAS.find(c=>c.tipo==="autopista"), out={};
      for(const nitro of [false,true]){ const C=nuevoCoche(au.x[8],au.z[8],Math.atan2(au.tx[8],au.tz[8])); let max=0, en=0, p=0;
        for(let t=0;t<38&&C.x<980;t+=dt){ if(nitro) C.nitro=1; cocheCorre(C,{gas:1,freno:0,giro:piloto(C,26),mano:false,nitro},dt); max=Math.max(max,C.kmh); p++; if(C.sobre) en++; }
        out[nitro?"nitro":"normal"]=max; out.enCarretera=en/p; }
      const e=EVENTOS.find(x=>x.tipo==="salto"), c=e.c, i0=clamp(e.i-e.sentido*28,0,c.n-1), C=nuevoCoche(c.x[i0],c.z[i0],Math.atan2(c.tx[i0]*e.sentido,c.tz[i0]*e.sentido));
      C.vx=Math.sin(C.rumbo)*30; C.vz=Math.cos(C.rumbo)*30; out.vuelo=0;
      for(let t=0;t<9;t+=dt){ const ev=cocheCorre(C,{gas:0.8,freno:0,giro:piloto(C,20),mano:false,nitro:false},dt); if(ev.aterriza&&ev.aterriza.tiempo>0.3){ out.vuelo=ev.aterriza.tiempo; break; } }
      const D=nuevoCoche(760,-400,0); D.vz=27; out.derrape=0;
      for(let t=0;t<1.2;t+=dt){ cocheCorre(D,{gas:0.7,freno:0,giro:1,mano:t<0.5,nitro:false},dt); out.derrape=Math.max(out.derrape,Math.abs(D.anguloDerrape)); }
      const B=EDIFICIOS[10], K=nuevoCoche(B.x-B.w/2-12,B.z,Math.PI/2); K.vx=25; out.choque=0;
      for(let t=0;t<2;t+=dt){ const ev=cocheCorre(K,{gas:1,freno:0,giro:0,mano:false,nitro:false},dt); if(ev.choque) out.choque=Math.max(out.choque,ev.choque); }
      out.dentro=Math.abs(K.x-B.x)<B.w/2&&Math.abs(K.z-B.z)<B.d/2;
      const t=tamRender("k4",2560,1080); out.ultra=t.w+"x"+t.h;
      return out; })()`);
    console.log("  punta " + r.normal.toFixed(0) + " km/h y " + r.nitro.toFixed(0) + " con nitro · en la carretera el " + (r.enCarretera * 100).toFixed(0) + "% · salto de " + r.vuelo.toFixed(2) + " s · derrape de " + (r.derrape * 57.3).toFixed(0) + "° · choque " + r.choque.toFixed(0) + " m/s (dentro del edificio: " + r.dentro + ") · 4K en pantalla ultraancha: " + r.ultra);
    if (r.normal < 220 || r.normal > 275) MAL("la velocidad punta no está entre 220 y 275 km/h");
    if (r.nitro < r.normal + 40) MAL("el nitro no se nota");
    if (r.enCarretera < 0.97) MAL("el piloto automático se sale de la autopista");
    if (r.vuelo < 0.8) MAL("la rampa no hace volar");
    if (r.derrape < 0.35) MAL("el freno de mano no derrapa");
    if (!r.choque || r.dentro) MAL("los edificios se atraviesan");
    if (r.ultra !== "4096x1728") MAL("en pantallas ultraanchas el lienzo pasa de 4096 px");
  }
  /* ---------- 4) 🏠 enchufado en el cuartel y sin nada de fuera ---------- */
  {
    const padre = fs.readFileSync(__dirname + "/index.html", "utf8");
    const checks = [["botón", /id="pickTurbo"/], ["marco", /<iframe id="turboFrame"/], ["abre turbo.html", /abreMundo\("turboFrame","turboFs","turbo\.html"/], ["cierre", /turboCloseBtn"\)\.onclick=\(\)=>cierraMundo\("turboFrame","turboFs"\)/],
      ["el mando no toca el menú", /o\("turboFs"\)\);\s*\}/], ["juego al azar", /"pickTurbo"/]];
    const faltan = checks.filter(([, re]) => !re.test(padre)).map(([n]) => n);
    console.log("  en el cuartel: " + (faltan.length ? "faltan " + faltan.join(", ") : "botón, marco, cierre, mando y juego al azar ✅"));
    if (faltan.length) MAL("no está bien enchufado en el cuartel");
    const fuera = (html.match(/(src|href)\s*=\s*["']https?:|url\(\s*["']?https?:|\.(png|jpe?g|mp3|mp4|wav|glb|gltf)["')]/gi) || []);
    console.log("  archivos de fuera (imágenes, sonidos, modelos): " + fuera.length + " · marcas o logos de otros juegos: " + (/need for speed|nfs|unbound/i.test(html) ? "SÍ" : "ninguno"));
    if (fuera.length) MAL("el juego carga cosas de fuera");
    if (/need for speed|nfs|unbound/i.test(html)) MAL("aparece el nombre de otro juego");
  }
  console.log("");
  if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
  console.log("✅ EDTU TURBO: arranca, se juega con teclado, física de arcade comprobada y enchufado en el cuartel");
  process.exit(0);
})();
