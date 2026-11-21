// Kami banner: the mascot hugging the mug (Paula Lee's sticker), "KAMI" and the tagline.
import { sharp, fonts, publicDir, W, H, preview, trimmed } from "../lib.mjs";

const out = `${publicDir}/banners/kami.webp`;
const bg = { r: 233, g: 226, b: 217 };
const font = `${fonts}/OpenSans.ttf`;

// Renders big, trims to the glyph box, then scales down to the target height so edges stay sharp.
async function text(markup, boxH, targetH) {
  const big = await sharp({
    text: {
      text: markup,
      font: "Open Sans",
      fontfile: font,
      width: 4000,
      height: boxH,
      rgba: true,
    },
  })
    .png()
    .toBuffer();
  const { data, info } = await trimmed(big);
  const w = Math.round((info.width * targetH) / info.height);
  return {
    buf: await sharp(data).resize(w, targetH).png().toBuffer(),
    w,
    h: targetH,
  };
}

// mascot-mug.png is the mascot as cut from the first banner. The legs ran off its bottom edge,
// so they fade out here instead of ending in a hard cut.
const { data, info } = await sharp(`${import.meta.dirname}/mascot-mug.png`)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const fadeTop = 440;
const fadeX = 222; // the legs sit left of the mug, near the bottom
for (let y = fadeTop; y < info.height; y++) {
  const a = 1 - (y - fadeTop) / (info.height - fadeTop);
  for (let x = 0; x < fadeX; x++)
    data[(y * info.width + x) * 4 + 3] = Math.round(255 * a);
}
// A letter of the first banner's text sits right of the handle: hide it behind a feathered box so no seam shows.
const box = { x0: 700, x1: 738, y0: 360, y1: 394 };
const f = 5;
for (let y = box.y0 - f; y < box.y1 + f; y++)
  for (let x = box.x0 - f; x < Math.min(info.width, box.x1 + f); x++) {
    const d = Math.max(box.x0 - x, x - box.x1, box.y0 - y, y - box.y1, 0);
    const i = (y * info.width + x) * 4 + 3;
    data[i] = Math.round(data[i] * Math.min(1, d / f));
  }
const mascotH = 200;
const mascotW = Math.round((info.width * mascotH) / info.height);
const mascot = await sharp(data, { raw: info })
  .resize(mascotW, mascotH)
  .png()
  .toBuffer();

const title = await text(
  '<span weight="600" foreground="#000000">KAMI</span>',
  1200,
  92,
);
const tag = await text(
  '<span foreground="#000000">Your notion-based portfolio builder</span>',
  300,
  30,
);

// Mascot | title over tagline, centered a bit right of the middle (the page icon covers the bottom left).
const gap = 28;
const groupW = mascotW + gap + Math.max(title.w, tag.w);
const left = Math.round(1040 - groupW / 2);
const mascotTop = Math.round(H / 2 - mascotH / 2);
const textTop = Math.round(H / 2 - (title.h + 16 + tag.h) / 2) + 6;
const textLeft = left + mascotW + gap;

await sharp({ create: { width: W, height: H, channels: 3, background: bg } })
  .composite([
    { input: mascot, left, top: mascotTop },
    { input: title.buf, left: textLeft, top: textTop },
    { input: tag.buf, left: textLeft - 2, top: textTop + title.h + 16 },
  ])
  .webp({ quality: 90 })
  .toFile(out);
await preview(out, "kami");
console.log(`kami: ${out}`);
