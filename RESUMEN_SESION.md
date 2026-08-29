# 🛰️ EDTU — Resumen de la sesión autónoma (2026-08-28)

**Bucle de mejora continua mientras David estaba fuera** — dos tandas: la primera (~iter 205 → 302) y, tras el "sigue sin parar" de David, de la segunda a la duodécima (iter 303 → 445 y sigue, ya con David durmiendo 😴). **434 commits desde el 26/8** (~351 en esta gran sesión), con deploy a Heroku y verificación en vivo en cada paso. **Ningún juego quedó roto en ningún momento** (chequeos de salud cada 10 iteraciones: todos verdes; el último, iter 445, Heroku v1326).

**Números actuales**: 🕷️ SCREAM **115** 🏆 · 🦖 JURASSIC **122** 🏆 · 🧟 NOT A GAME **110** 🏆 · 🏎️ F1 **82** · 🧩 CUBO **66** · **tres juegos superaron las 100 features** · 445 iteraciones de bucle verificadas sanas 🎉 · páginas en vivo todas HTTP 200.

## 🔍 Auditoría multi-agente (ultracode)
- 2 rondas con agentes buscadores + verificadores adversarios: **25 hallazgos, 24 bugs reales corregidos** (1 refutado)
- Destacados: joystick táctil roto en SCREAM/JURASSIC, nivel hospital inalcanzable en NAG, doble cadena de IA en RUBIK, relojes que corrompían récords

## 🕷️ SCREAM (95 features)
- 👑 **PESADILLA+**: 6ª dificultad SECRETA (se desbloquea venciendo INFIERNO)
- ⚡ **Generador de emergencia**: 3s de carga → luz total 20s y araña congelada (bombilla gris al gastarse)
- 🎵 **Vitrola hipnótica**: melodía fúnebre 25s que atrae a la araña (distracción táctica)
- 🛗 **Ascensor de servicio**: sube un piso, pero sus DINGs atraen a la araña (cuenta regresiva en el HUD)
- 🐀 Ratas **detectoras de peligro** (chillan cerca de la araña invisible o el maniquí)
- 📞 Teléfono ampliado: 25% llama **EL DIRECTOR** (ánimo) + susurros escalofriantes
- 📡 Radar completo (válvulas, muestras, relojes, botiquines, teléfono, WALLY, maniquí, generador, vitrola, ascensor)
- 🎓 Tutorial de primera vez · 📸 modo foto F2

## 🦖 JURASSIC (97 features)
- 🔥 **Fogata** (C): zona segura temporal + curación · 🦅 **Pterodáctilo** con picadas esquivables (radar + sombra creciente)
- 🥚 **HUEVO DORADO**: secreto en 6 escondites → logro nº 21
- 🦕 **Estampidas** con temblor de aviso · 🏜️ **Arena movediza** (machaca ESPACIO para zafarte)
- 🎣 **Pesca** en el lago (con bota vieja de chiste) · 🐣 **Ptero bebé mascota** (premio por rescates)
- 🏝️ **MODO LIBRE** tras el rescate ("SEGUIR EXPLORANDO")
- 🗺️ **Tu aventura dibujada**: mapa con tu ruta exacta al ganar

## 🧟 NOT A GAME (85 features)
- 🚨 **MODO SIRENA** (60 kills): niebla roja 30s, zombies x2 pero kills x2
- 🐈‍⬛ **Gato aliado** (E): 60s espantando zombies · 🐕 Perro con personalidad (frases + salta con tus kills)
- 🟣 **Zombie ESCUPIDOR** (80+ kills): ácido esquivable que nubla la vista
- 🧪 **DR. VZ**: el creador del virus huye de ti — atrápalo por su maletín
- 🤖🔫 **Torreta del helipuerto** (5+ pistas) · 🔋 **Batería de linterna** nocturna + pilas verdes
- 🌧️ Lluvia nocturna (zombies patinan) · 📜 Pistas narradas por voz · 🗺️ Investigación dibujada al ganar

## 🏎️ F1 RB RUSH (60 features)
- 👻 **FANTASMA de tu récord** (como Mario Kart) + duelo con anuncio al superarlo
- 🦅 **KÓNDOR**: rival con nombre y head-to-head histórico (W-L en la portada)
- ⏱️ **Sectores de 2000 m** ("🟢 SECTOR VERDE") · 📯 **Claxon** (H) que aparta rivales
- 🪞 **MODO ESPEJO** (premio por 10 km) · 🎨 **Garaje de 6 colores** · ✨ Chispas DRS
- ☄️ **Lluvia de meteoros** nocturna (guiño a David) · 🚩 Público con banderas y pancartas ("¡VAMOS DAVID!")

## 🧩 CUBO 3x3 (51 features)
- 💡 **Pistas T** (matemáticamente exactas, máx 3) + botón táctil · 🎓 **PRÁCTICA LIBRE** (pistas infinitas)
- 🏁 **Podio top 3** por dificultad · 🔥 Racha de giros perfectos · 🎉 Confeti + 🎼 **Oda a la Alegría** al ganar
- ♿ **Modo símbolos** (accesibilidad daltónica) · 👑 **CUBO DE ORO** (skin exclusiva del 21/21)

## 🏠 Menú / Centro de Mando
- 🏆 **Sala de Trofeos** con WALLY presentador animado, **PÓSTER de récords** compartible, **progreso semanal** y **CHAT con WALLY** (chistes, trucos, recomendaciones)
- 👑 **Fiesta única del 21/21** (lluvia de WALLYs + cartel dorado + voz) — se disparará cuando David lo logre
- 🥚 Huevos de pascua: 5 clics al logo EDTU · escribir "wally" con el teclado
- 🔊 Tick al pasar por los botones · emojis en los títulos de pestaña 🕷️🦖🧟🏎️🧩

## 🎁 Tramo final de la sesión (iter 285+)
- 🕷️ SCREAM: **Tu escape dibujado** — el edificio en 7 franjas con tu ruta piso a piso (¡trilogía de mapas de victoria completa!)
- 🧟 NAG: **Cementerio personal** — 3 lápidas con tus últimas 3 caídas ("Aquí cayó el agente: 47 kills...")
- 🦖 JURASSIC: **Nubes con forma** (dino/WALLY/corazón, comenta si las miras) · **🏆 FEATURE Nº 100: "La manada te acepta"** (acaricia una cría con su papá cerca → las estampidas te esquivan) · **Cocos traicioneros** 🥥 (quieto bajo un árbol = ¡TOC!... pero son comida)

## 🆕 Segunda tanda (iter 303-345) — "sigue sin parar"
- 🏎️ **F1**: **LAUNCH CONTROL** (semáforo: salir en verde da turbo, salir antes = salida en falso) · **CÁMARA LENTA** al chocar (0.25x con viñeta) · **PIT STOP** cada 3000 m (entra por el carril y sales con boost) · 📅 récord semanal de metros
- 🧟 **NAG**: 💓 **Latido de corazón** cuando un zombie está a <5 m (más rápido cuanto más cerca) · 🌙 **Contador de noches** sobrevividas (HUD + récord + tarjeta) · 👣 Pasos que cambian por superficie (eco del drenaje, metal del helipuerto, chapoteo con lluvia) · 📅 récord semanal de kills · 📻 **RADIO DE LA CENTRAL**: si llevas 45 s sin pista te dice a cuántos metros y hacia dónde está la más cercana (estática + voz) · 📁 **EXPEDIENTE DEL CASO**: kills, pistas, noches, gigantes, gato, Dr. VZ, helicóptero, túnel, lápidas, sirena — últimos 3 casos guardados y "Último caso" en la portada
- 🦖 **JURASSIC**: 📅 récord semanal de días · 📖 **DIARIO DEL EXPLORADOR**: peces, cocos, bayas, fogatas, picadas del pterodáctilo, manada aceptada, huevo dorado, ataques (o "sin heridas") — últimas 3 aventuras y "Última aventura" en la portada
- 🕷️ **SCREAM**: 📅 récord semanal de mejor escape · 📖 **DIARIO DEL SOBREVIVIENTE**: apariciones de la araña, mordidas (o "sin mordidas"), botiquines, generador, vitrola, ascensor — últimos 3 escapes y "Último escape" en la portada
- 🧩 **CUBO**: 📅 **DESAFÍO DEL DÍA** (la misma revoltura para todos, semilla por fecha; mejor tiempo del día guardado) + **preview de la revoltura** en notación (R U' F…) para compartirla con amigos
- 🏠 **Menú / Sala de Trofeos**: línea **"Récords de la semana"** (🏎️ m · 🦖 días · 🧟 kills · 🕷️ tiempo, se renuevan cada lunes) · sección **📖 ÚLTIMAS AVENTURAS** con la entrada más reciente de cada diario · WALLY chat: pregúntale por la **"semana"** (te resume los récords y te anima) o por tu **"aventura"/"diario"** (te cuenta las tres últimas)
- 🩺 Chequeos de salud en 310, 320, 330, 335 y 345: todo verde

## 🆕 Tercera tanda (iter 346-359) — diarios, memoria y desafíos del día
- 📖 **DIARIOS en los 5 juegos**: 🦖 *Diario del explorador* (peces, cocos, bayas, fogatas, picadas, manada, huevo, heridas) · 🕷️ *Diario del sobreviviente* (apariciones de la araña, mordidas, botiquines, generador, vitrola, ascensor) · 🧟 *Expediente del caso* (kills, pistas, noches, gigantes, gato, Dr. VZ, helicóptero, túnel, lápidas, sirena) · 🏎️ *Diario de carrera* (metros, sectores, pits, DRS, KÓNDOR, clima) · 🧩 *Bitácora de cubero* (dificultad, tiempo, giros, pistas, racha perfecta). Cada juego guarda sus últimas 3 partidas y muestra "Última aventura" en su portada; la Sala de Trofeos las reúne en **📖 ÚLTIMAS AVENTURAS**
- 🧠 **MEMORIA de la partida anterior en los 5 mundos**: WALLY en la isla y en el edificio te recuerda cómo te fue ("la última vez pescaste 2 peces... ¿hoy superas eso?", "la araña te apareció 5 veces... con la linterna apagada no te encuentra"), el 🐕 perro de NAG lo ladra al acariciarlo, el HUD de F1 te muestra "la última vez: 4210 m — ¡a superarlo!" en la cuenta regresiva, y la 🤖 IA del cubo te provoca con voz ("la última vez te gané en 48s... ¿revancha?"). Y el WALLY presentador de la Sala te saluda con un dato de tu diario
- 📅 **DESAFÍO DEL DÍA en los 5 juegos** (semilla = fecha, "lo mismo para todos hoy"): 🧩 misma revoltura (con preview en notación para compartir) · 🕷️ mismo edificio (válvulas, muestras, relojes, botiquines, generador, vitrola, WALLY, teléfono, maniquí, crías, araña) · 🦖 misma isla (huevo, objetos, dinos y crías) · 🧟 misma ciudad (casas, autos, cajones de pistas) · 🏎️ mismo clima y tráfico. Cada uno guarda tu mejor marca del día; la Sala muestra **📅 DESAFÍOS DE HOY** ("¡los cinco! 🏅" o cuáles te faltan) y la **🔥 RACHA DE DÍAS** seguidos jugando desafíos (con récord y aviso rojo si se pierde a medianoche)
- 📻 **RADIO DE LA CENTRAL** (NAG): si llevas 45 s sin pista, la central te dice a cuántos metros y hacia dónde está la más cercana (estática + voz)
- 🤖 **Chat WALLY** nuevas palabras: *semana* (récords semanales), *aventura/diario* (tus últimas partidas), *desafío/hoy* (marcas del día), *racha* (días seguidos) y *mejoras* (celebra las 350+ mejoras de la sesión)
- 🩺 Chequeos de salud en 345 y 355: todo verde

## 🆕 Cuarta tanda (iter 360-369) — compartir y retar
- 📤 **COMPARTIR**: en la Sala de Trofeos (tus desafíos de hoy + racha), en el cubo (la revoltura del día en notación) y al terminar SCREAM, JURASSIC, NAG y F1 si la partida fue desafío del día — usa el menú de compartir del celular o copia al portapapeles ("✅ COPIADO — ¡a retar amigos!")
- ⚔️ **RECIBIR UN RETO**: los links compartidos llevan `?reto=1`; cuando tu amigo lo abre, el desafío del día se le activa solo **con el mismo mundo que el tuyo** — en el menú WALLY cruza avisando "¡TE RETARON!", en el cubo el botón se vuelve "📅 DESAFÍO DEL DÍA ⚔️ ¡ACEPTAR RETO!", SCREAM y JURASSIC lo anuncian en la portada y NAG recarga una vez para generar la misma ciudad
- 🤖 WALLY chat *"reto"/"amigo"* explica cómo retar y te arma el texto listo para copiar con tus 5 marcas del día; los desafíos quedan **persistentes** en los 5 juegos (recuerdan si los dejaste activados)
- 🏆 **NOT A GAME llegó a 100 features** — el tercer juego en cruzar la barrera (con SCREAM y JURASSIC)
- 🩺 Chequeo de salud en 365: todo verde

## 🆕 Quinta tanda (iter 370-375) — retos contados, espectador y rostro
- ⚔️ **Retos contados**: cada reto abierto por link y cada 📤 COMPARTIR se cuentan; la Sala muestra "retos: N enviados · M recibidos" y WALLY lo menciona
- 👻 **F1 MODO ESPECTADOR**: botón "VER MI RÉCORD" en la portada de F1 (si hay fantasma grabado) — el auto corre solo siguiendo la trayectoria de tu récord y termina con "así corrió tu récord: N m — ahora véncelo tú" (sin tocar récords ni diario)
- 🧬 **Arreglo del login facial** (lo reportaste antes de dormir: "no me deja entrar"): umbrales estándar de la IA (0.62 en vivo por promedio de 4 lecturas / 0.58 final; antes 0.55/0.50, más estricto de lo recomendado), aprendizaje adaptativo (cada verificación guarda el ángulo/luz nuevo), mensajes con el % de parecido y qué hacer, y aviso previo si el dispositivo no tiene rostro guardado. Además una auditoría encontró y se corrigieron **12 bugs**: el reloj de 25 s corría mientras bajaban ~7 MB de modelos (ahora corre desde que la IA carga), guardar la plantilla podía colgar la barra al 100 %, el botón desaparecía en Safari/Firefox antes de dar permiso, doble toque abría dos sesiones, el video no recibía play() (iOS), el rechazo de cámara no decía el motivo, la malla 3D rota dejaba la barra pegada al 70 %, la "cara seria" bloqueaba a quien ya venía sonriendo, un 404 de la red de expresiones bloqueaba todo, tamaño de detector distinto al del entrenamiento, la lista de agentes sin proteger y un bug del service worker que hacía pasar TODAS las descargas por él
- 🤖 WALLY chat *"rostro"/"cámara"/"no me deja entrar"* explica cómo funciona y qué hacer

> 📌 **Para David — registrar tu rostro en un celular nuevo**: el rostro se guarda en cada dispositivo. Escribe **HOLA** en la portada → **25062015** en la bóveda → cara seria y luego **sonríe** al escáner. Si no te reconoce: más luz, sin gorro ni lentes, o **4567** borra el rostro para registrarlo de nuevo. Necesita **https://www.edtu.cl** y permiso de cámara.

## 🆕 Sexta tanda (iter 376-385) — pulido con cariño
- 💾 **Respaldo del rostro en IndexedDB**: si iOS borra el localStorage a los 7 días, las huellas se restauran solas al abrir el escáner
- 🦖 **JURASSIC**: las flechas a la torre de radio y a tu casa muestran la **distancia en metros**; al recoger la 3ª batería te manda a seguir la flecha; 🌇 **aviso "anochece en 8 s"** (el día dura 24 s) para volver al refugio o prender la fogata
- 🧟 **NAG**: **flecha dorada a la pista más cercana** durante 8 s cada vez que la Radio de la Central avisa (con metros)
- 🕷️ **SCREAM**: **ÚLTIMO ALIENTO** — con 1 ❤️ y la araña a menos de 9 m, el corazón late (tum-tum grave + vibración, más rápido cuanto más cerca)
- 🧩 **CUBO**: en el desafío del día el HUD muestra tu objetivo "🎯 hoy: 48.2s" y se pone rojo si el reloj lo pasa
- 🏎️ **F1**: el diario de carrera guarda también velocidad máxima y adelantamientos ("⚡ 312 km/h · 🏁 14 adelant.")
- 📆 **Fechas relativas** en los 5 diarios y en la Sala: "hoy", "ayer", "hace N días"
- 🩺 Chequeo de salud en 385: todo verde

## 🆕 Séptima tanda (iter 386-395) — detalles que enamoran
- 🔥 **WALLY presentador felicita tu racha** de días con desafíos (a los 7: "eres IMPARABLE, agente 🏅")
- 🕷️ **SCREAM**: contador "🕷️ apariciones: N" en el HUD y el **ESCAPE FANTASMA** 👻 — ganar sin que la araña se te aparezca ni una vez (aviso, contador en la portada y marca en el diario); WALLY chat *"fantasma"* explica los dos fantasmas de EDTU
- 🧟 **NAG**: el WALLY del helipuerto **recuerda tu último caso** y la pista señalada por la central se dibuja **dorada en el radar** (con marcador en el borde si está lejos)
- 🦖 **JURASSIC**: el reloj hace **cuenta atrás "🌇 -6s"** en naranja antes de la noche
- 🏎️ **F1**: el cartel de KÓNDOR muestra el **marcador histórico** ("⚔️ ¡VENCISTE A KÓNDOR! (3-1)") y el locutor canta "¡Kóndor derrotado! Van 3 a 1"
- 📸 El **póster** de récords incluye la racha, los retos enviados/recibidos y los escapes fantasma
- 🩺 Chequeo de salud en 395: todo verde

## 🆕 Octava tanda (iter 396-405) — la madrugada de las 400
- 🎉 **Iteración 400** alcanzada de madrugada: WALLY lo celebra en el chat y en la Sala
- 🤖 WALLY chat **"ayuda"** lista todo lo que sabe responder (el placeholder del chat lo sugiere)
- 🧩 **CUBO**: al ganar el desafío del día te dice "🎯 -1.3s vs tu marca" · 🏎️ **F1**: el choque te cuenta a cuánto quedaste de tu fantasma ("te faltaron 320 m" / "¡superaste a tu fantasma!") y la **radio del ingeniero** habla en el pit ("Box, box" / "Neumáticos nuevos, ¡a fondo!")
- 🧟 **NAG**: ritmo "⚡ kills/min" en las estadísticas con récord · 🕷️ **SCREAM**: el mapa grande marca generador, vitrola, ascensor, botiquines y relojes
- 🦖 **JURASSIC**: la fogata avisa 10 s antes de apagarse; el chillido del ptero bebé ahora viene con texto
- 🔗 **Sala de Trofeos con enlaces**: cada aventura y cada desafío pendiente te lleva al juego con un clic
- 🩺 Chequeo de salud en 405: todo verde

## 🆕 Novena tanda (iter 406-415) — memoria por todos lados
- 🧟 **NAG**: la torreta del helipuerto cuenta sus kills (estadísticas y expediente) y WALLY te dice tu ritmo récord en kills/min
- 🦖 **JURASSIC**: WALLY celebra tu racha sin heridas ("¡N días sin un rasguño! eres un fantasma para los dinos"), el diario marca "sin heridas (¡NINJA!)", la radio encendida queda en el diario y WALLY la recuerda; los avisos de anochecer y fogata ya no se pisan
- 🕷️ **SCREAM**: el teléfono a veces **lee tu diario** ("...la última vez escapaste en 12:40... esta vez no será tan fácil...")
- 🧩 **CUBO**: la racha perfecta aparece en la Sala de Trofeos
- 📖 **ÚLTIMAS AVENTURAS** más detallada (tiempo del caso, noche/lluvia, generador/vitrola/ascensor, racha perfecta, radio) y WALLY chat *"aventura"* con fechas relativas
- 🩺 Chequeo de salud en 415: todo verde

## 🆕 Décima tanda (iter 416-425) — radios y consejos
- 🏎️ **F1**: la radio del ingeniero avisa "Kóndor a la vista, ¡a pelear, piloto!" y felicita "Mejor de la semana, piloto. Sigue empujando."
- 🧟 **NAG**: la Central felicita por radio a los 50 kills ("cincuenta eliminados, agente. Sigue así.") y el perro ladra cuando la central señala una pista
- 🧩 **CUBO**: fanfarria de 5 notas al batir tu marca del día
- 🕷️ **SCREAM**: WALLY aconseja según cuántas veces se te apareció la araña ("con la linterna apagada no te ve")
- 🦖 **JURASSIC**: WALLY aconseja de noche ("los depredadores cazan más — quédate cerca del refugio o de una fogata")
- 🏆 **Sala**: DESAFÍOS DE HOY dice en cuántas horas se renuevan
- 🩺 Chequeo de salud en 425: todo verde

## 🆕 Undécima tanda (iter 426-435) — pistas claras
- 🕷️ **SCREAM**: WALLY recuerda tu escape fantasma anterior ("la última vez la araña nunca te vio... ¿repites, ninja?"); el objetivo del HUD dice cuántas válvulas 🔧 y muestras 🧪 quedan en ESTE piso y se refresca al cambiar de piso; el mapa grande muestra abajo en qué pisos quedan piezas (PB · P2◀ · P5)
- 🦖 **JURASSIC**: las estadísticas del fin muestran fogatas, peces y cocos; el reloj del HUD muestra 🔥 mientras tu fogata sigue encendida
- 🧟 **NAG**: el expediente del caso muestra tu ritmo en kills/min
- 🏎️ **F1**: la portada dice hasta dónde llegó tu fantasma ("llegó a N m... ¡véncelo!")
- 📄 RESUMEN sin la nota duplicada de la iteración 400
- 🩺 Chequeo de salud en 435: todo verde (Heroku v1309, 425 commits desde el 26/8)

## 🆕 Duodécima tanda (iter 436-445) — brújulas y fantasmas
- 🦖 **JURASSIC**: flecha 🔥 TU FOGATA con distancia y segundos que le quedan; WALLY (E) te recuerda la fogata encendida ("sigue viva a N m y le quedan N s")
- 🧟 **NAG**: el HUD lleva cuenta atrás "🌅 amanece en m:ss" de noche y "🌙 anochece en m:ss" de día
- 🧩 **CUBO**: la portada muestra tus últimas 3 carreras y si vas mejorando ("⬆️ vas mejorando")
- 🏎️ **F1**: la portada dice cuándo hiciste tu récord (hoy / ayer / hace N días); el diario guarda el duelo con tu fantasma ("👻 fantasma vencido" / "👻 el fantasma ganó")
- 🏆 **Sala**: ÚLTIMAS AVENTURAS marca el duelo 👻 de F1 y WALLY lo menciona al saludar ("le ganaste a tu fantasma" / "tu fantasma sigue invicto")
- 🤖 **WALLY chat**: "mapa / flecha / brújula / perdí / radar" explica todas las ayudas de orientación de los 4 mundos; "ayuda" lista "mapa 🧭"
- 📄 RESUMEN con la Undécima tanda
- 🩺 Chequeo de salud en 445: todo verde (Heroku v1326, 434 commits desde el 26/8)

## 🤖 WALLY por todos lados
Frases x8 por juego, celebra el 21/21 con voz, escanea pisos/baterías/cajones, certifica el póster... y presume su carrera de mBots en todas partes 🏁
