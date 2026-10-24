import sqlite3
from contextlib import closing

from fastapi.testclient import TestClient

from backend.config.main import create_app
from backend.tests.fixtures import AuthFixture


class AuthTests(AuthFixture):
    def test_management_requires_authentication(self):
        with TestClient(create_app(self.database)) as anonymous:
            for route in ("/api/contracts", "/api/admin/credentials", "/api/auth/session"):
                self.assertEqual(anonymous.get(route).status_code, 401)
            self.assertEqual(anonymous.post("/api/contracts/contract-portal/documents", content=b"invalid").status_code, 401)
            self.assertEqual(anonymous.put("/api/admin/credentials/new", json={"title":"A", "issuer":"B"}).status_code, 401)
            self.assertEqual(anonymous.get("/api/credentials").status_code, 200)

    def test_mutations_require_csrf(self):
        self.client.headers.pop("X-CSRF-Token")
        self.assertEqual(self.client.put("/api/admin/credentials/test", json={"title":"A", "issuer":"B"}).status_code, 403)

    def test_cookie_and_password_storage(self):
        response = self.client.post("/api/auth/login", json={"email":"manager@example.test", "password":"test-manager-password"})
        cookie = response.headers["set-cookie"]
        self.assertIn("HttpOnly", cookie)
        self.assertIn("SameSite=strict", cookie)
        with closing(sqlite3.connect(self.database)) as db:
            encoded = db.execute("SELECT password_hash FROM accounts").fetchone()[0]
            self.assertTrue(encoded.startswith("scrypt$"))
            self.assertNotIn("test-manager-password", encoded)
            digest = db.execute("SELECT digest FROM sessions LIMIT 1").fetchone()[0]
            self.assertEqual(len(digest), 64)

    def test_logout_revokes_session(self):
        token = self.client.cookies.get("portfolio_session")
        self.assertEqual(self.client.post("/api/auth/logout").status_code, 204)
        self.client.cookies.set("portfolio_session", token)
        self.assertEqual(self.client.get("/api/auth/session").status_code, 401)

    def test_expired_session_is_rejected(self):
        with closing(sqlite3.connect(self.database)) as db, db:
            db.execute("UPDATE sessions SET expires=0")
        self.assertEqual(self.client.get("/api/contracts").status_code, 401)

    def test_wrong_password_and_unknown_account_have_same_error(self):
        one = self.client.post("/api/auth/login", json={"email":"manager@example.test", "password":"wrong"})
        two = self.client.post("/api/auth/login", json={"email":"unknown@example.test", "password":"wrong"})
        self.assertEqual(one.status_code, 401)
        self.assertEqual(one.json(), two.json())

    def test_brute_force_is_limited(self):
        for _ in range(4):
            self.assertEqual(self.client.post("/api/auth/login", json={"email":"manager@example.test", "password":"wrong"}).status_code, 401)
        self.assertEqual(self.client.post("/api/auth/login", json={"email":"manager@example.test", "password":"wrong"}).status_code, 429)

    def test_login_rejects_other_origin(self):
        self.assertEqual(self.client.post("/api/auth/login", json={"email":"manager@example.test", "password":"test-manager-password"}, headers={"origin":"https://untrusted.example"}).status_code, 403)

    def test_other_role_cannot_manage(self):
        with closing(sqlite3.connect(self.database)) as db, db:
            db.execute("UPDATE accounts SET role='contractor'")
        self.assertEqual(self.client.get("/api/admin/credentials").status_code, 403)
        self.assertEqual(self.client.get("/api/contracts").status_code, 403)

    def test_manage_publication_and_persist(self):
        body = {"title":"Certificado de teste", "issuer":"Emissor", "published":False, "evidence":"/credentials/example.pdf"}
        self.assertEqual(self.client.put("/api/admin/credentials/test-credential", json=body).status_code, 200)
        self.assertNotIn("test-credential", [item["id"] for item in self.client.get("/api/credentials").json()])
        body.update(published=True, title="Título revisado")
        self.assertEqual(self.client.put("/api/admin/credentials/test-credential", json=body).status_code, 200)
        with TestClient(create_app(self.database)) as restarted:
            item = next(item for item in restarted.get("/api/credentials").json() if item["id"]=="test-credential")
            self.assertEqual(item["title"], "Título revisado")

    def test_dangerous_evidence_links_are_rejected(self):
        body = {"title":"A", "issuer":"B", "evidence":"javascript:alert(1)"}
        self.assertEqual(self.client.put("/api/admin/credentials/unsafe", json=body).status_code, 422)
