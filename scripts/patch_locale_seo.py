#!/usr/bin/env python3
"""Rebuild locale sitemap block + EN hreflang for all separate-page locales."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# folder, hreflang
LOCALES = [
    ("ja", "ja"),
    ("ko", "ko"),
    ("de", "de"),
    ("es", "es"),
    ("pt", "pt"),
    ("zh", "zh-Hans"),
    ("zh-tw", "zh-Hant"),
    ("hi", "hi"),
    ("fr", "fr"),
    ("it", "it"),
    ("nl", "nl"),
    ("pl", "pl"),
    ("ru", "ru"),
    ("uk", "uk"),
    ("tr", "tr"),
    ("ar", "ar"),
    ("th", "th"),
    ("vi", "vi"),
    ("id", "id"),
    ("ms", "ms"),
    ("fil", "fil"),
    ("sv", "sv"),
    ("da", "da"),
    ("no", "no"),
    ("fi", "fi"),
    ("cs", "cs"),
    ("ro", "ro"),
    ("hu", "hu"),
    ("el", "el"),
    ("he", "he"),
    ("bn", "bn"),
    ("ta", "ta"),
]


def locale_urls() -> str:
    chunks: list[str] = []
    for code, hreflang in LOCALES:
        for path, pri in (("", "0.96"), ("anamorphic.html", "0.93")):
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
    text = re.sub(
        r"\n  <!-- LOCALE_SEO_START -->.*?<!-- LOCALE_SEO_END -->\n?",
        "\n",
        text,
        flags=re.S,
    )
    # Clean root alternates — rebuild below
    text = re.sub(
        r"(<loc>https://anamorphic-desqueeze\.com/</loc>\s*<lastmod>.*?</lastmod>\s*<changefreq>.*?</changefreq>\s*<priority>1\.0</priority>)(?:\s*<xhtml:link[^>]*>)*",
        r"\1",
        text,
        count=1,
        flags=re.S,
    )
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
        r"(<loc>https://anamorphic-desqueeze\.com/</loc>\s*<lastmod>.*?</lastmod>\s*<changefreq>.*?</changefreq>\s*<priority>1\.0</priority>)",
        r"\1\n" + root_alts,
        text,
        count=1,
        flags=re.S,
    )
    # anamorphic EN alts
    text = re.sub(
        r"(<loc>https://anamorphic-desqueeze\.com/anamorphic\.html</loc>\s*<lastmod>.*?</lastmod>\s*<changefreq>.*?</changefreq>\s*<priority>0\.95</priority>)(?:\s*<xhtml:link[^>]*>)*",
        r"\1",
        text,
        count=1,
        flags=re.S,
    )
    ana_alts = "\n".join(
        [
            '    <xhtml:link rel="alternate" hreflang="en" href="https://anamorphic-desqueeze.com/anamorphic.html"/>',
            '    <xhtml:link rel="alternate" hreflang="x-default" href="https://anamorphic-desqueeze.com/anamorphic.html"/>',
        ]
        + [
            f'    <xhtml:link rel="alternate" hreflang="{h}" href="https://anamorphic-desqueeze.com/{c}/anamorphic.html"/>'
            for c, h in LOCALES
        ]
    )
    text = re.sub(
        r"(<loc>https://anamorphic-desqueeze\.com/anamorphic\.html</loc>\s*<lastmod>.*?</lastmod>\s*<changefreq>.*?</changefreq>\s*<priority>0\.95</priority>)",
        r"\1\n" + ana_alts,
        text,
        count=1,
        flags=re.S,
    )
    block = f"\n  <!-- LOCALE_SEO_START -->\n{locale_urls()}\n  <!-- LOCALE_SEO_END -->\n"
    text = text.replace("</urlset>", block + "</urlset>")
    path.write_text(text, encoding="utf-8")
    print("sitemap ok", len(LOCALES), "locales")


def patch_en_pages() -> None:
    alts_home = "\n".join(
        [
            '  <link rel="alternate" hreflang="en-us" href="https://anamorphic-desqueeze.com/" />',
            '  <link rel="alternate" hreflang="en-ca" href="https://anamorphic-desqueeze.com/" />',
            '  <link rel="alternate" hreflang="en-gb" href="https://anamorphic-desqueeze.com/" />',
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
    it2 = re.sub(
        r'(  <link rel="canonical" href="https://anamorphic-desqueeze.com/" />\n)(?:  <link rel="alternate" hreflang=.*?\n)+',
        r"\1" + alts_home + "\n",
        it,
        count=1,
    )
    if it2 == it:
        it2 = re.sub(
            r'(  <!-- Hreflang:.*?-->\n)(?:  <link rel="alternate" hreflang=.*?\n)+',
            r"\1" + alts_home + "\n",
            it,
            count=1,
            flags=re.S,
        )
    index.write_text(it2, encoding="utf-8")

    alts_ana = "\n".join(
        [
            '  <link rel="alternate" hreflang="en-us" href="https://anamorphic-desqueeze.com/anamorphic.html" />',
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
    print("en hreflang ok")


def bump_chrome() -> None:
    for f in ROOT.rglob("*.html"):
        if "dist" in f.parts or ".astro" in f.parts:
            continue
        t = f.read_text(encoding="utf-8")
        n = re.sub(r"site-chrome\.js\?v=\d+", "site-chrome.js?v=17", t)
        if n != t:
            f.write_text(n, encoding="utf-8")
    print("chrome v17")


if __name__ == "__main__":
    bump_chrome()
    patch_sitemap()
    patch_en_pages()
