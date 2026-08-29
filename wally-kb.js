/* 📚 BASE DE CONOCIMIENTO DE WALLY — la genera el bucle de mejoras de EDTU.
   Formato: [ancla, regex, respuesta]. El ancla es una palabra literal barata de buscar:
   si no está en la pregunta, ni siquiera se evalúa la expresión regular (así la tabla escala
   a miles de entradas sin que el chat se ponga lento). Se consulta al final de wallyReply,
   después de todos los handlers propios del sitio, así que nunca les quita una respuesta. */
window.EDTU_KB=[
["fotosíntesis",/(qu[eé] es|c[oó]mo funciona|expl[ií]came) la fotos[ií]ntesis/,"🌿 la fotosíntesis es cómo las plantas fabrican su comida: con la luz del sol, agua de la tierra y el CO₂ del aire producen azúcar y sueltan oxígeno. por eso los bosques son la fábrica de aire del planeta."]
];
