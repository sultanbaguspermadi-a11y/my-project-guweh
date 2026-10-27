"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { ScrabbleTile3D, setTileOpacity } from "./ScrabbleTile3D";
import { loadArabicFonts, makeGlyph, type Glyph } from "./glyphTexture";
import { TILE_VALUES } from "@/data/scrabbleDemo";

// س ل ط ا ن (from سلطان), placed as fractions of the visible width/height at their depth.
// Chosen to stay clear of the bottom-left copy and the top-right lanyard.
const SPOTS: [string, number, number, number][] = [["س", -0.36, 0.3, -6], ["ل", -0.12, 0.38, -9], ["ط", 0.06, 0.1, -8], ["ا", 0.14, -0.3, -6], ["ن", 0.4, -0.2, -9]];
const CAM_Z = 6;

function Scene({ glyphs, pointer, kick }: { glyphs: Glyph[]; pointer: { x: number; y: number }; kick: { current: number } }) {
  const refs = useRef<(Group | null)[]>([]);
  const { size } = useThree();
  const aspect = size.width / size.height;
  const spots = useMemo(() => SPOTS.map(([, fx, fy, z]) => {
    const h = 2 * (CAM_Z - z) * Math.tan((38 * Math.PI) / 360);
    return { x: fx * h * aspect, y: fy * h, z, s: 0.9 + (-z - 6) * 0.1 };
  }), [aspect]);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime, k = kick.current;
    kick.current *= 0.94; // easter egg: a short spin that decays on its own
    camera.position.x += (pointer.x * 0.15 - camera.position.x) * 0.05;
    camera.position.y += (pointer.y * 0.1 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    refs.current.forEach((g, i) => {
      if (!g) return;
      const s = spots[i];
      g.position.set(s.x, s.y + Math.sin(t * 0.25 + i) * 0.08, s.z + k * 2.5);
      g.rotation.set(Math.sin(t * 0.12 + i) * 0.18, Math.sin(t * 0.15 + i * 2) * 0.3 + k * 3, Math.sin(t * 0.1 + i) * 0.1 + k * 0.6);
      g.scale.setScalar(s.s * 1.6);
      setTileOpacity(g, 0.55);
    });
  });
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 3, 5]} intensity={1.8} />
      {glyphs.map((g, i) => <ScrabbleTile3D key={i} glyph={g} body="#d8c78e" ref={(el) => { refs.current[i] = el; }} />)}
    </>
  );
}

export default function HeroDepth3D({ onFail }: { onFail: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [glyphs, setGlyphs] = useState<Glyph[] | null>(null);
  const [visible, setVisible] = useState(true);
  const pointer = useRef({ x: 0, y: 0 });
  const kick = useRef(0);

  useEffect(() => {
    let dead = false;
    let made: Glyph[] = [];
    loadArabicFonts().then(() => {
      if (dead) return;
      made = SPOTS.map(([ch]) => makeGlyph(ch, { color: "#14532d", size: 150, weight: 700, square: true, value: TILE_VALUES[ch] }));
      setGlyphs(made);
    });
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    // desktop mouse only: a few pixels of camera drift
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.x = (e.clientX / innerWidth - 0.5) * 2;
      pointer.current.y = -(e.clientY / innerHeight - 0.5) * 2;
    };
    const egg = () => { kick.current = 1; };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("playground:egg", egg);
    return () => {
      dead = true; io.disconnect();
      removeEventListener("pointermove", move); removeEventListener("playground:egg", egg);
      made.forEach((g) => g.texture.dispose());
    };
  }, []);

  return (
    <div ref={wrap} className="hero-gl" aria-hidden>
      {glyphs && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          camera={{ fov: 38, position: [0, 0, CAM_Z], near: 0.1, far: 40 }}
          onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", onFail, { once: true })}
        >
          <Scene glyphs={glyphs} pointer={pointer.current} kick={kick} />
        </Canvas>
      )}
    </div>
  );
}
