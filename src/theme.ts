import type { ChalkInstance } from "chalk";
import { Chalk } from "chalk";
import type { ColorName, StyleIntent, Theme, ThemeName } from "./types.js";

const yellowBold: StyleIntent = { color: "yellow", bold: true };
const magentaBold: StyleIntent = { color: "magenta", bold: true };
const blueUnderline: StyleIntent = { color: "blue", underline: true };
const whiteDim: StyleIntent = { color: "white", dim: true };
const cyan: StyleIntent = { color: "cyan" };
const green: StyleIntent = { color: "green" };
const boldOnly: StyleIntent = { bold: true };
const italicOnly: StyleIntent = { italic: true };
const dimOnly: StyleIntent = { dim: true };

const base: Theme = {
  heading: yellowBold,
  strong: boldOnly,
  emph: italicOnly,
  inlineCode: cyan,
  blockCode: green,
  link: blueUnderline,
  quote: dimOnly,
  hr: dimOnly,
  listMarker: cyan,
  tableHeader: yellowBold,
  tableCell: {},
};

const dim: Theme = {
  ...base,
  heading: { color: "white", bold: true, dim: true },
  link: { color: "blue", underline: true, dim: true },
};

const bright: Theme = {
  ...base,
  heading: magentaBold,
  link: { color: "cyan", underline: true },
  inlineCode: green,
  blockCode: green,
};

const solarized: Theme = {
  heading: yellowBold,
  strong: boldOnly,
  emph: italicOnly,
  inlineCode: cyan,
  blockCode: { color: "#2aa198" },
  link: blueUnderline,
  quote: whiteDim,
  hr: whiteDim,
  listMarker: cyan,
  tableHeader: yellowBold,
};

const monochrome: Theme = {
  heading: boldOnly,
  strong: boldOnly,
  emph: italicOnly,
  inlineCode: dimOnly,
  blockCode: dimOnly,
  link: { underline: true },
  quote: dimOnly,
  hr: dimOnly,
  listMarker: dimOnly,
  tableHeader: boldOnly,
};

const contrast: Theme = {
  heading: magentaBold,
  strong: { color: "white", bold: true },
  emph: { color: "white", italic: true },
  inlineCode: { color: "cyan", bold: true },
  blockCode: { color: "green", bold: true },
  link: blueUnderline,
  quote: whiteDim,
  hr: whiteDim,
  listMarker: yellowBold,
  tableHeader: yellowBold,
  tableCell: { color: "white" },
};

export type Themes = Record<ThemeName, Theme> & Record<string, Theme>;

export const themes: Themes = {
  default: Object.freeze(base),
  dim: Object.freeze(dim),
  bright: Object.freeze(bright),
  solarized: Object.freeze(solarized),
  monochrome: Object.freeze(monochrome),
  contrast: Object.freeze(contrast),
};

export type Styler = (text: string, style?: StyleIntent) => string;

function applyColor(fn: ChalkInstance, color: ColorName, background = false): ChalkInstance {
  if (color.startsWith("#")) return background ? fn.bgHex(color) : fn.hex(color);

  if (/^\d+$/.test(color)) {
    const index = Number(color);
    if (index <= 255) return background ? fn.bgAnsi256(index) : fn.ansi256(index);
    return fn;
  }

  const name =
    background && !color.startsWith("bg") ? `bg${color[0]?.toUpperCase()}${color.slice(1)}` : color;
  const indexed = fn as unknown as Record<string, ChalkInstance | undefined>;
  return indexed[name] ?? fn;
}

/**
 * Create a Chalk-based styling helper that applies StyleIntent safely.
 */
export function createStyler({ color }: { color: boolean }): Styler {
  const level = color ? 3 : 0;
  const chalk = new Chalk({ level }) as ChalkInstance;
  const apply: Styler = (text, style = {}) => {
    if (!color) return text;
    let fn: ChalkInstance = chalk;
    if (style.color) fn = applyColor(fn, style.color);
    if (style.bgColor) fn = applyColor(fn, style.bgColor, true);
    if (style.bold) fn = fn.bold;
    if (style.italic) fn = fn.italic;
    if (style.underline) fn = fn.underline;
    if (style.dim) fn = fn.dim;
    if (style.strike) fn = fn.strikethrough;
    return fn(text);
  };
  return apply;
}
