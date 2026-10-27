"use client";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, type Group, type MeshBasicMaterial } from "three";
import type { Glyph } from "./glyphTexture";
import { camZ, nearFade, ss } from "./timeline";

export interface FieldWord { glyph: Glyph; h: number }
const FAR = new Color("#8fd0f5"), NEAR = new Color("#0b6fa8"), tmp = new Color();

/** Real Lughoti vocabulary hanging in depth. Positions come from a fixed sequence, so it is the same on every visit. */
export function GlyphField({ words, progress, fit }: { words: FieldWord[]; progress: { current: number }; fit: number }) {
  const group = useRef<Group>(null);
  const { viewport } = useThree();
  const slots = useMemo(
    () =>
      words.map((w, i) => {
        const z = -1.2 - (i / words.length) * 10;
        const d = 8 - z; // distance from the start camera
        const u = (i * 0.618034) % 1, v = (i * 0.414214 + 0.27) % 1;
        return { z, x: (u - 0.5) * viewport.width * (d / 8) * 0.95, y: (v - 0.5) * viewport.height * (d / 8) * 0.9, s: w.h * fit };
      }),
    [words, viewport.width, viewport.height, fit],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = progress.current, reveal = ss(0.35, 0.7, p), cz = camZ(p);
    tmp.copy(FAR).lerp(NEAR, ss(0.5, 1, p));
    g.children.forEach((m, i) => {
      const mat = (m as unknown as { material: MeshBasicMaterial }).material;
      mat.opacity = reveal * 0.9 * nearFade(cz - slots[i].z);
      mat.color.copy(tmp);
      m.visible = mat.opacity > 0.01;
    });
  });

  return (
    <group ref={group}>
      {words.map((w, i) => (
        <mesh key={i} position={[slots[i].x, slots[i].y, slots[i].z]} scale={[slots[i].s * w.glyph.aspect, slots[i].s, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={w.glyph.texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
