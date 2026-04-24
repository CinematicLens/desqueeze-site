"""Unit tests for scripts/validate_site.py — run: python -m unittest discover -s tests -p 'test_*.py'"""
from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _load_validator():
    path = ROOT / "scripts" / "validate_site.py"
    spec = importlib.util.spec_from_file_location("validate_site", path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    sys.modules["validate_site"] = mod
    spec.loader.exec_module(mod)
    return mod


class TestValidateSite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.v = _load_validator()

    def test_style_css_exists(self):
        self.assertEqual(self.v.test_style_css_exists(), [])

    def test_single_h1(self):
        self.assertEqual(self.v.test_single_h1(), [], "each HTML page must have exactly one <h1>")

    def test_single_main_landmark(self):
        self.assertEqual(
            self.v.test_single_main_landmark(),
            [],
            "each HTML page must have exactly one <main> landmark",
        )

    def test_stylesheet_version(self):
        self.assertEqual(self.v.test_stylesheet_version(), [])

    def test_page_document_usability(self):
        self.assertEqual(
            self.v.test_page_document_usability(),
            [],
            "lang, viewport, title, and meta description checks per page",
        )

    def test_internal_links(self):
        self.assertEqual(self.v.test_internal_links(), [])

    def test_local_images_usability(self):
        self.assertEqual(self.v.test_local_images_usability(), [])

    def test_video_poster_paths(self):
        self.assertEqual(self.v.test_video_poster_paths(), [])

    def test_flagship_image_path(self):
        self.assertEqual(self.v.test_flagship_image_path(), [])

    def test_main_exit_zero(self):
        self.assertEqual(self.v.main(), 0)


if __name__ == "__main__":
    unittest.main()
