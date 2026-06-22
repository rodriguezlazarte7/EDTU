// ============================================================
//  EDTU — Servidor para Heroku (Node.js + Express)
//  Sirve la app estática (index.html) en el puerto que asigna Heroku.
// ============================================================
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

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
