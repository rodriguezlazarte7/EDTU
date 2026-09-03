/* 🧪 prueba del SONIDO DEL MOTOR: que cada nave suene distinta, que monte todas sus capas,
   que se apague sin dejar piezas colgando y que responda al gas, al turbo y al viraje.
   Se ejecuta con:  node test_starwars_motor.js */
const fs = require("fs");
const t = fs.readFileSync("test_starwars.js", "utf8");
const cab = t.slice(0, t.indexOf("/* --- que las piezas estén todas --- */"))
  .replace("globalThis.__MODOS=MODOS;",
    "globalThis.__MODOS=MODOS; globalThis.__MOT=MOT; globalThis.__motorVoz=motorVoz; " +
    "globalThis.__on=motorEnciende; globalThis.__off=motorApaga; globalThis.__suena=motorSuena;");
const p = `
const G=ctxVM.__G, N=ctxVM.__NAVES;
let malos=0; const MAL=m=>{ malos++; console.log("  FALLO: "+m); };

/* 1) cada nave con su voz */
console.log("  nave               tono   chillido  cuerpo  grave  aire");
const voces={};
for(const k of Object.keys(N)){
  G.bando=k; ctxVM.nuevaPartida();
  const v=ctxVM.__motorVoz(); voces[k]=v;
  console.log("  "+N[k].nom.padEnd(18)+String(v.base).padStart(4)+"   "+
    v.chillo.toFixed(2).padStart(7)+"  "+v.cuerpo.toFixed(2).padStart(6)+"  "+
    v.grave.toFixed(2).padStart(5)+"  "+v.aire.toFixed(2).padStart(4));
}
if(!(voces.t.chillo>voces.x.chillo)) MAL("el TIE no chilla más agudo que el Ala-X");
if(!(voces.corbeta.base<voces.t.base)) MAL("la Corbeta no suena más grave que el TIE");
if(!(voces.corbeta.grave>voces.x.grave)) MAL("la Corbeta no retumba más que el Ala-X");
console.log("  ✅ los TIE chillan, la Corbeta retumba y cada bando tiene su voz");

/* 2) enciende con sus capas y se apaga sin dejar nada colgando */
G.bando="david"; ctxVM.nuevaPartida(); G.run=true;
ctxVM.__on();
const piezas=ctxVM.__MOT.nodos.length;
console.log("  el motor monta "+piezas+" piezas de sonido (antes eran 3)");
if(piezas<12) MAL("el motor no monta todas sus capas");
if(!ctxVM.__MOT.on) MAL("el motor no arranca");
ctxVM.__off();
if(ctxVM.__MOT.on||ctxVM.__MOT.nodos.length) MAL("al apagar el motor quedan piezas colgando");
else console.log("  ✅ y al apagarlo no queda ninguna pieza suelta");

/* 3) responde al gas, al turbo y al viraje sin petar */
ctxVM.__on();
try{
  for(const gas of [0,0.5,1]) for(const turbo of [false,true]){
    G.turbo=turbo; G.boost=100; G.yaw=turbo?2:0;
    ctxVM.__suena(gas);
  }
  console.log("  ✅ responde a gas 0/50/100%, con y sin turbo, y virando");
}catch(e){ MAL("el motor peta al cambiar de régimen: "+e.message); }
ctxVM.__off();

/* 4) y con el sonido apagado no hace nada */
ctxVM.__MOT.on=false;
try{ ctxVM.__suena(1); console.log("  ✅ con el motor apagado, motorSuena no revienta"); }
catch(e){ MAL("motorSuena peta si el motor está apagado: "+e.message); }

console.log(malos ? "  ❌ "+malos+" fallo(s)" : "  ✅ el motor suena bien");
process.exit(malos?1:0);
`;
eval(cab + p);
