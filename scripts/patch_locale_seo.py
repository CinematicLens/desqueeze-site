#!/usr/bin/env python3
"""Patch sitemap.xml with high-value locale URLs and refresh EN hreflang on key pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES = [
    ("ja", "ja"),
    ("ko", "ko"),
    ("de", "de"),
    ("es", "es"),
    ("pt", "pt"),
    ("zh", "zh-Hans"),
    ("hi", "hi"),
    ("fr", "fr"),
]


def locale_urls() -> str:
    chunks: list[str] = []
    for code, hreflang in LOCALES:
        for path, pri in (("", "0.97"), ("anamorphic.html", "0.94")):
            loc = (
                f"https://anamorphic-desqueeze.com/{code}/"
                if not path
                else f"https://anamorphic-desqueeze.com/{code}/{path}"
            )
            en = (
                "https://anamorphic-desqueeze.com/"
                if not path
                else "https://anamorphic-desqueeze.com/anamorphic.html"
            )
            chunks.append(
                f"""  <url>
    <loc>{loc}</loc>
    <lastmod>2026-08-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{pri}</priority>
    <xhtml:link rel="alternate" hreflang="{hreflang}" href="{loc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="{en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{en}"/>
  </url>"""
            )
    return "\n".join(chunks)


def patch_sitemap() -> None:
    path = ROOT / "sitemap.xml"
    text = path.read_text(encoding="utf-8")
    # Remove previous locale block if regenerating (between markers or known ja entries already present)
    text = re.sub(
        r"\n  <!-- LOCALE_SEO_START -->.*?<!-- LOCALE_SEO_END -->\n",
        "\n",
        text,
        flags=re.S,
    )
    # Also remove earlier hand-added /ja/ blocks to avoid dupes
    text = re.sub(
        r"\n  <url>\n    <loc>https://anamorphic-desqueeze\.com/(?:ja|ko|de|es|pt|zh|hi|fr)/.*?</url>",
        "",
        text,
        flags=re.S,
    )
    block = f"\n  <!-- LOCALE_SEO_START -->\n{locale_urls()}\n  <!-- LOCALE_SEO_END -->\n"
    text = text.replace("</urlset>", block + "</urlset>")
    # Refresh root + anamorphic EN entries with locale alternates
    root_alts = "\n".join(
        [
            '    <xhtml:link rel="alternate" hreflang="en" href="https://anamorphic-desqueeze.com/"/>',
            '    <xhtml:link rel="alternate" hreflang="en-us" href="https://anamorphic-desqueeze.com/"/>',
            '    <xhtml:link rel="alternate" hreflang="x-default" href="https://anamorphic-desqueeze.com/"/>',
        ]
        + [
            f'    <xhtml:link rel="alternate" hreflang="{h}" href="https://anamorphic-desqueeze.com/{c}/"/>'
            for c, h in LOCALES
        ]
    )
    text = re.sub(
        r"(<loc>https://anamorphic-desqueeze\.com/</loc>.*?<priority>1\.0</priority>)(.*?)(  </url>)",
        r"\1\n" + root_alts + r"\n\3",
        text,
        count=1,
        flags=re.S,
    )
    path.write_text(text, encoding="utf-8")
    print("sitemap updated")


def patch_en_hreflang() -> None:
    alts_home = "\n".join(
        [
            '  <link rel="alternate" hreflang="en-us" href="https://anamorphic-desqueeze.com/" />',
            '  <link rel="alternate" hreflang="en-ca" href="https://anamorphic-desqueeze.com/" />',
            '  <link rel="alternate" hreflang="en-gb" href="https://anamorphic-desqueeze.com/" />',
            '  <link rel="alternate" hreflang="en-in" href="https://anamorphic-desqueeze.com/" />',
            '  <link rel="alternate" hreflang="en" href="https://anamorphic-desqueeze.com/" />',
        ]
        + [
            f'  <link rel="alternate" hreflang="{h}" href="https://anamorphic-desqueeze.com/{c}/" />'
            for c, h in LOCALES
        ]
        + ['  <link rel="alternate" hreflang="x-default" href="https://anamorphic-desqueeze.com/" />']
    )
    index = ROOT / "index.html"
    it = index.read_text(encoding="utf-8")
    it = re.sub(
        r'(  <!-- Hreflang:.*?-->\n)(?:  <link rel="alternate" hreflang=.*?\n)+',
        r"\1" + alts_home + "\n",
        it,
        count=1,
        flags=re.S,
    )
    # fallback if comment missing
    if 'hreflang="zh-Hans"' not in it:
        it = re.sub(
            r'(  <link rel="canonical" href="https://anamorphic-desqueeze.com/" />\n)(?:  <link rel="alternate" hreflang=.*?\n)+',
            r"\1" + alts_home + "\n",
            it,
            count=1,
        )
    index.write_text(it, encoding="utf-8")

    alts_ana = "\n".join(
        [
            '  <link rel="alternate" hreflang="en-us" href="https://anamorphic-desqueeze.com/anamorphic.html" />',
            '  <link rel="alternate" hreflang="en-ca" href="https://anamorphic-desqueeze.com/anamorphic.html" />',
            '  <link rel="alternate" hreflang="en-gb" href="https://anamorphic-desqueeze.com/anamorphic.html" />',
            '  <link rel="alternate" hreflang="en" href="https://anamorphic-desqueeze.com/anamorphic.html" />',
        ]
        + [
            f'  <link rel="alternate" hreflang="{h}" href="https://anamorphic-desqueeze.com/{c}/anamorphic.html" />'
            for c, h in LOCALES
        ]
        + [
            '  <link rel="alternate" hreflang="x-default" href="https://anamorphic-desqueeze.com/anamorphic.html" />'
        ]
    )
    ana = ROOT / "anamorphic.html"
    at = ana.read_text(encoding="utf-8")
    at = re.sub(
        r'(  <link rel="canonical" href="https://anamorphic-desqueeze.com/anamorphic.html" />\n)(?:  <link rel="alternate" hreflang=.*?\n)+',
        r"\1" + alts_ana + "\n",
        at,
        count=1,
    )
    ana.write_text(at, encoding="utf-8")
    print("en hreflang updated")


def bump_chrome() -> None:
    for f in ROOT.rglob("*.html"):
        if "dist" in f.parts or ".astro" in f.parts:
            continue
        t = f.read_text(encoding="utf-8")
        n = re.sub(r"site-chrome\.js\?v=\d+", "site-chrome.js?v=16", t)
        if n != t:
            f.write_text(n, encoding="utf-8")
    print("chrome v16 bumped")


if __name__ == "__main__":
    bump_chrome()
    patch_sitemap()
    patch_en_hreflang()
