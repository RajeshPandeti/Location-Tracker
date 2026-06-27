import os
import unittest
from unittest.mock import patch

import app


class ResolveBaseUrlTests(unittest.TestCase):
    def test_uses_public_override_when_present(self):
        with patch.dict(os.environ, {"PUBLIC_BASE_URL": "https://example.com"}, clear=False):
            self.assertEqual(
                app.resolve_base_url("localhost:5000", fallback_host="192.168.1.20", port=5000),
                "https://example.com",
            )

    def test_builds_share_link_with_phone(self):
        self.assertEqual(
            app.build_share_link("127.0.0.1:5000", "+919876543210", fallback_host="192.168.1.20", port=5000),
            "http://192.168.1.20:5000/share?phone=%2B919876543210",
        )

    def test_replaces_loopback_host_with_fallback(self):
        self.assertEqual(
            app.resolve_base_url("127.0.0.1:5000", fallback_host="192.168.1.20", port=5000),
            "http://192.168.1.20:5000",
        )

    def test_preserves_non_loopback_host(self):
        self.assertEqual(
            app.resolve_base_url("192.168.0.25:5000", fallback_host="192.168.1.20", port=5000),
            "http://192.168.0.25:5000",
        )


if __name__ == "__main__":
    unittest.main()
