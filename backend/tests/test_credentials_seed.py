import tempfile
import unittest
from pathlib import Path

from backend.infrastructure.credentials import SqliteCredentialRepository


class CredentialSeedTests(unittest.TestCase):
    def test_new_credentials_are_published_without_overwriting_manager_changes(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "credentials.sqlite3"
            repository = SqliteCredentialRepository(path)
            cloud = next(item for item in repository.list() if item["id"] == "cloud-practitioner")
            repository.save(cloud["id"], {**cloud, "title": "Título personalizado", "published": False})

            restarted = SqliteCredentialRepository(path)
            public = {item["id"]: item for item in restarted.list()}
            managed = {item["id"]: item for item in restarted.list(include_private=True)}
            self.assertEqual(len(managed), 19)
            self.assertEqual(managed["cloud-practitioner"]["title"], "Título personalizado")
            self.assertNotIn("cloud-practitioner", public)
            self.assertEqual(public["harvard-cs50"]["title"], "Harvard CS50: Introduction to Computer Science")
            self.assertNotIn("completedAt", public["harvard-cs50"])
            self.assertEqual(public["developer-practice-dva-c02"]["completedAt"], "2026-10-23")
