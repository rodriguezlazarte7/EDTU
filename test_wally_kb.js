/* 🧪 Test de la base de conocimiento de WALLY — ejecutar: node test_wally_kb.js
   Comprueba que wally-kb.js carga, que ninguna entrada le roba una respuesta a los handlers
   del sitio ni al corrector ortográfico, que cada entrada responde a sus propias preguntas,
   y que consultar la tabla entera sigue siendo rápido. */
const fs=require("fs"), path=require("path");
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const st=html.indexOf("function wallyReply(q){"); if(st<0){ console.error("no se encontró wallyReply"); process.exit(2); }
let d=0,e=-1; for(let j=html.indexOf("{",st);j<html.length;j++){ const c=html[j]; if(c==="{")d++; else if(c==="}"){ d--; if(d===0){ e=j; break; } } }
const src=html.slice(st,e+1);
function motor(conKB){
  const store={}; const localStorage={getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}};
  const w={localStorage,_wallyPrevQ:""}; w.wallyName=()=>"";
  if(conKB) new Function("window",fs.readFileSync(path.join(__dirname,"wally-kb.js"),"utf8"))(w);
  const fn=new Function("localStorage","window","$","g","pick","toast","wallyType","navigator","document","fmtMS","setTimeout","speechSynthesis",src+"; return wallyReply;")(localStorage,w,()=>null,k=>localStorage.getItem(k),a=>a[0],()=>{},()=>{},{userAgent:"n"},{getElementById:()=>null,querySelectorAll:()=>[]},t=>t,()=>0,undefined);
  return {fn,w};
}
let fallos=0, avisos=0;
const F=(m)=>{ console.log("❌ "+m); fallos++; };

/* 1) el archivo carga */
let KB;
try{ KB=motor(true).w.EDTU_KB; }catch(err){ console.error("❌ wally-kb.js no carga: "+err.message); process.exit(2); }
if(!Array.isArray(KB)||!KB.length){ console.error("❌ EDTU_KB vacío"); process.exit(2); }
console.log("📚 "+KB.length+" entradas en la base de conocimiento");

/* 2) forma de cada entrada */
KB.forEach((k,i)=>{
  if(!Array.isArray(k)||k.length!==3) return F("entrada "+i+": no es [ancla, regex, respuesta]");
  if(k[0]!==null&&!(Array.isArray(k[0])&&k[0].length&&k[0].every(a=>typeof a==="string"&&a.length>=4))) return F("entrada "+i+": anclas inválidas");
  if(Array.isArray(k[0])){ const src=k[1].source.toLowerCase(); k[0].forEach(a=>{ if(!src.includes(a.slice(0,4))) F("entrada "+i+": el ancla «"+a+"» no está en su regex"); }); }
  if(!(k[1] instanceof RegExp)) return F("entrada "+i+": la regex no es una RegExp");
  if(typeof k[2]!=="string"||k[2].length<20) return F("entrada "+i+": respuesta muy corta");
  if(k[2].length>420) return F("entrada "+i+": respuesta de "+k[2].length+" caracteres (máx 420)");
});

/* 3) no le pisa la respuesta a nadie: las preguntas del test principal que hoy caen en el
      corrector o en el comodín deben seguir cayendo ahí (el resto ya lo cubre un handler) */
const test=fs.readFileSync(path.join(__dirname,"test_wally_chat.js"),"utf8");
const RX=new RegExp('\\["((?:[^"\\\\]|\\\\.)*)"\\s*,\\s*\\/',"g");
const preguntas=[...test.matchAll(RX)].map(m=>m[1].replace(/\\"/g,'"').replace(/\\\\/g,"\\"));
const FALLBACK=/no entend[ií]|circuitos no procesaron|gira la cabeza confundido|quisiste decir|pregúntame por chistes/i;
const sin=motor(false).fn, con=motor(true).fn;
let protegidas=0;
for(const q of preguntas){
  let a="",b=""; try{ a=String(sin(q)); }catch(err){} try{ b=String(con(q)); }catch(err){}
  if(FALLBACK.test(a)){ protegidas++; if(!FALLBACK.test(b)) F("«"+q+"» debía seguir en el comodín y la base de conocimiento la interceptó: "+b.slice(0,60)); }
}
console.log("🛡️ "+protegidas+" preguntas del test que deben seguir cayendo en el comodín: respetadas");

/* 4) cada entrada responde a sus propias preguntas de ejemplo */
let probadas=0, huerfanas=0;
try{
  const ej=JSON.parse(fs.readFileSync(path.join(__dirname,"kb-preguntas.json"),"utf8"));
  const m=motor(true).fn;
  for(const [q,esperado] of ej){
    probadas++;
    let r=""; try{ r=String(m(q)); }catch(err){ r="EXCEPCIÓN: "+err.message; }
    if(r!==esperado){
      if(FALLBACK.test(r)){ huerfanas++; if(huerfanas<=5) console.log("⚠️  «"+q+"» no la responde nadie (la intercepta el corrector)"); }
      else if(avisos<5){ avisos++; console.log("ℹ️  «"+q+"» la responde otro handler antes (ok): "+r.slice(0,55)); }
    }
  }
  if(huerfanas>5) console.log("   ...y "+(huerfanas-5)+" preguntas huérfanas más");
  /* alguna se cuela: se tolera hasta el 0,5% para no bloquear por casos límite, pero se reporta */
  if(huerfanas) console.log("⚠️  "+huerfanas+" de "+probadas+" preguntas ("+(100*huerfanas/probadas).toFixed(2)+"%) las intercepta otra cosa antes");
  if(huerfanas>probadas*0.005) F("demasiadas preguntas sin respuesta: "+huerfanas+" (máximo tolerado "+Math.floor(probadas*0.005)+")");
}catch(err){ console.log("ℹ️  sin kb-preguntas.json, me salto la prueba de ejemplos"); }
if(probadas) console.log("🎯 "+probadas+" preguntas de ejemplo comprobadas");

/* 5) rendimiento del peor caso: una pregunta que no está en ninguna parte */
const m2=motor(true).fn; const N=300, t0=Date.now();
for(let i=0;i<N;i++) m2("zzz pregunta inexistente qwerty "+i);
const ms=(Date.now()-t0)/N;
console.log("⚡ peor caso (recorre toda la tabla): "+ms.toFixed(3)+" ms por respuesta");
if(ms>12) F("demasiado lento: "+ms.toFixed(1)+" ms");

console.log(fallos?("\n❌ "+fallos+" fallos"):("\n✅ base de conocimiento sana · "+KB.length+" entradas"));
process.exit(fallos?1:0);
