"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { WebGLBoundary } from "../WebGL/WebGLFallback";
import { canWebGL } from "../WebGL/timeline";

const HeroGL = dynamic(() => import("../WebGL/HeroDepth3D"), { ssr: false });

/** Optional depth behind the hero. Loads after the DOM is up; skipped on phones and with reduced motion. */
export function HeroDepth() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (innerWidth < 640 || matchMedia("(prefers-reduced-motion: reduce)").matches || !canWebGL()) return;
    const t = setTimeout(() => setOn(true), 800);
    return () => clearTimeout(t);
  }, []);
  return on ? <WebGLBoundary onError={() => setOn(false)}><HeroGL onFail={() => setOn(false)} /></WebGLBoundary> : null;
}
