# JB Perfume Lab

JB Perfume Lab es un espacio personal, Android-first y local-first para desarrollar conceptos olfativos, estudiar composiciones, analizar patrones y construir una identidad creativa propia.

## Dirección del producto

La aplicación prioriza la formulación conceptual y la investigación creativa. No incluye escenas 3D, renderizado de objetos, cámaras, zoom, iluminación virtual ni animaciones tridimensionales. La interfaz se concentra en tablas, gráficos analíticos, historial y herramientas de comparación.

- Constructor de composiciones con materias de referencia de la biblioteca.
- Distribución normalizada en 100 puntos creativos para comparar ideas.
- Análisis de familias, facetas sensoriales y estructura orientativa salida/corazón/fondo.
- Índice de diferenciación interna contra fórmulas guardadas en el archivo personal.
- Benchmark local de similitud editorial frente a perfumes árabes, nicho e diseñador, usando notas públicas y familias.
- Estimador heurístico de persistencia (horas) y proyección (metros), con rangos y confianza baja.
- Lectura de patrones de identidad creativa y desafíos para explorar familias menos utilizadas.
- Archivo local de creaciones, variantes, versiones e importación/exportación JSON.
- Dashboard de indicadores y tendencias con gráficos 2D.
- PWA instalable, responsive y preparada para funcionamiento local/offline.

**Límite fundamental:** el sistema es una herramienta de exploración editorial y creativa, no un simulador químico ni una guía de fabricación. Los puntos creativos no son porcentajes de ingredientes, concentraciones, dosificaciones ni relaciones de producción. El índice personal compara únicamente el historial local. El benchmark comercial compara notas y perfiles públicos, no fórmulas químicas propietarias. El estimador es una heurística de baja confianza; no garantiza duración, distancia ni desempeño físico.

## Dashboard y analítica

El dashboard agrega las creaciones y variantes guardadas en el dispositivo. Muestra conteos de creaciones, variantes, versiones y referencias distintas, junto con la participación de familias olfativas y actividad reciente. Los gráficos se construyen directamente desde los datos guardados; si el archivo está vacío, la interfaz muestra un estado inicial sin inventar estadísticas.

## Motor de originalidad personal

El Originality Engine compara una composición candidata contra variantes y versiones históricas diferentes del propio archivo local. Su índice combina:
- Frecuencia histórica de uso de referencias.
- Novedad de parejas de referencias que no aparecen juntas en el archivo.
- Distancia de distribución frente a la composición histórica más cercana.

La afinidad con patrones previos es una métrica separada: una fórmula puede diferenciarse bastante del archivo y, a la vez, alejarse del estilo predominante del creador. La primera fórmula no recibe una puntuación ficticia; el sistema solicita una línea base suficiente.

El índice personal no consulta catálogos comerciales: es una métrica de **diferenciación interna de tu archivo**. El módulo separado de benchmark compara notas y familias públicas de una biblioteca local, pero no confirma fórmulas propietarias, copia, originalidad legal ni exclusividad.

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
| 13. Motor de propuestas de formulación | Propuestas conceptuales A/B/C, explicación de cada referencia, balance editable de puntos creativos y transferencia voluntaria | **Completado** — PR #44 fusionado |
| 14. Originalidad y diferenciación por inspiración | Extraer rasgos apreciados de perfumes de referencia y explorar estructuras conceptuales distintas sin reconstruir fórmulas comerciales | **Completado** — PR #45 fusionado |
| 15. Briefs y diseño para clientes | Perfil de gustos, rechazos, ocasión, estilo y presencia deseada; vista previa y conexión voluntaria con asistente y propuestas | **Completado** — PR #47 fusionado |
| 16. Posicionamiento de público y validación integral | Lectura comercial de género/estética de edad para fórmulas manuales, integración de flujos, referencias, normalización y offline | **Completado en CI** — PR #48 fusionado; aceptación física Android pendiente |
| 17. Benchmark de catálogo comercial | Comparar notas y familias de una fórmula frente a perfumes árabes, nicho e diseñador, con top 3 por categoría, evidencia y fuente | **Completado** — PR #51 fusionado |
| 18. Estimador conceptual de rendimiento | Estimar rangos amplios de persistencia en horas y proyección en metros en apertura y 1–2 h, con confianza baja y límites explícitos | **Completado** — PR #53 fusionado |

La base funcional vigente pasó **180/180 pruebas**, comprobación de sintaxis y validador de estructura en GitHub Actions tras el Bloque 18. Los PR #32 al #53 de funcionalidad están integrados en `main`. La PWA usa `shell-v42` e incluye briefs, posicionamiento, benchmark y estimador en su shell offline. Queda pendiente la aceptación física en Android: revisión visual responsive, actualización PWA en dispositivo, impresión/guardado PDF y verificación del despliegue más reciente de GitHub Pages.

## Bloque 17 — Benchmark comercial local

La biblioteca de referencia incluye **1,479 perfiles** procedentes del dataset Scento, snapshot 2026-10-29, clasificados por tipo de casa en **324 árabes, 396 nicho/independiente y 759 diseñador/heritage**. Se muestran las tres mejores coincidencias por categoría. El score combina coincidencia de notas públicas y similitud de familias; cada tarjeta muestra evidencia y confianza.

La comparación es editorial y aproximada: no compara composición química, fórmulas propietarias, proporciones de producción ni certifica que una fórmula sea copia u original. Las categorías se derivan del tipo de casa del dataset. El catálogo queda incluido en la PWA y funciona offline.

**Fuente y licencia:** Scento Team, Scento Perfume Database (snapshot 2026-10-29), [scento.com/perfume-database](https://www.scento.com/perfume-database), CC BY 4.0. Se conserva atribución dentro del módulo. No se consulta la API durante la ejecución.

## Bloque 18 — Estimador conceptual de rendimiento

El panel estima rangos heurísticos de persistencia potencial en piel (horas), proyección inicial (metros) y proyección aproximada después de 1–2 horas. Utiliza familias, facetas y roles editoriales. La confianza se declara baja; la estimación no incorpora concentración real, vehículo, dosis, condiciones de aplicación, piel, clima ni prueba física. Los 100 puntos creativos no son porcentajes de ingredientes ni concentración, por lo que el resultado es una orientación de concepto, no una predicción de desempeño.

## Bloque 6 — Experiencia del constructor

El constructor incorpora un buscador integrado con filtros por familia, tipo y ubicación orientativa. Los resultados permiten añadir una referencia sin navegar a otra pantalla, muestran cuáles ya pertenecen a la composición y permiten ampliar o reducir el listado. La edición de cada peso combina deslizador y campo numérico; la redistribución conserva el total conceptual de 100 puntos. El borrador local y el archivo existente se mantienen.

## Bloque 7 — Comparación analítica

El módulo permite comparar dos variantes guardadas, incluso cuando pertenecen a creaciones distintas. Calcula coincidencia estructural por puntos creativos compartidos, referencias añadidas o retiradas y cambios por referencia. También presenta distribuciones comparativas por familia olfativa, facetas editoriales y roles orientativos de salida/corazón/fondo. Los gráficos y porcentajes describen exclusivamente los datos conceptuales del archivo local: no predicen olor real, compatibilidad química ni similitud comercial. La comparación es de solo lectura y no modifica las composiciones guardadas.

## Bloque 8 — Historial de firma personal

El historial recorre las versiones guardadas de cada variante, las ordena cronológicamente y resume las familias editoriales presentes, las referencias más recurrentes y los cambios entre el primer registro y el más reciente. La vista de evolución usa hasta ocho registros recientes para conservar una lectura compacta en móvil. No añade registros al archivo ni modifica las composiciones. Los patrones representan únicamente decisiones creativas guardadas y etiquetas editoriales; no determinan una identidad olfativa objetiva ni una medición sensorial.

## Bloque 8 — Historial de firma personal

El historial recorre las versiones guardadas de cada variante, las ordena cronológicamente y resume las familias editoriales presentes, las referencias más recurrentes y los cambios entre el primer registro y el más reciente. La vista de evolución usa hasta ocho registros recientes para conservar una lectura compacta en móvil. No añade registros al archivo ni modifica las composiciones. Los patrones representan únicamente decisiones creativas guardadas y etiquetas editoriales; no determinan una identidad olfativa objetiva ni una medición sensorial.

## Checkpoint de desarrollo — Bloques 1 a 16

**Completados (1–16):** estabilidad PWA; retirada 3D; dashboard analítico; motor de originalidad personal; certificación base; constructor de formulación; comparación analítica; historial de firma; experimentos sensoriales; informes profesionales; compactación móvil; asistente creativo local; motor de propuestas A/B/C; diferenciación por inspiración; briefs guiados de clientes; posicionamiento de público y validación integral automatizada.

**Pendiente de cierre operativo (fuera de los bloques funcionales):**
- Aceptación física en Android: revisar las pantallas reales, controles táctiles y distribución responsive.
- Probar en dispositivo la instalación y actualización PWA, incluyendo caché y activación de `shell-v40`.
- Comprobar impresión/guardado PDF desde Android y verificar el último despliegue de GitHub Pages.

La CI cubre pruebas automatizadas, sintaxis y validador estructural; no sustituye estas pruebas físicas.

**Cierre de los bloques 13 y 14:** el Bloque 13 genera tres rutas distintas, A/B/C, usando referencias reales de la biblioteca; cada propuesta suma 100 puntos creativos enteros y solo sustituye la mezcla actual después de confirmación, conservando la acción de deshacer. El Bloque 14 separa rasgos apreciados y rechazados, usa el historial local para priorizar familias menos utilizadas y construye tres arquitecturas alternativas sin buscar ni reconstruir composiciones comerciales. La transferencia de una dirección de inspiración al asistente vuelve a generar propuestas, pero nunca carga una mezcla automáticamente.

**Cierre del Bloque 15:** el brief guiado recoge ocasión, estilo, presencia deseada, gustos, rasgos a evitar y contexto opcional. El usuario revisa la vista previa antes de enviar el contenido al asistente creativo y generar propuestas. No se solicitan nombres ni identificadores personales; el procesamiento es local.

**Cierre del Bloque 16:** el análisis de público se recalcula al editar la composición manual o cargar una propuesta. Presenta tendencia masculina, femenina o unisex/versátil; además, una estética juvenil/contemporánea, adulta/sofisticada o transversal. Muestra las familias con mayor influencia y un nivel de confianza. Es una heurística editorial de posicionamiento comercial, no una predicción validada ni una limitación de quién puede usar la fragancia.

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

Es un motor determinista basado en reglas y coincidencia editorial; no es un modelo generativo conversacional ni entiende cualquier frase libre como una persona. No reconstruye fórmulas de perfumes comerciales ni predice química o seguridad. El benchmark comercial y el estimador de rendimiento son módulos separados, con sus limitaciones documentadas en los bloques 17 y 18.

## Política de costos y privacidad

Los bloques 11, 12, 15 y 16 no incorporan servicios de IA externos, API keys, suscripciones, telemetría ni llamadas de red para generar recomendaciones o posicionamiento. El asistente, el constructor de briefs y el evaluador de público procesan datos en el dispositivo usando el código y la biblioteca local. Las fórmulas y briefs no se envían a un proveedor de IA.


## Bloques 13 y 14 — Motor de propuestas y diferenciación por inspiración

El motor A/B/C ofrece tres rutas conceptuales distintas a partir del brief del asistente y de la biblioteca local. Cada ruta utiliza IDs reales de referencia, explica su orientación y distribuye 100 puntos creativos enteros. Al cargarla, el usuario confirma la sustitución de la composición activa; el estado anterior se conserva en el historial para deshacer. La validación rechaza IDs desconocidos o duplicados y totales distintos de 100.

El módulo de inspiración recibe una etiqueta opcional, los rasgos que gustan y lo que se desea evitar. Extrae familias y descriptores, puede usar la frecuencia de familias del archivo local para ordenar caminos complementarios y muestra tres arquitecturas con referencias ilustrativas. Una dirección puede enviarse al asistente para crear otro brief y generar propuestas A/B/C; no se aplica a la composición activa. No consulta la fórmula de perfumes comerciales, no usa Internet ni certifica originalidad mundial.

La PWA usa `shell-v42`. Los bloques 15–18 no agregan API, proveedor IA externo, claves, cuotas, suscripciones, nuevas dependencias ni servicios pagos. El benchmark comercial es un catálogo local con atribución y licencia; no se hacen llamadas de red para consultar referencias.
