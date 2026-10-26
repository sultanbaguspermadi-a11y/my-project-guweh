const LINKS = [
  { href: "#scrabble", label: "Play" },
  { href: "#index", label: "Projects" },
  { href: "#end", label: "Info" },
];

export function Navigation() {
  return (
    <header className="nav">
      <a href="#top" className="nav-mark" data-cursor="TOP">Sultan’s Playground</a>
      <nav aria-label="Sections">
        <ul className="flex gap-5 sm:gap-8">
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href} className="nav-link">{l.label}</a></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
