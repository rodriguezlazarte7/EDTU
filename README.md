# 🛰️ EDTU — el cuartel de juegos de David

Centro de mando para **agendar misiones de espionaje**, gestionar **agentes** y un **canal de comunicaciones (chat)**. Estilo neón futurista, pensada para **móvil, tablet y escritorio**.

## ✨ Características
- 🔐 Acceso de **superadmin** con PIN, y **PIN por agente** (cada agente inicia su propia sesión).
- 🎯 **Misiones**: nombre clave, objetivo, agentes, fecha/hora/ubicación, prioridad y estado.
- 👥 **Agentes**: alta, edición, borrado, bloqueo y foto. Permisos por nivel (solo nivel **Máximo** edita).
- 💬 **Chat** / canal de comunicaciones.
- 👤 **Perfil** editable (nombre + foto).
- 📱 Diseño **responsive** (celulares y tabletas).
- 💾 Datos en **localStorage** (modo local), con opción de migrar a **Supabase** para sync entre dispositivos.

## 🚀 Uso rápido
Abre `index.html` en tu navegador, o sírvelo en local:

```powershell
# Servidor local (solo este equipo)
powershell -ExecutionPolicy Bypass -File server.ps1
# Luego abre http://localhost:8080/
```

Para verlo en **móvil/tablet** en tu red Wi-Fi, ejecuta `iniciar-red.ps1` (como administrador).

## 🌐 Publicar en GitHub Pages
1. Sube estos archivos a un repositorio de GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Elige la rama `main` y carpeta `/ (root)` → **Save**.
4. En 1–2 min tendrás tu app en `https://TU-USUARIO.github.io/EDTU/`.

## 📁 Estructura
- `index.html` — la app completa (HTML + CSS + JS).
- `server.ps1` — servidor local para esta PC.
- `iniciar-red.ps1` — servidor accesible desde móvil/tablet en la red local.
- `.gitignore`, `README.md`.

---
🔒 *Datos confidenciales. Top Secret.*

## 🎮 Juegos y WALLY
Además del centro de mando, EDTU tiene **22 juegos** (5 mundos grandes: 🦖 JURASSIC, 🕷️ SCREAM, 🧟 NOT A GAME, 🏎️ F1 RB RUSH y 🧩 CUBO 3x3 + 17 minijuegos), una **🏆 Sala de Trofeos** (récords, medias, hitos, rachas, calendario, diarios) y a **WALLY**, el robot del cuartel.

- 🤖 **WALLY chat** (en la Sala de Trofeos): más de 100 tipos de preguntas — trucos de cada mundo, tus récords y estadísticas, chistes, cuentos, adivinanzas, trivia, quiz de mates e inglés (con rondas de 5 y notas), calculadora, conversiones, fecha y hora en otros países, capitales, enciclopedia de bolsillo, temporizador y más. Escribe `ayuda` para verlo por categorías.
- 🔊 **Voz**: chip "🔈 voz" o escribe `voz` para que lea sus respuestas (también dentro de los juegos); 🎤 **micrófono** para hablarle.
- 🙋 Te llama por tu nombre (`me llamo X`), recuerda tu cumpleaños (`mi cumpleaños es el 14 de marzo`) y te felicita ese día.
- 🎯 **DESAFÍO DEL DÍA** en cada mundo (misma semilla para todos) y **📤 COMPARTIR** para retar a amigos.

### 🧪 Test del chat
```bash
npm test        # node test_wally_chat.js
```
Extrae `wallyReply` de `index.html`, la ejecuta en Node con stubs y comprueba más de 300 preguntas y secuencias (más un fuzz de 60 entradas aleatorias). Los handlers se evalúan en orden: el test detecta cuando una palabra cae en otro comando antes de publicar.

Todo se guarda en el navegador (`localStorage`). Sitio: **https://www.edtu.cl** · Resumen detallado de las mejoras en `RESUMEN_SESION.md`.
