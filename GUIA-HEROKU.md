# 🚀 Desplegar EDTU en Heroku

EDTU se sirve con un mini servidor **Node.js + Express** (`server.js`). Estos archivos ya están preparados:

- `package.json` — define la app y la dependencia `express`.
- `server.js` — sirve `index.html` en el puerto de Heroku.
- `Procfile` — `web: node server.js`.
- `app.json` — metadatos de despliegue.

> 💡 Heroku **ya no tiene plan gratuito**. Necesitas un dyno de pago (Eco ≈ 5 USD/mes) y registrar una tarjeta.

---

## Opción A — Desde GitHub (recomendada, sin instalar nada)

### 1) Sube los archivos nuevos al repo
En **github.com/rodriguezlazarte7/EDTU** → **Add file → Upload files** y sube:
`package.json`, `server.js`, `Procfile`, `app.json`
(además de `index.html` si aún no estaba). **Commit changes**.

### 2) Crea la app en Heroku
1. Entra en **https://dashboard.heroku.com** (crea cuenta si no tienes).
2. **New → Create new app** → ponle un nombre único (ej. `edtu-espias`) → **Create app**.

### 3) Conéctala a GitHub
1. En la app → pestaña **Deploy**.
2. **Deployment method → GitHub** → autoriza y busca el repo **EDTU** → **Connect**.
3. Baja a **Manual deploy**, elige la rama **main** → **Deploy Branch**.
   - (Opcional: activa **Enable Automatic Deploys** para que cada cambio en GitHub se publique solo.)

### 4) Ábrela
Cuando termine, pulsa **Open app**. Tu URL será algo como:
```
https://edtu-espias.herokuapp.com/
```

---

## Opción B — Heroku CLI (requiere instalar Git + Heroku CLI)

```bash
heroku login
heroku git:remote -a NOMBRE-DE-TU-APP
git add .
git commit -m "Deploy EDTU"
git push heroku main
heroku open
```

---

## Notas
- La app es **pública**. Por ahora los datos son **locales por dispositivo** (localStorage).
- Cuando integremos **Supabase**, los datos irán a la nube (sync entre dispositivos).
- Si el deploy falla, revisa los **logs**: en el dashboard → **More → View logs**, o `heroku logs --tail`.
