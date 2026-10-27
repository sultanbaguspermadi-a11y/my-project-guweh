import { CanvasTexture, SRGBColorSpace } from "three";

export interface Glyph { texture: CanvasTexture; aspect: number }

let fonts: Promise<unknown> | null = null;
/** Arabic is shaped by the browser's own text engine (canvas 2D), so joining and harakat stay correct. */
export const loadArabicFonts = () =>
  (fonts ??= Promise.all([
    document.fonts.load("400 120px Amiri", "لغتيسطانصحاسوب"),
    document.fonts.load("700 120px Amiri", "لغتيسطان"),
    document.fonts.load('800 40px "Bricolage Grotesque Variable"', "0123456789"),
  ]).catch(() => undefined));

interface Opts { color: string; size: number; weight?: number; square?: boolean; value?: number; pad?: number }

export function makeGlyph(text: string, o: Opts): Glyph {
  const font = `${o.weight ?? 400} ${o.size}px Amiri, "Noto Naskh Arabic", serif`;
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = font;
  const w = o.square ? o.size * 1.6 : Math.ceil(probe.measureText(text).width + (o.pad ?? o.size * 0.5));
  const h = o.square ? w : Math.ceil(o.size * 2);
  const c = document.createElement("canvas");
  c.width = Math.min(1024, w); c.height = h;
  const k = c.width / w; // keep very long words inside the max texture width
  const ctx = c.getContext("2d")!;
  ctx.scale(k, k);
  ctx.font = font; ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = o.color;
  ctx.fillText(text, w / 2, h * 0.52);
  if (o.value !== undefined) {
    ctx.font = '800 38px "Bricolage Grotesque Variable", system-ui, sans-serif';
    ctx.direction = "ltr"; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";
    ctx.fillText(String(o.value), w - 22, h - 20);
  }
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, aspect: c.width / c.height };
}
