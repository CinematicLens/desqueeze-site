"""
Playwright e2e: crawl same-origin HTML pages, follow internal <a href>,
assert load + structure (h1, main, duplicate ids). Detect duplicate <title>
and duplicate meta descriptions across the site.

Third-party requests are aborted so GA/AdSense do not pollute console errors.
"""
from __future__ import annotations

import socket
import subprocess
import sys
from collections import defaultdict, deque
from pathlib import Path
from urllib.parse import urljoin, urlparse

import pytest
from playwright.sync_api import Page, expect, sync_playwright

ROOT = Path(__file__).resolve().parent.parent

JS_PAGE_AUDIT = r"""
() => {
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id).filter(Boolean);
  const idCounts = {};
  for (const id of ids) { idCounts[id] = (idCounts[id] || 0) + 1; }
  const duplicateIds = Object.keys(idCounts).filter(k => idCounts[k] > 1);

  const title = (document.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim();
  const md = document.querySelector('meta[name="description"]');
  const metaDesc = md ? (md.getAttribute('content') || '').trim() : '';

  return {
    h1Count: document.querySelectorAll('h1').length,
    mainCount: document.querySelectorAll('main').length,
    duplicateIds,
    title,
    metaDesc,
  };
}
"""


def _strip_query_hash(url: str) -> str:
    return url.split("#")[0].split("?")[0]


def _canonical_page_url(url: str, base: str) -> str:
    """Treat / and /index.html as one page for crawl deduplication."""
    u = _strip_query_hash(url)
    if not u.startswith(base):
        return u
    path = urlparse(u).path or "/"
    if path in ("/", "/index.html"):
        return base + "/"
    return u


def _html_seeds(base: str) -> list[str]:
    seeds = [f"{base}/"]
    for f in sorted(ROOT.glob("*.html")):
        if f.name != "index.html":
            seeds.append(f"{base}/{f.name}")
    return seeds


def _same_server(url: str, origin_netloc: str) -> bool:
    p = urlparse(url)
    if p.scheme in ("mailto", "javascript", "tel", "ms-windows-store", "data"):
        return False
    if not p.netloc:
        return True
    return p.netloc == origin_netloc


def _is_crawlable_html_page(abs_url: str, base: str) -> bool:
    if not abs_url.startswith(base):
        return False
    path = urlparse(abs_url).path or "/"
    if path in ("/", ""):
        return True
    return path.endswith(".html")


def _extract_hrefs(page: Page) -> list[str]:
    return page.eval_on_selector_all("a[href]", "els => els.map(a => a.getAttribute('href'))")


@pytest.fixture(scope="session")
def served_site():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        _, port = sock.getsockname()
    script = Path(__file__).resolve().parent / "serve_site.py"
    proc = subprocess.Popen(
        [sys.executable, str(script), str(port)],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    url = f"http://127.0.0.1:{port}"
    import time

    deadline = time.time() + 15
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.3):
                break
        except OSError:
            time.sleep(0.05)
    else:
        proc.terminate()
        pytest.fail("e2e static server did not start")

    try:
        yield url
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=8)
        except subprocess.TimeoutExpired:
            proc.kill()


@pytest.fixture(scope="session")
def browser_ctx(served_site: str):
    base = served_site.rstrip("/")
    origin_netloc = urlparse(served_site).netloc

    def route_handler(route) -> None:
        try:
            host = urlparse(route.request.url).netloc
        except Exception:
            route.abort()
            return
        if host == origin_netloc or host == "":
            route.continue_()
            return
        route.abort()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(base_url=served_site)
        context.route("**/*", route_handler)
        yield context, served_site, origin_netloc
        context.close()
        browser.close()


def test_crawl_internal_links_structure_and_dupes(browser_ctx):
    context, base, origin_netloc = browser_ctx
    seeds = [_canonical_page_url(s, base) for s in _html_seeds(base)]
    queue: deque[str] = deque(dict.fromkeys(seeds))
    seen: set[str] = set()
    titles: defaultdict[str, list[str]] = defaultdict(list)
    meta_descs: defaultdict[str, list[str]] = defaultdict(list)
    failures: list[str] = []

    while queue:
        raw = queue.popleft()
        url = _canonical_page_url(raw, base)
        if url in seen:
            continue
        if not url.startswith(base):
            continue
        seen.add(url)

        page = context.new_page()
        origin_failures: list[str] = []

        def on_request_failed(request) -> None:
            if request.url.startswith(base):
                origin_failures.append(f"{request.url} ({request.failure})")

        page.on("requestfailed", on_request_failed)
        resp = page.goto(url, wait_until="domcontentloaded")
        if resp is not None and not resp.ok:
            failures.append(f"{url}: HTTP {resp.status}")
            page.close()
            continue

        ctype = (resp.headers.get("content-type") if resp else "") or ""
        if "text/html" not in ctype.lower():
            page.close()
            continue

        data = page.evaluate(JS_PAGE_AUDIT)
        if data["h1Count"] != 1:
            failures.append(f"{url}: expected 1 <h1>, found {data['h1Count']}")
        if data["mainCount"] != 1:
            failures.append(f"{url}: expected 1 <main>, found {data['mainCount']}")
        if data["duplicateIds"]:
            failures.append(f"{url}: duplicate element id(s): {data['duplicateIds']}")

        t = data["title"]
        if t:
            titles[t].append(url)
        md = data["metaDesc"]
        if len(md) >= 40:
            meta_descs[md].append(url)

        if origin_failures:
            failures.append(f"{url}: same-origin request failed: {origin_failures[:8]}")

        for href in _extract_hrefs(page):
            if not href or not href.strip() or href.strip().startswith("#"):
                continue
            abs_u = _strip_query_hash(urljoin(url, href))
            if not _same_server(abs_u, origin_netloc):
                continue
            if not abs_u.startswith(base):
                continue
            if not _is_crawlable_html_page(abs_u, base):
                continue
            c = _canonical_page_url(abs_u, base)
            if c not in seen:
                queue.append(abs_u)

        page.close()

    for title, urls in titles.items():
        if len(urls) > 1:
            failures.append(f"Duplicate <title> across pages ({len(urls)}): {title!r} -> {urls}")

    for desc, urls in meta_descs.items():
        if len(urls) > 1:
            failures.append(
                f"Duplicate meta description across {len(urls)} pages "
                f"(first 80 chars): {desc[:80]!r}... -> {urls}"
            )

    assert not failures, "\n".join(failures)


def test_sample_real_clicks_same_tab(browser_ctx):
    """Click same-tab internal links on guides.html (navigation smoke test)."""
    context, base, _ = browser_ctx
    page = context.new_page()
    page.goto(f"{base}/guides.html", wait_until="domcontentloaded")
    for path in ("/how-to-desqueeze-1-33x.html", "/privacy.html"):
        loc = page.locator(f'a[href="{path}"]')
        if loc.count() == 0:
            loc = page.locator(f'a[href="{path.lstrip("/")}"]')
        assert loc.count() > 0, f"missing link {path} on guides"
        expect_url = f"{base}{path}"
        with page.expect_navigation():
            loc.first.click()
        assert _strip_query_hash(page.url) == _strip_query_hash(expect_url)
        page.go_back(wait_until="domcontentloaded")
    page.close()
