import { validateFragranceSimilarityProfile } from "./contracts.js";

const toLookupKey = (value) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("en")
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9]+/g, " ")
  .trim()
  .replace(/\s+/g, " ");

const toSlug = (value) => toLookupKey(value).replace(/\s/g, "-");

const NOTE_ALIAS_GROUPS = Object.freeze({
  bergamot: ["bergamot", "bergamota"],
  lemon: ["lemon", "limon"],
  lime: ["lime", "lima"],
  mandarin: ["mandarin", "mandarina"],
  orange: ["orange", "naranja"],
  "blood-orange": ["blood orange", "blood-orange", "naranja sanguina"],
  "bitter-orange": ["bitter orange", "naranja amarga"],
  grapefruit: ["grapefruit", "toronja", "pomelo"],
  yuzu: ["yuzu"],
  "blackcurrant": ["blackcurrant", "black currant", "cassis", "grosella negra"],
  "red-currant": ["red currant", "redcurrant", "grosella roja"],
  apple: ["apple", "manzana"],
  pear: ["pear", "pera"],
  peach: ["peach", "durazno", "melocoton"],
  pineapple: ["pineapple", "pina"],
  raspberry: ["raspberry", "frambuesa"],
  strawberry: ["strawberry", "fresa", "frutilla"],
  plum: ["plum", "ciruela"],
  cherry: ["cherry", "cereza"],
  fig: ["fig", "higo"],
  lychee: ["lychee", "lichi"],
  coconut: ["coconut", "coco"],
  "pink-pepper": ["pink pepper", "pimienta rosa"],
  "black-pepper": ["black pepper", "pimienta negra"],
  pepper: ["pepper", "pimienta"],
  cardamom: ["cardamom", "cardamomo"],
  cinnamon: ["cinnamon", "canela"],
  saffron: ["saffron", "azafran"],
  ginger: ["ginger", "jengibre"],
  nutmeg: ["nutmeg", "nuez moscada"],
  clove: ["clove", "clavo"],
  rose: ["rose", "rosa"],
  jasmine: ["jasmine", "jazmin"],
  "orange-blossom": ["orange blossom", "flor de azahar", "azahar"],
  neroli: ["neroli"],
  lavender: ["lavender", "lavanda"],
  "clary-sage": ["clary sage", "salvia esclarea"],
  sage: ["sage", "salvia"],
  rosemary: ["rosemary", "romero"],
  basil: ["basil", "albahaca"],
  mint: ["mint", "menta"],
  "ylang-ylang": ["ylang ylang", "ylang-ylang"],
  freesia: ["freesia", "fresia"],
  peony: ["peony", "peonia"],
  iris: ["iris"],
  violet: ["violet", "violeta"],
  geranium: ["geranium", "geranio"],
  tuberose: ["tuberose", "nardo"],
  "lily-of-the-valley": ["lily of the valley", "muguet", "lirio del valle"],
  gardenia: ["gardenia"],
  magnolia: ["magnolia"],
  cedarwood: ["cedarwood", "cedar", "cedro"],
  sandalwood: ["sandalwood", "sandal", "sandalo"],
  vetiver: ["vetiver", "vetiver"],
  patchouli: ["patchouli", "pachouli", "pachuli", "pachuli"],
  oakmoss: ["oakmoss", "oak moss", "musgo de roble"],
  musk: ["musk", "almizcle"],
  "white-musk": ["white musk", "almizcle blanco"],
  vanilla: ["vanilla", "vainilla"],
  "tonka-bean": ["tonka bean", "tonka", "haba tonka"],
  oud: ["oud", "agarwood", "agar", "madera de agar"],
  incense: ["incense", "frankincense", "olibanum", "incienso"],
  myrrh: ["myrrh", "mirra"],
  benzoin: ["benzoin", "benjui"],
  labdanum: ["labdanum", "ladano"],
  amber: ["amber", "ambar"],
  ambergris: ["ambergris", "ambar gris"],
  "pink-peppercorn": ["pink peppercorn"],
  tobacco: ["tobacco", "tabaco"],
  leather: ["leather", "cuero"],
  suede: ["suede", "gamuza"],
  "sea-notes": ["sea notes", "marine notes", "notas marinas", "acordes marinos"],
  "green-leaves": ["green leaves", "green leaf", "hojas verdes"],
  "woody-notes": ["woody notes", "wood notes", "notas amaderadas", "maderas"],
  "cashmere-wood": ["cashmere wood", "cashmere woods", "maderas de cachemira"],
  "guaiac-wood": ["guaiac wood", "guaiac", "madera de guayaco"],
  "fir-balsam": ["fir balsam", "balsamo de abeto"],
  "balsam-of-peru": ["balsam of peru", "balsamo del peru"],
  coffee: ["coffee", "cafe"],
  cacao: ["cacao"],
  chocolate: ["chocolate"],
  almond: ["almond", "almendra"],
  honey: ["honey", "miel"],
  praline: ["praline"],
  caramel: ["caramel", "caramelo"],
  aldehydes: ["aldehydes", "aldehidos"],
  tea: ["tea", "te"],
  "green-tea": ["green tea", "te verde"],
  juniper: ["juniper", "enebro"],
  cypress: ["cypress", "cipres"],
  eucalyptus: ["eucalyptus", "eucalipto"],
  ambroxan: ["ambroxan"],
  amberwood: ["amberwood"],
  cashmeran: ["cashmeran"],
  ambrette: ["ambrette"],
  civet: ["civet", "algalia"],
  opoponax: ["opoponax"],
  cypriol: ["cypriol", "nagarmotha"]
});

const FAMILY_ALIAS_GROUPS = Object.freeze({
  citrus: ["citrus", "citrusy", "cítrico", "cítrica", "sunlit citrus"],
  fruity: ["fruity", "fruit", "frutal", "frutal", "orchard fruit"],
  floral: ["floral", "florals", "floral blanco", "floral blanca", "white bloom", "petal garden"],
  aromatic: ["aromatic", "aromática", "aromático"],
  green: ["green", "verde", "green leaf"],
  woody: ["woody", "wood", "amaderado", "amaderada", "wood and root", "oud court"],
  earthy: ["earthy", "terroso", "terrosa", "wood and root"],
  spicy: ["spicy", "spice", "especiado", "especiada", "spice route"],
  amber: ["amber", "ambarado", "ambarada", "amber and resin", "oud court"],
  resinous: ["resinous", "resinoso", "resinosa", "amber and resin", "oud court"],
  gourmand: ["gourmand", "dulce", "dulces", "velvet sweet"],
  sweet: ["sweet", "dulce", "velvet sweet"],
  powdery: ["powdery", "empolvado", "empolvada", "powder veil"],
  musky: ["musky", "almizclado", "almizclada", "skin musk"],
  smoky: ["smoky", "smoke", "ahumado", "ahumada", "smoke and leather"],
  leathery: ["leathery", "leather", "cuero", "smoke and leather"],
  aquatic: ["aquatic", "acuático", "acuática", "marine", "salt and mineral"],
  mineral: ["mineral", "mineralic", "salt and mineral"],
  clean: ["clean", "limpio", "limpia"],
  creamy: ["creamy", "cremoso", "cremosa"]
});

const CHARACTER_ALIAS_GROUPS = Object.freeze({
  citrus: ["citrusy", "citrus", "cítrico", "cítrica"],
  fruity: ["fruity", "fruit", "frutal"],
  floral: ["floral"],
  woody: ["woody", "wood", "amaderado", "amaderada"],
  spicy: ["spicy", "especiado", "especiada"],
  sweet: ["sweet", "dulce"],
  warm: ["warm", "cálido", "cálida"],
  fresh: ["fresh", "fresco", "fresca"],
  earthy: ["earthy", "terroso", "terrosa"],
  creamy: ["creamy", "cremoso", "cremosa"],
  herbal: ["herbal", "herbáceo", "herbácea"],
  powdery: ["powdery", "empolvado", "empolvada"],
  resinous: ["resinous", "resinoso", "resinosa"],
  musky: ["musky", "almizclado", "almizclada"],
  green: ["green", "verde"],
  amber: ["amber", "ambarado", "ambarada"],
  smoky: ["smoky", "ahumado", "ahumada"],
  clean: ["clean", "limpio", "limpia"],
  salty: ["salty", "salado", "salada"],
  leathery: ["leathery", "cuero"],
  rich: ["rich", "intenso", "intensa"]
});

function createAliasIndex(groups) {
  const index = new Map();
  for (const [canonical, aliases] of Object.entries(groups)) {
    for (const alias of [canonical, ...aliases]) {
      const key = toLookupKey(alias);
      if (key && !index.has(key)) index.set(key, canonical);
    }
  }
  return index;
}

const NOTE_INDEX = createAliasIndex(NOTE_ALIAS_GROUPS);
const FAMILY_INDEX = createAliasIndex(FAMILY_ALIAS_GROUPS);
const CHARACTER_INDEX = createAliasIndex(CHARACTER_ALIAS_GROUPS);

const DATASET_FAMILY_GROUP_TAGS = new Map([
  ["wood and root", ["woody", "earthy"]],
  ["white bloom", ["floral"]],
  ["petal garden", ["floral"]],
  ["green leaf", ["green"]],
  ["velvet sweet", ["gourmand", "sweet"]],
  ["sunlit citrus", ["citrus"]],
  ["spice route", ["spicy"]],
  ["orchard fruit", ["fruity"]],
  ["amber and resin", ["amber", "resinous"]],
  ["powder veil", ["powdery"]],
  ["skin musk", ["musky"]],
  ["smoke and leather", ["smoky", "leathery"]],
  ["salt and mineral", ["aquatic", "mineral"]],
  ["oud court", ["woody", "amber", "resinous"]]
]);

function toEntryList(values, normalizer) {
  const seen = new Set();
  const entries = [];
  for (const raw of values) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const label = raw.trim().replace(/\s+/g, " ");
    const key = normalizer(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    entries.push(Object.freeze({ key, label }));
  }
  return Object.freeze(entries);
}

export function normalizeOlfactoryTerm(value, domain = "note") {
  const lookup = toLookupKey(value);
  if (!lookup) return null;

  if (domain === "family") return FAMILY_INDEX.get(lookup) ?? `family:${toSlug(lookup)}`;
  if (domain === "character") return CHARACTER_INDEX.get(lookup) ?? toSlug(lookup);
  if (domain === "accord") return NOTE_INDEX.get(lookup) ?? CHARACTER_INDEX.get(lookup) ?? toSlug(lookup);
  return NOTE_INDEX.get(lookup) ?? toSlug(lookup);
}

export function normalizeOlfactoryTerms(values, domain = "note") {
  if (!Array.isArray(values)) return Object.freeze([]);
  return toEntryList(values, (value) => normalizeOlfactoryTerm(value, domain));
}

function familyEntries(values) {
  const seen = new Set();
  const entries = [];
  for (const raw of values) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const label = raw.trim().replace(/\s+/g, " ");
    const lookup = toLookupKey(label);
    const groupTags = DATASET_FAMILY_GROUP_TAGS.get(lookup);
    const keys = groupTags ?? [normalizeOlfactoryTerm(label, "family")];
    for (const key of keys) {
      if (!key || seen.has(key)) continue;
      seen.add(key);
      entries.push(Object.freeze({ key, label }));
    }
  }
  return Object.freeze(entries);
}

export function normalizeFragranceSimilarityProfile(profile) {
  const validation = validateFragranceSimilarityProfile(profile);
  if (!validation.valid) {
    throw new TypeError(`Cannot normalize invalid fragrance profile: ${validation.issues.join(", ")}`);
  }

  const olfactory = profile.olfactory;
  const familySource = olfactory.family ? [olfactory.family] : [];
  return Object.freeze({
    id: profile.id,
    identity: Object.freeze({
      name: profile.identity.name,
      house: profile.identity.house,
      category: profile.identity.category
    }),
    families: familyEntries(familySource),
    subfamilies: familyEntries(olfactory.subfamilies ?? []),
    accords: normalizeOlfactoryTerms(olfactory.accords ?? [], "accord"),
    notes: Object.freeze({
      all: normalizeOlfactoryTerms(olfactory.notes.all, "note"),
      top: normalizeOlfactoryTerms(olfactory.notes.top, "note"),
      heart: normalizeOlfactoryTerms(olfactory.notes.heart, "note"),
      base: normalizeOlfactoryTerms(olfactory.notes.base, "note")
    }),
    character: normalizeOlfactoryTerms(olfactory.character, "character"),
    quality: Object.freeze({
      noteCount: profile.quality.noteCount,
      characterCount: profile.quality.characterCount,
      pyramidCoverage: profile.quality.pyramidCoverage,
      hasNotes: profile.quality.hasNotes,
      hasCharacter: profile.quality.hasCharacter
    }),
    provenance: profile.provenance
  });
}
