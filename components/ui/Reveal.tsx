"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Mask reveal: content slides up from behind a clipped line. Reduced motion is handled by MotionConfig. */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "105%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.1, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}
