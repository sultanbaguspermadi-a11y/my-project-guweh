"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { PROJECTS } from "@/data/projects";
import { TILE_VALUES } from "@/data/scrabbleDemo";
import { Reveal } from "../ui/Reveal";

const BIG = ["ص", "غ", "ع", "ط", "ز"]; // the heaviest tiles in the real bag (values 10, 10, 8, 8, 10)

const SCRABBLE_FACTS = [
  ["2 players", "one device, pass it back and forth"],
  ["15×15", "the classic board"],
  ["تحكيم", "tahkim: a human rules every word ✔ صحيح or ✖ خطأ"],
  ["4 themes", "Classic, Dark, Emerald, Desert"],
  ["Offline", "install it once, play anywhere"],
];

/** Oversized real tiles that drift at different scroll speeds. */
export function ScrabbleShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 70]);
  const r1 = useTransform(scrollYProgress, [0, 1], [-9, 6]);
  const p = PROJECTS[0];
  return (
    <div ref={ref} className="showcase-s">
      <div className="giant-tiles" aria-hidden>
        {BIG.map((ch, i) => (
          <motion.div key={ch} className="giant" style={{ y: i % 2 ? y2 : y1, rotate: i === 1 ? r1 : (i - 2) * 3 }}>
            <span lang="ar" dir="rtl" className="amiri">{ch}</span>
            <sup>{TILE_VALUES[ch]}</sup>
          </motion.div>
        ))}
      </div>
      <ul className="facts facts-s">
        {SCRABBLE_FACTS.map(([a, b]) => (
          <li key={a}><strong lang={/[\u0600-\u06FF]/.test(a) ? "ar" : undefined}>{a}</strong><span>{b}</span></li>
        ))}
      </ul>
      <a className="big-link" href={p.url} target="_blank" rel="noopener noreferrer" data-cursor="OPEN">{p.cta} →</a>
    </div>
  );
}

const LUGHOTI_FACTS = [
  ["شجره = شَجَرَة", "search ignores harakat"],
  ["RPL · TBKR · Akuntansi · TSM", "a word list per department, plus everyday words"],
  ["Mirip", "“careful, these look alike” pairs"],
  ["Story card", "share a word as a 1080×1920 image"],
  ["Offline", "install it to your home screen"],
];

export function LughotiShowcase() {
  const p = PROJECTS[1];
  return (
    <div className="showcase-l">
      <ul className="facts facts-l">
        {LUGHOTI_FACTS.map(([a, b]) => (
          <li key={a}><strong lang={/[\u0600-\u06FF]/.test(a) ? "ar" : undefined}>{a}</strong><span>{b}</span></li>
        ))}
      </ul>
      <a className="big-link big-link-sky" href={p.url} target="_blank" rel="noopener noreferrer" data-cursor="OPEN">{p.cta} →</a>
    </div>
  );
}

export function SectionTitle({ n, name, ar, arClass }: { n: string; name: string; ar: string; arClass: string }) {
  return (
    <header className="sec-title">
      <p className="kicker">{n} — project</p>
      <h2 className="sec-h"><Reveal>{name}</Reveal></h2>
      <p lang="ar" dir="rtl" className={`sec-ar ${arClass}`}>{ar}</p>
    </header>
  );
}
