/* 🧪 prueba del MISIL DIRIGIDO (tecla Q): que se lanza, que el ratón lo guía, que revienta
   enemigos, que un clic lo suelta, que se acaba solo y que la cámara vuelve bien a tu nave.
   Se ejecuta con:  node test_starwars_misil.js */
const fs = require("fs");
const t = fs.readFileSync("test_starwars.js", "utf8");
const cab = t.slice(0, t.indexOf("/* --- que las piezas estén todas --- */"))
  .replace("globalThis.__MODOS=MODOS;",
    "globalThis.__MODOS=MODOS; globalThis.__lanzaMisil=lanzaMisil; globalThis.__abortaMisil=abortaMisil; globalThis.__MIS_VIDA=MIS_VIDA;");
const p = `
const G=ctxVM.__G, DT=1/60;
let malos=0; const MAL=m=>{ malos++; console.log("  FALLO: "+m); };

G.bando="david"; ctxVM.nuevaPartida(); G.run=true;
const posNave={x:G.pos.x,y:G.pos.y,z:G.pos.z};

/* 1) se lanza y la cámara se mete dentro */
ctxVM.__lanzaMisil();
if(!G.misil) MAL("la Q no lanza el misil");
else console.log("  ✅ misil lanzado, con "+ctxVM.__MIS_VIDA+" s de combustible");

/* 2) el ratón lo guía: girando a un lado, se va a ese lado */
const antes={x:G.misil.p.x,y:G.misil.p.y,z:G.misil.p.z};
const rectoAntes={x:G.misil.b.f.x,y:G.misil.b.f.y,z:G.misil.b.f.z};
G.yaw=2.5;
for(let i=0;i<0.6/DT;i++) ctxVM.update(DT);
const giro=Math.hypot(G.misil.b.f.x-rectoAntes.x, G.misil.b.f.y-rectoAntes.y, G.misil.b.f.z-rectoAntes.z);
const avance=Math.hypot(G.misil.p.x-antes.x, G.misil.p.y-antes.y, G.misil.p.z-antes.z);
console.log("  con el ratón a un lado, en 0,6 s giró "+giro.toFixed(2)+" y avanzó "+Math.round(avance)+" unidades");
if(giro<0.1) MAL("el ratón no guía el misil");
if(avance<150) MAL("el misil casi no avanza");

/* 3) tu nave sigue volando allá atrás, no se queda pegada al misil */
const lejos=Math.hypot(G.misil.p.x-G.pos.x, G.misil.p.y-G.pos.y, G.misil.p.z-G.pos.z);
console.log("  el misil está a "+Math.round(lejos)+" unidades de tu nave (tu nave sigue su camino)");
if(lejos<100) MAL("el misil no se separa de la nave");

/* 4) dibujar mientras lo pilotas NO debe dejar la cámara descolocada */
const px=G.pos.x, py=G.pos.y, pz=G.pos.z;
ctxVM.render();
if(G.pos.x!==px||G.pos.y!==py||G.pos.z!==pz) MAL("tras dibujar, la cámara se queda en el misil y la nave se teletransporta");
else console.log("  ✅ tras dibujar, tu nave sigue en su sitio (la cámara se devuelve)");

/* 5) revienta enemigos */
ctxVM.nuevoEnemigo("caza");
const e=G.enem[G.enem.length-1];
e.p={x:G.misil.p.x+G.misil.b.f.x*40, y:G.misil.p.y+G.misil.b.f.y*40, z:G.misil.p.z+G.misil.b.f.z*40};
const vidaAntes=e.vida;
for(let i=0;i<0.4/DT&&G.misil;i++) ctxVM.update(DT);
console.log("  al chocar con un caza: vida del caza "+vidaAntes+" → "+Math.round(e.vida)+" · ¿misil gastado? "+(!G.misil));
if(e.vida>=vidaAntes) MAL("el misil no hace daño");
if(G.misil) MAL("el misil no revienta al chocar");

/* 6) el clic lo suelta */
ctxVM.__lanzaMisil();
if(!G.misil) MAL("no se puede lanzar otro");
ctxVM.__abortaMisil();
if(G.misil) MAL("el clic no suelta el misil");
else console.log("  ✅ con un clic se suelta y vuelves a tu nave");

/* 7) se queda sin combustible solo */
ctxVM.__lanzaMisil();
for(let i=0;i<(ctxVM.__MIS_VIDA+1)/DT&&G.misil;i++) ctxVM.update(DT);
if(G.misil) MAL("el misil no se acaba nunca");
else console.log("  ✅ y si no le das a nada, se queda sin combustible a los "+ctxVM.__MIS_VIDA+" s");

/* 8) el CAZA DAVID no gasta misiles; el Ala-X sí */
G.bando="david"; ctxVM.nuevaPartida(); G.run=true; const tD=G.torp;
ctxVM.__lanzaMisil(); ctxVM.__abortaMisil();
if(G.torp!==tD) MAL("el CAZA DAVID gasta misiles y los tiene infinitos");
G.bando="x"; ctxVM.nuevaPartida(); G.run=true; const tX=G.torp;
ctxVM.__lanzaMisil(); ctxVM.__abortaMisil();
console.log("  CAZA DAVID: "+tD+" → "+tD+" (infinitos) · Ala-X: "+tX+" → "+G.torp);
if(G.torp!==tX-1) MAL("el Ala-X no gasta un misil al lanzarlo");

console.log(malos ? "  ❌ "+malos+" fallo(s)" : "  ✅ el misil dirigido funciona");
process.exit(malos?1:0);
`;
eval(cab + p);
