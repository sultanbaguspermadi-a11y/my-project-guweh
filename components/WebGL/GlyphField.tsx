"use client";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, type Group, type MeshBasicMaterial } from "three";
import type { Glyph } from "./glyphTexture";
import { camZ, FOV, nearFade, ss } from "./timeline";

export interface FieldWord { glyph: Glyph; hf: number } // hf: word height as a fraction of the visible height
const FAR = new Color("#8fd0f5"), NEAR = new Color("#0b6fa8"), tmp = new Color();
const TAN = Math.tan((FOV * Math.PI) / 360);
const frac = (x: number) => x - Math.floor(x);

/**
 * Real Lughoti vocabulary hanging in depth. Each word is framed for the size of the view it will have when the
 * camera is ~6.5 units away, so it fits any aspect ratio. R2 low-discrepancy points spread them evenly.
 */
export function GlyphField({ words, progress, depth }: { words: FieldWord[]; progress: { current: number }; depth: number }) {
  const group = useRef<Group>(null);
  const { size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const slots = useMemo(() => {
    const vh = 2 * 6.5 * TAN, vw = vh * aspect;
    return words.map((w, i) => {
      let h = w.hf * vh, wd = h * w.glyph.aspect;
      const maxW = vw * 0.8;
      if (wd > maxW) { h *= maxW / wd; wd = maxW; }
      const x = (frac(0.5 + i * 0.7548776662) * 2 - 1) * ((vw - wd) / 2) * 0.92;
      const y = (frac(0.5 + i * 0.569840291) * 2 - 1) * ((vh - h) / 2) * 0.8;
      return { x, y, z: -1.5 - (i / Math.max(1, words.length - 1)) * depth, h, w: wd };
    });
  }, [words, aspect, depth]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = progress.current, reveal = ss(0.35, 0.7, p), cz = camZ(p);
    tmp.copy(FAR).lerp(NEAR, ss(0.5, 1, p));
    g.children.forEach((m, i) => {
      const mat = (m as unknown as { material: MeshBasicMaterial }).material;
      mat.opacity = reveal * 0.92 * nearFade(cz - slots[i].z);
      mat.color.copy(tmp);
      m.visible = mat.opacity > 0.01;
    });
  });

  return (
    <group ref={group}>
      {words.map((w, i) => (
        <mesh key={i} position={[slots[i].x, slots[i].y, slots[i].z]} scale={[slots[i].w, slots[i].h, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={w.glyph.texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
