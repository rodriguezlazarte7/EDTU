/* 🛠️ SERVIDOR DE DESARROLLO DE EDTU — solo para trabajar en el computador, no se usa en Heroku.
   Levanta la carpeta en http://localhost:3000 y RECARGA SOLA la página cuando guardas un archivo.
   Arrancar con:  node dev-server.js     (Ctrl+C para parar)
   No necesita instalar nada: usa solo lo que ya trae Node. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.DEV_PORT || 3000;
const RAIZ = __dirname;
const TIPOS = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif",
  ".svg":"image/svg+xml", ".ico":"image/x-icon", ".mp3":"audio/mpeg", ".wav":"audio/wav", ".mp4":"video/mp4", ".webmanifest":"application/manifest+json" };

/* --- quién está mirando (para avisarles que recarguen) --- */
const clientes = new Set();
function avisarRecarga(archivo){
  const msg = "data: " + JSON.stringify({ archivo }) + "\n\n";
  for (const res of clientes) { try { res.write(msg); } catch (e) {} }
  if (clientes.size) console.log("  🔄 " + archivo + " cambió → recargando " + clientes.size + " pestaña(s)");
}

/* --- vigilar los archivos del proyecto --- */
const VIGILAR = /\.(html|js|css|json)$/i;
const IGNORAR = /node_modules|\.git|kb-preguntas\.json/i;
let ultimo = 0;
try {
  fs.watch(RAIZ, { recursive: true }, (evt, archivo) => {
    if (!archivo || !VIGILAR.test(archivo) || IGNORAR.test(archivo)) return;
    const ahora = Date.now();
    if (ahora - ultimo < 250) return;          /* al guardar, el editor dispara varios avisos seguidos */
    ultimo = ahora;
    setTimeout(() => avisarRecarga(archivo), 90);
  });
} catch (e) { console.log("⚠️  no pude vigilar la carpeta: " + e.message); }

/* --- el trocito que se inyecta en cada página para que se recargue sola --- */
const RECARGA = `
<script>
/* 🔄 refresh automático del servidor de desarrollo (no se sube a producción) */
(function(){
  var es = new EventSource("/__recarga");
  es.onmessage = function(){ console.log("🔄 recargando..."); location.reload(); };
  es.onerror = function(){ /* si se cae el servidor, reintenta solo */ };
  window.addEventListener("beforeunload", function(){ try{ es.close(); }catch(e){} });
})();
</script>
`;

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);

  /* canal de avisos */
  if (url === "/__recarga") {
    res.writeHead(200, { "Content-Type":"text/event-stream", "Cache-Control":"no-cache", "Connection":"keep-alive" });
    res.write("retry: 800\n\n");
    clientes.add(res);
    req.on("close", () => clientes.delete(res));
    return;
  }

  let rel = url === "/" ? "/index.html" : url;
  const archivo = path.join(RAIZ, path.normalize(rel).replace(/^([\\/])+/, ""));
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end("no"); return; }

  fs.readFile(archivo, (err, data) => {
    if (err) { res.writeHead(404, { "Content-Type":"text/plain; charset=utf-8" }).end("404 · no encontré " + rel); return; }
    const ext = path.extname(archivo).toLowerCase();
    const tipo = TIPOS[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": tipo, "Cache-Control": "no-store" });
    if (ext === ".html") { res.end(data.toString("utf8").replace(/<\/body>/i, RECARGA + "</body>")); }
    else res.end(data);
  });
}).listen(PORT, () => {
  console.log("");
  console.log("  🛰️  EDTU en modo desarrollo");
  console.log("  ──────────────────────────────────────────");
  console.log("  El cuartel : http://localhost:" + PORT + "/");
  console.log("  STAR WARS  : http://localhost:" + PORT + "/starwars.html");
  console.log("");
  console.log("  Guarda un archivo y la página se recarga sola 🔄");
  console.log("  Ctrl+C para parar.");
  console.log("");
});
