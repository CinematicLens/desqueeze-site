# Static HTML site (`static-html` branch)

This branch is the **pre-Astro** site: `index.html`, `cinelutlivegrade.html`, `filmstudio.html`, `guides.html`, etc.

## Branches

| Branch | Site |
|--------|------|
| `static-html` | Static HTML (this branch) — deploys to production |
| `main` | Astro site (kept in repo, not auto-deployed from here while using static) |
| `astro-migration` | Early Astro snapshot |

## Work locally

```bash
git checkout static-html
npm ci
npm run build:css
npx http-server -p 8080
```

Open http://localhost:8080

## Deploy live

Push to `static-html` → **Deploy static HTML to GitHub Pages** runs.

```bash
git push origin static-html
```

GitHub → **Settings → Pages** → source must be **GitHub Actions**.

Custom domain: `anamorphic-desqueeze.com` (see root `CNAME`).

## Switch back to Astro later

Push to `main` and run **Deploy Astro to GitHub Pages** on `main` (re-enable that workflow on `main` if needed).
