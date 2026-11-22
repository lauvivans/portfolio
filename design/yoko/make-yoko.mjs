// Yoko banner after the landing hero: the mascot tilted -8deg, "Yoko!" and
// "Your days, in one place." with "in one place." on the blue highlight.
import { readFileSync } from "node:fs";
import { sharp, fonts, publicDir, W, H, preview, inkBox } from "../lib.mjs";

const out = `${publicDir}/banners/yoko.webp`;
const font = `${fonts}/Quicksand.ttf`;
// Yoko's light theme tokens: --bg-surface, --text-color-default, --blue, --text-color-on-color
const T = {
  surface: "#e4e6e7",
  text: "#262626",
  blue: "#b5e0ff",
  onColor: "#1a1a1a",
};

// Untrimmed, so pieces with the same size share a baseline; inkBox gives where the ink sits.
async function text(str, weight, size, color) {
  const markup = `<span weight="${weight}" foreground="${color}">${str}</span>`;
  const buf = await sharp({
    text: {
      text: markup,
      font: `Quicksand ${size}`,
      fontfile: font,
      dpi: 72,
      rgba: true,
    },
  })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  const box = await inkBox(buf);
  return {
    buf,
    h: meta.height,
    ink: { left: box.left, top: box.top, w: box.width, h: box.height },
  };
}

// mascot.svg is a copy of Yoko's client/public/mascot.svg.
const src = readFileSync(`${import.meta.dirname}/mascot.svg`, "utf8");
const inner = src.slice(
  src.indexOf(">", src.indexOf("<svg")) + 1,
  src.lastIndexOf("</svg>"),
);
const M = 210;
const mascotSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${M}" height="${M}" viewBox="0 0 128 128"><g transform="rotate(-8 64 64)">${inner}</g></svg>`;
const mascot = await sharp(Buffer.from(mascotSvg), { density: 300 })
  .resize(M, M)
  .png()
  .toBuffer();

const title = await text("Yoko!", 700, 120, T.text);
const lead = await text("Your days, ", 700, 46, T.text);
const hi = await text("in one place.", 700, 46, T.onColor);

// The landing's highlight has 8px side padding and a 5px radius at 40px text; scaled to 46px here.
const k = 46 / 40;
const padX = Math.round(8 * k);
const padY = Math.round(4 * k);
const chipW = hi.ink.w + padX * 2;
const chipH = lead.h + padY * 2;
const chip = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${chipW}" height="${chipH}"><rect width="${chipW}" height="${chipH}" rx="${Math.round(5 * k)}" fill="${T.blue}"/></svg>`,
);

// Mascot | title over tagline, centered a bit right of the middle (the page icon covers the bottom left).
const gap = 36;
const groupW = M + gap + Math.max(title.ink.w, lead.ink.w + 14 + chipW);
const left = Math.round(1040 - groupW / 2);
const textLeft = left + M + gap;
const titleTop = 232;
const leadTop = titleTop + title.ink.h + 30 - lead.ink.top;
const chipLeft = textLeft + lead.ink.w + 14;

await sharp({
  create: { width: W, height: H, channels: 3, background: T.surface },
})
  .composite([
    { input: mascot, left, top: Math.round(H / 2 - M / 2) - 4 },
    {
      input: title.buf,
      left: textLeft - title.ink.left,
      top: titleTop - title.ink.top,
    },
    { input: lead.buf, left: textLeft - lead.ink.left, top: leadTop },
    { input: chip, left: chipLeft, top: leadTop - padY },
    { input: hi.buf, left: chipLeft + padX - hi.ink.left, top: leadTop },
  ])
  .webp({ quality: 92 })
  .toFile(out);
await preview(out, "yoko");
console.log(`yoko: ${out}`);
