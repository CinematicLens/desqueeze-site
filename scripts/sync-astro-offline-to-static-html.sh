#!/usr/bin/env bash
# Build Astro and copy offline pages into the static-html worktree (sales homepage stays).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LIVE="${STATIC_HTML_ROOT:-$(cd "$ROOT/../desqueeze-site-live" 2>/dev/null && pwd || true)}"
if [[ -z "${LIVE}" || ! -d "$LIVE" ]]; then
  echo "Set STATIC_HTML_ROOT to the static-html worktree path." >&2
  exit 1
fi
cd "$ROOT"
npm run build
rm -rf "$LIVE/products" "$LIVE/guides" "$LIVE/_astro"
mkdir -p "$LIVE/products" "$LIVE/guides"
cp -a "$ROOT/dist/products/index.html" "$LIVE/products/index.html"
cp -a "$ROOT/dist/guides/index.html" "$LIVE/guides/index.html"
cp -a "$ROOT/dist/_astro" "$LIVE/_astro"
# Logo used by Astro chrome on offline pages
mkdir -p "$LIVE/images"
cp -a "$ROOT/dist/images/logo_for_dark_bg.png" "$LIVE/images/logo_for_dark_bg.png"
# Optional full image set (uncomment to sync all Astro public images)
# rsync -a --delete "$ROOT/dist/images/" "$LIVE/images/"
echo "Synced products + guides → $LIVE"
echo "Open: $LIVE/products/index.html#anamorphic"
