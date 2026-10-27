"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 2D lanyard: one rope-constrained mass (the card clip) + a spring-driven tilt.
 * Everything is driven by real pointer input; the loop sleeps when the card is at rest.
 * Physics runs on refs and writes transforms directly, so React never re-renders per frame.
 */
const G = 2600; // gravity, px/s²
const K_ROPE = 1100; // stiffness once the rope is over-extended
const C_ROPE = 26; // radial damping along the rope
const AIR = 0.9; // linear air drag
const K_TILT = 150;
const C_TILT = 9;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Decorative "scan me" block. Deterministic, purely visual.
const FINDER = [0, 1, 2, 7, 9, 14, 15, 16, 4, 5, 6, 11, 13, 18, 19, 20, 28, 29, 30, 35, 37, 42, 43, 44];
const QR = Array.from({ length: 49 }, (_, i) => FINDER.includes(i) || (i * 7 + (i >> 3) * 5 + 3) % 5 < 2);

export function Lanyard() {
  const box = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const strap = useRef<SVGPathElement>(null);
  const strapDash = useRef<SVGPathElement>(null);
  const impulse = useRef<(x: number, y: number) => void>(() => {});
  const [flipped, setFlipped] = useState(false);
  const [note, setNote] = useState("");
  const [year, setYear] = useState("2026");
  const taps = useRef(0);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const say = useCallback((m: string) => {
    setNote(m);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(""), 2600);
  }, []);

  useEffect(() => {
    const boxEl = box.current!;
    const cardEl = card.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, L = 200, CW = 260, LMAX = 380;
    const A = { x: 0, y: -6 }; // anchor: top centre, just above the viewport edge
    const P = { x: 0, y: 0 }; // clip point
    const V = { x: 0, y: 0 };
    let rot = 0, rotV = 0;
    let dragging = false;
    const target = { x: 0, y: 0 };
    let raf = 0, last = 0, overT = 0, warned = false;

    const draw = () => {
      cardEl.style.transform = `translate3d(${P.x - CW / 2}px, ${P.y}px, 0) rotate(${rot}deg)`;
      const dx = P.x - A.x, dy = P.y - A.y;
      const sag = Math.max(0, L - Math.hypot(dx, dy)) * 0.35;
      const d = `M${A.x},${A.y} Q${(A.x + P.x) / 2},${(A.y + P.y) / 2 + sag} ${P.x},${P.y + 4}`;
      strap.current?.setAttribute("d", d);
      strapDash.current?.setAttribute("d", d);
      (boxEl.parentElement ?? boxEl).style.setProperty("--dx", dx.toFixed(1)); // hero copy leans away from the pull
    };

    const measure = () => {
      const r = boxEl.getBoundingClientRect();
      // "at rest" is judged against the OLD anchor, before it moves
      const atRest = P.x === 0 || (Math.abs(P.x - A.x) < 1.5 && Math.abs(P.y - (A.y + L)) < 4);
      W = r.width; H = r.height; CW = cardEl.offsetWidth;
      let ax: number;
      if (W < 640) { L = clamp(H * 0.11, 80, 104); ax = W * 0.62; } // phones: upper centre-right, part of the composition
      else if (W < 1024) { L = clamp(H * 0.13, 90, 150); ax = W - clamp(W * 0.07, 28, 72) - CW / 2; } // tablet: moved inward
      else { L = clamp(H * 0.13, 90, 170); ax = W - clamp(W * 0.03, 16, 56) - CW / 2; } // desktop: top-right
      A.x = clamp(ax, CW * 0.62 + 4, W - CW * 0.62 - 4);
      LMAX = Math.min(H * 0.6, Math.max(L * 1.9, 260));
      if (atRest) { P.x = A.x; P.y = A.y + L; V.x = V.y = 0; }
      else { // mid-swing: keep the rope vector valid instead of teleporting
        let dx = P.x - A.x, dy = P.y - A.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d > LMAX) { dx *= LMAX / d; dy *= LMAX / d; }
        P.x = clamp(A.x + dx, CW * 0.62 + 4, W - CW * 0.62 - 4); P.y = A.y + dy;
        run();
      }
      draw();
    };

    const step = (dt: number) => {
      if (dragging) {
        // follow the pointer, but never further than the strap can stretch
        let dx = target.x - A.x, dy = target.y - A.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d > LMAX) { dx = (dx / d) * LMAX; dy = (dy / d) * LMAX; }
        const nx = clamp(A.x + dx, CW * 0.62 + 4, W - CW * 0.62 - 4), ny = Math.max(A.y + dy, A.y + L * 0.5);
        V.x = clamp((nx - P.x) / dt, -4000, 4000);
        V.y = clamp((ny - P.y) / dt, -4000, 4000);
        P.x = nx; P.y = ny;
        overT = d >= LMAX * 0.98 ? overT + dt : 0;
        if (overT > 0.7 && !warned) { warned = true; say("easy, it's only paper."); }
        if (d < LMAX * 0.7) warned = false;
      } else {
        V.y += G * dt;
        const dx = P.x - A.x, dy = P.y - A.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist > L) {
          // over-extended rope = stiff damped spring along its axis
          const nx = dx / dist, ny = dy / dist;
          const a = -K_ROPE * (dist - L) - C_ROPE * (V.x * nx + V.y * ny);
          V.x += a * nx * dt; V.y += a * ny * dt;
        }
        const drag = Math.exp(-AIR * dt);
        V.x *= drag; V.y *= drag;
        P.x += V.x * dt; P.y += V.y * dt;
        const lo = CW * 0.62 + 4, hi = W - CW * 0.62 - 4; // soft walls at the screen edges
        if (P.x < lo || P.x > hi) { P.x = clamp(P.x, lo, hi); V.x *= -0.35; }
      }
      // tilt hangs along the rope, lags behind and overshoots; horizontal speed leans it
      const ropeAngle = -Math.atan2(P.x - A.x, P.y - A.y) * (180 / Math.PI);
      const tTarget = ropeAngle + clamp(V.x * -0.0075, -16, 16);
      rotV += (K_TILT * (tTarget - rot) - C_TILT * rotV) * dt;
      rot += rotV * dt;
    };

    const loop = (t: number) => {
      const dt = Math.min(0.032, (t - last) / 1000 || 0.016);
      last = t;
      const n = Math.ceil(dt * 120); // substeps keep the stiff rope stable
      for (let i = 0; i < n; i++) step(dt / n);
      draw();
      const rest = !dragging && Math.hypot(V.x, V.y) < 4 && Math.abs(rotV) < 0.8 && Math.abs(P.x - A.x) < 0.8;
      raf = rest ? 0 : requestAnimationFrame(loop);
    };
    const run = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    impulse.current = (x, y) => { V.x += x; V.y += y; run(); };

    // --- pointer input -------------------------------------------------------
    const down = { x: 0, y: 0, t: 0, onName: false };
    const grab = { x: 0, y: 0 };
    const local = (e: PointerEvent) => {
      const r = boxEl.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-nodrag]")) return;
      cardEl.setPointerCapture(e.pointerId);
      const p = local(e);
      grab.x = p.x - P.x; grab.y = p.y - P.y; // the point you grabbed stays under your finger
      Object.assign(down, { x: e.clientX, y: e.clientY, t: performance.now(), onName: !!(e.target as HTMLElement).closest("[data-name]") });
      dragging = true; target.x = P.x; target.y = P.y;
      cardEl.dataset.drag = "1";
      run();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const p = local(e);
      target.x = p.x - grab.x; target.y = p.y - grab.y;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false; delete cardEl.dataset.drag;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moved < 6 && performance.now() - down.t < 300 && down.onName && ++taps.current === 5) {
        setYear("٢٠٢٦");
        say("سلطان. you found the other 2026.");
        dispatchEvent(new Event("playground:egg")); // the hero tiles react too
      }
      run();
    };
    cardEl.addEventListener("pointerdown", onDown);
    cardEl.addEventListener("pointermove", onMove);
    cardEl.addEventListener("pointerup", onUp);
    cardEl.addEventListener("pointercancel", onUp);

    const ro = new ResizeObserver(measure);
    ro.observe(boxEl);
    measure();
    // One-off drop-in: released off-centre, so it swings because of physics, not a loop. Waits for the cover.
    const drop = () => {
      if (reduce) return;
      P.x = A.x - Math.min(160, W * 0.25);
      P.y = A.y + L * 0.35;
      V.x = V.y = 0; rot = 0; rotV = 0;
      run();
    };
    const waiting = document.documentElement.dataset.cover !== "skip" && !document.documentElement.dataset.entered;
    if (waiting) addEventListener("playground:enter", drop, { once: true });
    else drop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("playground:enter", drop);
      clearTimeout(noteTimer.current);
      ro.disconnect();
      cardEl.removeEventListener("pointerdown", onDown);
      cardEl.removeEventListener("pointermove", onMove);
      cardEl.removeEventListener("pointerup", onUp);
      cardEl.removeEventListener("pointercancel", onUp);
    };
  }, [say]);

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("[data-nodrag]")) return; // let the flip button / links handle themselves
    const k = e.key;
    if (k === "ArrowLeft") impulse.current(-900, 0);
    else if (k === "ArrowRight") impulse.current(900, 0);
    else if (k === "ArrowDown") impulse.current(0, 1100);
    else if (k === "ArrowUp") impulse.current(0, -700);
    else if (k === "Enter" || k === " ") setFlipped((f) => !f);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={box} className="lanyard-box" data-lanyard>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path ref={strap} fill="none" stroke="#17130e" strokeWidth="18" strokeLinecap="round" />
        <path ref={strapDash} fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
      </svg>

      <div
        ref={card}
        className="lanyard-card"
        tabIndex={0}
        role="group"
        aria-label="Project pass. Drag to swing it. Arrow keys nudge it, Enter flips it."
        onKeyDown={onKey}
        data-cursor="DRAG"
      >
        <div className="lanyard-clip" aria-hidden />
        <div className={`lanyard-flip ${flipped ? "is-flipped" : ""}`}>
          <section className="pass pass-front" aria-hidden={flipped}>
            <header className="flex items-start justify-between text-[0.62rem] font-semibold tracking-[0.2em] uppercase">
              <span>Project Pass</span>
              <span className="opacity-60">No. 0026</span>
            </header>
            <p data-name lang="ar" dir="rtl" className="nastaliq select-none text-center">سلطان</p>
            <div>
              <p className="pass-name">SULTAN BAGUS PERMADI</p>
              <div className="perforation" aria-hidden />
              <div className="flex items-end justify-between gap-3">
                <ul className="pass-list">
                  <li>Arabic Scrabble</li>
                  <li>Lughoti Vokasi</li>
                </ul>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="qr" aria-hidden>{QR.map((on, i) => <i key={i} className={on ? "on" : ""} />)}</div>
                  <span lang="ar" dir="rtl" className="amiri text-[0.85rem] leading-none">{year}</span>
                </div>
              </div>
            </div>
            <button type="button" data-nodrag tabIndex={flipped ? -1 : 0} className="pass-btn" onClick={() => setFlipped(true)} aria-label="Flip the pass over">flip ↻</button>
          </section>

          <section className="pass pass-back" aria-hidden={!flipped}>
            <header className="text-[0.62rem] font-semibold tracking-[0.2em] uppercase opacity-70">Try these</header>
            <nav className="flex flex-col gap-3" aria-label="Jump to a project">
              <a data-nodrag tabIndex={flipped ? 0 : -1} href="#scrabble" className="back-link"><span>Arabic Scrabble</span><small>play ↓</small></a>
              <a data-nodrag tabIndex={flipped ? 0 : -1} href="#lughoti" className="back-link"><span>Lughoti Vokasi</span><small>explore ↓</small></a>
            </nav>
            <p lang="ar" dir="rtl" className="amiri text-center text-2xl opacity-80">العب واستكشف</p>
            <button type="button" data-nodrag tabIndex={flipped ? 0 : -1} className="pass-btn" onClick={() => setFlipped(false)} aria-label="Flip the pass back">↺ back</button>
          </section>
        </div>
      </div>

      <p role="status" aria-live="polite" className="lanyard-note">{note}</p>
    </div>
  );
}
