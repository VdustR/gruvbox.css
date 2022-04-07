# gruvbox.css

[gruvbox](https://github.com/morhetz/gruvbox) css variables.

[![NPM Publish](https://github.com/VdustR/gruvbox.css/actions/workflows/build.yml/badge.svg)](https://github.com/VdustR/gruvbox.css/actions/workflows/build.yml)

![Palette Dark](https://cdn.jsdelivr.net/gh/vdustr/gruvbox.css/img/dark.png)

![Palette Light](https://cdn.jsdelivr.net/gh/vdustr/gruvbox.css/img/light.png)

## Demo

You can copy and paste the code easily from the demo:

[📦 CodeSandbox](https://codesandbox.io/s/gruvbox-css-demo-mjyeyr)

## Usage

### Basic

Install [gruvbox.css](https://www.npmjs.com/package/gruvbox.css):

```sh
npm i gruvbox.css
```

and import it in your source code:

```js
import "gruvbox.css/gruvbox.css";
```

CDN:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/gruvbox.css/gruvbox.css"
/>
```

then you can use the CSS variables for your elements:

```css
.my-div {
  background-color: var(--gruvbox-mode-bg-0);
  color: var(--gruvbox-mode-fg-0);
}
```

To check all the CSS variables [here](https://cdn.jsdelivr.net/npm/gruvbox.css/gruvbox.css).

You can use the class `.gruvbox-dark` for dark mode. For example, you can make the whole page in dark mode with:

```html
<body class="gruvbox-dark">
  <!-- ... -->
</body>
```

### [prefer-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

Automatically turn into dark mode while the client is configured as dark-mode preferred.

```diff
- import "gruvbox.css/gruvbox.css";
+ import "gruvbox.css/gruvbox-pcs.css";
```

CDN:

```diff
  <link
    rel="stylesheet"
-   href="https://cdn.jsdelivr.net/npm/gruvbox.css/gruvbox.css"
+   href="https://cdn.jsdelivr.net/npm/gruvbox.css/gruvbox-pcs.css"
  />
```

## Pre-defined Constants

### [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

Variables with the prefix `MODE_` stand for it might be changed when switching between dark mode and light mode.

```js
import { MODE_BG_0, MODE_FG_0 } from "gruvbox.css/gruvbox";

const className = css`
  background-color: var(${MODE_BG_0});
  color: var(${MODE_FG_0});
`;
```

CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/gruvbox.css/gruvbox.min.js"></script>
<script>
  const bg = `var(${GRUVBOX.MODE_BG_0})`;
  const fg = `var(${GRUVBOX.MODE_FG_0})`;
</script>
```

To check all constants [here](https://cdn.jsdelivr.net/npm/gruvbox.css/gruvbox.js).

### Palette

Palette colors are constants. They **WON'T** be changed when switching between dark mode and light mode.

You can get the palette colors with these scripts:

```js
import { DARK_0, LIGHT_0 } from "gruvbox.css/gruvbox-palette";

const className = css`
  background-color: var(${DARK_0});
  color: var(${LIGHT_0});
`;
```

CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/gruvbox.css/gruvbox-palette.min.js"></script>
<script>
  const bg = `var(${GRUVBOX_PALETTE.DARK_0})`;
  const fg = `var(${GRUVBOX_PALETTE.LIGHT_0})`;
</script>
```

To check all constants [here](https://cdn.jsdelivr.net/npm/gruvbox.css/gruvbox-palette.js).

## License

[MIT](https://github.com/VdustR/gruvbox.css/blob/main/LICENSE) © [ViPro](https://vdustr.dev).
