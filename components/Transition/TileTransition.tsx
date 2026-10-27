"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { WebGLBoundary } from "../WebGL/WebGLFallback";
import { canWebGL, clamp01, getTier, ss, type Tier } from "../WebGL/timeline";

const GL = dynamic(() => import("../WebGL/ProjectTransition3D"), { ssr: false });

const WORD = ["ل", "غ", "ت", "ي"]; // لغتي, left to right as tiles
const STOPS = [[36, 21, 12], [59, 90, 106], [223, 240, 251]]; // wood-2 → slate → sky-wash: same ends as the sections around it
const mix = (p: number) => {
  const [a, b, t] = p < 0.5 ? [STOPS[0], STOPS[1], p * 2] : [STOPS[1], STOPS[2], (p - 0.5) * 2];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
};

function TileRow({ interactive }: { interactive?: boolean }) {
  const row = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (!interactive || e.pointerType !== "mouse") return;
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
    <div className="bridge-row" ref={row} dir="rtl" aria-hidden onPointerMove={move} onPointerLeave={leave}>
      {WORD.slice().reverse().map((ch) => <span key={ch} className="bridge-tile amiri" lang="ar">{ch}</span>)}
    </div>
  );
}

/**
 * Scrabble → Lughoti. A tall section with a sticky stage; scroll position (0-1) is the only clock.
 * Falls back to the plain tile row when WebGL is missing, fails, or motion is reduced.
 */
export function TileTransition() {
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const glWrap = useRef<HTMLDivElement>(null);
  const capA = useRef<HTMLSpanElement>(null);
  const capB = useRef<HTMLSpanElement>(null);
  const link = useRef<HTMLAnchorElement>(null);
  const progress = useRef({ current: 0 });
  const invalidate = useRef<(() => void) | null>(null);
  const visible = useRef(false);
  const [mode, setMode] = useState<"static" | "gl">("static");
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [tier, setTier] = useState<Tier>("desktop");

  // Decide once on the client; follow the OS reduced-motion setting live.
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => { setMode(!mq.matches && canWebGL() ? "gl" : "static"); setTier(getTier()); };
    decide();
    mq.addEventListener("change", decide);
    const resize = () => setTier(getTier()); // never re-probe WebGL here; only the quality tier follows the viewport
    addEventListener("resize", resize);
    return () => { mq.removeEventListener("change", decide); removeEventListener("resize", resize); };
  }, []);

  const update = useCallback(() => {
    const s = sec.current, st = stage.current;
    if (!s || !st) return;
    const r = s.getBoundingClientRect();
    const p = clamp01(-r.top / Math.max(1, r.height - innerHeight));
    progress.current.current = p;
    st.style.backgroundColor = mix(p);
    if (capA.current) capA.current.style.opacity = String(1 - ss(0.3, 0.5, p));
    if (capB.current) capB.current.style.opacity = String(ss(0.55, 0.75, p));
    if (link.current) link.current.style.color = p > 0.55 ? "#17130e" : "#f6ecd2";
    if (glWrap.current) glWrap.current.style.opacity = String(1 - ss(0.9, 1, p)); // hand off to the DOM section
    invalidate.current?.();
  }, []);

  useEffect(() => { if (!near) setReady(false); }, [near]); // canvas unmounted: show the DOM row again until it is rebuilt

  useEffect(() => {
    if (mode !== "gl" || !sec.current) return;
    let raf = 0;
    const tick = () => { raf = 0; if (visible.current) update(); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      setNear(e.isIntersecting);   // mounts the canvas when the section is within a screen and a half...
      if (e.isIntersecting) update();
    }, { rootMargin: "150% 0px" }); // ...and unmounts it again once it is well past
    io.observe(sec.current);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();
    return () => { io.disconnect(); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [mode, update]);

  const fail = useCallback(() => { setMode("static"); setReady(false); invalidate.current = null; }, []);

  if (mode === "static") {
    return (
      <div className="bridge">
        <TileRow interactive />
        <a href="#lughoti" className="bridge-link" data-cursor="GO">next: a dictionary ↓</a>
      </div>
    );
  }

  return (
    <section ref={sec} className="tt" aria-label="From the board game to the dictionary">
      <div ref={stage} className="tt-stage" data-ready={ready ? "1" : undefined}>
        <TileRow />
        {near && (
          <div ref={glWrap} className="tt-gl"><WebGLBoundary onError={fail}>
            <GL
              progress={progress.current}
              tier={tier}
              onFail={fail}
              onReady={(inv) => { invalidate.current = inv; setReady(true); update(); }}
            />
          </WebGLBoundary></div>
        )}
        <p className="tt-cap" aria-hidden>
          <span ref={capA}>tiles</span>
          <span ref={capB} style={{ opacity: 0 }}>words</span>
        </p>
        <a ref={link} href="#lughoti" className="bridge-link tt-link" data-cursor="GO">next: a dictionary ↓</a>
      </div>
    </section>
  );
}
