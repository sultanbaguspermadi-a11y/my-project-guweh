"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { ScrabbleTile3D, setTileOpacity } from "./ScrabbleTile3D";
import { loadArabicFonts, makeGlyph, type Glyph } from "./glyphTexture";
import { TILE_VALUES } from "@/data/scrabbleDemo";
import { FOV, gpuPreference, guardContext, type Tier } from "./timeline";

// Letters of سلطان. x/y are fractions of the visible width/height at the tile's depth (centre = 0, y up).
// Placed to stay clear of the bottom-left copy and the lanyard; phones use three tiles in the free zones.
type Spot = [ch: string, x: number, y: number, z: number, size: number];
const WIDE: Spot[] = [["س", -0.4, 0.17, -5, 0.24], ["ل", -0.03, 0.27, -8, 0.2], ["ط", 0.15, 0.04, -7, 0.22], ["ا", 0.25, -0.34, -5, 0.18], ["ن", 0.42, -0.3, -8, 0.2]];
const NARROW: Spot[] = [["س", -0.3, 0.2, -5, 0.15], ["ط", -0.34, -0.08, -7, 0.13], ["ن", 0.34, -0.1, -6, 0.14]];
const CAM_Z = 6, TAN = Math.tan((FOV * Math.PI) / 360);

function Scene({ glyphs, spots, pointer, kick, drift }: { glyphs: Glyph[]; spots: Spot[]; pointer: { x: number; y: number }; kick: { current: number }; drift: number }) {
  const refs = useRef<(Group | null)[]>([]);
  const { size } = useThree();
  const aspect = size.width / size.height;
  const placed = useMemo(() => spots.map(([, fx, fy, z, fs]) => {
    const h = 2 * (CAM_Z - z) * TAN; // visible height at this depth
    return { x: fx * h * aspect, y: fy * h, z, s: fs * h };
  }), [spots, aspect]);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime, k = kick.current;
    kick.current *= 0.94; // easter egg: a short spin that decays on its own
    camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.05;
    camera.position.y += (pointer.y * 0.22 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, -4);
    refs.current.forEach((g, i) => {
      const s = placed[i];
      if (!g || !s) return;
      g.position.set(s.x, s.y + Math.sin(t * 0.25 + i) * 0.1 * drift, s.z + k * 2.5);
      g.rotation.set(Math.sin(t * 0.12 + i) * 0.22 * drift - 0.1, Math.sin(t * 0.15 + i * 2) * 0.35 * drift + 0.2 * (i % 2 ? -1 : 1) + k * 3, Math.sin(t * 0.1 + i) * 0.12 * drift + k * 0.6);
      g.scale.setScalar(s.s);
      setTileOpacity(g, 1);
    });
  });
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[-3, 4, 5]} intensity={2.6} />
      <directionalLight position={[4, -2, 3]} intensity={0.6} />
      {glyphs.map((g, i) => <ScrabbleTile3D key={i} glyph={g} body="#dccb92" ref={(el) => { refs.current[i] = el; }} />)}
    </>
  );
}

export default function HeroDepth3D({ tier, onFail }: { tier: Tier; onFail: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [made, setMade] = useState<{ spots: Spot[]; list: Glyph[] } | null>(null);
  const [visible, setVisible] = useState(true);
  const pointer = useRef({ x: 0, y: 0 });
  const kick = useRef(0);

  useEffect(() => {
    let dead = false;
    let list: Glyph[] = [];
    loadArabicFonts().then(() => {
      if (dead) return;
      // Pick the composition from the hero's real shape, not only the device tier.
      const r = wrap.current?.getBoundingClientRect();
      const spots = tier === "mobile" || (r && r.width / r.height < 0.8) ? NARROW : WIDE;
      list = spots.map(([ch]) => makeGlyph(ch, { color: "#14532d", size: 150, weight: 700, square: true, value: TILE_VALUES[ch] }));
      setMade({ spots, list });
    });
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // desktop mouse only
      pointer.current.x = (e.clientX / innerWidth - 0.5) * 2;
      pointer.current.y = -(e.clientY / innerHeight - 0.5) * 2;
    };
    const egg = () => { kick.current = 1; };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("playground:egg", egg);
    return () => {
      dead = true; io.disconnect();
      removeEventListener("pointermove", move); removeEventListener("playground:egg", egg);
      list.forEach((g) => g.texture.dispose());
    };
  }, [tier]);

  return (
    <div ref={wrap} className="hero-gl" aria-hidden>
      {made && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={tier === "mobile" ? [1, 1] : [1, 1.75]}
          gl={{ alpha: true, antialias: tier !== "mobile", powerPreference: gpuPreference(tier) }}
          camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 40 }}
          onCreated={({ gl, invalidate }) => guardContext(gl.domElement, onFail, invalidate)}
        >
          <Scene glyphs={made.list} spots={made.spots} pointer={pointer.current} kick={kick} drift={tier === "mobile" ? 0.5 : 1} />
        </Canvas>
      )}
    </div>
  );
}
