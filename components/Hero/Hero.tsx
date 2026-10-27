import { Lanyard } from "../Lanyard/Lanyard";
import { HeroDepth } from "./HeroDepth";

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <HeroDepth />
      <Lanyard />
      <div className="hero-copy">
        <p className="kicker">A little digital playground</p>
        <h1 id="hero-title" className="hero-title">Some Arabic<br />projects I made.</h1>
        <p className="hero-sub">Drag the card. Pull it. Let go. Then scroll and try stuff.</p>
      </div>
      <p className="hero-scroll" aria-hidden>scroll ↓</p>
    </section>
  );
}
