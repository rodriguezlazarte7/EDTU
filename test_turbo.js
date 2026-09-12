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
        return clamp(-angDif(C.rumbo,Math.atan2(q.c.x[k]-C.x,q.c.z[k]-C.z))*2.2,-1,1); };   /* el menos: con D se gira a la derecha */
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
  /* ---------- 5) 🎮 el volante no va en espejo · 🔗 los cruces no lanzan el coche ---------- */
  {
    const { N } = await arrancaJuego("#foto&sitio=lago");
    const en = x => vm.runInContext(x, N.env);
    const r = en(`(()=>{
      const au=CARRETERAS.find(c=>c.tipo==="autopista"), i=10, out={};
      /* con la cámara del juego: ¿a qué lado de la PANTALLA acaba el coche al pulsar D? */
      for(const giro of [1,-1]){
        const C=nuevoCoche(au.x[i],au.z[i],Math.atan2(au.tx[i],au.tz[i]));
        C.vx=Math.sin(C.rumbo)*25; C.vz=Math.cos(C.rumbo)*25;
        const K=nuevaCamara(C); camaraSigue(K,C,1/60);
        const VP=m4Mul(m4Persp(K.fov,16/9,0.35,4600), m4Mirar(v3(K.x,K.y,K.z),K.mira,v3(0,1,0)));
        const p0=m4Proyecta(VP,v3(C.x,C.y+0.6,C.z));
        for(let f=0;f<75;f++) cocheCorre(C,{gas:1,freno:0,giro,mano:false,nitro:false},1/60);
        const p1=m4Proyecta(VP,v3(C.x,C.y+0.6,C.z));
        out[giro>0?"derecha":"izquierda"]=p1.x-p0.x;
      }
      /* todos los cruces entre carreteras: escalón del suelo y si el coche despega sin rampa */
      const cortan=(a,b,c,d)=>{ const r1=b[0]-a[0], r2=b[1]-a[1], s1=d[0]-c[0], s2=d[1]-c[1], den=r1*s2-r2*s1;
        if(Math.abs(den)<1e-9) return null; const t=((c[0]-a[0])*s2-(c[1]-a[1])*s1)/den, u=((c[0]-a[0])*r2-(c[1]-a[1])*r1)/den;
        return (t>=0&&t<=1&&u>=0&&u<=1)?[a[0]+r1*t,a[1]+r2*t]:null; };
      /* el coche cruza SIGUIENDO la carretera (yendo recto se saldría en las curvas y saltaría por el campo) */
      const piloto=(C,mira)=>{ const q=carreteraCerca(C.x,C.z,40); if(!q) return 0;
        const s=Math.sign(Math.sin(C.rumbo)*q.tx+Math.cos(C.rumbo)*q.tz)||1, n=q.c.n, k=q.c.cerrada?((q.i+s*Math.round(mira/4))%n+n)%n:clamp(q.i+s*Math.round(mira/4),0,n-1);
        return clamp(-angDif(C.rumbo,Math.atan2(q.c.x[k]-C.x,q.c.z[k]-C.z))*2.2,-1,1); };   /* el menos: con D se gira a la derecha */
      const cruces=[];
      for(let x=0;x<CARRETERAS.length;x++) for(let y=x+1;y<CARRETERAS.length;y++){
        const A=CARRETERAS[x], B=CARRETERAS[y];
        for(let i=0;i<A.n-1;i++) for(let j=0;j<B.n-1;j++){
          if(Math.abs(A.x[i]-B.x[j])>40||Math.abs(A.z[i]-B.z[j])>40) continue;
          const p=cortan([A.x[i],A.z[i]],[A.x[i+1],A.z[i+1]],[B.x[j],B.z[j]],[B.x[j+1],B.z[j+1]]);
          if(p && !cruces.some(q=>Math.hypot(q.x-p[0],q.z-p[1])<25)) cruces.push({ x:p[0], z:p[1], A, i });
        } }
      out.cruces=cruces.length; out.escalon=0; out.saltan=0; out.peor="";
      for(const c of cruces){
        /* el escalón se mide SIGUIENDO la carretera (es lo que pisa el coche), no en línea recta */
        const n=c.A.n, idx=k=>c.A.cerrada?((k%n)+n)%n:Math.max(0,Math.min(n-1,k));
        let salto=0, yAnt=null;
        for(let k=-8;k<=8;k+=0.25){ const a=idx(Math.floor(c.i+k)), b=idx(Math.floor(c.i+k)+1), t=(c.i+k)-Math.floor(c.i+k);
          const y=sueloEn(c.A.x[a]+(c.A.x[b]-c.A.x[a])*t, c.A.z[a]+(c.A.z[b]-c.A.z[a])*t).y;
          if(yAnt!==null) salto=Math.max(salto,Math.abs(y-yAnt)); yAnt=y; }
        if(salto>out.escalon){ out.escalon=salto; out.peor=c.A.nombre+" ("+c.x.toFixed(0)+", "+c.z.toFixed(0)+")"; }
        const i0=idx(c.i-13), dir=Math.atan2(c.A.tx[i0],c.A.tz[i0]);      /* el coche sale 52 m antes, sobre el asfalto */
        const C=nuevoCoche(c.A.x[i0],c.A.z[i0],dir); C.vx=Math.sin(dir)*28; C.vz=Math.cos(dir)*28;
        for(let f=0;f<220;f++) if(cocheCorre(C,{gas:0.6,freno:0,giro:0,mano:false,nitro:false},1/120).despega){ out.saltan++; break; }
      }
      return out; })()`);
    console.log("  el volante: con D el coche se va " + (r.derecha > 0 ? "a la DERECHA" : "a la IZQUIERDA") + " de la pantalla (" + r.derecha.toFixed(2) + ") y con A " + (r.izquierda < 0 ? "a la IZQUIERDA" : "a la DERECHA") + " (" + r.izquierda.toFixed(2) + ")");
    if (r.derecha < 0.05 || r.izquierda > -0.05) MAL("los giros van en espejo (D tiene que ir a la derecha de la pantalla)");
    console.log("  " + r.cruces + " cruces de carreteras: el peor escalón mide " + (r.escalon * 100).toFixed(0) + " cm en " + r.peor + " · el coche despega sin rampa en " + r.saltan);
    if (r.escalon > 0.35) MAL("hay un escalón de " + (r.escalon * 100).toFixed(0) + " cm en un cruce");
    if (r.saltan) MAL("el coche sale volando en " + r.saltan + " cruces");
  }
  /* ---------- 6) 🚗 el tráfico y 🚓 la policía ---------- */
  {
    const { N } = await arrancaJuego("#foto&sitio=lago");
    const en = x => vm.runInContext(x, N.env);
    const r = en(`(()=>{
      const piloto=(C,mira)=>{ const q=carreteraCerca(C.x,C.z,40); if(!q) return 0;
        const s=Math.sign(Math.sin(C.rumbo)*q.tx+Math.cos(C.rumbo)*q.tz)||1, n=q.c.n, k=q.c.cerrada?((q.i+s*Math.round(mira/4))%n+n)%n:clamp(q.i+s*Math.round(mira/4),0,n-1);
        return clamp(-angDif(C.rumbo,Math.atan2(q.c.x[k]-C.x,q.c.z[k]-C.z))*2.2,-1,1); };
      const au=CARRETERAS.find(c=>c.tipo==="autopista"), i0=Math.floor(au.n*0.35), dir=Math.atan2(au.tx[i0],au.tz[i0]), out={};
      /* 🚗 60 s de tráfico: cuántos, a qué distancia nacen, si se salen del carril */
      const C=nuevoCoche(au.x[8],au.z[8],Math.atan2(au.tx[8],au.tz[8])); TRAFICO.length=0; POLICIA.coches.length=0; POLICIA.nivel=0;
      out.vivos=0; out.nacer=1e9; out.fuera=0; out.nan=0;
      for(let f=0;f<3600;f++){ const antes=new Set(TRAFICO); traficoCorre(1/60,C);
        for(const v of TRAFICO){ if(!antes.has(v)) out.nacer=Math.min(out.nacer,Math.hypot(v.x-C.x,v.z-C.z));
          let md=1e9; for(let k=-6;k<=6;k++){ const i=v.c.cerrada?((v.i+k)%v.c.n+v.c.n)%v.c.n:clamp(v.i+k,0,v.c.n-1); md=Math.min(md,Math.hypot(v.c.x[i]-v.x,v.c.z[i]-v.z)); }
          if(md>v.c.ancho/2+1.5){ out.fuera++; out.peorFuera=Math.max(out.peorFuera||0,md); }
          if(!isFinite(v.x+v.z+v.rumbo)) out.nan++; }
        out.vivos=Math.max(out.vivos,TRAFICO.length); cocheCorre(C,{gas:0.85,freno:0,giro:piloto(C,26),mano:false,nitro:false},1/60); }
      /* 🚓 pasas a 150 km/h junto a una patrulla · te paras · te pillan (multa) */
      const D=nuevoCoche(au.x[i0],au.z[i0],dir); D.vx=Math.sin(dir)*42; D.vz=Math.cos(dir)*42;
      TRAFICO.length=0; const pat=ponTraficoEn(au,i0+10,1,false); pat.poli=true; pat.malla=POLI_MALLA;
      out.vio=null; for(let f=0;f<240;f++){ cocheCorre(D,{gas:1,freno:0,giro:piloto(D,26),mano:false,nitro:false},1/60); traficoCorre(1/60,D); policiaCorre(1/60,D); if(POLICIA.nivel>0&&out.vio===null) out.vio=f/60; }
      out.perseguidores=POLICIA.coches.length; const d0=AJUSTES.dinero=5000; out.pilla=null;
      for(let f=0;f<60*40;f++){ cocheCorre(D,{gas:0,freno:1,giro:0,mano:false,nitro:false},1/60); traficoCorre(1/60,D); if(policiaCorre(1/60,D).pillado){ out.pilla=f/60; break; } }
      out.multa=d0-AJUSTES.dinero; out.nivelTras=POLICIA.nivel;
      /* 🚓 recién multado hay TREGUA: aunque pases volando al lado de una patrulla, no te persiguen */
      out.treguaBloquea=(()=>{ const T=nuevoCoche(au.x[i0],au.z[i0],dir); T.vx=Math.sin(dir)*45; T.vz=Math.cos(dir)*45;
        TRAFICO.length=0; const p=ponTraficoEn(au,i0+10,1,false); p.poli=true; p.malla=POLI_MALLA;
        for(let f=0;f<120;f++){ cocheCorre(T,{gas:1,freno:0,giro:piloto(T,26),mano:false,nitro:false},1/60); traficoCorre(1/60,T); policiaCorre(1/60,T); }
        return POLICIA.nivel===0; })();
      POLICIA.tregua=0;                     /* el jugador esperaría los 45 s: la prueba se los salta */
      /* 🚓 otra vez, y huyes con nitro con 300 m de ventaja: los despistas (premio) */
      TRAFICO.length=0; const pat2=ponTraficoEn(au,i0+10,1,false); pat2.poli=true; pat2.malla=POLI_MALLA;
      const E=nuevoCoche(au.x[i0],au.z[i0],dir); E.vx=Math.sin(dir)*42; E.vz=Math.cos(dir)*42;
      for(let f=0;f<120;f++){ cocheCorre(E,{gas:1,freno:0,giro:piloto(E,26),mano:false,nitro:false},1/60); traficoCorre(1/60,E); policiaCorre(1/60,E); }
      const lejosI=Math.min(au.n-1,i0+Math.round(300/4)); E.x=au.x[lejosI]; E.z=au.z[lejosI]; E.y=au.y[lejosI]; const d1=AJUSTES.dinero; out.escapa=null;
      for(let f=0;f<60*30;f++){ E.nitro=1; cocheCorre(E,{gas:1,freno:0,giro:piloto(E,30),mano:false,nitro:true},1/60); traficoCorre(1/60,E); const ev=policiaCorre(1/60,E); if(ev.despistado){ out.escapa=f/60; break; } if(ev.pillado){ out.escapa=-1; break; } }
      out.premio=AJUSTES.dinero-d1;
      return out; })()`);
    console.log("  🚗 tráfico, 60 s: hasta " + r.vivos + " coches · el más cercano nace a " + r.nacer.toFixed(0) + " m · fuera de su carril " + r.fuera + (r.peorFuera ? " (el peor a " + r.peorFuera.toFixed(1) + " m del eje)" : "") + " · números rotos " + r.nan);
    if (r.vivos < 8) MAL("hay muy poco tráfico"); if (r.nacer < 80) MAL("un coche nace demasiado cerca (" + r.nacer.toFixed(0) + " m)"); if (r.fuera || r.nan) MAL("el tráfico se sale de la carretera o se rompe");
    console.log("  🚓 pasas a 150 km/h junto a una patrulla: persecución a los " + (r.vio === null ? "NUNCA" : r.vio.toFixed(2) + " s") + " con " + r.perseguidores + " perseguidores · parado te pillan a los " + (r.pilla === null ? "NUNCA" : r.pilla.toFixed(1) + " s") + " y pagas $ " + r.multa + " · huyendo con nitro los despistas a los " + (r.escapa === null ? "NUNCA" : r.escapa < 0 ? "¡te pillan!" : r.escapa.toFixed(1) + " s") + " y cobras $ " + r.premio);
    if (r.vio === null || r.vio > 2 || !r.perseguidores) MAL("la patrulla no te persigue");
    if (r.pilla === null || r.multa <= 0 || r.nivelTras !== 0) MAL("parado no te pillan (o no hay multa)");
    console.log("  🚓 recién multado, la tregua te protege de otra persecución: " + (r.treguaBloquea ? "sí ✅" : "NO"));
    if (!r.treguaBloquea) MAL("tras la multa te vuelven a perseguir enseguida (no hay tregua)");
    if (r.escapa === null || r.escapa < 0 || r.premio <= 0) MAL("no se puede despistar a la policía (o no paga)");
  }
  /* ---------- 7) 🏁 las carreras contra los rivales ---------- */
  {
    const { N } = await arrancaJuego("#foto&sitio=lago");
    const en = x => vm.runInContext(x, N.env);
    const r = en(`(()=>{
      const out={ carreras:[], quieto:0, fuera:0, pasos:0, nan:0, alReves:0 };
      /* el piloto sigue LA RUTA de la carrera (no la carretera más cercana: se solapan) */
      const piloto=(C,mira,def)=>{ const c=def.c, n=c.n; let mi=0, md=1e9;
        for(let i=0;i<n;i++){ const d=Math.hypot(c.x[i]-C.x,c.z[i]-C.z); if(d<md){ md=d; mi=i; } }
        const k=c.cerrada?((mi+def.s*Math.round(mira/4))%n+n)%n:clamp(mi+def.s*Math.round(mira/4),0,n-1);
        return clamp(-angDif(C.rumbo,Math.atan2(c.x[k]-C.x,c.z[k]-C.z))*2.2,-1,1); };
      for(const ev of EVENTOS.filter(e=>e.tipo==="carrera")){
        const def=ev.carrera, C=nuevoCoche(0,0,0); TRAFICO.length=0; POLICIA.coches.length=0; POLICIA.nivel=0;
        empiezaCarrera(def,C);
        const x0=C.x, z0=C.z;
        for(let f=0;f<180;f++){ cocheCorre(C,{gas:1,freno:0,giro:0,mano:false,nitro:false},1/60); carreraCorre(1/60,C); }
        out.quieto=Math.max(out.quieto,Math.hypot(C.x-x0,C.z-z0));       /* en la cuenta atrás no te mueves */
        let fin=null, puesto=0, t=0;
        for(let f=0;f<60*240;f++,t+=1/60){ C.nitro=Math.max(C.nitro,0.4);
          cocheCorre(C,{gas:1,freno:0,giro:piloto(C,28,def),mano:false,nitro:true},1/60);
          const e=carreraCorre(1/60,C); if(CARRERA.activa) puesto=CARRERA.activa.puesto;
          for(const R of RIVALES){ out.pasos++; if(!isFinite(R.x+R.z+R.vel)) out.nan++;
            let md=1e9; for(let k=-6;k<=6;k++){ const i=R.c.cerrada?((R.i+k)%R.c.n+R.c.n)%R.c.n:clamp(R.i+k,0,R.c.n-1); md=Math.min(md,Math.hypot(R.c.x[i]-R.x,R.c.z[i]-R.z)); }
            if(md>R.c.ancho/2+1.5) out.fuera++; }
          if(e.fin){ fin=t; break; } }
        out.carreras.push({ nom:def.nombre, largo:Math.round(def.largo), fin:fin===null?null:+fin.toFixed(1), puesto });
      }
      /* marcha atrás en la vuelta al lago: tiene que avisar */
      const def=EVENTOS.find(e=>e.tipo==="carrera"&&e.carrera.c.cerrada).carrera, D=nuevoCoche(0,0,0);
      empiezaCarrera(def,D);
      for(let f=0;f<60*10;f++){ cocheCorre(D,{gas:1,freno:0,giro:piloto(D,28,def),mano:false,nitro:false},1/60); carreraCorre(1/60,D); }
      for(let f=0;f<60*10;f++){ cocheCorre(D,{gas:0,freno:1,giro:0,mano:false,nitro:false},1/60); carreraCorre(1/60,D); }
      out.alReves=CARRERA.activa?CARRERA.activa.alReves:0;
      CARRERA.activa=null; RIVALES.length=0;
      return out; })()`);
    console.log("  🏁 " + r.carreras.map(c => c.nom + " (" + c.largo + " m): " + (c.fin === null ? "NO ACABA" : c.fin + " s, " + c.puesto + "º")).join(" · "));
    console.log("  en la cuenta atrás te mueves " + r.quieto.toFixed(1) + " m · rivales fuera de su ruta " + r.fuera + "/" + r.pasos + " · números rotos " + r.nan + " · marcha atrás: avisa tras " + r.alReves.toFixed(1) + " s");
    if (r.carreras.length !== 4) MAL("tienen que ser 4 carreras");
    for (const c of r.carreras) if (c.fin === null) MAL("la carrera " + c.nom + " no acaba");
    if (r.quieto > 1.5) MAL("el coche se mueve durante la cuenta atrás");
    if (r.fuera > r.pasos * 0.01 || r.nan) MAL("los rivales se salen de su ruta o se rompen");
    if (r.alReves < 0.5) MAL("no avisa del sentido equivocado");
  }
  /* ---------- 8) 🔧 las mejoras del garaje ---------- */
  {
    const { N } = await arrancaJuego("#foto&sitio=lago");
    const en = x => vm.runInContext(x, N.env);
    const r = en(`(()=>{
      const piloto=(C,mira)=>{ const q=carreteraCerca(C.x,C.z,40); if(!q) return 0;
        const s=Math.sign(Math.sin(C.rumbo)*q.tx+Math.cos(C.rumbo)*q.tz)||1, n=q.c.n, k=q.c.cerrada?((q.i+s*Math.round(mira/4))%n+n)%n:clamp(q.i+s*Math.round(mira/4),0,n-1);
        return clamp(-angDif(C.rumbo,Math.atan2(q.c.x[k]-C.x,q.c.z[k]-C.z))*2.2,-1,1); };
      const au=CARRETERAS.find(c=>c.tipo==="autopista");
      const mide=()=>{ const o={};
        const C=nuevoCoche(au.x[8],au.z[8],Math.atan2(au.tx[8],au.tz[8])); let t=0, t100=null; o.punta=0;
        for(let f=0;f<60*40&&C.x<980;f++,t+=1/60){ cocheCorre(C,{gas:1,freno:0,giro:piloto(C,26),mano:false,nitro:false},1/60); if(C.kmh>=100&&t100===null) t100=t; o.punta=Math.max(o.punta,C.kmh); }
        o.t100=t100;
        const D=nuevoCoche(au.x[8],au.z[8],Math.atan2(au.tx[8],au.tz[8])); const v=200/3.6; D.vx=Math.sin(D.rumbo)*v; D.vz=Math.cos(D.rumbo)*v; D.kmh=200;
        const x0=D.x, z0=D.z; for(let f=0;f<60*20&&D.kmh>2;f++) cocheCorre(D,{gas:0,freno:1,giro:0,mano:false,nitro:false},1/60);
        o.frenada=Math.hypot(D.x-x0,D.z-z0);
        const E=nuevoCoche(au.x[8],au.z[8],Math.atan2(au.tx[8],au.tz[8])); E.nitro=1; let tn=0; o.puntaNitro=0;
        for(let f=0;f<60*60&&E.nitro>0.011;f++,tn+=1/60){ cocheCorre(E,{gas:1,freno:0,giro:piloto(E,26),mano:false,nitro:true},1/60); o.puntaNitro=Math.max(o.puntaNitro,E.kmh); if(E.x>980){ E.x=au.x[8]; E.z=au.z[8]; } }
        o.nitroSeg=tn; return o; };
      AJUSTES.mejoras={}; aplicaMejoras();
      const a=mide();
      AJUSTES.dinero=100; const pobre=compraMejora("motor");            /* sin dinero no se compra */
      AJUSTES.dinero=1e6; let gastado=0;
      for(const M of MEJORAS) for(let k=0;k<MEJ_MAX+2;k++){ const p=precioMejora(M.id); if(p===null) break; gastado+=p; compraMejora(M.id); }
      const b=mide();
      return { a, b, pobre, gastado, queda:Math.round(AJUSTES.dinero), tope:MEJORAS.every(M=>nivelMejora(M.id)===MEJ_MAX), sigueComprable:precioMejora("motor")!==null };
    })()`);
    console.log("  🔧 sin mejoras: " + r.a.punta.toFixed(0) + " km/h · 0-100 " + r.a.t100.toFixed(1) + " s · frena de 200 en " + r.a.frenada.toFixed(0) + " m · nitro " + r.a.nitroSeg.toFixed(1) + " s");
    console.log("  🔧 con todo al máximo ($ " + r.gastado.toLocaleString("es") + "): " + r.b.punta.toFixed(0) + " km/h · 0-100 " + r.b.t100.toFixed(1) + " s · frena en " + r.b.frenada.toFixed(0) + " m · nitro " + r.b.nitroSeg.toFixed(1) + " s (punta con nitro " + r.b.puntaNitro.toFixed(0) + ")");
    if (r.pobre) MAL("se compran mejoras sin dinero");
    if (!r.tope || r.sigueComprable) MAL("las mejoras no llegan al máximo (o se siguen vendiendo)");
    if (1e6 - r.queda !== r.gastado) MAL("el dinero de las mejoras no cuadra");
    if (r.b.punta < r.a.punta + 20) MAL("el motor no se nota");
    if (r.b.t100 > r.a.t100 - 0.3) MAL("no acelera bastante más");
    if (r.b.frenada > r.a.frenada - 10) MAL("los frenos no se notan");
    if (r.b.nitroSeg < r.a.nitroSeg + 3) MAL("el nitro no dura bastante más");
    if (r.b.puntaNitro > 365) MAL("con mejoras el coche se pasa de 365 km/h (" + r.b.puntaNitro.toFixed(0) + ")");   /* el tope son 338; cuesta abajo se pasa un poco */
  }
  console.log("");
  if (malos) { console.log("❌ " + malos + " fallo(s)"); process.exit(1); }
  console.log("✅ EDTU TURBO: arranca, se juega con teclado, física de arcade comprobada y enchufado en el cuartel");
  process.exit(0);
})();
