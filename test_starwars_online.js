/* 🧪 prueba de la SALA ONLINE de STAR WARS, con una nube de mentira:
   comprueba que entra, que manda tu posición, que ve a los demás pilotos,
   que sus disparos llegan y se apagan, y que al salir se limpia todo.
   Se ejecuta con:  node test_starwars_online.js                              */
const fs = require("fs");
const t = fs.readFileSync("test_starwars.js", "utf8");

/* la cabecera del test normal monta el navegador de mentira; aquí se le añade
   un "cuartel" padre con una nube falsa, que es de donde el juego la saca */
let cab = t.slice(0, t.indexOf("/* --- que las piezas estén todas --- */"))
  .replace("globalThis.__MODOS=MODOS;",
    "globalThis.__MODOS=MODOS; globalThis.__RED=RED; globalThis.__entra=redEntra; " +
    "globalThis.__sale=redSale; globalThis.__corre=redCorre; globalThis.__nube=nube;");

/* el canal de mentira: guarda lo que se manda y deja meter mensajes de otros */
const falso = `
const enviados=[], seguidos=[];
let alRecibir={};
const canalFalso={
  on(tipo,ev,fn){ alRecibir[(ev&&ev.event)||tipo]=fn; return canalFalso; },
  subscribe(fn){ fn("SUBSCRIBED"); return canalFalso; },
  track(x){ seguidos.push(x); return Promise.resolve(); },
  send(m){ enviados.push(m); },
  presenceState(){ return { yo:[{nom:"David"}], otro:[{nom:"Luis"}] }; }
};
ventana.parent={ Cloud:{ enabled:true, sb:{ channel:()=>canalFalso, removeChannel:()=>{} } } };
let RELOJ=0;
ventana.performance={ now:()=>RELOJ };
ventana.__reloj=(ms)=>{ RELOJ+=ms; };
`;
cab = cab.replace("const ctxVM = vm.createContext(ventana);", falso + "\nconst ctxVM = vm.createContext(ventana);");

const p = `
const G=ctxVM.__G, RED=ctxVM.__RED, DT=1/60;
let malos=0; const MAL=m=>{ malos++; console.log("  FALLO: "+m); };

/* 0) EL CUARTEL DE VERDAD tiene que dejar ver su nube al marco del juego */
{
  const ix=require("fs").readFileSync("index.html","utf8");
  const exporta=/window\\.Cloud\\s*=/.test(ix);
  console.log("  el cuartel exporta su nube al marco: "+(exporta?"sí":"NO"));
  if(!exporta) MAL("index.html declara Cloud con const y no lo cuelga de window: desde el marco, window.parent.Cloud es undefined y la sala NUNCA funciona");
  const claves=/window\\.SB_URL\\s*=\\s*"https/.test(ix)&&/window\\.SB_KEY\\s*=\\s*"[^"]{10}/.test(ix);
  if(!claves) MAL("el cuartel no tiene puestas la dirección y la clave de la nube");
  else console.log("  ✅ y tiene puestas su dirección y su clave");
}

/* 1) ¿encuentra la nube del cuartel? */
if(!ctxVM.__nube()) MAL("no encuentra la nube del cuartel");
else console.log("  ✅ encuentra la conexión del cuartel (no carga ninguna otra)");

/* 2) entrar a la sala */
G.bando="david"; ctxVM.nuevaPartida(); G.run=true;
ctxVM.__entra();
if(!RED.on) MAL("no entra a la sala");
else console.log("  ✅ entra a la sala como '"+RED.nom+"' · se anuncia: "+JSON.stringify(seguidos[0]));

/* 3) manda tu posición ~10 veces por segundo, no más */
enviados.length=0;
G.pos={x:100,y:20,z:-40};
for(let i=0;i<1/DT;i++){ ctxVM.__reloj(DT*1000); ctxVM.__corre(DT); }   /* un segundo de reloj de verdad */
const vuelos=enviados.filter(m=>m.event==="v").length;
console.log("  en 1 segundo manda "+vuelos+" avisos de posición");
if(vuelos<8||vuelos>13) MAL("manda "+vuelos+" veces por segundo (deberían ser unas 10)");
const ult=enviados[enviados.length-1].payload;
if(!ult.p||ult.p[0]!==100) MAL("no manda tu posición");
if(!ult.f||!ult.u) MAL("no manda hacia dónde miras (la nave saldría torcida)");
console.log("  ✅ manda posición, orientación, nave ("+ult.nave+"), puntos y oleada");

/* 4) llega otro piloto */
alRecibir.v({ payload:{ id:"otro1", nom:"Luis", nave:"halcon", pts:1200, ol:3,
  p:[300,0,0], f:[0,0,1], u:[0,1,0], sh:[[300,0,0, 0,0,900, "#ff3b30"]] } });
if(!RED.otros.otro1) MAL("no aparece el otro piloto");
else console.log("  ✅ se ve a Luis volando el "+RED.otros.otro1.nave+" con "+RED.otros.otro1.pts+" puntos");
if(!RED.balas.length) MAL("no se ven los disparos de los demás");
else console.log("  ✅ y se ven sus disparos ("+RED.balas.length+")");

/* 5) sus balas vuelan y se apagan solas */
const antes=RED.balas[0].p.z;
ctxVM.__reloj(500); ctxVM.__corre(0.5);
if(!(RED.balas.length===0 || RED.balas[0].p.z>antes)) MAL("las balas de los demás no se mueven");
for(let i=0;i<3/DT;i++){ ctxVM.__reloj(DT*1000); ctxVM.__corre(DT); }
if(RED.balas.length) MAL("las balas de los demás no se apagan nunca (se acumularían sin fin)");
else console.log("  ✅ sus disparos se apagan solos (no se acumulan)");

/* 6) el que deja de mandar desaparece */
alRecibir.v({ payload:{ id:"otro2", nom:"Ana", nave:"x", p:[9,9,9], f:[0,0,1], u:[0,1,0] } });
RED.otros.otro2.t = -9000;                        /* como si llevara 9 s callado */
ctxVM.__reloj(200); ctxVM.__corre(0.2);
if(RED.otros.otro2) MAL("un piloto desconectado se queda pegado para siempre");
else console.log("  ✅ el que se va (o se le cae internet) desaparece a los 4 s");

/* 7) que el juego siga dibujando con gente conectada */
try{ for(let i=0;i<60;i++){ ctxVM.update(DT); ctxVM.render(); } console.log("  ✅ el juego dibuja bien con otros pilotos en pantalla"); }
catch(e){ MAL("el juego peta al dibujar a los demás: "+e.message); }

/* 8) salir limpia todo */
ctxVM.__sale();
if(RED.on||Object.keys(RED.otros).length||RED.balas.length) MAL("al salir queda basura");
else console.log("  ✅ al salir se limpia todo");

/* 9) PLAN B: si el cuartel no exporta Cloud (versión vieja en la caché), el juego
      tiene que armar el cliente él mismo con la dirección y la clave del cuartel */
{
  let creado=null;
  ventana.parent={ SB_URL:"https://ejemplo.supabase.co", SB_KEY:"clave-de-prueba-123456",
    supabase:{ createClient:(u,k)=>{ creado={u,k}; return { channel:()=>canalFalso, removeChannel:()=>{} }; } } };
  const c=ctxVM.__nube();
  if(!c||!creado) MAL("sin Cloud en el cuartel, el juego no sabe armar la conexión por su cuenta");
  else console.log("  ✅ plan B: si el cuartel no exporta la nube, el juego la arma solo ("+creado.u+")");
}

console.log("");
if(malos){ console.log("❌ "+malos+" fallo(s)"); process.exit(1); }
console.log("✅ sala online sana · entra, se ve a los demás, sus disparos llegan y al salir queda limpio");
`;
eval(cab + p);
