// Shared paths and the crop preview used by every banner script.
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

export const sharp = createRequire(import.meta.url)("sharp");

const root = import.meta.dirname;
export const fonts = `${root}/fonts`;
export const publicDir = `${root}/../public`;
export const outDir = `${root}/out`;
mkdirSync(outDir, { recursive: true });

// Banners are 2000x635 and the page shows them in a 210px-tall, full-width slot with object-fit: cover.
export const W = 2000;
export const H = 635;

// The box around the non-transparent pixels of an image. sharp's trim() changed how it treats
// transparent backgrounds between versions, so text is measured from the alpha channel instead.
export async function inkBox(png) {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width;
  let right = -1;
  let top = info.height;
  let bottom = -1;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3]) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

// The image cropped to its ink box.
export async function trimmed(png) {
  const box = await inkBox(png);
  return { data: await sharp(png).extract(box).png().toBuffer(), info: box };
}

// Saves what the slot shows on a wide screen (1855px: the middle band) and on a 375px phone (full height, sides cut).
export async function preview(file, name) {
  const desk = 1855;
  const deskH = Math.round((H * desk) / W);
  await sharp(file)
    .resize(desk, deskH)
    .extract({
      left: 0,
      top: Math.round((deskH - 210) / 2),
      width: desk,
      height: 210,
    })
    .png()
    .toFile(`${outDir}/${name}-desktop.png`);
  const phoneW = Math.round((W * 210) / H);
  await sharp(file)
    .resize(phoneW, 210)
    .extract({
      left: Math.round((phoneW - 375) / 2),
      top: 0,
      width: 375,
      height: 210,
    })
    .png()
    .toFile(`${outDir}/${name}-phone.png`);
}
