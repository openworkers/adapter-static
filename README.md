# @openworkers/adapter-static

Static site adapter for OpenWorkers. Converts any static site into a deployable worker with optimized asset serving.

## Installation

```bash
bun add -g @openworkers/adapter-static
```

## Quick Start

```bash
# Auto-detect input folder and generate worker
adapter-static

# Specify input and output directories
adapter-static ./build -o ./dist

# Custom 404 page
adapter-static --fallback /404.html
```

## CLI Options

| Option    | Flag             | Default            | Description                                         |
| --------- | ---------------- | ------------------ | --------------------------------------------------- |
| Input     | positional       | auto-detect        | Source directory (`dist`, `build`, `out`, `public`) |
| Output    | `-o, --out`      | `dist-openworkers` | Output directory                                    |
| Mode      | `-m, --mode`     | auto-detect        | Routing mode: `directory` or `flat`                 |
| Fallback  | `-f, --fallback` | none               | Fallback file for unmatched routes                  |
| Immutable | `--immutable`    | auto-detect        | Comma-separated immutable path patterns             |

## Programmatic Usage

```js
import { adapt } from '@openworkers/adapter-static';

await adapt({
  input: 'build',
  out: 'dist',
  mode: 'flat',
  fallback: '/404.html'
});
```

## Output Structure

```
dist/
├── worker.js   # Worker serving files via ASSETS binding
├── assets/     # Static files
└── routes.js   # Route manifest
```

## Routing Modes

The adapter auto-detects the routing mode based on your file structure.

| Mode          | URL      | File                |
| ------------- | -------- | ------------------- |
| **Directory** | `/about` | `/about/index.html` |
| **Flat**      | `/about` | `/about.html`       |

Directory mode is used by most static generators. Flat mode is common with SvelteKit static adapter.

## Immutable Assets

Assets with hashed filenames are served with long cache headers (`max-age=31536000, immutable`).

Auto-detected patterns:

- `/_app/immutable/*` — SvelteKit
- `/assets/*` — Vite
- `/_next/static/*` — Next.js
- `/_astro/*` — Astro

## Deploy to OpenWorkers

**Quick deploy** (existing worker):

```bash
ow workers upload my-site ./dist
```

**Full setup**:

```bash
# 1. Create storage for assets
ow storage create my-site-assets --provider platform

# 2. Create environment
ow env create my-site-env

# 3. Bind storage to environment as ASSETS
ow env bind my-site-env ASSETS my-site-assets -t assets

# 4. Create worker
ow workers create my-site

# 5. Link environment to worker
ow workers link my-site my-site-env

# 6. Build and upload
adapter-static ./build -o ./dist
ow workers upload my-site ./dist
```

Your site is live at `https://my-site.workers.rocks`

## License

MIT
