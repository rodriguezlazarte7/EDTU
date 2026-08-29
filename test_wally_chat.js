/* 🧪 Test de regresión del chat de WALLY — ejecutar: node test_wally_chat.js
   Extrae la función wallyReply de index.html, la ejecuta en Node con stubs (localStorage, $, toast...)
   y comprueba que cada pregunta cae en el handler correcto (los handlers se evalúan en orden y
   una palabra puede ser capturada por otro comando: esto lo detecta antes de publicar). */
const fs=require("fs"); const path=require("path");
const s=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const st=s.indexOf("function wallyReply(q){"); if(st<0){ console.error("no se encontró wallyReply"); process.exit(2); }
let depth=0, end=-1;
for(let j=s.indexOf("{",st); j<s.length; j++){ const c=s[j]; if(c==="{") depth++; else if(c==="}"){ depth--; if(depth===0){ end=j; break; } } }
const src=s.slice(st,end+1);
const store={};
const localStorage={getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
const window={localStorage,_wallyPrevQ:""}; window.wallyName=()=>localStorage.getItem("edtu_agent_name")||"";   /* stub del nombre (se define fuera de wallyReply) */
const $=()=>null; const g=k=>localStorage.getItem(k); const pick=a=>a[0]; const toast=()=>{}; const wallyType=()=>{};
const navigator={userAgent:"node"}; const document={getElementById:()=>null,querySelectorAll:()=>[]};
const fmtMS=t=>Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");
let fn;
try{ fn=new Function("localStorage","window","$","g","pick","toast","wallyType","navigator","document","fmtMS","setTimeout","speechSynthesis", src+"; return wallyReply;")(localStorage,window,$,g,pick,toast,wallyType,navigator,document,fmtMS,()=>0,undefined); }
catch(e){ console.error("❌ wallyReply no compila:",e.message); process.exit(2); }
/* [pregunta, regex esperado] — en orden (algunas son secuencias: adivinanza→pista→me rindo) */
const T=[
  ["hola",/agente/],["buenos días",/agente/],["ey wally",/agente/],["ayuda",/pregúntame por/],
  ["cuánto es 12 por 7",/= 84/],["100 entre 4",/= 25/],["2+2",/= 4/],["4 al cubo",/= 64/],["raíz de 81",/= 9/],["20% de 50",/= 10/],["10/0",/cero/],
  ["tira el dado",/🎲/],["d20",/20 caras/],["2 dados",/= \d+/],["moneda",/🪙/],["cara o sello",/CARA|SELLO/],
  ["qué día es hoy",/📅 hoy es/],["cuánto falta para el finde",/📅/],
  ["trabalenguas",/👅/],
  ["adivinanza",/🧠 adivinanza/],["pista",/💡 pista/],["me rindo",/era «/],
  ["adivina",/1 al 100/],["1000",/entre 1 y 100/],["50",/más (alto|bajo)|🎯/],["me rindo",/./],
  ["al revés anilina",/PALÍNDROMO/],["deletrea dino",/D - I - N - O/],["cómo se escribe murciélago",/10 letras/],["cuenta hasta 5",/1, 2, 3, 4, 5/],
  ["cuenta atrás desde 3",/3\.\.\. 2\.\.\. 1\.\.\. ¡DESPEGUE!/],
  ["piedra",/vs .* → /],["papel",/marcador/],["tijeras",/marcador/],
  ["juegos del chat",/juegos aquí mismo/],["juguemos",/juegos aquí mismo/],
  ["abre jurassic",/abriendo|dime cuál/],["quiero jugar",/dime cuál/],
  ["avísame en 1 minuto",/te aviso en 1 minuto/],["temporizador 30 segundos",/30 segundos/],
  ["canta",/soy WALLY/],["voz",/voz encendida/],["silencio",/voz apagada/],["micrófono",/🎤/],
  ["minijuegos",/🕹️/],["juegos",/./],["cubo",/trucos del CUBO/],["nitro",/trucos de F1/],["antídoto",/trucos de SCREAM/],["pescar",/trucos de JURASSIC/],["zombie",/TORRETA|zombi/i],
  ["mapa",/🧭/],["pausa",/⏸/],["fantasma",/👻/],["hora",/🕐/],["mejoras",/MEJORAS/],["chiste",/./],["estadísticas",/📈/],["calendario",/🗓️/],
  ["quién eres",/soy WALLY/],["quién te creó",/David/],["cuéntame un cuento",/érase una vez/],["tabla del 7",/7×7=49/],
  ["cuánto falta para navidad",/🎄/],["halloween",/🎃/],["cuánto falta para mi cumpleaños",/aún no sé tu cumpleaños/],["mi cumpleaños es el 14 de marzo",/apuntado/],["cuánto falta para mi cumpleaños",/🎂 (faltan|¡tu)/],
  ["cómo me llamo",/aún no sé tu nombre/],["me llamo david",/encantado, David/],["cómo me llamo",/te llamas David/],["olvida mi nombre",/agente/],
  ["marcador del chat",/🏅 marcador del chat/],["marcador",/adivinanzas resueltas/],
  ["cómo estás",/batería|feliz|circuitos/],["qué haces",/vigilo|ordeno|trabalenguas/],["te quiero",/💛|mejor espía/],["eres genial",/💛|mejor espía/],["tienes hambre",/electricidad|despierto|miedo/],["bien",/me alegro|anotado|gracias por/],
  ["mis estadísticas",/💬 chat/],
  ["sabías que",/🧠 ¿sabías que/],["dato curioso",/🧠 ¿sabías que/],
  ["cómo se dice araña en inglés",/spider/],["gato en inglés",/«cat»/],["el dinosaurio en inglés",/dinosaur/],["xyzq en inglés",/diccionario/],
  ["qué más sabes",/💡/],["dame un consejo",/💡/],
  ["quiz de inglés",/🇬🇧 quiz: ¿cómo se dice/],["zzzz",/casi/],["me rindo",/en inglés es/],
  ["trivia",/🧠 trivia: .* a\) /],["b",/CORRECTO|era [abc]\)/],
  ["quiz de mates",/🧮 ¿cuánto es \d+ [+\-×] \d+\?/],["me rindo",/😅 \d+ [+\-×] \d+ = -?\d+/],["quiz de mates fácil",/🧮 ¿cuánto es/],["0",/CORRECTO|casi/],
  ["me rindo",/era \d+|nada de qué rendirse/],["me rindo",/nada de qué rendirse/],
  ["cuántos comandos sabes",/sé responder a unos \d+ tipos/],
  ["mis notas",/🎓 tus notas — 🧮 mates: \d+\/\d+/],["cómo voy en mates",/🎓 tus notas/],
  ["ronda de mates",/RONDA DE 5! pregunta 1 de 5/],["0",/pregunta 2 de 5/],["0",/pregunta 3 de 5/],["0",/pregunta 4 de 5/],["0",/pregunta 5 de 5/],["0",/RONDA TERMINADA: \d\/5/],["ronda de trivia",/RONDA DE 5.*a\) /],["a",/pregunta 2 de 5/],
  ["ronda de inglés",/RONDA DE 5! pregunta 1 de 5: ¿cómo se dice/],["zzzz",/era «.*» ➜ pregunta 2 de 5/],["me rindo",/pregunta 3 de 5/],["me rindo",/pregunta 4 de 5/],["me rindo",/pregunta 5 de 5/],["me rindo",/RONDA TERMINADA: \d\/5/],
  ["rekord",/quisiste decir 'récord'/],["adivinansa",/quisiste decir 'adivinanza'/],["asdfgh",/no entendí|circuitos|confundido/],
];
let ok=0, bad=0;
for(const [q,re] of T){ let r=""; try{ window._wallyPrevQ=store.edtu_wally_last||""; r=String(fn(q)); store.edtu_wally_last=q.slice(0,40); }catch(e){ r="❌ EXCEPCIÓN: "+e.message; }
  const p=re.test(r); if(p) ok++; else bad++; console.log((p?"✅ ":"❌ ")+q.padEnd(30)+" → "+r.replace(/\n/g," ").slice(0,90)); }
let fz=0; const AL="abcdefghijklmnñopqrstuvwxyzáéíóú0123456789 ?¿!¡+-*/.,'🎲🧠🦖  ";
for(let i=0;i<60;i++){ const len=1+Math.floor(Math.random()*24); let q=""; for(let j=0;j<len;j++) q+=AL[Math.floor(Math.random()*AL.length)]; try{ window._wallyPrevQ=""; const r=fn(q); if(typeof r!=="string"||!r.length) throw new Error("respuesta vacía o no-string"); fz++; }catch(e){ bad++; console.log("❌ fuzz «"+q+"» → "+e.message); } }
console.log("🎲 fuzz: "+fz+"/60 entradas aleatorias sin excepciones");
console.log("\n"+ok+" OK · "+bad+" fallos · "+T.length+" preguntas");
process.exit(bad?1:0);
