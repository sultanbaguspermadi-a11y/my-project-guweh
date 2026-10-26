"use client";

import { useState } from "react";
import { PROJECTS } from "@/data/projects";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(location.href.split("#")[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", location.href.split("#")[0]);
    }
  };
  return (
    <footer id="end" className="end">
      <h2 className="end-h">That’s it.</h2>
      <p className="end-p">You can keep playing, or open the full projects.</p>
      <div className="flex flex-wrap gap-3">
        {PROJECTS.map((p) => (
          <a key={p.slug} className="btn btn-solid-light" href={p.url} target="_blank" rel="noopener noreferrer" data-cursor="OPEN">{p.cta} ↗</a>
        ))}
        <button type="button" className="btn btn-line-light" onClick={copy} aria-live="polite">{copied ? "Copied ✓" : "Copy link"}</button>
      </div>
      <p className="end-small">Made for fun. Built around Arabic. · Sultan Bagus Permadi · 2026</p>
    </footer>
  );
}
