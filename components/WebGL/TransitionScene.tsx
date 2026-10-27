"use client";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { ScrabbleTile3D, setTileOpacity } from "./ScrabbleTile3D";
import { GlyphField, type FieldWord } from "./GlyphField";
import type { Glyph } from "./glyphTexture";
import { camZ, clamp01, lerp, nearFade, ss } from "./timeline";

// Where each tile ends up after the break: x/y are fractions of half the visible width/height (so any aspect works),
// z is depth toward the camera. Index 0 is ل, the rightmost tile of لغتي.
const TARGET: [number, number, number][] = [[-0.62, 0.5, 1.4], [0.55, -0.5, 1.9], [-0.3, -0.58, 0.5], [0.72, 0.48, -0.6]];
const SPIN: [number, number, number][] = [[0.5, 0.9, 0.3], [-0.4, -0.8, -0.5], [0.3, -0.6, 0.6], [-0.5, 0.7, -0.3]];

export function TransitionScene({ tiles, words, progress, depth }: { tiles: Glyph[]; words: FieldWord[]; progress: { current: number }; depth: number }) {
  const refs = useRef<(Group | null)[]>([]);
  const { viewport } = useThree();
  const fit = Math.min(1.25, Math.max(0.42, viewport.width / 5.4)); // keeps the four-tile row inside narrow screens
  const vw = viewport.width / 2, vh = viewport.height / 2;

  useFrame(({ camera }) => {
    const p = progress.current;
    const p1 = ss(0, 0.3, p), p2 = ss(0.25, 0.65, p), p3 = ss(0.6, 1, p);
    const cz = camZ(p);
    camera.position.set(Math.sin(p * Math.PI) * vw * 0.1, 0, cz);
    camera.rotation.set(0, -camera.position.x * 0.03, 0);
    tiles.forEach((_, i) => {
      const g = refs.current[i];
      if (!g) return;
      const sgn = i % 2 ? -1 : 1;
      const bx = (1.5 - i) * 1.3 * fit;
      const t = TARGET[i], r = SPIN[i];
      // phase 1 lifts off the page, phase 2 breaks into space, phase 3 fades and swells toward the lens
      g.position.set(lerp(bx, t[0] * vw, p2), lerp(0, t[1] * vh, p2), p1 * 0.8 + p2 * t[2]);
      g.rotation.set(p1 * 0.1 * sgn + p2 * r[0], p1 * 0.16 * sgn + p2 * r[1], p1 * 0.05 + p2 * r[2]);
      g.scale.setScalar(fit * (1 + p3 * 0.45));
      const o = (1 - 0.45 * ss(0.5, 0.75, p)) * (1 - ss(0.8, 0.95, p)) * nearFade(cz - g.position.z);
      setTileOpacity(g, clamp01(o));
    });
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 6]} intensity={2.4} />
      <directionalLight position={[-4, -2, 3]} intensity={0.5} />
      {tiles.map((g, i) => (
        <ScrabbleTile3D key={i} glyph={g} ref={(el) => { refs.current[i] = el; }} />
      ))}
      <GlyphField words={words} progress={progress} depth={depth} />
    </>
  );
}
