import hashlib
import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from backend.domain.contracts import ContractNotFound, InvalidContract
from backend.infrastructure.seed import CONTRACTS


class SqliteContractRepository:
    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS contracts (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS documents (
                    id INTEGER PRIMARY KEY, contract_id TEXT NOT NULL REFERENCES contracts(id),
                    name TEXT NOT NULL, content BLOB NOT NULL, sha256 TEXT NOT NULL, uploaded_at TEXT NOT NULL
                );
            """)
            for contract in CONTRACTS:
                db.execute("INSERT OR IGNORE INTO contracts VALUES (?, ?)", (contract["id"], json.dumps(contract)))

    @contextmanager
    def _connect(self):
        db = sqlite3.connect(self.path)
        try:
            db.execute("PRAGMA foreign_keys = ON")
            with db:
                yield db
        finally:
            db.close()

    def list(self) -> list[dict]:
        with self._connect() as db:
            return [json.loads(row[0]) for row in db.execute("SELECT payload FROM contracts ORDER BY rowid")]

    def _get(self, db, contract_id: str) -> dict:
        row = db.execute("SELECT payload FROM contracts WHERE id = ?", (contract_id,)).fetchone()
        if row is None:
            raise ContractNotFound("Contrato não encontrado.")
        return json.loads(row[0])

    def attach_document(self, contract_id: str, name: str, content: bytes) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        digest = hashlib.sha256(content).hexdigest()
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            contract = self._get(db, contract_id)
            cursor = db.execute(
                "INSERT INTO documents (contract_id, name, content, sha256, uploaded_at) VALUES (?, ?, ?, ?, ?)",
                (contract_id, name, content, digest, now),
            )
            contract["signedDocument"] = {"fileName": name, "fileSize": len(content), "uploadedAt": now, "sha256": digest, "versionId": cursor.lastrowid}
            db.execute("UPDATE contracts SET payload = ? WHERE id = ?", (json.dumps(contract), contract_id))
            return contract

    def decide(self, contract_id: str, validation_id: str, decision: str) -> dict:
        with self._connect() as db:
            db.execute("BEGIN IMMEDIATE")
            contract = self._get(db, contract_id)
            validation = next((item for item in contract["validations"] if item["id"] == validation_id), None)
            if validation is None:
                raise ContractNotFound("Validação não encontrada neste contrato.")
            if validation["status"] != "PENDING":
                raise InvalidContract("Esta entrega já foi decidida.")
            validation.update(status=decision, updatedAt=datetime.now(timezone.utc).isoformat())
            db.execute("UPDATE contracts SET payload = ? WHERE id = ?", (json.dumps(contract), contract_id))
            return contract
