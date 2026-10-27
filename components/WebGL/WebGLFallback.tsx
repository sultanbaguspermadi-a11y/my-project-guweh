"use client";
import { Component, type ReactNode } from "react";
import { warnGL } from "./timeline";

/** If anything in the WebGL tree throws, say so in the console, then render nothing so the DOM fallback stays. */
export class WebGLBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { warnGL("scene crashed", e); this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
