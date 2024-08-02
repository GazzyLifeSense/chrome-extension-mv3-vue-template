<div align="center">


![icon](./public/icon-128.png)

</div>

#  A demo for Chrome Extension MV3 - Vite, Vue3, Typescript, Ant Design, TailwindCss

## Features

- 🥳 [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- ⚡️ Vite 4、Vue 3 and TypeScript.
- 🌼 Integrated with Ant design vue、less、tailwindcss, easy to beutiful design!
- 💪 Lots of utils, including data export(excel、csv、json)、file zip、file download...
- 🔥 Hot Module Reload (HMR)
- ✍️ Example code of service-worker, content script, popup and options page
  - (⚠️ some function might not work correctly due to unfinished project)

## Usage
### development
1. Install dependencies with `pnpm install`.
2. Run `pnpm run dev` to build development version and development server.
3. Load `dist` directory into Chrome as an unpacked extension.
   1. Open `chrome://extensions`
   2. Turn on `Developer mode`
   3. Select `Load unpacked` and open `dist` folder
### production
1. Install dependencies with `pnpm install`.
2. Generate private and public key pair for extension - `cd secrets/ && sh generate-secrets.sh && cd ../`.
3. Run `pnpm run package` to build production version of extension and package it into `dist/xxx.crx` file.
