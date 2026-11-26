const OPTIONS = Object.freeze({
  occasion: ["diario", "trabajo", "casual", "evento especial", "noche", "regalo", "sin definir"],
  style: ["fresco", "floral", "amaderado", "dulce", "limpio", "elegante", "moderno", "cálido", "sin preferencia"],
  presence: ["discreta", "equilibrada", "marcada", "sin definir"]
});
const clean = (value, limit) => String(value ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, limit);
const pick = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
export function buildClientBrief(input = {}) {
  const fields = {
    occasion: pick(input.occasion, OPTIONS.occasion, "sin definir"),
    style: pick(input.style, OPTIONS.style, "sin preferencia"),
    presence: pick(input.presence, OPTIONS.presence, "sin definir"),
    liked: clean(input.liked, 280), avoid: clean(input.avoid, 280), additional: clean(input.additional, 280)
  };
  const hasDirection = fields.style !== "sin preferencia" || fields.liked.length >= 5 || fields.additional.length >= 8;
  if (!hasDirection) return {
    status: "needs-direction", fields, description: "",
    followUpQuestion: "¿Qué estilo o rasgo le gustaría a la persona: fresco, floral, amaderado, limpio, dulce o algo diferente?"
  };
  const parts = ["Brief de diseño para un perfil de cliente."];
  if (fields.occasion !== "sin definir") parts.push("Ocasión de uso: " + fields.occasion + ".");
  if (fields.style !== "sin preferencia") parts.push("Estilo buscado: " + fields.style + ".");
  if (fields.presence !== "sin definir") parts.push("Presencia deseada: " + fields.presence + ".");
  if (fields.liked) parts.push("Le gusta: " + fields.liked + ".");
  if (fields.avoid) parts.push("Evitar o moderar: " + fields.avoid + ".");
  if (fields.additional) parts.push("Contexto adicional: " + fields.additional + ".");
  return { status: "ready", fields, description: parts.join(" "), summary: "El brief está listo para que el asistente creativo sugiera referencias de la biblioteca local." };
}
