"use client";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { SEEDS } from "@/data/seeds";
import { TILE_VALUES } from "@/data/scrabbleDemo";
import { TransitionScene } from "./TransitionScene";
import { loadArabicFonts, makeGlyph, type Glyph } from "./glyphTexture";
import { gpuPreference, guardContext, TIERS, type Tier } from "./timeline";
import type { FieldWord } from "./GlyphField";

const WORD = ["ل", "غ", "ت", "ي"];
// Interleave departments so the field mixes RPL, TBKR, Akuntansi, TSM and everyday words.
const VOCAB = [0, 1, 2, 3].flatMap((i) => (["RPL", "TBKR", "Akuntansi", "TSM", "Umum"] as const).map((d) => SEEDS[d][i].ar));

interface Props { progress: { current: number }; tier: Tier; onReady: (invalidate: () => void) => void; onFail: () => void }

export default function ProjectTransition3D({ progress, tier, onReady, onFail }: Props) {
  const [built, setBuilt] = useState<{ tiles: Glyph[]; words: FieldWord[] } | null>(null);

  useEffect(() => {
    let dead = false;
    let all: Glyph[] = [];
    loadArabicFonts().then(() => {
      if (dead) return;
      try {
        const tiles = WORD.map((ch) => makeGlyph(ch, { color: "#14532d", size: 150, weight: 700, square: true, value: TILE_VALUES[ch] }));
        const words = VOCAB.slice(0, TIERS[tier].glyphs).map((w, i) => ({ glyph: makeGlyph(w, { color: "#ffffff", size: 140 }), hf: 0.17 + (i % 3) * 0.06 }));
        all = [...tiles, ...words.map((w) => w.glyph)];
        setBuilt({ tiles, words });
      } catch { onFail(); }
    });
    return () => { dead = true; all.forEach((g) => g.texture.dispose()); };
  }, [tier, onFail]);

  if (!built) return null;
  return (
    <Canvas
      className="tt-canvas"
      aria-hidden
      frameloop="demand"
      dpr={TIERS[tier].dpr}
      gl={{ alpha: true, antialias: tier !== "mobile", powerPreference: gpuPreference(tier) }}
      camera={{ fov: 40, position: [0, 0, 8], near: 0.1, far: 40 }}
      onCreated={({ gl, invalidate }) => {
        guardContext(gl.domElement, onFail, invalidate);
        onReady(invalidate);
      }}
    >
      <TransitionScene tiles={built.tiles} words={built.words} progress={progress} depth={TIERS[tier].depth} />
    </Canvas>
  );
}
