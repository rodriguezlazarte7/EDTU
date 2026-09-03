/* 🧪 prueba de lo nuevo: las 9 naves, la República, los torpedos del CAZA DAVID,
   los Destructores Estelares que disparan y se hunden, y el jefe aliado.
   Se ejecuta con:  node test_starwars_nuevo.js */
const fs = require("fs");
const t = fs.readFileSync("test_starwars.js", "utf8");
const cab = t.slice(0, t.indexOf("/* --- que las piezas estén todas --- */"))
  .replace("globalThis.__MODOS=MODOS;",
    "globalThis.__MODOS=MODOS; globalThis.__esRep=esRep; globalThis.__destructorGolpe=destructorGolpe; " +
    "globalThis.__llamaAliado=llamaAliado; globalThis.__aliadoGolpe=aliadoGolpe; globalThis.__DEST_VIDA=DEST_VIDA; globalThis.__nombreAliado=nombreAliado;");
const p = `
const G=ctxVM.__G, N=ctxVM.__NAVES, DT=1/60;
let malos=0; const MAL=m=>{ malos++; console.log("  FALLO: "+m); };

console.log("  naves pilotables: "+Object.keys(N).length+" → "+Object.keys(N).map(k=>N[k].nom).join(", "));
if(!N.halcon||!N.corbeta) MAL("faltan el Halcón o la Corbeta");

/* 1) el CAZA DAVID vuela para la República */
G.bando="david"; ctxVM.nuevaPartida();
console.log("  CAZA DAVID · ¿República? "+ctxVM.__esRep()+" · escuadrón: "+ctxVM.nombreAmigo(G.amigos[0])+" · refuerzos: "+ctxVM.__nombreAliado());
if(!ctxVM.__esRep()) MAL("el CAZA DAVID no vuela para la República");

/* 2) torpedos infinitos y del doble */
G.run=true; G.torp=6; G.torpCarga=0;
for(let i=0;i<5;i++){ ctxVM.lanzaTorpedo(); G.torpCarga=0; }
console.log("  tras lanzar 5 tandas de torpedos le quedan: "+G.torp+" (deberían seguir 6: son infinitos)");
if(G.torp!==6) MAL("los torpedos del CAZA DAVID se gastan");
if((N.david.torpX||1)!==2) MAL("los torpedos del CAZA DAVID no hacen el doble");

/* 3) los Destructores tienen vida, se les puede dar y se hunden */
const d=G.destructores[0];
console.log("  el Destructor tiene "+d.vidaMax+" de vida");
const dentro=ctxVM.__destructorGolpe(d.p, 100);
if(!dentro) MAL("no se le puede disparar al Destructor");
const fuera=ctxVM.__destructorGolpe({x:d.p.x+9000,y:d.p.y,z:d.p.z}, 100);
if(fuera) MAL("le das al Destructor desde 9.000 unidades de distancia");
ctxVM.__destructorGolpe(d.p, ctxVM.__DEST_VIDA);
console.log("  tras vaciarle la vida entra en agonía: "+(d.agonia>0));
if(!(d.agonia>0)) MAL("el Destructor no se hunde al quedarse sin vida");
const antesPts=G.score, cuantos=G.destructores.length;
for(let i=0;i<5/DT;i++) ctxVM.update(DT);
console.log("  quedan "+G.destructores.length+" Destructores (antes "+cuantos+") y te dio "+(G.score-antesPts)+" puntos");
if(G.destructores.length!==cuantos-1) MAL("el Destructor hundido no desaparece");
if(G.score<=antesPts) MAL("hundir un Destructor no da puntos");

/* 4) los Destructores te disparan */
G.pos={x:G.destructores[0].p.x, y:G.destructores[0].p.y+400, z:G.destructores[0].p.z};
G.balas.length=0;
for(const x of G.destructores) x.fuego=0;
for(let i=0;i<2/DT;i++) ctxVM.update(DT);
const suyos=G.balas.filter(b=>!b.mia&&b.gordo).length;
console.log("  con un Destructor al lado te disparan "+suyos+" cañonazos gordos");
if(!suyos) MAL("los Destructores no disparan");

/* 5) el jefe aliado llega, dispara y se le puede hundir */
G.bando="david"; ctxVM.nuevaPartida(); G.run=true;
ctxVM.__llamaAliado();
if(!G.aliado||G.aliado.vida<=0) MAL("el jefe aliado no llega");
else {
  console.log("  llega "+ctxVM.__nombreAliado()+" con "+G.aliado.vidaMax+" de vida");
  ctxVM.nuevoEnemigo("caza");
  G.enem[0].p={x:G.aliado.p.x+150,y:G.aliado.p.y,z:G.aliado.p.z};
  G.balas.length=0;
  let disp=0;                                            /* se cuentan TODOS los que dispara, no los que quedan vivos */
  for(let i=0;i<3/DT;i++){
    if(G.enem.length===0||G.enem[0].ardiendo>0){ G.enem.length=0; ctxVM.nuevoEnemigo("caza");
      G.enem[0].p={x:G.aliado.p.x+150,y:G.aliado.p.y,z:G.aliado.p.z}; }   /* si lo incendia, otro */
    const antes=G.balas.filter(b=>b.fuerte).length;
    ctxVM.update(DT);
    const ahora=G.balas.filter(b=>b.fuerte).length;
    if(ahora>antes) disp+=ahora-antes;
  }
  console.log("  tu nave capital disparó "+disp+" cañonazos a los enemigos");
  if(!disp) MAL("el jefe aliado no dispara");
  const le=ctxVM.__aliadoGolpe(G.aliado.p, 99999);
  if(!le) MAL("no se le puede dar al jefe aliado");
  console.log("  y se le puede hundir: vida tras un cañonazo enorme = "+Math.max(0,G.aliado.vida));
}
console.log(malos ? "  ❌ "+malos+" fallo(s)" : "  ✅ todo lo nuevo funciona");
process.exit(malos?1:0);
`;
eval(cab + p);
