// All visual state is a pure function of scroll progress p (0-1), so scrubbing back and forth is deterministic.
export type Tier = "desktop" | "tablet" | "mobile";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const FOV = 40;
/** Camera dives forward through the vocabulary field during the second half. */
export const camZ = (p: number) => 8 - 9 * ss(0.3, 1, p);
/** Things very close to the lens fade out so nothing slaps the camera. */
export const nearFade = (dist: number) => clamp01((dist - 0.9) / 2.4);

export const TIERS: Record<Tier, { glyphs: number; depth: number; dpr: [number, number] }> = {
  desktop: { glyphs: 18, depth: 10, dpr: [1, 1.75] },
  tablet: { glyphs: 12, depth: 8, dpr: [1, 1.5] },
  mobile: { glyphs: 8, depth: 6, dpr: [1, 1.25] },
};

export const isWeakDevice = () => {
  const n = navigator as Navigator & { deviceMemory?: number };
  return (n.deviceMemory !== undefined && n.deviceMemory <= 2) || (navigator.hardwareConcurrency || 4) <= 2;
};

/** Width plus a few cheap hints. No benchmarks. */
export function getTier(): Tier {
  const w = innerWidth, coarse = matchMedia("(pointer: coarse)").matches;
  if (w < 640 || (coarse && w < 900)) return "mobile";
  if (w < 1100 || isWeakDevice()) return "tablet";
  return "desktop";
}

/** Desktop lets the browser pick the fast GPU; phones stay conservative. */
export const gpuPreference = (t: Tier): WebGLPowerPreference =>
  t === "desktop" ? "high-performance" : t === "mobile" ? "low-power" : "default";

export const warnGL = (...a: unknown[]) => console.warn("[webgl]", ...a);

let cached: boolean | null = null;
/**
 * Probed once per page. Re-probing (e.g. on every resize event) leaks short-lived contexts, and browsers
 * answer that by killing the OLDEST context, which was the visible canvas.
 */
export function canWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    cached = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    if (!cached) warnGL("WebGL unavailable, using DOM fallback");
  } catch (e) {
    cached = false;
    warnGL("WebGL probe threw", e);
  }
  return cached;
}

/** A lost context is usually recoverable. Only give up if it has not come back after a moment. */
export function guardContext(canvas: HTMLCanvasElement, onFail: () => void, onRestore: () => void) {
  let t = 0;
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault(); // allows the browser to restore it
    warnGL("context lost, waiting for restore");
    t = window.setTimeout(onFail, 2500);
  });
  canvas.addEventListener("webglcontextrestored", () => { clearTimeout(t); warnGL("context restored"); onRestore(); });
}
