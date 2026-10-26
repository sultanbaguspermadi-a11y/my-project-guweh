"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { DEPTS, loadDictionary, search, type Dept, type Entry } from "@/data/vocabulary";
import { SEEDS } from "@/data/seeds";
import { PROJECTS } from "@/data/projects";

const seedEntry = (dept: Dept, i = 0): Entry => {
  const s = SEEDS[dept][i % SEEDS[dept].length];
  return { uid: `seed:${dept}:${i}`, dept, ar: s.ar, latin: s.latin, id: s.id, cat: "", exAr: "", exId: "", _ar: "", _la: "", _id: "" };
};

export function LughotiExplorer() {
  const root = useRef<HTMLDivElement>(null);
  const seen = useInView(root, { once: true, margin: "200px" });
  const [dict, setDict] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [dept, setDept] = useState<Dept>("RPL");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Entry | null>(null);
  const [seedIdx, setSeedIdx] = useState(0);

  useEffect(() => {
    if (!seen) return;
    loadDictionary().then(setDict).catch(() => setFailed(true));
  }, [seen]);

  const { hits, widened } = useMemo(() => (dict ? search(dict, dept, q) : { hits: [] as Entry[], widened: false }), [dict, dept, q]);
  const shown: Entry = picked ?? hits[0] ?? seedEntry(dept, seedIdx);
  const empty = q.trim() !== "" && dict !== null && hits.length === 0;

  const random = () => {
    if (!dict) return setSeedIdx((i) => i + 1);
    const pool = dict.filter((e) => e.dept === dept);
    setQ("");
    setPicked(pool[Math.floor(Math.random() * pool.length)]);
  };
  const clear = () => { setQ(""); setPicked(null); };

  // result card leans toward the pointer; floating words drift with it (CSS vars, no re-render)
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !root.current) return;
    const r = root.current.getBoundingClientRect();
    root.current.style.setProperty("--mx", String(((e.clientX - r.left) / r.width - 0.5).toFixed(3)));
    root.current.style.setProperty("--my", String(((e.clientY - r.top) / r.height - 0.5).toFixed(3)));
  };

  return (
    <div ref={root} className="lex" onPointerMove={onMove}>
      <div className="lex-float" aria-hidden>
        {SEEDS[dept].map((s, i) => (
          <motion.span
            key={`${dept}-${s.ar}`}
            lang="ar" dir="rtl"
            className="lex-word amiri"
            style={{ ["--i" as string]: i }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            title={s.id}
          >
            {s.ar}
          </motion.span>
        ))}
      </div>

      <div className="lex-ui">
        <div role="group" aria-label="Choose a department" className="chips">
          {DEPTS.map((d) => (
            <button key={d} type="button" className="chip" aria-pressed={dept === d} onClick={() => { setDept(d); setPicked(null); }}>{d}</button>
          ))}
        </div>

        <label className="field">
          <span className="sr-only">Search a word, in Indonesian or Arabic</span>
          <span aria-hidden className="field-caret">›</span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPicked(null); }}
            placeholder="Search something… komputer, mesin, شاشة"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
          />
        </label>

        {hits.length > 1 && (
          <ul className="alts" aria-label="Other matches">
            {hits.slice(0, 5).map((h) => (
              <li key={h.uid}>
                <button type="button" className="alt" aria-pressed={shown.uid === h.uid} onClick={() => setPicked(h)}>{h.id}</button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-solid-sky" onClick={random}>Random word</button>
          <button type="button" className="btn btn-line-sky" onClick={clear} disabled={!q && !picked}>Clear</button>
          <a className="btn btn-line-sky" href={PROJECTS[1].url} target="_blank" rel="noopener noreferrer" data-cursor="OPEN">Open full project →</a>
        </div>
        <p className="hint" role="status">
          {failed ? "Couldn’t load the word list. Showing a few samples." : !dict ? "Loading the real word list…" : empty ? "Nothing for that. Try another word." : widened && q ? `Not in ${dept}. Showing ${shown.dept} instead.` : "Type a word, or hit Random."}
        </p>
      </div>

      <div className="lex-result" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.article
            key={shown.uid}
            className="lex-card"
            initial={{ opacity: 0, y: 18, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <p lang="ar" dir="rtl" className="amiri lex-ar">{shown.ar}</p>
            <p className="lex-latin">{shown.latin}</p>
            <p className="lex-id">{shown.id}</p>
            <p className="lex-meta"><span className="stamp">{shown.dept}</span>{shown.cat && <span>{shown.cat}</span>}</p>
            {shown.exAr && (
              <div className="lex-ex">
                <p lang="ar" dir="rtl" className="amiri">{shown.exAr}</p>
                <p>{shown.exId}</p>
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
