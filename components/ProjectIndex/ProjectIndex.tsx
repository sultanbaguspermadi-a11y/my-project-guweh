import { PROJECTS } from "@/data/projects";

export function ProjectIndex() {
  return (
    <section id="index" className="index" aria-labelledby="index-h">
      <h2 id="index-h" className="kicker">Projects</h2>
      <ol className="index-list">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="index-row" data-cursor="OPEN">
              <span className="index-n">{p.n}</span>
              <span className="index-name">{p.name}</span>
              <span className="index-kind">{p.kind}</span>
              <span lang="ar" dir="rtl" className="index-ar">{p.ar}</span>
              <span className="index-arrow" aria-hidden>↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
