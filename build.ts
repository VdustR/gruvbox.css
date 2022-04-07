import { minify } from "csso";
import fs from "fs-extra";
import flow from "lodash/flow";
import kebabCase from "lodash/kebabCase";
import mapValues from "lodash/mapValues";
import mergeWith from "lodash/mergeWith";
import snakeCase from "lodash/snakeCase";
import toUpper from "lodash/toUpper";
import { format } from "prettier";

const eol = "\n";

function formatName(name: string): string {
  return kebabCase(name);
}

const palette = {
  dark0_hard: "#1d2021",
  dark0: "#282828",
  dark0_soft: "#32302f",
  dark1: "#3c3836",
  dark2: "#504945",
  dark3: "#665c54",
  dark4: "#7c6f64",
  dark4_256: "#7c6f64",
  gray_245: "#928374",
  gray_244: "#928374",
  light0_hard: "#f9f5d7",
  light0: "#fbf1c7",
  light0_soft: "#f2e5bc",
  light1: "#ebdbb2",
  light2: "#d5c4a1",
  light3: "#bdae93",
  light4: "#a89984",
  light4_256: "#a89984",
  bright_red: "#fb4934",
  bright_green: "#b8bb26",
  bright_yellow: "#fabd2f",
  bright_blue: "#83a598",
  bright_purple: "#d3869b",
  bright_aqua: "#8ec07c",
  bright_orange: "#fe8019",
  neutral_red: "#cc241d",
  neutral_green: "#98971a",
  neutral_yellow: "#d79921",
  neutral_blue: "#458588",
  neutral_purple: "#b16286",
  neutral_aqua: "#689d6a",
  neutral_orange: "#d65d0e",
  faded_red: "#9d0006",
  faded_green: "#79740e",
  faded_yellow: "#b57614",
  faded_blue: "#076678",
  faded_purple: "#8f3f71",
  faded_aqua: "#427b58",
  faded_orange: "#af3a03",
};

const prefix = "--gruvbox";
const darkClass = ".gruvbox-dark";

const lightMode = {
  bg0: "light0",
  bg0s: "light0_soft",
  bg0h: "light0_hard",
  bg1: "light1",
  bg2: "light2",
  bg3: "light3",
  bg4: "light4",
  gray: "gray_244",
  fg0: "dark0",
  fg1: "dark1",
  fg2: "dark2",
  fg3: "dark3",
  fg4: "dark4",
  fg4_256: "dark4_256",
  red: "faded_red",
  green: "faded_green",
  yellow: "faded_yellow",
  blue: "faded_blue",
  purple: "faded_purple",
  aqua: "faded_aqua",
  orange: "faded_orange",
};

type Mode = typeof lightMode;

function darkenValue(value: string): string {
  return value.replace(/(light|dark|bright)/, (match) => {
    if (match === "light") {
      return "dark";
    } else if (match === "dark") {
      return "light";
    } else if (match === "bright") {
      return "faded";
    }
    return match;
  });
}

const darkMode: Mode = mapValues(lightMode, (value) =>
  typeof value === "string"
    ? darkenValue(value)
    : mapValues(value, (value) => darkenValue(value))
) as Mode;

type PropertyKey = string;
type PropertyValue = string;
type Properties = Record<PropertyKey, PropertyValue>;
type CssMap = Record<string, Properties>;

function modeToCssMap(
  mode: typeof lightMode,
  modeName: "light" | "dark" = "light"
): CssMap {
  const cssMap: CssMap = {};
  function push(
    query: string,
    propertyKey: PropertyKey,
    propertyValue: PropertyValue
  ) {
    if (cssMap[query] === undefined) {
      cssMap[query] = {};
    }
    cssMap[query][propertyKey] = propertyValue;
  }
  const entries = Object.entries(mode);
  entries.forEach(([key, value]) => {
    if (typeof value === "string") {
      push(
        modeName === "light" ? `:root` : darkClass,
        `${prefix}-mode-${formatName(key)}`,
        `var(${prefix}-abs-${formatName(value)})`
      );
      return;
    }
  });
  return cssMap;
}

const paletteCss: Properties = flow(
  () => Object.entries(palette),
  (entries) =>
    entries.map(([key, hex]) => [`${prefix}-abs-${formatName(key)}`, hex]),
  (entries) => Object.fromEntries(entries)
)();

function toCssString(cssMap: CssMap): string {
  return Object.entries(cssMap)
    .map(
      ([query, properties]) =>
        `${query} { ${Object.entries(properties)
          .map(([key, value]) => `${key}: ${value};`)
          .join(eol)} }`
    )
    .join(eol);
}

const lightModeCssMap = modeToCssMap(lightMode);
const darkModeCssMap = modeToCssMap(darkMode, "dark");

const cssMap = mergeWith(
  {
    ":root": paletteCss,
  },
  lightModeCssMap,
  darkModeCssMap,
  function customizer(objValue, srcValue) {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  }
);

const content = format(toCssString(cssMap), { parser: "css" });
fs.writeFileSync("./gruvbox.css", content, "utf8");
fs.writeFileSync("./gruvbox.min.css", minify(content).css, "utf8");

// pcs: prefers-color-scheme
const pcsContent = format(
  toCssString(
    mergeWith(
      {
        ":root": paletteCss,
      },
      lightModeCssMap,
      function customizer(objValue, srcValue) {
        if (Array.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      }
    )
  ) +
    eol +
    eol +
    `@media (prefers-color-scheme: dark) { ${toCssString(
      modeToCssMap(darkMode)
    )}}`,
  { parser: "css" }
);
fs.writeFileSync("./gruvbox-pcs.css", pcsContent, "utf8");
fs.writeFileSync("./gruvbox-pcs.min.css", minify(pcsContent).css, "utf8");

const cssVariables: Record<string, string> = flow(
  () => Object.keys(cssMap[":root"]),
  (keys) =>
    keys.map((key) => [
      toUpper(snakeCase(key.substring(prefix.length + 1))),
      key,
    ]),
  (entries) => Object.fromEntries(entries)
)();

fs.writeFileSync(
  "gruvbox.js",
  Object.entries(cssVariables)
    .map(([key, value]) => `export const ${key} = "${value}";`)
    .join(eol),
  "utf8"
);
fs.writeFileSync(
  "gruvbox.cjs",
  Object.entries(cssVariables)
    .map(([key, value]) => `exports.${key} = "${value}";`)
    .join(eol),
  "utf8"
);
fs.writeFileSync(
  "gruvbox.d.ts",
  Object.keys(cssVariables)
    .map((key) => `export const ${key}: string;`)
    .join(eol),
  "utf8"
);
fs.writeFileSync(
  "gruvbox.min.js",
  "var GRUVBOX={" +
    Object.entries(cssVariables)
      .map(([key, value]) => `${key}:"${value}"`)
      .join(",") +
    "}",
  "utf8"
);

console.log("Builded successfully!");
