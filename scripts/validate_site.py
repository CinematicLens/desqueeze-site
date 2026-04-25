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

# Usability / SEO sanity bounds (per page)
TITLE_LEN_MIN = 20
TITLE_LEN_MAX = 200
META_DESC_LEN_MIN = 40
META_DESC_LEN_MAX = 500


def html_files() -> list[Path]:
    return sorted(ROOT.glob("*.html"))


def _is_skippable_url(ref: str) -> bool:
    ref = ref.strip()
    if not ref or ref.startswith("#"):
        return True
    if ref.startswith("//"):
        return True
    if re.match(r"^[a-z][-a-z0-9+.]*:", ref, re.I):
        return True
    return False


def _resolve_local_target(html_path: Path, ref: str) -> tuple[Path | None, str | None]:
    """
    For a repo-local path reference, return (resolved_path, error).
    error is 'outside' if path escapes ROOT, None otherwise.
    Returns (None, None) if ref should be skipped (external, empty).
    """
    if _is_skippable_url(ref):
        return None, None
    path_only = ref.split("?")[0].split("#")[0]
    if not path_only:
        return None, None
    root_res = ROOT.resolve()
    if path_only.startswith("/"):
        target = (ROOT / path_only.lstrip("/")).resolve()
    else:
        target = (html_path.parent / path_only).resolve()
    try:
        target.relative_to(root_res)
    except ValueError:
        return target, "outside"
    return target, None


def _link_target_ok(target: Path) -> bool:
    if target.is_file():
        return True
    if target.is_dir() and (target / "index.html").is_file():
        return True
    return False


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


def test_single_main_landmark() -> list[str]:
    """One <main> per document — multiple mains confuse screen readers and violate HTML5."""
    failures: list[str] = []
    for f in html_files():
        text = f.read_text(encoding="utf-8", errors="replace")
        n = len(re.findall(r"<main\b", text, re.I))
        if n != 1:
            failures.append(f"{f.name}: expected exactly 1 <main> landmark, found {n}")
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


def test_internal_links() -> list[str]:
    failures: list[str] = []
    for f in html_files():
        text = f.read_text(encoding="utf-8", errors="replace")
        for m in re.finditer(r'href\s*=\s*"([^"]*)"', text, re.I):
            ref = m.group(1)
            target, err = _resolve_local_target(f, ref)
            if target is None and err is None:
                continue
            if err == "outside":
                failures.append(f"{f.name}: href leaves repo: {ref!r}")
                continue
            assert target is not None
            if _link_target_ok(target):
                continue
            failures.append(f"{f.name}: missing target for href {ref!r} -> {target}")
    return failures


def _meta_description_content(text: str) -> str | None:
    m = re.search(r'<meta\s[^>]*name\s*=\s*["\']description["\']', text, re.I)
    if not m:
        return None
    window = text[m.end() : m.end() + 1200]
    cm = re.search(r'content\s*=\s*"([^"]*)"', window, re.S | re.I)
    if cm:
        return cm.group(1).strip()
    cm = re.search(r"content\s*=\s*'([^']*)'", window, re.S | re.I)
    if cm:
        return cm.group(1).strip()
    return None


def test_page_document_usability() -> list[str]:
    """
    Per HTML file: lang, viewport, title length, meta description length,
    presence of <main> (count enforced separately).
    """
    failures: list[str] = []
    for f in html_files():
        text = f.read_text(encoding="utf-8", errors="replace")
        name = f.name
        if not re.search(r"<html\b[^>]*\blang\s*=\s*['\"][^'\"]+['\"]", text, re.I):
            failures.append(f"{name}: missing or empty <html lang>")
        if not re.search(r'<meta\b[^>]*name\s*=\s*["\']viewport["\']', text, re.I):
            failures.append(f"{name}: missing <meta name=\"viewport\">")
        tm = re.search(r"<title\b[^>]*>([\s\S]*?)</title\s*>", text, re.I)
        if not tm:
            failures.append(f"{name}: missing <title>")
        else:
            title = re.sub(r"\s+", " ", tm.group(1).strip())
            if len(title) < TITLE_LEN_MIN:
                failures.append(f"{name}: <title> too short ({len(title)} chars, min {TITLE_LEN_MIN})")
            if len(title) > TITLE_LEN_MAX:
                failures.append(f"{name}: <title> too long ({len(title)} chars, max {TITLE_LEN_MAX})")
        desc = _meta_description_content(text)
        if desc is None:
            failures.append(f"{name}: missing <meta name=\"description\"> or content=")
        else:
            if len(desc) < META_DESC_LEN_MIN:
                failures.append(
                    f"{name}: meta description too short ({len(desc)} chars, min {META_DESC_LEN_MIN})"
                )
            if len(desc) > META_DESC_LEN_MAX:
                failures.append(
                    f"{name}: meta description too long ({len(desc)} chars, max {META_DESC_LEN_MAX})"
                )
    return failures


def _attr_in_tag(tag: str, attr: str) -> str | None:
    m = re.search(rf'\b{re.escape(attr)}\s*=\s*"([^"]*)"', tag, re.I)
    if m:
        return m.group(1)
    m = re.search(rf"\b{re.escape(attr)}\s*=\s*'([^']*)'", tag, re.I)
    if m:
        return m.group(1)
    return None


def test_local_images_usability() -> list[str]:
    """Every <img>: local src resolves to a file; alt attribute present (empty OK for decorative)."""
    failures: list[str] = []
    img_tag_re = re.compile(r"<img\b[^>]*>", re.I)
    for f in html_files():
        text = f.read_text(encoding="utf-8", errors="replace")
        for im in img_tag_re.finditer(text):
            tag = im.group(0)
            if not re.search(r"\balt\s*=", tag, re.I):
                failures.append(f"{f.name}: <img> missing alt attribute")
                continue
            src = _attr_in_tag(tag, "src")
            if src is None:
                failures.append(f"{f.name}: <img> missing src")
                continue
            if _is_skippable_url(src) or src.lower().startswith("data:"):
                continue
            target, err = _resolve_local_target(f, src)
            if err == "outside":
                failures.append(f"{f.name}: img src leaves repo: {src!r}")
                continue
            if target is None:
                continue
            if not target.is_file():
                failures.append(f"{f.name}: missing file for img src {src!r} -> {target}")
    return failures


def test_video_poster_paths() -> list[str]:
    failures: list[str] = []
    video_open_re = re.compile(r"<video\b[^>]*>", re.I)
    for f in html_files():
        text = f.read_text(encoding="utf-8", errors="replace")
        for vm in video_open_re.finditer(text):
            tag = vm.group(0)
            poster = _attr_in_tag(tag, "poster")
            if poster is None:
                continue
            if _is_skippable_url(poster) or poster.lower().startswith("data:"):
                continue
            target, err = _resolve_local_target(f, poster)
            if err == "outside":
                failures.append(f"{f.name}: video poster leaves repo: {poster!r}")
                continue
            if target is None:
                continue
            if not target.is_file():
                failures.append(f"{f.name}: missing file for video poster {poster!r} -> {target}")
    return failures


def test_flagship_image_path() -> list[str]:
    """Promo image path used on CineLut page must exist."""
    p = ROOT / "assets" / "cinelutlivegrade-promo-collage.png"
    if not p.is_file():
        return [f"Missing {p.relative_to(ROOT)}"]
    return []


def test_tailwind_bundle() -> list[str]:
    """If any page links tailwind.css, the built file must exist and ?v= must match."""
    failures: list[str] = []
    uses: list[Path] = []
    versions: set[str] = set()
    tw_re = re.compile(r"tailwind\.css\?v=(\d+)", re.I)
    for f in html_files():
        text = f.read_text(encoding="utf-8", errors="replace")
        if "tailwind.css" not in text:
            continue
        uses.append(f)
        m = tw_re.search(text)
        if not m:
            failures.append(f"{f.name}: links tailwind.css but missing tailwind.css?v=")
        else:
            versions.add(m.group(1))
    if not uses:
        return []
    bundle = ROOT / "assets" / "tailwind.css"
    if not bundle.is_file():
        failures.append("assets/tailwind.css missing (run npm run build:css)")
    if len(versions) > 1:
        failures.append(f"Inconsistent tailwind.css?v= across HTML: {sorted(versions, key=int)}")
    return failures


def main() -> int:
    failures: list[str] = []
    failures.extend(test_style_css_exists())
    failures.extend(test_single_h1())
    failures.extend(test_single_main_landmark())
    failures.extend(test_stylesheet_version())
    failures.extend(test_page_document_usability())
    failures.extend(test_internal_links())
    failures.extend(test_local_images_usability())
    failures.extend(test_video_poster_paths())
    failures.extend(test_flagship_image_path())
    failures.extend(test_tailwind_bundle())

    if failures:
        print("VALIDATION FAILED\n", file=sys.stderr)
        for line in failures:
            print(f"  - {line}", file=sys.stderr)
        return 1
    n = len(html_files())
    print(
        f"OK: {n} HTML file(s); one <h1> and one <main> each; document head usability; "
        "style.css version aligned; Tailwind bundle when linked; internal hrefs and local images/posters resolve."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
