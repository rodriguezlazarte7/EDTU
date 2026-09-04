/* 🧪 prueba de las TECLAS: que ESC salta al hiperespacio y sale, y que la P sigue pausando.
   Se ejecuta con:  node test_starwars_teclas.js */
const fs = require("fs");
const t = fs.readFileSync("test_starwars.js", "utf8");
let cab = t.slice(0, t.indexOf("/* --- que las piezas estén todas --- */"))
  .replace("globalThis.__MODOS=MODOS;", "globalThis.__MODOS=MODOS; globalThis.__saliendo=()=>saliendo;");
/* el navegador de mentira tira las teclas a la basura; aquí sí se guardan */
cab = cab.replace(
  "  addEventListener: nada, removeEventListener: nada, requestAnimationFrame: () => 0, cancelAnimationFrame: nada,",
  "  addEventListener: (tipo, fn) => { if (tipo === 'keydown') { ventana.__teclas = ventana.__teclas || []; ventana.__teclas.push(fn); } }, removeEventListener: nada, requestAnimationFrame: () => 0, cancelAnimationFrame: nada,");

const p = `
const G=ctxVM.__G;
const pulsa=k=>{ const e={key:k, preventDefault(){}, repeat:false};
  for(const fn of (ventana.__teclas||[])) fn(e); };
let malos=0; const MAL=m=>{ malos++; console.log("  FALLO: "+m); };

console.log("  teclas escuchadas por el juego: "+((ventana.__teclas||[]).length)+" oyente(s)");
if(!(ventana.__teclas||[]).length) MAL("no se pudo capturar el teclado");

G.bando="david"; ctxVM.nuevaPartida(); G.run=true;
pulsa("Escape");
console.log("  tras ESC → ¿saltando al hiperespacio? "+(ctxVM.__saliendo()>0)+" · ¿en pausa? "+G.paused);
if(!(ctxVM.__saliendo()>0)) MAL("ESC no lanza el salto");
if(G.paused) MAL("ESC deja el juego en pausa en vez de saltar");

ctxVM.nuevaPartida(); G.run=true;
pulsa("p");
console.log("  tras P → ¿en pausa? "+G.paused);
if(!G.paused) MAL("la P ya no pausa");

console.log(malos ? "  ❌ "+malos+" fallo(s)" : "  ✅ ESC salta y P pausa");
process.exit(malos?1:0);
`;
eval(cab + p);
