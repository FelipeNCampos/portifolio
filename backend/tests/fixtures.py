import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.config.main import create_app
from backend.infrastructure.identity import SqliteIdentityRepository, ScryptPasswords


class AuthFixture(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.database = Path(self.directory.name) / "test.sqlite3"
        self.environment = patch.dict(os.environ, {"APP_DEMO_MODE":"true", "SESSION_COOKIE_SECURE":"false"})
        self.environment.start()
        self.client = TestClient(create_app(self.database))
        SqliteIdentityRepository(self.database).create_manager("manager@example.test", ScryptPasswords().hash("test-manager-password"))
        self.sign_in(self.client)

    def sign_in(self, client):
        response = client.post("/api/auth/login", json={"email":"manager@example.test", "password":"test-manager-password"})
        self.assertEqual(response.status_code, 200)
        client.headers["X-CSRF-Token"] = response.json()["csrf"]

    def tearDown(self):
        self.client.close()
        self.environment.stop()
        self.directory.cleanup()
