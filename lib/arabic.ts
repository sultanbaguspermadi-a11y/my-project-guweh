// Same idea as the Lughoti app: search ignores harakat and folds common letter variants.
const MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

export const normalizeArabic = (s: string): string =>
  s
    .normalize("NFKC")
    .replace(MARKS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .trim();

export const normalizeLatin = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'‘`ʿʾ]/g, "")
    .trim();

export const hasArabic = (s: string): boolean => /[\u0600-\u06FF]/.test(s);
