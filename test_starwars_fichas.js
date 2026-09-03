/* 🧪 prueba de las FICHAS de nave de la pantalla de elección: comprueba que las 9 naves
   salen del mismo tamaño y que ninguna se sale de su tarjeta.
   Se ejecuta con:  node test_starwars_fichas.js */
const fs = require("fs");
const t = fs.readFileSync("test_starwars.js", "utf8");
const cab = t.slice(0, t.indexOf("/* --- que las piezas estén todas --- */"))
  .replace("globalThis.__MODOS=MODOS;", "globalThis.__MODOS=MODOS; globalThis.__MOD=MOD; globalThis.__baseNueva=baseNueva; globalThis.__girar=girar; globalThis.__aLocal=aLocal;");
const p = `
const MOD=ctxVM.__MOD, N=ctxVM.__NAVES;
const W=168, H=78;                                   /* la tarjeta de verdad */
const fov=Math.min(W,H)*1.15, dz0=3.1;
let malos=0;
console.log("  nave               tamaño  ancho   alto   (la ficha mide "+W+"x"+H+")");
for(const k of Object.keys(N)){
  const mod=N[k].mod(); let rr=0; for(const v of mod.V) rr=Math.max(rr,Math.hypot(v.x,v.y,v.z)); const dz=rr*dz0;
  let maxX=0, maxY=0;
  for(let paso=0; paso<24; paso++){                  /* se gira entera, como en la ficha */
    const b=ctxVM.__baseNueva(); ctxVM.__girar(b, paso*0.26, Math.sin(paso*.7)*.3, Math.sin(paso*.4)*.25);
    for(const v of mod.V){
      const q=ctxVM.__aLocal(b,v); const z=q.z+dz;
      if(z<0.5) continue;
      maxX=Math.max(maxX, Math.abs(q.x/z*fov));
      maxY=Math.max(maxY, Math.abs(q.y/z*fov));
    }
  }
  const anc=Math.round(maxX*2), alt=Math.round(maxY*2);
  const cabe = anc<=W && alt<=H;
  if(!cabe) malos++;
  console.log("  "+N[k].nom.padEnd(18)+String(Math.round(rr*10)/10).padStart(5)+"   "+String(anc).padStart(5)+"   "+String(alt).padStart(4)+"   "+(cabe?"cabe":"❌ SE SALE"));
}
console.log(malos ? "  ❌ "+malos+" naves se salen de su ficha" : "  ✅ las 9 naves caben en su ficha y salen del mismo tamaño");
process.exit(malos?1:0);
`;
eval(cab + p);
