# JB Perfume Lab

JB Perfume Lab es un espacio personal, Android-first y local-first para desarrollar conceptos olfativos, estudiar composiciones, analizar patrones y construir una identidad creativa propia.

## Dirección del producto

La aplicación prioriza la formulación conceptual y la investigación creativa. No incluye escenas 3D, renderizado de objetos, cámaras, zoom, iluminación virtual ni animaciones tridimensionales. La interfaz se concentra en tablas, gráficos analíticos, historial y herramientas de comparación.

- Constructor de composiciones con materias de referencia de la biblioteca.
- Distribución normalizada en 100 puntos creativos para comparar ideas.
- Análisis de familias, facetas sensoriales y estructura orientativa salida/corazón/fondo.
- Índice de diferenciación interna contra fórmulas guardadas en el archivo personal.
- Lectura de patrones de identidad creativa y desafíos para explorar familias menos utilizadas.
- Archivo local de creaciones, variantes, versiones e importación/exportación JSON.
- Dashboard de indicadores y tendencias con gráficos 2D.
- PWA instalable, responsive y preparada para funcionamiento local/offline.

**Límite fundamental:** el sistema es una herramienta de exploración editorial y creativa, no un simulador químico ni una guía de fabricación. Los puntos creativos no son porcentajes de ingredientes, concentraciones, dosificaciones ni relaciones de producción. El índice de diferenciación solo compara el historial local del usuario; no demuestra originalidad mundial, ausencia de similitudes comerciales, patentabilidad ni exclusividad.

## Dashboard y analítica

El dashboard agrega las creaciones y variantes guardadas en el dispositivo. Muestra conteos de creaciones, variantes, versiones y referencias distintas, junto con la participación de familias olfativas y actividad reciente. Los gráficos se construyen directamente desde los datos guardados; si el archivo está vacío, la interfaz muestra un estado inicial sin inventar estadísticas.

## Motor de originalidad personal

El Originality Engine compara una composición candidata contra variantes y versiones históricas diferentes del propio archivo local. Su índice combina:
- Frecuencia histórica de uso de referencias.
- Novedad de parejas de referencias que no aparecen juntas en el archivo.
- Distancia de distribución frente a la composición histórica más cercana.

La afinidad con patrones previos es una métrica separada: una fórmula puede diferenciarse bastante del archivo y, a la vez, alejarse del estilo predominante del creador. La primera fórmula no recibe una puntuación ficticia; el sistema solicita una línea base suficiente.

No se consulta Internet, catálogos comerciales ni bases de datos globales de fórmulas. Por tanto, el resultado debe interpretarse como **diferenciación interna de tu archivo**, nunca como garantía de que una fragancia sea inédita en el mercado.

## PWA, actualizaciones y uso offline

El service worker administra una caché de shell versionada. La aplicación comprueba si existe una actualización al iniciar y al pulsar **Buscar versión**. Un aviso de actualización pendiente se presenta una sola vez; al cerrarlo, la decisión queda guardada mientras esa misma actualización continúe pendiente. Una versión nueva vuelve a generar el aviso. El mensaje «Está todo actualizado» solo aparece después de una comprobación solicitada manualmente.

La instalación PWA puede realizarse desde Chrome en Android usando **Instalar** cuando el navegador ofrece el diálogo, o desde su menú de instalación. El almacenamiento de creaciones es local en el dispositivo, sin sincronización en la nube. Exportá respaldos JSON regularmente: borrar los datos del navegador o cambiar de dispositivo puede eliminar el archivo local.

Incrementá CACHE_NAME en sw.js cuando se publique un nuevo shell.

## Biblioteca olfativa

La biblioteca editorial incluye 60 referencias con familia, roles orientativos en la pirámide, facetas sensoriales, perfiles y asociaciones creativas. Estas descripciones son referencias educativas; no representan reglas técnicas universales ni fórmulas.

## Desarrollo

Requisitos: Node.js 22+ y npm.

~~~~bash
npm test
npm run validate
~~~~

JB Expert QA 2.0 está declarado como dependencia de desarrollo, pero su runtime no se instala como parte de la aplicación web ni se usa para prestar el servicio principal.

## Roadmap de rediseño

| Bloque | Alcance | Estado |
|---|---|---|
| 1. Estabilidad PWA | Un solo aviso por release pendiente; persistir el cierre; chequeo manual separado | **Completado** |
| 2. Retirada 3D | Eliminar import map, motor, cámara, zoom, renderizado y caché externa | **Completado** |
| 3. Dashboard analítico | Indicadores locales, familias, actividad e interfaz responsive | **Completado** |
| 4. Originalidad e identidad | Diferenciación interna, afinidad personal y desafíos creativos | **Completado** |
| 5. Certificación y publicación | Tests, validator, documentación, CI, PR y despliegue | **Completado** — PR #32 fusionado, CI verde y Pages desplegado |
| 6. Experiencia del constructor | Búsqueda directa, filtros por familia/tipo/ubicación y ajuste numérico preciso | **Completado** — PR #33 fusionado |
| 7. Comparación analítica | Comparar variantes guardadas, coincidencia estructural y diferencias por familia/faceta/rol | **Completado** — PR #34 fusionado |
| 8. Historial de firma personal | Evolución por versiones, familias recurrentes, referencias frecuentes y cambios entre el primer y último registro | **Completado** — PR #36 fusionado |
| 9. Experimentos sensoriales | Observaciones subjetivas por variante y versión, contexto, tiempo, facetas, valoraciones y respaldo independiente | **Completado** — PR #38 fusionado |
| 10. Informes profesionales | Dossier por variante con composición, análisis editorial e historial sensorial; impresión PDF y exportaciones CSV/JSON | **Completado** — PR #39 fusionado |
| 11. UX móvil del formulador | Compactar el Bloque 06, aclarar el contador de materias y optimizar búsqueda, filtros y resultados en Android | **Completado** — PR #41 fusionado |
| 12. Asistente creativo local | Interpretar briefs personales, perfiles de clientes e inspiraciones; recomendar referencias existentes con explicación y transferencia voluntaria al formulador | **Completado** — PR #42 fusionado |
| 13. Motor de propuestas de formulación | Propuestas conceptuales A/B/C, explicación de cada referencia, balance editable de puntos creativos y transferencia voluntaria | **Pendiente** |
| 14. Originalidad y diferenciación por inspiración | Extraer rasgos apreciados de perfumes de referencia y explorar estructuras conceptuales distintas sin reconstruir fórmulas comerciales | **Pendiente** |
| 15. Briefs y diseño para clientes | Perfil de gustos, rechazos, ocasión y estilo; preguntas guiadas y conexión con propuestas de formulación | **Pendiente** |
| 16. Validación integral del asistente | Pruebas de recomendaciones, referencias existentes, normalización, persistencia, autonomía offline, privacidad y aceptación Android | **Pendiente** |

La base funcional vigente pasó **144/144 pruebas**, comprobación de sintaxis y validador de estructura en GitHub Actions tras el Bloque 12. Los PR #32 al #42 de funcionalidad y cierre documental están integrados en `main`. La PWA usa `shell-v36` e incluye el asistente en su shell offline. Queda pendiente la revisión física de la interfaz, el comportamiento de actualización PWA, la impresión/guardado PDF en Android, la aceptación visual responsive y la verificación del despliegue más reciente de GitHub Pages.

## Bloque 6 — Experiencia del constructor

El constructor incorpora un buscador integrado con filtros por familia, tipo y ubicación orientativa. Los resultados permiten añadir una referencia sin navegar a otra pantalla, muestran cuáles ya pertenecen a la composición y permiten ampliar o reducir el listado. La edición de cada peso combina deslizador y campo numérico; la redistribución conserva el total conceptual de 100 puntos. El borrador local y el archivo existente se mantienen.

## Bloque 7 — Comparación analítica

El módulo permite comparar dos variantes guardadas, incluso cuando pertenecen a creaciones distintas. Calcula coincidencia estructural por puntos creativos compartidos, referencias añadidas o retiradas y cambios por referencia. También presenta distribuciones comparativas por familia olfativa, facetas editoriales y roles orientativos de salida/corazón/fondo. Los gráficos y porcentajes describen exclusivamente los datos conceptuales del archivo local: no predicen olor real, compatibilidad química ni similitud comercial. La comparación es de solo lectura y no modifica las composiciones guardadas.

## Bloque 8 — Historial de firma personal

El historial recorre las versiones guardadas de cada variante, las ordena cronológicamente y resume las familias editoriales presentes, las referencias más recurrentes y los cambios entre el primer registro y el más reciente. La vista de evolución usa hasta ocho registros recientes para conservar una lectura compacta en móvil. No añade registros al archivo ni modifica las composiciones. Los patrones representan únicamente decisiones creativas guardadas y etiquetas editoriales; no determinan una identidad olfativa objetiva ni una medición sensorial.

## Bloque 8 — Historial de firma personal

El historial recorre las versiones guardadas de cada variante, las ordena cronológicamente y resume las familias editoriales presentes, las referencias más recurrentes y los cambios entre el primer registro y el más reciente. La vista de evolución usa hasta ocho registros recientes para conservar una lectura compacta en móvil. No añade registros al archivo ni modifica las composiciones. Los patrones representan únicamente decisiones creativas guardadas y etiquetas editoriales; no determinan una identidad olfativa objetiva ni una medición sensorial.

## Checkpoint de desarrollo — Bloques 1 a 16

**Completados (1–12):** estabilidad PWA; retirada 3D; dashboard analítico; motor de originalidad personal; certificación base; constructor de formulación; comparación analítica; historial de firma; experimentos sensoriales; informes profesionales; compactación móvil del Bloque 06; asistente creativo local.

**Pendientes (13–16):**
- **Bloque 13 — Motor de propuestas:** generar rutas creativas A/B/C con referencias reales, explicar aportes editoriales y distribuir puntos creativos editables; el usuario conserva el control de la mezcla.
- **Bloque 14 — Diferenciación por inspiración:** registrar qué rasgos de un perfume gustan y proponer direcciones alternativas, sin copiar ni reconstruir fórmulas de terceros.
- **Bloque 15 — Briefs de clientes:** recopilar gustos, rechazos, ocasión y estilo mediante preguntas breves; convertir las respuestas en un brief utilizable por el motor de propuestas.
- **Bloque 16 — Validación integral:** probar recomendaciones, control de referencias, suma de 100 puntos conceptuales, transferencia autorizada, privacidad, uso offline y comportamiento en Android.

**Aceptación manual aún pendiente:** revisar físicamente en Android el nuevo diseño móvil y el asistente; probar el flujo PWA de actualización en el dispositivo; comprobar impresión/guardado PDF y verificar el despliegue más reciente de GitHub Pages. Estas revisiones no se consideran aprobadas por el solo hecho de que CI pase.

## Protección de datos creativos

El archivo principal vive en IndexedDB, con localStorage como alternativa cuando IndexedDB no está disponible. No se sincroniza con GitHub ni con un servicio remoto. Los datos pueden perderse si se borran los datos del sitio o se pierde el dispositivo; mantené un respaldo JSON externo.


## Bloque 9 — Experimentos sensoriales

Los registros sensoriales se guardan en una colección local separada del archivo de fórmulas. Cada observación conserva una instantánea de la variante y versión evaluada, fecha/hora, contexto, tiempo transcurrido opcional, evaluador, impresión libre, facetas seleccionadas y valoraciones subjetivas de 1 a 5. Las observaciones pueden exportarse e importarse como un respaldo JSON independiente. Al eliminar una creación también se eliminan sus registros asociados. Estas valoraciones no son mediciones instrumentales.

## Bloque 10 — Informes profesionales

El generador prepara un dossier por creación y variante archivada. Incluye versión fuente, referencias con perfiles editoriales, distribución por familias, facetas y roles, además de observaciones sensoriales asociadas a esa misma variante. La vista está preparada para imprimir o guardar como PDF desde el diálogo nativo del navegador y ofrece exportación CSV y JSON. Los informes son instantáneas generadas desde el archivo local; después de cambiar fórmulas u observaciones, generá un nuevo informe para reflejar los datos actualizados.

## Bloque 11 — UX móvil del formulador

El constructor móvil reduce el espacio vertical del encabezado, la búsqueda, los filtros y los resultados. El contador del buscador ahora se expresa como materias disponibles y no aparece duplicado dentro del campo. La lista inicial muestra cuatro resultados y permite ampliar el resto. El ajuste está orientado a Android y conserva el acceso completo a las 60 referencias.


## Bloque 12 — Asistente creativo local

El asistente funciona sin conexión a modelos externos ni APIs facturables. Interpreta palabras y expresiones relacionadas con familias y facetas olfativas, distingue preferencias positivas de rasgos que el usuario desea evitar, y consulta exclusivamente las referencias incluidas en la biblioteca local. Permite trabajar con una idea personal, un perfil de cliente o una fragancia tomada como inspiración. Explica por qué sugiere cada materia, formula una pregunta de seguimiento cuando falta contexto y solo envía las referencias al constructor cuando el usuario pulsa la acción explícita de transferencia.

Es un motor determinista basado en reglas y coincidencia editorial; no es un modelo generativo conversacional ni entiende cualquier frase libre como una persona. No reconstruye fórmulas de perfumes comerciales, no consulta catálogos externos y no predice química, seguridad, duración, rendimiento ni similitud comercial. Las propuestas son direcciones creativas iniciales que deben revisarse y probarse por el usuario.

## Política de costos y privacidad

Los bloques 11 y 12 no incorporan servicios de IA externos, API keys, suscripciones, telemetría ni llamadas de red para generar recomendaciones. El asistente procesa el brief en el dispositivo usando el código y la biblioteca local. Las fórmulas y briefs no se envían a un proveedor de IA.
