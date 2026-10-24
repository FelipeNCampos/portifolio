import json
import sqlite3
from contextlib import closing
from pathlib import Path


class SqliteCredentialRepository:
    def __init__(self, path: Path):
        self.path = path
        with closing(sqlite3.connect(path)) as db, db:
            db.execute("CREATE TABLE IF NOT EXISTS credentials (id TEXT PRIMARY KEY, payload TEXT NOT NULL)")
            seed = json.loads(Path(__file__).with_name("credential_seed.json").read_text(encoding="utf-8"))
            for item in seed:
                db.execute("INSERT OR IGNORE INTO credentials VALUES (?, ?)", (item["id"], json.dumps(item)))

    def list(self, include_private: bool = False):
        with closing(sqlite3.connect(self.path)) as db:
            items = [json.loads(row[0]) for row in db.execute("SELECT payload FROM credentials ORDER BY rowid")]
        return items if include_private else [item for item in items if item["published"]]

    def save(self, credential_id: str, data: dict):
        item = {**data, "id": credential_id}
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("INSERT INTO credentials VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload", (credential_id, json.dumps(item)))
        return item
