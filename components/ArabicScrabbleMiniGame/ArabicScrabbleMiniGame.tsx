"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { BOARD, ROUNDS, TILE_VALUES, type Round } from "@/data/scrabbleDemo";
import { PROJECTS } from "@/data/projects";

interface Tile { id: string; ch: string }

const shuffle = <T,>(a: T[]): T[] => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const makeRack = (r: Round, mix: boolean): Tile[] => {
  const t = [...r.word, ...r.decoys].map((ch, i) => ({ id: `${r.word}-${i}`, ch }));
  return mix ? shuffle(t) : t;
};
const value = (ch: string) => TILE_VALUES[ch] ?? 0;

function Face({ ch }: { ch: string }) {
  return (
    <>
      <span lang="ar" dir="rtl" className="tile-ch">{ch}</span>
      <sup className="tile-val">{value(ch)}</sup>
    </>
  );
}

/** Short, reliable demo: drag (or tap) the right tiles into the word row. No dictionary, no rules engine. */
export function ArabicScrabbleMiniGame() {
  const [ri, setRi] = useState(0);
  const round = ROUNDS[ri];
  const letters = [...round.word];
  const [rack, setRack] = useState<Tile[]>(() => makeRack(ROUNDS[0], false));
  const [placed, setPlaced] = useState<(Tile | null)[]>(() => Array(letters.length).fill(null));
  const [wobble, setWobble] = useState<string | null>(null);
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const moved = useRef(false);
  const done = placed.every(Boolean);
  const score = letters.reduce((s, c) => s + value(c), 0);

  // Shuffle after mount only, so server and client render the same first frame.
  useEffect(() => { setRack(makeRack(ROUNDS[0], true)); }, []);

  const load = (i: number) => {
    setRi(i);
    setRack(makeRack(ROUNDS[i], true));
    setPlaced(Array(ROUNDS[i].word.length).fill(null));
  };

  const reject = (id: string) => {
    setWobble(id);
    setTimeout(() => setWobble(null), 400);
  };

  const place = (t: Tile, slot: number | null) => {
    const idx = slot ?? letters.findIndex((c, i) => c === t.ch && !placed[i]);
    if (idx < 0 || placed[idx] || letters[idx] !== t.ch) return reject(t.id);
    setPlaced((p) => p.map((x, i) => (i === idx ? t : x)));
    setRack((r) => r.filter((x) => x.id !== t.id));
  };

  const pickUp = (i: number) => {
    const t = placed[i];
    if (!t || done) return;
    setPlaced((p) => p.map((x, k) => (k === i ? null : x)));
    setRack((r) => [...r, t]);
  };

  const drop = (t: Tile, pageX: number, pageY: number) => {
    const x = pageX - scrollX, y = pageY - scrollY;
    const idx = slots.current.findIndex((el) => {
      if (!el) return false;
      const b = el.getBoundingClientRect();
      return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
    });
    if (idx >= 0) place(t, idx);
    setTimeout(() => { moved.current = false; }, 0);
  };

  const first = (BOARD[0].length - letters.length) >> 1;

  return (
    <div className="mini" aria-label="Arabic Scrabble mini game">
      <div className="mini-head">
        <p className="kicker">Make the word</p>
        <p lang="ar" dir="rtl" className="amiri mini-word">{round.shown}</p>
        <p className="mini-mean">= {round.meaning}</p>
      </div>

      <div className="board" dir="rtl">
        {BOARD.map((row, r) =>
          [...row].map((c, col) => {
            const si = r === 2 ? col - first : -1;
            const isSlot = si >= 0 && si < letters.length;
            return (
              <div
                key={`${r}-${col}`}
                ref={isSlot ? (el) => { slots.current[si] = el; } : undefined}
                className={`sq ${isSlot ? "sq-slot" : ""}`}
                data-p={c}
                data-filled={isSlot && placed[si] ? "1" : undefined}
              >
                {isSlot && placed[si] ? (
                  <motion.button
                    type="button"
                    className="tile tile-placed"
                    initial={{ scale: 1.25, y: -10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 22 }}
                    onClick={() => pickUp(si)}
                    aria-label={`Letter ${placed[si]!.ch} in place. Press to take it back.`}
                  >
                    <Face ch={placed[si]!.ch} />
                  </motion.button>
                ) : isSlot ? (
                  <span className="sq-hint" aria-hidden>{si + 1}</span>
                ) : c === "*" ? <span className="sq-star" aria-hidden>★</span> : null}
              </div>
            );
          }),
        )}
      </div>

      <div className="rack" aria-label="Your tiles">
        {rack.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            className="tile tile-rack"
            data-cursor="DRAG"
            drag
            dragSnapToOrigin
            dragElastic={0.12}
            whileDrag={{ scale: 1.14, rotate: -5, zIndex: 40 }}
            animate={wobble === t.id ? { rotate: [0, -9, 9, -5, 5, 0] } : { rotate: 0 }}
            transition={{ duration: 0.38 }}
            onDragStart={() => { moved.current = true; }}
            onDragEnd={(_, info) => drop(t, info.point.x, info.point.y)}
            onClick={() => { if (moved.current) { moved.current = false; return; } place(t, null); }}
            aria-label={`Tile ${t.ch}, ${value(t.ch)} points. Drag it to the word, or press to place it.`}
          >
            <Face ch={t.ch} />
          </motion.button>
        ))}
        {rack.length === 0 && <span className="rack-empty">rack empty</span>}
      </div>

      <div className="mini-foot" aria-live="polite">
        {done ? (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="win">
            <p lang="ar" dir="rtl" className="amiri win-ar">أحسنت!</p>
            <p className="win-score">+{score} <small>tile points</small></p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-solid" onClick={() => load((ri + 1) % ROUNDS.length)}>Play again</button>
              <a className="btn btn-line" href={PROJECTS[0].url} target="_blank" rel="noopener noreferrer" data-cursor="OPEN">Open Arabic Scrabble →</a>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="hint">Drag the right tiles into the row. Or just tap them.</p>
            <button type="button" className="btn btn-line" onClick={() => load(ri)}>Reset</button>
          </div>
        )}
      </div>
    </div>
  );
}
