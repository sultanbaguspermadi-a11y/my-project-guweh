"use client";
import { forwardRef } from "react";
import { RoundedBox } from "@react-three/drei";
import type { Group, Material, Mesh } from "three";
import type { Glyph } from "./glyphTexture";

/** Matte, slightly bevelled tile. The glyph is a texture on the front face (shaped by the browser, not by three). */
export const ScrabbleTile3D = forwardRef<Group, { glyph: Glyph; body?: string }>(function ScrabbleTile3D({ glyph, body = "#eadfb8" }, ref) {
  return (
    <group ref={ref}>
      <RoundedBox args={[1, 1, 0.2]} radius={0.07} smoothness={3}>
        <meshStandardMaterial color={body} roughness={0.85} metalness={0} transparent />
      </RoundedBox>
      <mesh position={[0, 0, 0.102]}>
        <planeGeometry args={[0.94, 0.94]} />
        <meshBasicMaterial map={glyph.texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
});

export function setTileOpacity(g: Group, o: number) {
  g.visible = o > 0.01;
  g.traverse((c) => {
    const m = (c as Mesh).material as Material | undefined;
    if (m) m.opacity = o;
  });
}
