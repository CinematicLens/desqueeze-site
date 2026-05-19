# Deploy

## Production (live site)

- **URL:** https://anamorphic-desqueeze.com
- **Branch:** `main`
- **How:** Push to `main` → GitHub Actions runs **Deploy Astro to GitHub Pages**

```bash
git checkout main
git push origin main
```

Re-run without new commits: GitHub → **Actions** → **Deploy Astro to GitHub Pages** → **Run workflow**.

Check status: https://github.com/CinematicLens/desqueeze-site/actions

## Preview (`astro-migration` branch)

- **URL:** https://cinematiclens.github.io/desqueeze-site/astro-preview/
- **Branch:** `astro-migration`
- **How:** Push to `astro-migration` → **Preview deploy (astro-migration)** workflow

```bash
git checkout astro-migration
git push origin astro-migration
```

## Local

```bash
npm ci
npm run build
npm run preview
```

Node **22.12+** required.
