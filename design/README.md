# Design sources

Sources and scripts for the project page artwork in `public/`. Each script writes its files straight into `public/`, and running it again reproduces the committed files exactly, so `git status` stays clean unless a source changed.

| Output                                              | Script               | Sources                                                         |
| --------------------------------------------------- | -------------------- | --------------------------------------------------------------- |
| `public/banners/kami.webp`                          | `kami/make-kami.mjs` | `kami/mascot-mug.png`, `fonts/OpenSans.ttf`                     |
| `public/banners/haru.webp`, `public/icons/haru.svg` | `haru/make-haru.mjs` | the Haru repository's pixel art code, `fonts/PixelifySans.ttf`  |
| `public/banners/yoko.webp`                          | `yoko/make-yoko.mjs` | `yoko/mascot.svg`, `fonts/Quicksand.ttf`                        |
| `public/banners/gaku.webp`, `public/icons/gaku.svg` | `gaku/make-gaku.mjs` | the Gaku repository's prototype code, `fonts/JetBrainsMono.ttf` |

The other images in `public/` are used as they are: `icons/kami.png` and `icons/yoko.svg` are the projects' mascots (see [Third-party elements](#third-party-elements)), and the other page banners and icons in `public/` were never part of the Canva design, so they are kept as they are.

## Generate

The scripts are a separate package, so the site doesn't install their dependency. Node version: see `.nvmrc`.

```sh
cd design
npm install
npm run kami
HARU_REPO=/path/to/haru npm run haru   # a local clone of github.com/lauvivans/haru
npm run yoko
GAKU_REPO=/path/to/gaku npm run gaku   # a local clone of github.com/lauvivans/gaku
```

`sharp` is pinned to an exact version: a new version can render text or encode WebP slightly differently, so after upgrading it, run every script and check the previews before committing the new files in `public/`.

Each run also saves previews in `design/out/` (ignored by Git): what the banner slot shows on a wide screen (`*-desktop.png`) and on a phone (`*-phone.png`). Check them before committing a new banner.

## Sizes

- **Banner:** 2000×635 WebP. The page shows it in a 210px-tall, full-width slot with `object-fit: cover`.
  - On a wide screen only the middle band shows: about y 215 to 420 of the image.
  - On a phone the full height shows and the sides are cut: about x 434 to 1566 at 375px.
  - The page icon covers the bottom left, so content starts right of about x 600.
  - Keep the title, text and characters inside that band. The rest is background.
- **Icon:** square. The page title shows it up to `5.8rem` wide, in a `max-content` box, so an SVG icon needs `width` and `height` on its root element. With only a `viewBox` it ends up 0px wide.
- Browsers cache banners for up to 4 hours (`max-age=14400`), so a new banner may need a hard refresh.

## Kami

- Background `#E9E2D9`.
- Title "KAMI", Open Sans SemiBold (600), black. Tagline "Your notion-based portfolio builder", Open Sans Regular.
- `kami/mascot-mug.png` is the mascot hugging the mug, cut from the first banner. The script fades out the legs, which ran off that banner's bottom edge, and hides a letter of its old text next to the handle.

## Haru

- Drawn by the game's own code: `src/pixel/*.ts` from the Haru repository runs in Node with a fake canvas (`haru/pixel-env.mjs`). The colors are the day palette from its `src/styles/tokens.css`, so the art always matches the game.
- The script runs whatever code is in `HARU_REPO`, so point it only at a clone of the official repository that you trust, as you would before running `npm run dev` there.
- The world is drawn at 5× (400×127 art pixels), with the camera at village x 1450. `npm run haru -- <x>` (or a scene name: `castle`, `tavern`, `market`, `square`) tries another spot.
- The three looks stand on the ground: the knight idle, the villager cheering, the wizard winning.
- Title "Haru" and "Save Haru from the gallows" (the game's landing copy) in Pixelify Sans, white with a dark outline and drop shadow, like the game's titles. Outline color: `--px-outline`.
- Lossless WebP, so the pixel edges stay exact.
- Icon: the villager Haru, idle, as an SVG of its pixels with `shape-rendering="crispEdges"`.

## Yoko

- After the hero of Yoko's landing page: the mascot tilted -8°, "Yoko!" and the headline "Your days, in one place." with "in one place." on the blue highlight.
- Yoko's light theme tokens: background `--bg-surface` `#e4e6e7`, text `--text-color-default` `#262626`, highlight `--blue` `#b5e0ff`. Quicksand Bold.
- `yoko/mascot.svg` is a copy of `client/public/mascot.svg` from the Yoko repository.

## Gaku

- Drawn by the prototype's own code in the Gaku repository (`docs/prototypes/platform`): `src/mascot.ts` gives the SVG of the character and her ghost, and the script redraws the inked shapes with rough.js using the seeds and options of `src/sketch.ts`, so the line matches the prototype. The styles come from `mascot.css` and the light theme of `tokens.css`, and the "ink" and "sketch" filters are copied from `sketch.ts`.
- As with Haru, the script runs the code in `GAKU_REPO`, so point it only at a clone you trust.
- Default mode: responsible, with the sky ghost. `npm run gaku -- <mode>` draws another one (`tired`, `anxious`, `procrastinating`, `proud`, `focused`, `chaotic`).
- Background `--paper` with the page's dot grid. Title "Gaku" and "A personal study platform" (from the repository's README) in JetBrains Mono, the app's font.
- Icon: the character without the dotted frame, which follows the page theme in the app.

## Third-party elements

| Element                                   | Used in                                                      | Origin                                                                                                     | License                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Open Sans                                 | Kami banner                                                  | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/opensans)                                     | SIL Open Font License 1.1, `fonts/OFL-opensans.txt`                                            |
| Pixelify Sans                             | Haru banner                                                  | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/pixelifysans)                                 | SIL Open Font License 1.1, `fonts/OFL-pixelifysans.txt`                                        |
| Quicksand                                 | Yoko banner                                                  | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/quicksand)                                    | SIL Open Font License 1.1, `fonts/OFL-quicksand.txt`                                           |
| Mascot hugging the mug, mascot with bread | Kami banner (`kami/mascot-mug.png`), `public/icons/kami.png` | Stickers by Paula Lee, coffee shop pack on [Flaticon](https://www.flaticon.com/free-sticker/drink_7465398) | Flaticon license; credited on the Kami page through the banner and icon `author`/`link` fields |
| Octopus mascot                            | Yoko banner (`yoko/mascot.svg`), `public/icons/yoko.svg`     | [Noto Emoji](https://github.com/googlefonts/noto-emoji) by Google, as modified for Yoko                    | Apache License 2.0                                                                             |
| Haru sprites and world                    | Haru banner and icon                                         | Drawn in code in the Haru repository                                                                       | MIT (Haru repository)                                                                          |
| JetBrains Mono                            | Gaku banner                                                  | [Google Fonts](https://github.com/google/fonts/tree/main/ofl/jetbrainsmono)                                | SIL Open Font License 1.1, `fonts/OFL-jetbrainsmono.txt`                                       |
| Gaku character and ghosts                 | Gaku banner and icon                                         | Drawn in code in the Gaku repository                                                                       | Same author as this site; the Gaku repository has no license file yet                          |
| rough.js                                  | Gaku banner and icon (`roughjs` package)                     | [rough-stuff/rough](https://github.com/rough-stuff/rough)                                                  | MIT                                                                                            |
