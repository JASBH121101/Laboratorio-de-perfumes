export const VIEWS = Object.freeze(["home", "lab", "notes", "projects"]);

export function resolveView(hash = "") {
  const candidate = String(hash).replace(/^#\/?/, "").split(/[/?&]/, 1)[0];
  return VIEWS.includes(candidate) ? candidate : "home";
}

export function viewHash(view) {
  return VIEWS.includes(view) ? `#${view}` : "#home";
}
