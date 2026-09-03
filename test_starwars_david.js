/* 🧪 prueba de lo propio del CAZA DAVID: que su escudo se repara solo, que la reparación
   se pausa al recibir un golpe, que las demás naves NO se reparan, y que él no echa humo
   pero las demás sí. Se ejecuta con:  node test_starwars_david.js */
const fs = require("fs");
const t = fs.readFileSync("test_starwars.js", "utf8");
const cab = t.slice(0, t.indexOf("/* --- que las piezas estén todas --- */"))
  .replace("globalThis.__MODOS=MODOS;", "globalThis.__MODOS=MODOS; globalThis.__naveTocada=naveTocada;");
const p = `
const G=ctxVM.__G, N=ctxVM.__NAVES, DT=1/60;
let malos=0; const MAL=m=>{ malos++; console.log("  FALLO: "+m); };

/* 1) el CAZA DAVID se repara solo */
G.bando="david"; ctxVM.nuevaPartida(); G.run=true;
G.quedan=99;                                       /* que no se complete la oleada: regala 14% de escudo y falsearía la medida */
G.shield=100; G.regenT=0;
for(let i=0;i<3/DT;i++) ctxVM.update(DT);
const trasDavid=Math.round(G.shield);
console.log("  CAZA DAVID: escudo 100 → "+trasDavid+" tras 3 segundos (escudo máximo "+G.vidaMax+")");
if(trasDavid<160) MAL("el escudo del CAZA DAVID no se repara");

/* 2) al recibir un golpe, la reparación se pausa 2 segundos */
G.shield=100; ctxVM.golpe(10);
const justoDespues=G.shield;
for(let i=0;i<1/DT;i++) ctxVM.update(DT);          /* 1 segundo: aún no debería reparar */
console.log("  tras un impacto, 1 s después: "+Math.round(G.shield)+" (no repara todavía)");
if(G.shield>justoDespues+2) MAL("repara aunque le acaben de dar");
for(let i=0;i<2/DT;i++) ctxVM.update(DT);          /* 2 s más: ya sí */
console.log("  y 2 s más tarde: "+Math.round(G.shield)+" (ya se está reparando)");
if(!(G.shield>justoDespues+20)) MAL("no vuelve a reparar tras la pausa");

/* 3) las demás naves NO se reparan */
G.bando="x"; ctxVM.nuevaPartida(); G.run=true;
G.quedan=99;                                       /* lo mismo aquí */
G.shield=100; G.regenT=0;
for(let i=0;i<3/DT;i++) ctxVM.update(DT);
console.log("  Ala-X: escudo 100 → "+Math.round(G.shield)+" tras 3 segundos (no debe cambiar)");
if(Math.abs(G.shield-100)>1) MAL("el Ala-X también se repara, y no debería");

/* 4) humo: el CAZA DAVID no echa, el Ala-X sí */
function humo(bando){
  G.bando=bando; ctxVM.nuevaPartida(); G.run=true; G.quedan=99;
  G.shield=G.vidaMax*0.15; G.chispas.length=0;
  for(let i=0;i<2/DT;i++){ G.shield=G.vidaMax*0.15; ctxVM.__naveTocada(DT); }
  return G.chispas.length;
}
const hDavid=humo("david"), hX=humo("x");
console.log("  con el escudo al 15%: el CAZA DAVID suelta "+hDavid+" partículas y el Ala-X "+hX);
if(hDavid!==0) MAL("el CAZA DAVID sigue echando humo");
if(hX===0) MAL("el Ala-X ya no echa humo, y debería (eso solo se quitó para el CAZA DAVID)");

console.log(malos ? "  ❌ "+malos+" fallo(s)" : "  ✅ todo correcto");
process.exit(malos?1:0);
`;
eval(cab + p);
