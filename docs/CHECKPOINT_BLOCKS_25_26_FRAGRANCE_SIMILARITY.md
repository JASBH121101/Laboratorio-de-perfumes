# Checkpoint — JB Perfume Lab
## Fragrance Similarity · Bloques 25 y 26

**Estado:** COMPLETADOS / CERTIFICADOS POR CI / FUSIONADOS

**Repositorio:** `JASBH121101/Laboratorio-de-perfumes`  
**Rama de funcionalidad:** `feature/blocks25-26-fragrance-similarity-foundation`  
**PR de funcionalidad:** #65 — https://github.com/JASBH121101/Laboratorio-de-perfumes/pull/65  
**Commit de integración:** `9c5bb19ff9e4b35813735371ddb1882937345fa1`

### BLOQUE 25 — ARQUITECTURA Y CONTRATOS
- Módulo independiente `src/js/features/laboratory/fragrance-similarity/`.
- Contrato normalizado de perfiles olfativos y resultados.
- Porcentaje editorial 0–100 separado de confianza.
- Motor diseñado sin UI, DOM, persistencia, red ni proveedores externos.
- Salvaguardas explícitas contra afirmaciones de equivalencia química, copia exacta o reconstrucción de fórmulas propietarias.

### BLOQUE 26 — MODELO DE DATOS OLFATIVOS
- Modelo normalizado aplicado a los 1,479 registros del catálogo local.
- Conserva identidad, casa, categoría, familia, notas agregadas y pirámide declarada, carácter, procedencia, atribución, licencia y enlaces.
- Clasifica la cobertura de la pirámide como completa, parcial o no disponible.
- No asigna notas agregadas a etapas que la fuente no declara.
- No inventa familia, subfamilias ni acordes.
- Reporta registros rechazados y sus motivos.

### VALIDACIÓN
- GitHub Actions: run #1104 — SUCCESS.
- Pruebas: 226 aprobadas / 0 fallidas.
- Sintaxis de módulos: aprobada.
- Validador de estructura: aprobado.
- Sin dependencias nuevas, APIs externas, servicios IA, servicios de pago, nube ni cambios en Supabase.

### PR Y MERGE
- PR #65: MERGED.
- Merge SHA: `9c5bb19ff9e4b35813735371ddb1882937345fa1`.
- Rama de funcionalidad: conservada en GitHub.

### BLOQUES COMPLETADOS
- Bloques 1–24: completados y fusionados anteriormente.
- Bloques 25–26: completados y fusionados con PR #65.

### SIGUIENTES BLOQUES
- **BLOQUE 27:** normalización semántica, sinónimos, escritura, duplicados y calidad de fuentes.
- **BLOQUE 28:** motor de comparación olfativa por notas, familias, acordes, pirámide y carácter.

**NOTA DE ALCANCE:** estos bloques solo dejan lista la base y los perfiles. Todavía no hay búsqueda inversa, ranking, porcentajes de similitud ni interfaz. No declarar la función terminada hasta cerrar esos bloques posteriores.
