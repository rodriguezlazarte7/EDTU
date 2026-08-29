// ============================================================
//  EDTU — Servidor para Heroku (Node.js + Express)
//  Sirve la app estática (index.html) en el puerto que asigna Heroku.
// ============================================================
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// Compresión gzip (si el paquete está instalado): la base de conocimiento baja de ~1 MB a ~250 KB.
try { app.use(require("compression")()); } catch (e) { console.log("sin compresión: " + e.message); }

// La base de conocimiento sí se cachea (la URL lleva ?v= y cambia cuando cambia el contenido).
app.use((req, res, next) => {
  if (/^\/wally-kb\.js$/.test(req.path)) { res.set("Cache-Control", "public, max-age=604800"); return res.sendFile(path.join(__dirname, "wally-kb.js")); }
  next();
});

// No-cache: el navegador siempre carga la última versión publicada.
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  next();
});

// Archivos estáticos de esta carpeta (index.html, etc.)
app.use(express.static(__dirname));

// Cualquier otra ruta devuelve la app.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`EDTU activo en el puerto ${PORT}`);
});
