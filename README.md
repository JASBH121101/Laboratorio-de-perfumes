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
| 1. Estabilidad PWA | Un solo aviso por release pendiente; persistir el cierre; chequeo manual separado | Implementado en rama, CI pendiente |
| 2. Retirada 3D | Eliminar import map, motor, cámara, zoom, renderizado y caché externa | En implementación |
| 3. Dashboard analítico | Indicadores locales, familias, actividad e interfaz responsive | Módulos implementados, integración y validación en curso |
| 4. Originalidad e identidad | Diferenciación interna, afinidad personal y desafíos creativos | Motor y panel implementados, validación en curso |
| 5. Certificación y publicación | Tests, validator, documentación, CI, PR y despliegue | Pendiente |

## Protección de datos creativos

El archivo principal vive en IndexedDB, con localStorage como alternativa cuando IndexedDB no está disponible. No se sincroniza con GitHub ni con un servicio remoto. Los datos pueden perderse si se borran los datos del sitio o se pierde el dispositivo; mantené un respaldo JSON externo.
