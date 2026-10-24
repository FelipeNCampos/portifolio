import os
from pathlib import Path


def database_location() -> Path:
    return Path(os.environ.get("DATABASE_PATH", str(Path(__file__).resolve().parents[1] / "data" / "demo.sqlite3")))
