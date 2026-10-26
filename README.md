# Sultan's Project Playground

Next.js 15 · TypeScript · Tailwind 4 · Motion. No WebGL, no Three.js.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Where things live
| Path | What |
|---|---|
| `components/Lanyard/` | 2D rope + spring physics, pointer-driven, sleeps at rest. Arrow keys nudge, Enter flips. |
| `components/ArabicScrabbleMiniGame/` | Drag or tap tiles into the word row. Tile values are the real ones from the game's `modes.js`. |
| `components/LughotiExplorer/` | Searches the real `public/words.json` (copied from the Lughoti repo), loaded lazily. |
| `data/projects.ts` | Names, links, index rows. Add a project here and the index and closing links follow. |
| `data/scrabbleDemo.ts` | Mini-game rounds (`ROUNDS`), tile values, 5×5 board. |

## Before you share it
- Set `NEXT_PUBLIC_SITE_URL` (or deploy on Vercel) so Open Graph URLs resolve.
- The OG image (`app/opengraph-image.tsx`) is Latin-only on purpose. Drop a designed `opengraph-image.png` in `app/` to replace it.
- No screenshots were supplied, and both live apps block framing, so the showcases use real data (tile bag, vocabulary) instead of fake UI. Put real screenshots in `public/shots/` and add them to `ProjectShowcase.tsx`.
- Words in `public/words.json` must stay in the same format as the Lughoti repo (`[arab, latin, arti, kategori, contoh_arab, contoh_indonesia]`).
