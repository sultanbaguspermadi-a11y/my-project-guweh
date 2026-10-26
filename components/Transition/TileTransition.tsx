"use client";

import { useRef } from "react";

const WORD = ["ل", "غ", "ت", "ي"]; // لغتي, left to right as tiles

/** Tiles near the cursor lift and turn; a small bridge from the dark board to the light page. */
export function TileTransition() {
  const row = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    row.current?.querySelectorAll<HTMLElement>(".bridge-tile").forEach((el) => {
      const b = el.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      const near = Math.max(0, 1 - Math.hypot(dx, dy) / 220);
      el.style.setProperty("--n", near.toFixed(2));
      el.style.setProperty("--tx", `${(-dx * 0.08 * near).toFixed(1)}px`);
    });
  };
  const leave = () => row.current?.querySelectorAll<HTMLElement>(".bridge-tile").forEach((el) => { el.style.setProperty("--n", "0"); el.style.setProperty("--tx", "0px"); });
  return (
    <div className="bridge" onPointerMove={move} onPointerLeave={leave}>
      <div ref={row} className="bridge-row" dir="rtl" aria-hidden>
        {WORD.slice().reverse().map((ch) => (
          <span key={ch} className="bridge-tile amiri" lang="ar">{ch}</span>
        ))}
      </div>
      <a href="#lughoti" className="bridge-link" data-cursor="GO">next: a dictionary ↓</a>
    </div>
  );
}
