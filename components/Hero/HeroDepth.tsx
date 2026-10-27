"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { WebGLBoundary } from "../WebGL/WebGLFallback";
import { canWebGL, getTier, isWeakDevice, type Tier } from "../WebGL/timeline";

const HeroGL = dynamic(() => import("../WebGL/HeroDepth3D"), { ssr: false });

/**
 * Decorative depth behind the hero. The DOM paints first; the chunk loads straight after hydration (no timer).
 * Phones get a lighter 3-tile version unless the device looks weak or reduced motion is on.
 */
export function HeroDepth() {
  const [tier, setTier] = useState<Tier | null>(null);
  useEffect(() => {
    const t = getTier();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !canWebGL() || (t === "mobile" && isWeakDevice())) return;
    setTier(t);
  }, []);
  if (!tier) return null;
  return (
    <WebGLBoundary onError={() => setTier(null)}>
      <HeroGL tier={tier} onFail={() => setTier(null)} />
    </WebGLBoundary>
  );
}
