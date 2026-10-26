// Single source of truth for links and copy. Only real, user-supplied links live here.
export const PROJECTS = [
  {
    n: "01",
    slug: "arabic-scrabble",
    name: "Arabic Scrabble",
    ar: "سكرابل عربية",
    kind: "Board game",
    line: "Two players, one device, a 15×15 board.",
    url: "https://asbyebepev5.vercel.app/",
    cta: "Open Arabic Scrabble",
  },
  {
    n: "02",
    slug: "lughoti-vokasi",
    name: "Lughoti Vokasi",
    ar: "لغتي",
    kind: "Dictionary",
    line: "Arabic–Indonesian vocabulary for vocational students.",
    url: "https://lughoti-vokasi-final.vercel.app/",
    cta: "Open Lughoti Vokasi",
  },
] as const;

export type Project = (typeof PROJECTS)[number];
