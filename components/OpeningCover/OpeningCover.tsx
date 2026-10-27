"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const TILES = ["ا", "ل", "ع", "ب"]; // العب, "play"
const PAGE = "main, header.nav, footer";

/**
 * First screen. Pure DOM + Motion, so entering never depends on WebGL.
 * Enter by click/tap, Enter/Space/↓, wheel or swipe. Skipped for deep links (#hash) and later visits in the same session.
 */
export function OpeningCover() {
  const [open, setOpen] = useState(true);
  const reduce = useReducedMotion();
  const btn = useRef<HTMLButtonElement>(null);
  const done = useRef(false);

  const lock = (on: boolean) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.querySelectorAll(PAGE).forEach((el) => el.toggleAttribute("inert", on));
  };

  const enter = useCallback(() => {
    if (done.current) return;
    done.current = true;
    lock(false);
    document.documentElement.dataset.entered = "1";
    try { sessionStorage.setItem("pg-entered", "1"); } catch { /* private mode */ }
    dispatchEvent(new Event("playground:enter")); // the lanyard drops as the cover lifts
    setOpen(false);
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.cover === "skip") { done.current = true; setOpen(false); return; }
    lock(true);
    btn.current?.focus({ preventScroll: true });
    let y0 = 0;
    const key = (e: KeyboardEvent) => { if (["Enter", " ", "ArrowDown", "PageDown", "Escape"].includes(e.key)) { e.preventDefault(); enter(); } };
    const wheel = (e: WheelEvent) => { if (e.deltaY > 8) enter(); };
    const start = (e: TouchEvent) => { y0 = e.touches[0].clientY; };
    const move = (e: TouchEvent) => { if (y0 - e.touches[0].clientY > 28) enter(); };
    addEventListener("keydown", key);
    addEventListener("wheel", wheel, { passive: true });
    addEventListener("touchstart", start, { passive: true });
    addEventListener("touchmove", move, { passive: true });
    return () => {
      lock(false);
      removeEventListener("keydown", key); removeEventListener("wheel", wheel);
      removeEventListener("touchstart", start); removeEventListener("touchmove", move);
    };
  }, [enter]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cover"
          role="dialog"
          aria-modal="true"
          aria-label="Sultan’s Project Playground"
          onClick={enter}
          exit={reduce ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduce ? 0.15 : 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div className="cover-main" exit={reduce ? undefined : { y: -70, opacity: 0 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
            <div className="cover-tiles" dir="rtl" aria-hidden>
              {TILES.map((ch, i) => (
                <motion.span key={ch} lang="ar" className="bridge-tile amiri" initial={reduce ? false : { y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.07, duration: 0.5, ease: [0.2, 0.7, 0.1, 1] }}>
                  {ch}
                </motion.span>
              ))}
            </div>
            <p className="kicker">A little digital playground</p>
            <p className="cover-title">Sultan’s<br />Project<br />Playground</p>
            <p className="cover-sub">Arabic Scrabble · Lughoti Vokasi</p>
          </motion.div>
          <div className="cover-foot">
            <button ref={btn} type="button" className="btn btn-solid" onClick={enter} data-cursor="ENTER">Enter</button>
            <span className="hint">or scroll, swipe, press Enter</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
