/**
 * MEASURED POINTS — Lovable: open each image, find these points by eye, and
 * replace the numbers. They are % of the image's own width and height.
 */
export const POINTS = {
  /** Centre of the lantern flame in hand-lantern image (the 7 layers share this). */
  flame: { x: 59.7, y: 53 },
  /** Centre of the lantern flame in hero-mobile (used on mobile). */
  flameMaster: { x: 53.5, y: 51.5 },
  /** Centre of the big window in suite image. */
  suiteWindow: { x: 68, y: 38 },
  /** Centre of the fire in dining image. */
  diningFire: { x: 91, y: 54 },
  /** Centre of the big window in dining (blue-hour mountains). */
  diningWindow: { x: 35, y: 25 },
  /** Main peak in trail. */
  trailFocus: { x: 56, y: 20 },
  /** Centre of the lodge's lit windows in stars. */
  starsLodge: { x: 81, y: 64 },
};

/** Number of scroll beats in the film. Batch 2 increases this. */
export const BEATS = 11;

export type FilmText = {
  id: string;
  /** Where the block sits on desktop. On mobile every block sits at the bottom. */
  place: "bottom-left" | "top-left" | "middle-left" | "middle-right" | "center";
  tone?: "light"; // dark text on a light background
  label?: string;
  /** One entry per headline line. Wrap the italic word in *asterisks*. */
  headline: string[];
  body?: string;
  meta?: string;
  list?: string[];
};

export const TEXTS: FilmText[] = [
  {
    id: "arrival",
    place: "bottom-left",
    label: "A lodge above the clouds · 2,940 m",
    headline: ["Where the mountains", "*keep* the light."],
    body: "Twelve suites of timber and stone, one long fire, and nowhere you need to be.",
  },
  {
    id: "lodge",
    place: "top-left",
    label: "01 — The lodge",
    headline: ["Twelve suites on a ledge", "most maps *leave* out."],
    body: "The road ends forty minutes below us. Up here, the day is measured by light on the peaks.",
    meta: "2,940 m · 12 suites · 40 min on foot",
  },
  { id: "light", place: "center", tone: "light", headline: ["Step *inside*."] },
  {
    id: "stay",
    place: "middle-left",
    label: "02 — The stay",
    headline: ["Rooms that face", "the *weather*."],
    body: "One wide window, a fireplace lit before you arrive, timber, stone, wool and linen.",
    meta: "Ridge suite · 64 m² · sleeps 2",
  },
  {
    id: "dining",
    place: "middle-right",
    label: "03 — Dining",
    headline: ["One table,", "one *fire*."],
    body: "Dinner is served by the hearth at eight. The menu follows what the valley grows that week.",
    list: ["Tonight", "Smoked trout · juniper", "Lamb · apricot · walnut", "Burnt honey custard"],
  },
  {
    id: "trail",
    place: "top-left",
    label: "04 — Experiences",
    headline: ["Days that start", "above the *clouds*."],
    body: "Guided ridge walks leave at first light. Bring a coat; we bring the coffee.",
    meta: "Sunrise ridge walk · 3 hrs · guided",
  },
  {
    id: "stars",
    place: "middle-left",
    label: "05 — Nights",
    headline: ["Nothing between you", "and the *stars*."],
    body: "The terrace stays open after dark, with blankets and something warm, until the last guest goes in.",
    meta: "Night sky terrace · after 10 pm",
  },
];
