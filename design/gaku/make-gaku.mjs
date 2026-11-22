// Gaku banner and icon, drawn by the mascot code of Gaku's platform prototype
// (docs/prototypes/platform in the Gaku repository, path in GAKU_REPO).
// Optional argument: the mode whose face she shows (default responsible).
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { sharp, fonts, publicDir, W, H, preview, inkBox } from "../lib.mjs";

const rough = createRequire(import.meta.url)("roughjs");

const GAKU = process.env.GAKU_REPO;
if (!GAKU)
  throw new Error("Set GAKU_REPO to a local clone of the Gaku repository");
const PROTO = `${GAKU}/docs/prototypes/platform`;

// mascot.ts is a browser script: it puts { MODES, girl, ghost } on window.
globalThis.window = globalThis;
await import(pathToFileURL(`${PROTO}/src/mascot.ts`).href);
const { MODES, girl, ghost } = globalThis.GakuMascot;
const mode = process.argv[2] ?? "responsible";
if (!(mode in MODES))
  throw new Error(`Unknown mode ${mode}: ${Object.keys(MODES).join(", ")}`);

// Light theme tokens from the prototype's tokens.css (the first value of each name is the light one).
const tokens = {};
for (const [, name, value] of readFileSync(
  `${PROTO}/tokens.css`,
  "utf8",
).matchAll(/(--[\w-]+):\s*([^;]+);/g))
  tokens[name] ??= value.trim();
const resolve = (css) => {
  for (let i = 0; i < 5; i++)
    css = css.replace(/var\((--[\w-]+)\)/g, (m, n) => tokens[n] ?? m);
  return css;
};
const T = {
  paper: tokens["--paper"],
  ink: tokens["--ink"],
  dot: tokens["--bg-dot"],
  grid: parseFloat(tokens["--dot-grid"]),
};

// mascot.css with its variables filled in: the SVG renderer has no CSS variables.
const style = `<style>${resolve(readFileSync(`${PROTO}/mascot.css`, "utf8"))}</style>`;

// The filters sketch.ts injects into the page: "ink-mascot" scratches the black lines, "sketch" wobbles the ghost.
const filters = `<defs>
  <filter id="ink-mascot" filterUnits="userSpaceOnUse" x="-10" y="-10" width="220" height="250">
    <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="1" seed="7" result="grain"/>
    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -9 0 0 0 6.8" result="mask"/>
    <feComposite in="SourceGraphic" in2="mask" operator="in" result="scratched"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="2" result="warp"/>
    <feDisplacementMap in="scratched" in2="warp" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="sketch">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/>
    <feDisplacementMap in="SourceGraphic" scale="2.6"/>
  </filter>
</defs>`;

// sketch.ts roughen() without a DOM: every [data-rough] shape becomes rough.js paths,
// with the same seeds (in document order) and options, so the ink line matches the prototype.
const gen = rough.generator();
function roughen(svg) {
  let i = 0;
  return svg.replace(
    /<(path|circle|ellipse)\s([^>]*\bdata-rough="[^"]*"[^>]*?)\/>/g,
    (_, tag, attrs) => {
      const a = Object.fromEntries(
        [...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v]),
      );
      const options = {
        seed: 100 + i++ * 31,
        roughness: Number(a["data-rough"]) || 1.2,
        bowing: 1.2,
        stroke: a["data-stroke"] ?? "#1f1d1b",
        strokeWidth: Number(a["data-width"] ?? 2.6),
        fill: a["data-fill"],
        fillStyle: "solid",
      };
      const shape =
        tag === "path"
          ? gen.path(a.d, options)
          : gen.ellipse(
              +a.cx,
              +a.cy,
              2 * +(a.rx ?? a.r),
              2 * +(a.ry ?? a.r),
              options,
            );
      const paths = gen
        .toPaths(shape)
        .map(
          (p) =>
            `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${p.fill ?? "none"}"/>`,
        )
        .join("");
      return `<g${a.class ? ` class="${a.class}"` : ""}>${paths}</g>`;
    },
  );
}

const inner = (svg) =>
  svg.slice(
    svg.indexOf(">", svg.indexOf("<svg")) + 1,
    svg.lastIndexOf("</svg>"),
  );
const figure = inner(roughen(girl(mode)));

// The ghost sits by her head as on the prototype's mascot stage: a 64px ghost at -42px, -6px of a 170px figure.
const k = 200 / 170;
const g = ghost(mode);
const ghostVB = g.match(/viewBox="([^"]+)"/)[1];
const ghostW = 64 * k;
const ghostSvg = `<g filter="url(#sketch)"><svg x="${-42 * k}" y="${-6 * k}" width="${ghostW}" height="${(ghostW * 82) / 78}" viewBox="${ghostVB}" overflow="visible">${resolve(inner(g))}</svg></g>`;

// Banner figure: girl, frame and ghost. Icon: the girl alone, without the frame, which follows the page theme.
const svgDoc = (viewBox, width, height, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" class="mascot">${style}${filters}${body}</svg>`;

const ICON = 200;
const icon = svgDoc(
  "4 44 192 194",
  ICON,
  ICON,
  figure.replace(/<circle[^>]*class="m-frame"\/>/, ""),
);
writeFileSync(`${publicDir}/icons/gaku.svg`, `${icon}\n`);

const FIG_VB = { x: -58, y: 4, w: 234, h: 236 };
const FIG_H = 206;
const FIG_W = Math.round((FIG_H * FIG_VB.w) / FIG_VB.h);
const figPng = await sharp(
  Buffer.from(
    svgDoc(
      `${FIG_VB.x} ${FIG_VB.y} ${FIG_VB.w} ${FIG_VB.h}`,
      FIG_W,
      FIG_H,
      ghostSvg + figure,
    ),
  ),
  { density: 300 },
)
  .resize(FIG_W, FIG_H)
  .png()
  .toBuffer();

// Text in JetBrains Mono, the app's font. Untrimmed, so inkBox gives where the ink sits.
async function text(str, weight, size, color) {
  const buf = await sharp({
    text: {
      text: `<span weight="${weight}" foreground="${color}">${str}</span>`,
      font: `JetBrains Mono ${size}`,
      fontfile: `${fonts}/JetBrainsMono.ttf`,
      dpi: 72,
      rgba: true,
    },
  })
    .png()
    .toBuffer();
  return { buf, ink: await inkBox(buf) };
}
const title = await text("Gaku", 800, 120, T.ink);
const lead = await text(
  "A personal study platform",
  500,
  44,
  tokens["--ink-soft"],
);

// The page's dot grid, scaled from the 18px grid to the banner as the slot shows it on wide screens.
const step = Math.round(T.grid * 1.2);
const dots = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><pattern id="d" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><circle cx="${step / 2}" cy="${step / 2}" r="1.4" fill="${T.dot}"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#d)"/></svg>`,
);

// Figure | title over tagline, centered a bit right of the middle (the page icon covers the bottom left).
const gap = 40;
const groupW = FIG_W + gap + Math.max(title.ink.width, lead.ink.width);
const left = Math.round(1060 - groupW / 2);
const textLeft = left + FIG_W + gap;
const textH = title.ink.height + 30 + lead.ink.height;
const titleTop = Math.round(H / 2 - textH / 2);
const leadTop = titleTop + title.ink.height + 30;

const out = `${publicDir}/banners/gaku.webp`;
await sharp({
  create: { width: W, height: H, channels: 3, background: T.paper },
})
  .composite([
    { input: dots },
    { input: figPng, left, top: Math.round(H / 2 - FIG_H / 2) },
    {
      input: title.buf,
      left: textLeft - title.ink.left,
      top: titleTop - title.ink.top,
    },
    {
      input: lead.buf,
      left: textLeft - lead.ink.left,
      top: leadTop - lead.ink.top,
    },
  ])
  .webp({ quality: 92 })
  .toFile(out);
await preview(out, "gaku");
console.log(`gaku: ${out}, ${publicDir}/icons/gaku.svg (${mode})`);
