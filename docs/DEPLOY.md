# Deploy

## Production (live site) — static HTML

- **URL:** https://anamorphic-desqueeze.com
- **Branch:** `static-html` (pre-Astro: `index.html`, product pages, etc.)
- **How:** Push to `static-html` → **Deploy static HTML to GitHub Pages**

See [STATIC-SITE.md](./STATIC-SITE.md).

## Astro site (manual deploy from `main`)

- **Branch:** `main`
- **How:** GitHub Actions → **Deploy Astro to GitHub Pages** → **Run workflow** (not auto on push)

```bash
git checkout main
git push origin main
```

Re-run without new commits: GitHub → **Actions** → **Deploy Astro to GitHub Pages** → **Run workflow**.

Check status: https://github.com/CinematicLens/desqueeze-site/actions

### If the custom domain shows 404

1. Repo → **Settings** → **Pages** → **Build and deployment**
2. **Source** must be **GitHub Actions** (not “Deploy from a branch”).
3. Under **Custom domain**, set `anamorphic-desqueeze.com` and wait for DNS check.
4. Re-run **Deploy Astro to GitHub Pages** from the Actions tab.

The build includes `public/CNAME` so the custom domain is attached to each deploy.

## Preview (`astro-migration` branch)

Run locally:

```bash
git checkout astro-migration
npm ci && npm run dev
```

## Local

```bash
npm ci
npm run build
npm run preview
```

Node **22.12+** required.
