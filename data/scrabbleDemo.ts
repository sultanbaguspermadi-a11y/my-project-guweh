// Tile values copied from the real game's tile bag (js/modes.js). Nothing else is simulated.
export const TILE_VALUES: Record<string, number> = {
  ا: 1, ل: 1, ي: 1, ت: 1, ن: 1, ر: 1,
  و: 2, م: 2, ب: 2, د: 2, ه: 2,
  س: 3, ج: 3, ح: 3, ك: 3,
  خ: 4, ق: 4, ف: 4,
  ث: 5, ذ: 5, ش: 5, ض: 5,
  ط: 8, ظ: 8, ع: 8,
  ص: 10, ز: 10, غ: 10,
};

export interface Round {
  word: string; // bare letters, one tile each
  shown: string; // with harakat
  meaning: string;
  decoys: string[];
}

export const ROUNDS: Round[] = [
  { word: "كتاب", shown: "كِتَاب", meaning: "book", decoys: ["م", "س"] },
  { word: "مكتب", shown: "مَكْتَب", meaning: "desk, office", decoys: ["ر", "ن"] },
  { word: "قلم", shown: "قَلَم", meaning: "pen", decoys: ["د", "و"] },
  { word: "بيت", shown: "بَيْت", meaning: "house", decoys: ["ر", "ح"] },
];

// 5×5 board, same palette as the game. "." plain · l/L double/triple letter · w/W double/triple word · * centre
export const BOARD = ["W.l.W", ".w.w.", "l.*.l", ".w.w.", "W.l.W"];
