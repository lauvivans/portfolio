// Runs the Haru game's own pixel art code (src/pixel/*.ts) in Node with a fake canvas.
// Every drawing call there is fillRect/clearRect with a --px-* token color, so a pixel buffer is enough.
// Node strips the TypeScript types on its own; the browser-only imports get small stubs.
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// The Haru repository (github.com/lauvivans/haru), cloned locally.
const HARU = process.env.HARU_REPO?.replaceAll("\\", "/");
if (!HARU || !existsSync(`${HARU}/src/pixel/haru.ts`))
  throw new Error("Set HARU_REPO to a local clone of the Haru repository.");

// Day (light theme) tokens: the first :root block of the tokens file
const css = readFileSync(`${HARU}/src/styles/tokens.css`, "utf8");
const rootBlock = css.slice(css.indexOf(":root {"), css.indexOf("/* Night"));
export const tokens = {};
for (const m of rootBlock.matchAll(/(--[\w-]+):\s*([^;]+);/g))
  tokens[m[1]] = m[2].trim();

const stubs = {
  gsap: "export const gsap = { ticker: { add(f) { globalThis.__tick = f; }, remove() {} }, to() { return null; }, killTweensOf() {}, delayedCall() { return { kill() {} }; } };",
  "@/theme": "export const theme = { get: () => 'light', subscribe() {} };",
  "@/stored":
    "export function stored(k, init) { let v = init(); return { get: () => v, set(n) { v = n; }, subscribe() {} }; }",
  "@/round": "export const MAX_MISSES = 7;",
};

registerHooks({
  resolve(spec, ctx, next) {
    if (stubs[spec])
      return {
        url: "data:text/javascript," + encodeURIComponent(stubs[spec]),
        shortCircuit: true,
      };
    if (spec.startsWith("@/"))
      return {
        url: pathToFileURL(`${HARU}/src/${spec.slice(2)}.ts`).href,
        shortCircuit: true,
      };
    return next(spec, ctx);
  },
});

globalThis.document = { documentElement: { dataset: {} } };
globalThis.getComputedStyle = () => ({
  getPropertyValue: (n) => tokens[n] ?? "",
});
// Reduced motion: the game draws a still frame (T = 0) and tweens jump to their end.
globalThis.matchMedia = (q) => ({ matches: q.includes("reduced-motion") });
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};

function hex(c) {
  const h = c.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

// A canvas with a fixed pixel buffer; whatever size the game code asks for is ignored.
export function fakeCanvas(width, height) {
  const buf = new Uint8ClampedArray(width * height * 4);
  const ctx = {
    fillStyle: "#000000",
    fillRect(x, y, w, h) {
      const [r, g, b] = hex(this.fillStyle);
      for (let j = Math.max(0, y); j < Math.min(height, y + h); j++)
        for (let i = Math.max(0, x); i < Math.min(width, x + w); i++) {
          const k = (j * width + i) * 4;
          buf[k] = r;
          buf[k + 1] = g;
          buf[k + 2] = b;
          buf[k + 3] = 255;
        }
    },
    clearRect(x, y, w, h) {
      for (let j = Math.max(0, y); j < Math.min(height, y + h); j++)
        for (let i = Math.max(0, x); i < Math.min(width, x + w); i++)
          buf[(j * width + i) * 4 + 3] = 0;
    },
  };
  const canvas = {
    get width() {
      return width;
    },
    set width(_) {},
    get height() {
      return height;
    },
    set height(_) {},
    style: {},
    parentElement: null,
    getContext: () => ctx,
  };
  return { canvas, ctx, buf, width, height };
}

export const pixel = {
  core: await import(pathToFileURL(`${HARU}/src/pixel/core.ts`).href),
  haru: await import(pathToFileURL(`${HARU}/src/pixel/haru.ts`).href),
  world: await import(pathToFileURL(`${HARU}/src/pixel/world.ts`).href),
};
