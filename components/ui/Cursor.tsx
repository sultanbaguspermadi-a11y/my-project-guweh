"use client";
import { useEffect, useRef } from "react";

/** Small ring that follows the mouse and shows DRAG / PLAY / OPEN over [data-cursor] elements. Mouse only. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ring.current!;
    const label = el.firstElementChild as HTMLElement;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const tick = () => {
      x += (tx - x) * 0.28; y += (ty - y) * 0.28;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX; ty = e.clientY;
      if (!el.dataset.on) { x = tx; y = ty; }
      el.dataset.on = "1";
      const text = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
      if (el.dataset.label !== text) { el.dataset.label = text; label.textContent = text; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => { el.dataset.on = ""; };
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ring} className="cursor" aria-hidden data-on=""><span /></div>;
}
