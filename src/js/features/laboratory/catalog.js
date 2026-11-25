export const LAB_RENDER_CONFIG = Object.freeze({
  threeRevision: "187",
  maxPixelRatio: 1.5,
  mobileMaxPixelRatio: 1.25,
  minCameraRadius: 4.5,
  maxCameraRadius: 15,
  initialCameraRadius: 10.8
});

export const LAB_PROPS = Object.freeze([
  {
    id: "author-bottle",
    title: "Frasco principal",
    category: "ENVASE DE CONCEPTO",
    description: "El recipiente central del atelier. Su diseño representa el espacio donde una futura creación podrá tomar identidad visual.",
    noteId: null,
    position: [0, 0.716, 0.1],
    color: "#b77a4d",
    scale: 1.18
  },
  {
    id: "bergamot-vial",
    title: "Vial cítrico",
    category: "REFERENCIA OLFATIVA",
    description: "Un vial de consulta para explorar perfiles luminosos y cítricos.",
    noteId: "bergamot",
    position: [-2.25, 0.73, 0.1],
    color: "#d5b45d",
    scale: 0.72
  },
  {
    id: "rose-vial",
    title: "Vial floral",
    category: "REFERENCIA OLFATIVA",
    description: "Un vial de consulta dedicado a perfiles florales y rosados.",
    noteId: "rose",
    position: [-1.15, 0.73, -0.72],
    color: "#a65e71",
    scale: 0.72
  },
  {
    id: "sandalwood-vial",
    title: "Vial amaderado",
    category: "REFERENCIA OLFATIVA",
    description: "Un vial de consulta para perfiles cálidos, suaves y amaderados.",
    noteId: "sandalwood",
    position: [1.15, 0.73, -0.72],
    color: "#a9784c",
    scale: 0.72
  },
  {
    id: "vanilla-vial",
    title: "Vial gourmand",
    category: "REFERENCIA OLFATIVA",
    description: "Un vial de consulta para referencias dulces y cremosas.",
    noteId: "vanilla",
    position: [2.25, 0.73, 0.1],
    color: "#c8a66c",
    scale: 0.72
  },
  {
    id: "glass-beaker",
    title: "Vaso de exploración",
    category: "RECIPIENTE VIRTUAL",
    description: "Recipiente de trabajo para la futura composición conceptual. En este bloque funciona únicamente como objeto visual e inspeccionable.",
    noteId: null,
    position: [0, 0.75, -1.45],
    color: "#a7c2c1",
    scale: 1
  },
  {
    id: "glass-pipette",
    title: "Pipeta de precisión",
    category: "HERRAMIENTA VIRTUAL",
    description: "Herramienta visual del atelier. La interacción de dosificación conceptual se implementará en el Bloque 5.",
    noteId: null,
    position: [3.1, 0.86, -0.75],
    color: "#c5d7d2",
    scale: 1
  },
  {
    id: "note-tray",
    title: "Bandeja de referencias",
    category: "ORGANIZADOR",
    description: "Superficie para organizar visualmente las referencias que después podrás incorporar a una composición conceptual.",
    noteId: null,
    position: [-3.1, 0.74, -0.78],
    color: "#9b7b58",
    scale: 1
  }
]);

export function getLabProp(id) {
  return LAB_PROPS.find((item) => item.id === id) ?? null;
}
