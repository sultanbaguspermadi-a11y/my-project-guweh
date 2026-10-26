import { hasArabic, normalizeArabic, normalizeLatin } from "@/lib/arabic";

export const DEPTS = ["RPL", "TBKR", "Akuntansi", "TSM"] as const;
export type Dept = (typeof DEPTS)[number] | "Umum";

export interface Entry {
  uid: string;
  dept: Dept;
  ar: string;
  latin: string;
  id: string; // Indonesian meaning
  cat: string;
  exAr: string;
  exId: string;
  _ar: string;
  _la: string;
  _id: string;
}

let cache: Promise<Entry[]> | null = null;

/** Loads the real dictionary file (same format as the Lughoti app) once, on demand. */
export function loadDictionary(): Promise<Entry[]> {
  cache ??= fetch("/words.json")
    .then((r) => {
      if (!r.ok) throw new Error(`words.json ${r.status}`);
      return r.json() as Promise<Record<string, unknown>>;
    })
    .then((json) => {
      const out: Entry[] = [];
      for (const dept of [...DEPTS, "Umum"] as Dept[]) {
        const rows = json[dept];
        if (!Array.isArray(rows)) continue;
        rows.forEach((row, i) => {
          if (!Array.isArray(row) || row.length < 6 || !row.every((c) => typeof c === "string")) return;
          const [ar, latin, id, cat, exAr, exId] = row as string[];
          out.push({ uid: `${dept}:${i}`, dept, ar, latin, id, cat, exAr, exId, _ar: normalizeArabic(ar), _la: normalizeLatin(latin), _id: normalizeLatin(id) });
        });
      }
      return out;
    })
    .catch((e) => {
      cache = null; // allow retry
      throw e;
    });
  return cache;
}

/** Ranked search: exact meaning > prefix > substring. Arabic ignores harakat. */
export function search(all: Entry[], dept: Dept, raw: string, limit = 6): { hits: Entry[]; widened: boolean } {
  const q = raw.trim();
  if (!q) return { hits: [], widened: false };
  const arabic = hasArabic(q);
  const nq = arabic ? normalizeArabic(q) : normalizeLatin(q);
  const score = (e: Entry): number => {
    const fields = arabic ? [e._ar] : [e._id, e._la];
    let best = 0;
    for (const f of fields) {
      if (f === nq) best = Math.max(best, 3);
      else if (f.startsWith(nq)) best = Math.max(best, 2);
      else if (f.includes(nq)) best = Math.max(best, 1);
    }
    return best;
  };
  const rank = (pool: Entry[]) =>
    pool
      .map((e) => [e, score(e)] as const)
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1] || a[0].id.length - b[0].id.length)
      .slice(0, limit)
      .map(([e]) => e);
  const inDept = rank(all.filter((e) => e.dept === dept));
  if (inDept.length) return { hits: inDept, widened: false };
  return { hits: rank(all), widened: true };
}
