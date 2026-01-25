# @openworkers/adapter-static

Static site adapter for OpenWorkers. Takes any static site output and generates a worker + assets ready for deployment.

## Installation

```bash
bun add -g @openworkers/adapter-static
```

## Usage

### CLI

```bash
# Auto-detect input folder (dist, build, out, public)
adapter-static

# Specify input and output
adapter-static ./build -o ./dist

# SPA mode (fallback to index.html for all routes)
adapter-static --fallback /index.html

# Force routing mode
adapter-static --mode flat      # /page -> /page.html
adapter-static --mode directory # /page -> /page/index.html
```

### Programmatic

```js
import { adapt } from '@openworkers/adapter-static';

await adapt({
  input: 'build',
  out: 'dist',
  mode: 'flat',
  fallback: '/index.html'
});
```

## Output

```
dist/
├── worker.js   # Worker that serves static files via ASSETS binding
├── assets/     # Static files
└── routes.js   # Route manifest for edge routing
```

## Deploying to OpenWorkers

### Quick deploy (existing worker with ASSETS binding)

```bash
ow workers upload my-site ./dist
```

### Full setup from scratch

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

Your site is now live at `https://my-site.workers.rocks`

## Options

| Option      | CLI              | Default            | Description                        |
| ----------- | ---------------- | ------------------ | ---------------------------------- |
| `input`     | positional       | auto-detect        | Input directory                    |
| `out`       | `-o, --out`      | `dist-openworkers` | Output directory                   |
| `mode`      | `-m, --mode`     | auto-detect        | `directory` or `flat`              |
| `fallback`  | `-f, --fallback` | none               | SPA fallback file                  |
| `immutable` | `--immutable`    | auto-detect        | Comma-separated immutable patterns |

## Routing Modes

**Directory mode** (default for most static generators):

- `/about` → `/about/index.html`
- `/docs/intro` → `/docs/intro/index.html`

**Flat mode** (SvelteKit static, some others):

- `/about` → `/about.html`
- `/docs/intro` → `/docs/intro.html`

The adapter auto-detects the mode based on your file structure.

## Immutable Assets

Assets with hashed filenames are automatically detected and served with long cache headers (`max-age=31536000, immutable`).

Detected patterns:

- `/_app/immutable/*` (SvelteKit)
- `/assets/*` (Vite)
- `/_next/static/*` (Next.js)
- `/_astro/*` (Astro)

## License

MIT
