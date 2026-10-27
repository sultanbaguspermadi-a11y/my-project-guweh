import { Hero } from "@/components/Hero/Hero";
import { Navigation } from "@/components/Navigation/Navigation";
import { ArabicScrabbleMiniGame } from "@/components/ArabicScrabbleMiniGame/ArabicScrabbleMiniGame";
import { LughotiExplorer } from "@/components/LughotiExplorer/LughotiExplorer";
import { LughotiShowcase, ScrabbleShowcase, SectionTitle } from "@/components/ProjectShowcase/ProjectShowcase";
import { TileTransition } from "@/components/Transition/TileTransition";
import { ProjectIndex } from "@/components/ProjectIndex/ProjectIndex";
import { Footer } from "@/components/Footer/Footer";
import { Cursor } from "@/components/ui/Cursor";
import { OpeningCover } from "@/components/OpeningCover/OpeningCover";
import { Reveal } from "@/components/ui/Reveal";
import { PROJECTS } from "@/data/projects";

export default function Page() {
  return (
    <>
      <OpeningCover />
      <Navigation />
      <Cursor />
      <main>
        <Hero />

        <section className="intro" aria-label="Intro">
          <p className="intro-p">
            <Reveal>Two things I built around Arabic.</Reveal>
            <Reveal delay={0.08}>A board game, and a dictionary.</Reveal>
            <Reveal delay={0.16}>Poke at both.</Reveal>
          </p>
        </section>

        <section id="scrabble" className="sec sec-s" aria-labelledby="s-h">
          <div className="sec-grid">
            <div id="s-h">
              <SectionTitle n={PROJECTS[0].n} name={PROJECTS[0].name} ar={PROJECTS[0].ar} arClass="amiri" />
              <p className="sec-lead">Try it. Drag the tiles.</p>
            </div>
            <ArabicScrabbleMiniGame />
          </div>
          <ScrabbleShowcase />
        </section>

        <TileTransition />

        <section id="lughoti" className="sec sec-l" aria-labelledby="l-h">
          <div id="l-h">
            <SectionTitle n={PROJECTS[1].n} name={PROJECTS[1].name} ar={PROJECTS[1].ar} arClass="nastaliq-lg" />
            <p className="sec-lead">Pick a department. Search a word.</p>
          </div>
          <LughotiExplorer />
          <LughotiShowcase />
        </section>

        <ProjectIndex />
      </main>
      <Footer />
    </>
  );
}
