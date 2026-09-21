# DSA Mastery Suite

## Prerequisites

This project requires **Node.js `>=22.12.0`** (see `package.json` `engines` and `.nvmrc`).

Vite and several dependencies will fail on Node 18/20. If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use   # picks 24 from .nvmrc
```

Run this in the project directory before installing or starting the app. To avoid repeating it in every new shell, set Node 24 as your default:

```bash
nvm alias default 24
```

If you installed dependencies under an older Node version, reinstall after switching:

```bash
rm -rf node_modules
npm install
```

## Getting started

```bash
nvm use
npm install
npm run dev
```

The app runs at [http://localhost:8080](http://localhost:8080).

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start the Vite dev server |
| `npm run build` | Production build         |
| `npm run preview` | Preview the production build |
| `npm run lint`  | Run ESLint               |
| `npm run format`| Format with Prettier     |
