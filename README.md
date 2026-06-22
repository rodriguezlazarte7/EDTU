# 🛰️ EDTU — Espías De Tecnología Universal

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
