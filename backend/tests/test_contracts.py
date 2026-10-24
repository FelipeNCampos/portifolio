import os
import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.config.main import create_app
from backend.tests.fixtures import AuthFixture

PDF = b"%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"


class ContractApiTests(AuthFixture):

    def upload(self, content=PDF, name="contrato.pdf"):
        return self.client.post("/api/contracts/contract-portal/documents", content=content,
                                headers={"content-type": "application/pdf", "x-file-name": name})

    def test_upload_persists_bytes_and_versions_across_restart(self):
        first = self.upload().json()["signedDocument"]
        second = self.upload().json()["signedDocument"]
        self.assertNotEqual(first["versionId"], second["versionId"])
        with TestClient(create_app(self.database)) as restarted:
            self.sign_in(restarted)
            document = restarted.get("/api/contracts").json()[0]["signedDocument"]
            self.assertEqual(document["sha256"], first["sha256"])
        import sqlite3
        with closing(sqlite3.connect(self.database)) as db:
            self.assertEqual(db.execute("SELECT content FROM documents LIMIT 1").fetchone()[0], PDF)

    def test_rejects_forged_pdf(self):
        self.assertEqual(self.upload(b"not a pdf").status_code, 422)

    def test_rejects_oversized_upload(self):
        self.assertEqual(self.upload(PDF + b"x" * (10 * 1024 * 1024)).status_code, 413)

    def test_missing_contract_cannot_receive_document(self):
        response = self.client.post("/api/contracts/missing/documents", content=PDF,
                                    headers={"content-type": "application/pdf", "x-file-name": "a.pdf"})
        self.assertEqual(response.status_code, 404)

    def test_decision_is_persisted_and_cannot_be_repeated(self):
        path = "/api/contracts/contract-portal/validations/validation-prototype/decision"
        self.assertEqual(self.client.post(path, json={"decision": "APPROVED"}).status_code, 200)
        self.assertEqual(self.client.post(path, json={"decision": "APPROVED"}).status_code, 422)
        self.assertEqual(self.client.get("/api/contracts").json()[0]["validations"][1]["status"], "APPROVED")

    def test_cannot_decide_validation_of_other_contract(self):
        path = "/api/contracts/contract-data/validations/validation-prototype/decision"
        self.assertEqual(self.client.post(path, json={"decision": "APPROVED"}).status_code, 404)

    def test_demo_mode_must_be_explicit(self):
        with patch.dict(os.environ, {"APP_DEMO_MODE": "false"}):
            with self.assertRaises(RuntimeError):
                create_app(self.database)

    def test_production_disables_documentation(self):
        with patch.dict(os.environ, {"APP_ENV": "production"}):
            with TestClient(create_app(self.database)) as client:
                for path in ("/docs", "/redoc", "/openapi.json"):
                    self.assertEqual(client.get(path).status_code, 404)
                self.assertEqual(client.get("/api/health").status_code, 200)

    def test_development_exposes_documentation(self):
        with patch.dict(os.environ, {"APP_ENV": "development"}):
            with TestClient(create_app(self.database)) as client:
                self.assertEqual(client.get("/docs").status_code, 200)

    def test_database_path_can_be_configured(self):
        path = Path(self.directory.name) / "volume" / "contracts.sqlite3"
        with patch.dict(os.environ, {"DATABASE_PATH": str(path)}):
            with TestClient(create_app()) as client:
                self.assertEqual(client.get("/api/health").status_code, 200)
        self.assertTrue(path.is_file())


if __name__ == "__main__":
    unittest.main()
