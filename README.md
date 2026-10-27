# Sultan's Project Playground

Next.js 15 · TypeScript · Tailwind 4 · Motion. three + @react-three/fiber (+ drei's RoundedBox) power two optional WebGL layers. The lanyard is still plain DOM.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Where things live
| Path | What |
|---|---|
| `components/Lanyard/` | 2D rope + spring physics, anchored top-right (`A.x` in `measure()`), pointer-driven, sleeps at rest. Arrow keys nudge, Enter flips. |
| `components/Transition/TileTransition.tsx` | Sticky 170vh stage; scroll progress 0-1 drives everything. Falls back to the plain tile row. |
| `components/WebGL/` | `timeline.ts` (phase math), `TransitionScene`, `ScrabbleTile3D`, `GlyphField`, `HeroDepth3D`. Arabic is drawn with canvas 2D so the browser shapes it. |
| `components/ArabicScrabbleMiniGame/` | Drag or tap tiles into the word row. Tile values are the real ones from the game's `modes.js`. |
| `components/LughotiExplorer/` | Searches the real `public/words.json` (copied from the Lughoti repo), loaded lazily. |
| `data/projects.ts` | Names, links, index rows. Add a project here and the index and closing links follow. |
| `data/scrabbleDemo.ts` | Mini-game rounds (`ROUNDS`), tile values, 5×5 board. |

## Before you share it
- Set `NEXT_PUBLIC_SITE_URL` (or deploy on Vercel) so Open Graph URLs resolve.
- The OG image (`app/opengraph-image.tsx`) is Latin-only on purpose. Drop a designed `opengraph-image.png` in `app/` to replace it.
- No screenshots were supplied, and both live apps block framing, so the showcases use real data (tile bag, vocabulary) instead of fake UI. Put real screenshots in `public/shots/` and add them to `ProjectShowcase.tsx`.
- Words in `public/words.json` must stay in the same format as the Lughoti repo (`[arab, latin, arti, kategori, contoh_arab, contoh_indonesia]`).

## Audit notes (round 3)
- `components/OpeningCover/`: DOM + Motion only. Enter by click, Enter/Space/↓, wheel or swipe. Skipped for `#hash` links and after the first visit in a session (script in `layout.tsx` sets `data-cover="skip"`).
- `components/WebGL/timeline.ts`: WebGL is probed once per page (`canWebGL`), tiers use width + pointer + device hints, GPU preference per tier, context loss waits 2.5 s for a restore before falling back. Failures log `[webgl]` to the console.
- Lanyard anchor is computed in `measure()` per width band: desktop top-right, tablet inward, phones at 62% of the hero width.
- Test harness used for QA lives outside the repo (puppeteer-core + @sparticuz/chromium, SwiftShader WebGL).
