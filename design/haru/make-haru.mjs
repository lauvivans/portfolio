// Haru banner and icon, drawn by the game's own pixel art code (see pixel-env.mjs).
// Optional argument: the camera's village x (default 1450) or a scene name (castle, tavern, market, square).
import { writeFileSync } from "node:fs";
import { sharp, fonts, publicDir, outDir, preview, trimmed } from "../lib.mjs";
import { fakeCanvas, pixel, tokens } from "./pixel-env.mjs";

const font = `${fonts}/PixelifySans.ttf`;
const camera = process.argv[2] ?? "1450";
const scene = camera in pixel.world.SCENES ? camera : "custom";
if (scene === "custom") pixel.world.SCENES.custom = Number(camera);

// Art pixels: 400x127 at 5x is the 2000x635 banner.
const SCALE = 5;
const AW = 400;
const AH = 127;
// The world puts the ground 20 art px above its bottom: G = 80, so y 400 on the banner,
// the bottom of the band the 210px slot shows on wide screens.
const WORLD_H = 100;
const G = WORLD_H - 20;

// mountWorld sizes itself from the window: 800x200 gives scale 2, so a 400x100 world.
globalThis.innerWidth = 800;
globalThis.innerHeight = 200;
const world = fakeCanvas(AW, AH);
pixel.world.mountWorld(world.canvas).update({ scene });
globalThis.__tick();

// The world paints only 20 art px of ground; continue its cobbles to the bottom of the banner.
const pen = pixel.core.pen(world.ctx);
pen(0, WORLD_H, AW, AH - WORLD_H, "ground");
const shift = Math.round(pixel.world.SCENES[scene]) % 6;
for (let y = G + 3, row = 0; y < AH; y += 4, row++)
  if (y >= WORLD_H - 1)
    for (let x = -shift - 6 + (row % 2) * 3; x < AW; x += 6)
      pen(x, y, 4, 2, "cobble");

// The three looks on the ground: the knight idle, the villager cheering, the wizard winning.
const GROUP_X = 124;
[
  ["knight", "idle"],
  ["villager", "hit"],
  ["wizard", "win"],
].forEach(([look, mood], i) => {
  const s = pixel.haru.newState(mood);
  s.look = look;
  s.seed = 1; // eyes open
  pixel.haru.drawHaru(pen, GROUP_X + i * 24, G - 21, s, 0);
});

const base = await sharp(Buffer.from(world.buf), {
  raw: { width: AW, height: AH, channels: 4 },
})
  .resize(AW * SCALE, AH * SCALE, { kernel: "nearest" })
  .png()
  .toBuffer();

// Text like the game's titles: white, a dark pixel outline all around and a drop shadow.
async function pixelText(text, weight, heightPx, outline, drop) {
  const render = async (color) => {
    const markup = `<span weight="${weight}" foreground="${color}">${text}</span>`;
    const big = await sharp({
      text: {
        text: markup,
        font: "Pixelify Sans",
        fontfile: font,
        width: 4000,
        height: 600,
        rgba: true,
      },
    })
      .png()
      .toBuffer();
    const t = await trimmed(big);
    const wpx = Math.round((t.info.width * heightPx) / t.info.height);
    return {
      buf: await sharp(t.data).resize(wpx, heightPx).png().toBuffer(),
      wpx,
    };
  };
  const { buf: white, wpx } = await render("#ffffff");
  const { buf: dark } = await render(tokens["--px-outline"]);
  const pad = outline + drop;
  const offsets = [];
  for (const dx of [-outline, 0, outline])
    for (const dy of [-outline, 0, outline])
      if (dx || dy) offsets.push([dx, dy]);
  offsets.push([drop, drop]);
  const buf = await sharp({
    create: {
      width: wpx + pad * 2,
      height: heightPx + pad * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      ...offsets.map(([dx, dy]) => ({
        input: dark,
        left: pad + dx,
        top: pad + dy,
      })),
      { input: white, left: pad, top: pad },
    ])
    .png()
    .toBuffer();
  return { buf, pad };
}

const title = await pixelText("Haru", 700, 96, 5, 10);
const tag = await pixelText("Save Haru from the gallows", 500, 30, 3, 5);
const textX = (GROUP_X + 3 * 24 + 10) * SCALE;
const titleTop = 226;
const banner = `${publicDir}/banners/haru.webp`;
await sharp(base)
  .composite([
    { input: title.buf, left: textX - title.pad, top: titleTop - title.pad },
    {
      input: tag.buf,
      left: textX - tag.pad,
      top: titleTop + 96 + 26 - tag.pad,
    },
  ])
  .webp({ lossless: true, effort: 6 }) // lossless keeps the pixel edges exact
  .toFile(banner);
await preview(banner, "haru");

// Icon: the villager Haru, idle, as an SVG of its pixels (one rect per run of a color in a row).
const icon = fakeCanvas(18, 26);
const s = pixel.haru.newState("idle");
s.look = "villager";
s.seed = 1;
pixel.haru.drawHaru(pixel.core.pen(icon.ctx), 1, 1, s, 0);
const color = (k) =>
  "#" +
  [0, 1, 2].map((i) => icon.buf[k + i].toString(16).padStart(2, "0")).join("");
const rects = [];
for (let y = 0; y < icon.height; y++) {
  for (let x = 0; x < icon.width;) {
    const k = (y * icon.width + x) * 4;
    if (!icon.buf[k + 3]) {
      x++;
      continue;
    }
    let x2 = x + 1;
    while (x2 < icon.width) {
      const k2 = (y * icon.width + x2) * 4;
      if (!icon.buf[k2 + 3] || color(k2) !== color(k)) break;
      x2++;
    }
    rects.push(
      `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${color(k)}"/>`,
    );
    x = x2;
  }
}
// Square viewBox centered on the 18x26 sprite. width/height matter: the page title wraps the icon
// in a max-content box, and an SVG with only a viewBox ends up 0px wide there.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="-4 0 26 26" shape-rendering="crispEdges">${rects.join("")}</svg>\n`;
writeFileSync(`${publicDir}/icons/haru.svg`, svg);
await sharp(Buffer.from(svg)).png().toFile(`${outDir}/haru-icon.png`);
console.log(`haru: ${banner}, ${publicDir}/icons/haru.svg`);
