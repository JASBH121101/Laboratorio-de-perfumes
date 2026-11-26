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
| 10. Informes profesionales | Dossier por variante con composición, análisis editorial e historial sensorial; impresión PDF y exportaciones CSV/JSON | En implementación — rama feature/block10-professional-reports |

La base funcional vigente pasó **117/117 pruebas**, comprobación de sintaxis y validador de estructura en GitHub Actions tras el Bloque 8. Los PR #32, #33, #34, #35 y #36 están integrados en `main`. Queda pendiente la revisión física de la interfaz, el comportamiento de actualización PWA y la aceptación visual en Android.

## Bloque 6 — Experiencia del constructor

El constructor incorpora un buscador integrado con filtros por familia, tipo y ubicación orientativa. Los resultados permiten añadir una referencia sin navegar a otra pantalla, muestran cuáles ya pertenecen a la composición y permiten ampliar o reducir el listado. La edición de cada peso combina deslizador y campo numérico; la redistribución conserva el total conceptual de 100 puntos. El borrador local y el archivo existente se mantienen.

## Bloque 7 — Comparación analítica

El módulo permite comparar dos variantes guardadas, incluso cuando pertenecen a creaciones distintas. Calcula coincidencia estructural por puntos creativos compartidos, referencias añadidas o retiradas y cambios por referencia. También presenta distribuciones comparativas por familia olfativa, facetas editoriales y roles orientativos de salida/corazón/fondo. Los gráficos y porcentajes describen exclusivamente los datos conceptuales del archivo local: no predicen olor real, compatibilidad química ni similitud comercial. La comparación es de solo lectura y no modifica las composiciones guardadas.

## Bloque 8 — Historial de firma personal

El historial recorre las versiones guardadas de cada variante, las ordena cronológicamente y resume las familias editoriales presentes, las referencias más recurrentes y los cambios entre el primer registro y el más reciente. La vista de evolución usa hasta ocho registros recientes para conservar una lectura compacta en móvil. No añade registros al archivo ni modifica las composiciones. Los patrones representan únicamente decisiones creativas guardadas y etiquetas editoriales; no determinan una identidad olfativa objetiva ni una medición sensorial.

## Bloque 8 — Historial de firma personal

El historial recorre las versiones guardadas de cada variante, las ordena cronológicamente y resume las familias editoriales presentes, las referencias más recurrentes y los cambios entre el primer registro y el más reciente. La vista de evolución usa hasta ocho registros recientes para conservar una lectura compacta en móvil. No añade registros al archivo ni modifica las composiciones. Los patrones representan únicamente decisiones creativas guardadas y etiquetas editoriales; no determinan una identidad olfativa objetiva ni una medición sensorial.

## Protección de datos creativos

El archivo principal vive en IndexedDB, con localStorage como alternativa cuando IndexedDB no está disponible. No se sincroniza con GitHub ni con un servicio remoto. Los datos pueden perderse si se borran los datos del sitio o se pierde el dispositivo; mantené un respaldo JSON externo.


## Bloque 9 — Experimentos sensoriales

Los registros sensoriales se guardan en una colección local separada del archivo de fórmulas. Cada observación conserva una instantánea de la variante y versión evaluada, fecha/hora, contexto, tiempo transcurrido opcional, evaluador, impresión libre, facetas seleccionadas y valoraciones subjetivas de 1 a 5. Las observaciones pueden exportarse e importarse como un respaldo JSON independiente. Al eliminar una creación también se eliminan sus registros asociados. Estas valoraciones no son mediciones instrumentales.

## Bloque 10 — Informes profesionales

El generador prepara un dossier por creación y variante archivada. Incluye versión fuente, referencias con perfiles editoriales, distribución por familias, facetas y roles, además de observaciones sensoriales asociadas a esa misma variante. La vista está preparada para imprimir o guardar como PDF desde el diálogo nativo del navegador y ofrece exportación CSV y JSON. Los informes son instantáneas generadas desde el archivo local; después de cambiar fórmulas u observaciones, generá un nuevo informe para reflejar los datos actualizados.