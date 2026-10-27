"use client";
import { Component, type ReactNode } from "react";

/** If anything in the WebGL tree throws, report it and render nothing: the DOM tile row stays as the fallback. */
export class WebGLBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
