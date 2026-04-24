#!/usr/bin/env python3
"""
Static validation for desqueeze-site (no network, no extra deps).

Run from repo root:
  python scripts/validate_site.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def html_files() -> list[Path]:
    return sorted(ROOT.glob("*.html"))


def test_style_css_exists() -> list[str]:
    if not (ROOT / "style.css").is_file():
        return ["style.css missing at repo root"]
    return []


def test_single_h1() -> list[str]:
    failures: list[str] = []
    for f in html_files():
        text = f.read_text(encoding="utf-8", errors="replace")
        n = len(re.findall(r"<h1\b", text, re.I))
        if n != 1:
            failures.append(f"{f.name}: expected exactly 1 <h1>, found {n}")
    return failures


def test_stylesheet_version() -> list[str]:
    failures: list[str] = []
    versions: set[str] = set()
    for f in html_files():
        text = f.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"style\.css\?v=(\d+)", text)
        if not m:
            failures.append(f"{f.name}: missing link to style.css?v=")
        else:
            versions.add(m.group(1))
    if len(versions) > 1:
        failures.append(f"Inconsistent style.css?v= across HTML: {sorted(versions, key=int)}")
    return failures


def _is_skippable_href(ref: str) -> bool:
    ref = ref.strip()
    if not ref or ref.startswith("#"):
        return True
    if re.match(r"^[a-z][-a-z0-9+.]*:", ref, re.I):
        # mailto:, https:, ms-windows-store:, javascript:, etc.
        return True
    return False


def test_internal_links() -> list[str]:
    failures: list[str] = []
    for f in html_files():
        text = f.read_text(encoding="utf-8", errors="replace")
        for m in re.finditer(r'href\s*=\s*"([^"]*)"', text, re.I):
            ref = m.group(1)
            if _is_skippable_href(ref):
                continue
            path_only = ref.split("?")[0].split("#")[0]
            if not path_only:
                continue
            if path_only.startswith("/"):
                target = (ROOT / path_only.lstrip("/")).resolve()
            else:
                target = (f.parent / path_only).resolve()
            try:
                target.relative_to(ROOT.resolve())
            except ValueError:
                failures.append(f"{f.name}: href leaves repo: {ref!r}")
                continue
            if target.is_file():
                continue
            if target.is_dir() and (target / "index.html").is_file():
                continue
            failures.append(f"{f.name}: missing target for href {ref!r} -> {target}")
    return failures


def test_flagship_image_path() -> list[str]:
    """Promo image path used on CineLut page must exist."""
    p = ROOT / "assets" / "cinelutlivegrade-promo-collage.png"
    if not p.is_file():
        return [f"Missing {p.relative_to(ROOT)}"]
    return []


def main() -> int:
    failures: list[str] = []
    failures.extend(test_style_css_exists())
    failures.extend(test_single_h1())
    failures.extend(test_stylesheet_version())
    failures.extend(test_internal_links())
    failures.extend(test_flagship_image_path())

    if failures:
        print("VALIDATION FAILED\n", file=sys.stderr)
        for line in failures:
            print(f"  - {line}", file=sys.stderr)
        return 1
    n = len(html_files())
    print(f"OK: {n} HTML file(s); one <h1> each; style.css version aligned; internal href targets exist.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
