// All visual state is a pure function of scroll progress p (0-1), so scrubbing back and forth is deterministic.
export type Tier = "desktop" | "tablet" | "mobile";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Camera dives forward through the glyph field during the second half. */
export const camZ = (p: number) => 8 - 10 * ss(0.3, 1, p);
/** Objects very close to the lens fade out so nothing slaps the camera. */
export const nearFade = (dist: number) => clamp01((dist - 0.9) / 2.4);

export const TIERS: Record<Tier, { glyphs: number; dpr: [number, number] }> = {
  desktop: { glyphs: 16, dpr: [1, 1.5] },
  tablet: { glyphs: 11, dpr: [1, 1.5] },
  mobile: { glyphs: 7, dpr: [1, 1.25] },
};

export const getTier = (): Tier => (innerWidth < 640 ? "mobile" : innerWidth < 1100 ? "tablet" : "desktop");

export function canWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext(); // release the probe context immediately
    return !!gl;
  } catch {
    return false;
  }
}
