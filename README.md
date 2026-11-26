# JB Perfume Lab

JB Perfume Lab es un espacio personal, Android-first y local-first para desarrollar conceptos olfativos, estudiar composiciones, analizar patrones y construir una identidad creativa propia.

## Dirección del producto

La aplicación prioriza la formulación conceptual y la investigación creativa. No incluye escenas 3D, renderizado de objetos, cámaras, zoom, iluminación virtual ni animaciones tridimensionales. La interfaz se concentra en tablas, gráficos analíticos, historial y herramientas de comparación.

- Constructor de composiciones con materias de referencia de la biblioteca.
- Distribución normalizada en 100 puntos creativos para comparar ideas.
- Análisis de familias, facetas sensoriales y estructura orientativa salida/corazón/fondo.
- Índice de diferenciación interna contra fórmulas guardadas en el archivo personal.
- Benchmark local de similitud editorial frente a perfumes árabes, nicho e diseñador, usando notas públicas y familias.
- Estimador heurístico de persistencia (horas) y proyección (metros), con escenarios de concentración asumida y ambiente seleccionable; rangos y confianza muy baja.
- Lectura de patrones de identidad creativa y desafíos para explorar familias menos utilizadas.
- Archivo local de creaciones, variantes, versiones e importación/exportación JSON.
- Dashboard de indicadores y tendencias con gráficos 2D.
- PWA instalable, responsive y preparada para funcionamiento local/offline.

**Límite fundamental:** el sistema es una herramienta de exploración editorial y creativa, no un simulador químico ni una guía de fabricación. Los puntos creativos no son porcentajes de ingredientes, concentraciones, dosificaciones ni relaciones de producción. El índice personal compara únicamente el historial local. El benchmark comercial compara notas y perfiles públicos, no fórmulas químicas propietarias. El estimador es una heurística de baja confianza; no garantiza duración, distancia ni desempeño físico.

## Block 19 — Benchmark y rendimiento por escenarios

- Benchmark muestra los mejores perfiles por categoría **Árabe / Ninja**, Diseñador y Nicho, con coincidencias directas de materias, similitud de familias y explicación de la evidencia. La comparación sigue usando descriptores públicos del catálogo local, no fórmulas propietarias.
- El estimador permite cambiar concentración asumida (EDT, EDP, Parfum) y escenario ambiental (neutro, cálido, fresco, exterior, interior) para recalcular rangos aproximados de horas y metros.
- Los escenarios son supuestos editoriales, no mediciones. El nivel de confianza es muy bajo hasta realizar pruebas físicas y registrar resultados.

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

La base funcional vigente pasó **180/180 pruebas**, comprobación de sintaxis y validador de estructura en GitHub Actions tras el Bloque 19. Los PR #32 al #55 de funcionalidad y mejoras están integrados en `main`. La PWA usa `shell-v43` e incluye briefs, posicionamiento, benchmark comercial mejorado y estimador por escenarios en su shell offline. Queda pendiente la aceptación física en Android: revisión visual responsive, actualización PWA en dispositivo, impresión/guardado PDF y verificación del despliegue más reciente de GitHub Pages.

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

## Checkpoint de desarrollo — Bloques 1 a 23 (2026-11-26)

**Completados (1–23):** estabilidad PWA y retirada 3D; dashboard analítico; originalidad personal; constructor y comparación de formulaciones; historial de firma; experimentos sensoriales e informes; UX móvil; asistente creativo local; propuestas A/B/C; diferenciación por inspiración; briefs de clientes y posicionamiento de público; benchmark comercial; estimador conceptual de rendimiento por escenarios; asistente creativo con prompts guiados y detección de contradicciones; rediseño visual responsive, gráficos accesibles y navegación interna; historial local de perfiles con comparación de alternativas, público, benchmark y rendimiento; calibración sensorial local basada en observaciones guardadas.

**Pendiente de cierre operativo (fuera de los bloques funcionales):**
- Aceptación física en Android: revisar las pantallas reales, controles táctiles y distribución responsive.
- Probar en dispositivo la instalación y actualización PWA, incluyendo caché y activación de `shell-v47`.
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

Es un motor determinista basado en reglas y coincidencia editorial; no es un modelo generativo conversacional ni entiende cualquier frase libre como una persona. No reconstruye fórmulas de perfumes comerciales ni predice química o seguridad. El benchmark comercial y el estimador de rendimiento son módulos separados, con sus limitaciones documentadas en los bloques 17, 18 y 19.

## Política de costos y privacidad

Los bloques 11, 12, 15 y 16 no incorporan servicios de IA externos, API keys, suscripciones, telemetría ni llamadas de red para generar recomendaciones o posicionamiento. El asistente, el constructor de briefs y el evaluador de público procesan datos en el dispositivo usando el código y la biblioteca local. Las fórmulas y briefs no se envían a un proveedor de IA.


## Bloques 13 y 14 — Motor de propuestas y diferenciación por inspiración

El motor A/B/C ofrece tres rutas conceptuales distintas a partir del brief del asistente y de la biblioteca local. Cada ruta utiliza IDs reales de referencia, explica su orientación y distribuye 100 puntos creativos enteros. Al cargarla, el usuario confirma la sustitución de la composición activa; el estado anterior se conserva en el historial para deshacer. La validación rechaza IDs desconocidos o duplicados y totales distintos de 100.

El módulo de inspiración recibe una etiqueta opcional, los rasgos que gustan y lo que se desea evitar. Extrae familias y descriptores, puede usar la frecuencia de familias del archivo local para ordenar caminos complementarios y muestra tres arquitecturas con referencias ilustrativas. Una dirección puede enviarse al asistente para crear otro brief y generar propuestas A/B/C; no se aplica a la composición activa. No consulta la fórmula de perfumes comerciales, no usa Internet ni certifica originalidad mundial.

La PWA usa actualmente `shell-v47`. Los bloques 15–23 no agregan API, proveedor IA externo, claves, cuotas, suscripciones, nuevas dependencias ni servicios pagos. El benchmark comercial es un catálogo local con atribución y licencia; no se hacen llamadas de red para consultar referencias.

### Cierre del Bloque 19 — Benchmark y rendimiento por escenarios

- Categorías comerciales presentadas como **Árabe / Ninja**, Diseñador y Nicho.
- El benchmark distingue coincidencias directas de materias disponibles y similitud por familias; incluye evidencia por perfume de referencia y no afirma copia ni equivalencia química.
- El estimador permite escenarios de concentración asumida (EDT, EDP, Parfum) y ambiente (neutro, cálido, fresco, interior, exterior).
- Presenta rangos aproximados de persistencia detectable en piel (horas), proyección inicial (metros) y proyección después de 1–2 horas (metros), con **confianza muy baja** y advertencias explícitas. Son estimaciones heurísticas, no mediciones físicas.
- CI final: **180/180 pruebas**, sintaxis y validador de estructura aprobados.

### Cierre del Bloque 20 — Asistente creativo guiado

- Añade tres briefs de inicio editables: fresco y limpio, cálido y envolvente, y floral elegante.
- Detecta cuando una misma familia aparece como preferida y también rechazada; pausa las recomendaciones y solicita aclaración en lugar de generar propuestas contradictorias.
- Las propuestas A/B/C solo se generan cuando el brief queda en estado listo.
- El motor sigue siendo local y determinista. No utiliza IA externa, API, nuevas dependencias ni servicios de pago.
- PWA: shell-v44. CI aprobada en PR #57.

### Cierre del Bloque 21 — Rediseño visual del laboratorio

- Navegación interna compacta para saltar entre composición, asistente, análisis, originalidad, evolución y rendimiento.
- Dashboard con gráfico de anillo por familias, barras accesibles y estados vacíos que orientan al primer paso.
- Análisis con leyendas de participación, gráficos mejor adaptados a móvil y acceso para volver a la composición cuando aún no hay datos.
- Se mantiene la lógica analítica existente: los gráficos se calculan a partir de datos guardados y no inventan métricas.
- PWA: shell-v45. CI aprobada en PR #58: **189/189 pruebas**, sintaxis y validador de estructura aprobados.

### Cierre del Bloque 22 — Historial y comparación de perfiles

- Los briefs guiados pueden guardarse como perfiles independientes del archivo de fórmulas. Se conserva un nombre corto opcional, los campos creativos, el brief y las alternativas A/B/C generadas.
- Cada alternativa guarda sus referencias reales de la biblioteca y conserva exactamente 100 puntos creativos; el historial no cambia la composición activa.
- El comparador permite elegir dos perfiles y revisar sus alternativas frente al público orientativo, las mejores coincidencias del benchmark por categoría (Árabe / Ninja, Nicho y Diseñador) y los rangos heurísticos de persistencia/proyección.
- La comparación permite seleccionar el mismo supuesto de concentración (EDT, EDP o Parfum) y ambiente (neutro, cálido, fresco, exterior o interior) para ambos perfiles.
- Los perfiles se almacenan localmente en un object store nuevo de IndexedDB (`creative-profiles`), con respaldo `localStorage`; pueden eliminarse individualmente. El esquema de IndexedDB quedó en versión 3.
- No se solicita nombre real, teléfono ni identificadores personales de clientes. Los perfiles no se sincronizan ni se envían a Internet.
- PR #60 fusionado. CI aprobada: **198/198 pruebas**, sintaxis y validador estructural.

### Cierre del Bloque 23 — Calibración sensorial local

- El formulario de experimento sensorial permite registrar de forma opcional persistencia percibida en horas, proyección inicial en metros y proyección tras 1–2 horas.
- Cada observación queda vinculada a la instantánea exacta de composición y versión que se evaluó, junto con el escenario indicado (EDT/EDP/Parfum y ambiente).
- El motor contrasta cada indicador con el rango base del estimador para la misma composición y escenario. Calcula factores mediante la mediana de las razones observado/estimado.
- Se requieren **al menos tres observaciones válidas por indicador y escenario** antes de aplicar su ajuste. Los factores se limitan a 0.5–1.5 para reducir el impacto de valores atípicos. Los indicadores sin muestra suficiente mantienen el rango base.
- El panel muestra cuántas observaciones faltan, la mediana observada, el error frente al valor base y los ajustes activos por escenario.
- Los registros anteriores siguen siendo válidos; los respaldos JSON conservan el nuevo campo opcional. La PWA incorpora el motor y panel de calibración en `shell-v47`.
- La calibración es una heurística basada en observaciones del usuario, no una medición instrumental ni una validación científica. Los datos permanecen en el dispositivo.
- PR #61 fusionado. CI aprobada: **210/210 pruebas**, sintaxis y validador estructural.

### Estado técnico del proyecto

- Rama principal: `main`.
- PWA actual: `shell-v47`.
- IndexedDB: versión 3; stores para creaciones, experimentos sensoriales y perfiles creativos.
- Sin nuevas API externas, servicios de IA, suscripciones, dependencias ni costos añadidos por los bloques 22 y 23.
- PR #57 — Bloque 20: fusionado.
- PR #58 — Bloque 21: fusionado.
- PR #59 — Checkpoint 1–21: fusionado.
- PR #60 — Bloque 22: fusionado.
- PR #61 — Bloque 23: fusionado.

### Pendiente de aceptación manual

- Revisar físicamente en Android la navegación interna, los gráficos y los formularios en distintos tamaños de pantalla.
- Comprobar en Android la actualización PWA a `shell-v47` y que el shell nuevo se activa sin dejar recursos antiguos en caché.
- Crear varias observaciones reales en el dispositivo y verificar que solo se active la calibración al alcanzar tres muestras por indicador y escenario.
- Probar impresión/guardado PDF desde Android y verificar el despliegue más reciente de GitHub Pages.

La CI valida las pruebas automatizadas, la sintaxis y la estructura de la aplicación; no sustituye estas verificaciones físicas.


### Cierre del Bloque 24 — Legibilidad tipográfica global

- Se amplió la tipografía en las cinco hojas de estilo principales: base, sistema de diseño, biblioteca, laboratorio y analítica.
- Se estableció un tamaño base global de **16px**, interlineado **1.55** y un piso de **12.5px** para tipografía declarada en píxeles; los tamaños superiores se escalaron proporcionalmente.
- Se conservaron las jerarquías de encabezados, la lógica de formulación, los cálculos, el archivo local y los datos existentes.
- Se añadió una prueba de regresión de legibilidad y se alinearon las pruebas de integración existentes con la caché actualizada.
- La PWA avanzó de `shell-v47` a **`shell-v48`** para que los clientes instalados descarguen las hojas de estilo actualizadas.
- **PR #63 fusionado** mediante Squash Merge. Commit de integración: `4a47d763cd759322f841cb87177f8970bde334c7`.
- **GitHub Actions run #1095: aprobado**. Resultado: **213/213 pruebas**, sintaxis de módulos y validador estructural aprobados.
- Sin nuevas dependencias, APIs externas, proveedores de IA ni servicios pagos.

**Aceptación manual pendiente:** revisar en Android el tamaño real de textos, saltos de línea, tarjetas, tablas, controles, gráficos y desbordamientos en pantallas pequeñas. Confirmar que el dispositivo active `shell-v48`. La CI no sustituye esta comprobación visual física.

**Estado al cierre:** Bloques funcionales **1–24 completados y fusionados**; aceptación visual Android pendiente.


## Checkpoint — Bloques 25 y 26: Fragrance Similarity

**Estado:** COMPLETADOS / CI APROBADA / PR DE FUNCIONALIDAD FUSIONADO

### Bloque 25 — Arquitectura independiente y contratos
- Se creó el módulo `src/js/features/laboratory/fragrance-similarity/` con contratos de perfil y resultado.
- Se definió el porcentaje como una **estimación editorial de similitud (0–100)**, separado del nivel de confianza.
- Se documentaron las fronteras del motor: JavaScript puro, sin DOM, almacenamiento, llamadas de red, proveedores de IA ni dependencias de pago.
- Se establecieron límites para no reconstruir fórmulas propietarias ni declarar equivalencia química o sensorial.

### Bloque 26 — Modelo de datos olfativos
- Se normalizaron los **1,479 registros** del catálogo local de referencia.
- Cada perfil conserva nombre, casa, categoría, familia, notas declaradas, descriptores, atribución, licencia, snapshot y URL de la ficha cuando existe.
- La pirámide se marca como completa, parcial o no disponible. Los datos agregados no se asignan artificialmente a salida, corazón o fondo.
- Los acordes y subfamilias faltantes quedan como desconocidos; no se inventan a partir de descriptores.
- Los registros inválidos se reportan con motivo; no se descartan silenciosamente.

### Certificación
- **PR #65:** fusionado mediante Squash Merge.
- **Commit de integración:** `9c5bb19ff9e4b35813735371ddb1882937345fa1`.
- **GitHub Actions run #1104:** aprobado.
- **Resultado:** **226/226 pruebas**, 0 fallidas; sintaxis de módulos aprobada y validador estructural aprobado.
- No se añadieron dependencias, APIs externas, servicios de IA, sincronización en nube ni costos. No se modificó Supabase.
- El módulo todavía no tiene interfaz ni calcula similitud: esa lógica corresponde a los bloques siguientes.

### Siguiente par
- **Bloque 27:** normalización semántica, sinónimos, variantes de escritura, duplicados y calidad de datos.
- **Bloque 28:** motor de comparación olfativa por notas, familias, acordes, pirámide y carácter.

**Alcance global:** bloques 1–26 completados y fusionados en `main`. La aceptación visual física de Android del trabajo anterior continúa siendo una verificación manual independiente.


## Checkpoint — Bloques 27 y 28: normalización y comparación olfativa

**Estado:** COMPLETADOS / CI APROBADA / PR DE FUNCIONALIDAD FUSIONADO

### Bloque 27 — Normalización semántica
- Se agregó normalización Unicode, acentos, mayúsculas, puntuación y espacios.
- Se incorporaron alias bilingües para notas frecuentes, por ejemplo Bergamot/Bergamota, Blackcurrant/Cassis, Pink Pepper/Pimienta rosa, Sandalwood/Sándalo y Olibanum/Incienso.
- Las familias editoriales del catálogo se traducen a etiquetas amplias de comparación. Los grupos compuestos conservan varias facetas: Wood & Root → woody/earthy; Amber & Resin → amber/resinous; Smoke & Leather → smoky/leathery; Salt & Mineral → aquatic/mineral.
- Los duplicados semánticos se consolidan por dimensión y se conserva la primera etiqueta original.
- Descriptores desconocidos mantienen una clave estable; no se adivinan equivalencias. Notas relacionadas pero diferentes permanecen separadas.

### Bloque 28 — Motor de comparación olfativa
- Se implementó comparación independiente de notas agregadas, familias, subfamilias, acordes, carácter y etapas de salida/corazón/fondo.
- Cada dimensión comparable devuelve un índice de solapamiento 0–100 (intersección/unión), coincidencias y descriptores exclusivos de cada perfil.
- Las dimensiones no disponibles en alguno de los perfiles se marcan como no comparables; no se convierten en coincidencias cero.
- No se calcula todavía porcentaje global, confianza ni ranking: corresponden a los bloques 29 y 32.

### Certificación
- **PR #67:** fusionado mediante Squash Merge.
- **Commit de integración:** `745747a64998bb6e295038f96ce08dc1201c684f`.
- **GitHub Actions runs #1113 y #1114:** aprobados.
- **Resultado:** **240/240 pruebas**, 0 fallidas; sintaxis de módulos y validador estructural aprobados.
- Sin nuevas dependencias, APIs externas, servicios IA, sincronización en nube ni costos. Sin cambios en Supabase.

### Siguiente par
- **Bloque 29:** puntuación global transparente y nivel de confianza separado, con cobertura y límites explícitos.
- **Bloque 30:** explicación de similitudes y diferencias, evidencia y calidad de datos.

**Alcance global:** bloques 1–28 completados y fusionados en `main`. La aceptación visual física Android de los cambios anteriores continúa siendo una verificación manual independiente.
