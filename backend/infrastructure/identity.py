import hashlib
import hmac
import secrets
import sqlite3
from contextlib import closing
from pathlib import Path


class ScryptPasswords:
    def hash(self, password: str) -> str:
        if not 12 <= len(password) <= 128:
            raise ValueError("A senha deve ter entre 12 e 128 caracteres.")
        salt = secrets.token_bytes(16)
        digest = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1)
        return f"scrypt${salt.hex()}${digest.hex()}"

    def verify(self, password: str, encoded: str) -> bool:
        if not encoded:
            hashlib.scrypt(password.encode(), salt=b"unknown-account!", n=16384, r=8, p=1)
            return False
        try:
            algorithm, salt, digest = encoded.split("$")
            if algorithm != "scrypt":
                return False
            actual = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1)
            return hmac.compare_digest(actual, bytes.fromhex(digest))
        except ValueError:
            return False


class SqliteIdentityRepository:
    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        with closing(sqlite3.connect(path)) as db, db:
            db.executescript('''
                CREATE TABLE IF NOT EXISTS accounts (email TEXT PRIMARY KEY, password_hash TEXT NOT NULL, role TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS sessions (digest TEXT PRIMARY KEY, email TEXT NOT NULL, csrf TEXT NOT NULL, expires REAL NOT NULL);
                CREATE TABLE IF NOT EXISTS login_attempts (remote TEXT NOT NULL, attempted REAL NOT NULL);
            ''')

    def create_manager(self, email: str, password_hash: str):
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("INSERT INTO accounts VALUES (?, ?, 'manager')", (email.strip().lower(), password_hash))

    def account(self, email: str):
        with closing(sqlite3.connect(self.path)) as db:
            db.row_factory = sqlite3.Row
            row = db.execute("SELECT * FROM accounts WHERE email=?", (email,)).fetchone()
            return dict(row) if row else None

    def record_attempt(self, key: str, now: float) -> bool:
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("BEGIN IMMEDIATE")
            db.execute("DELETE FROM login_attempts WHERE attempted < ?", (now - 900,))
            count = db.execute("SELECT COUNT(*) FROM login_attempts WHERE remote=?", (key,)).fetchone()[0]
            if count >= 5:
                return False
            db.execute("INSERT INTO login_attempts VALUES (?, ?)", (key, now))
            return True

    def save_session(self, digest: str, email: str, csrf: str, expires: float):
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("DELETE FROM sessions WHERE expires < ?", (expires - 8 * 3600,))
            db.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (digest, email, csrf, expires))

    def session(self, digest: str, now: float):
        with closing(sqlite3.connect(self.path)) as db:
            db.row_factory = sqlite3.Row
            row = db.execute("SELECT s.email, s.csrf, a.role FROM sessions s JOIN accounts a ON a.email=s.email WHERE digest=? AND expires>?", (digest, now)).fetchone()
            return dict(row) if row else None

    def revoke(self, digest: str):
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("DELETE FROM sessions WHERE digest=?", (digest,))
