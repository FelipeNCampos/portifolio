import json
import re
import time
from copy import deepcopy
from datetime import datetime, timezone
from http.client import HTTPException
from threading import Lock
from urllib.error import URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

from backend.domain.projects import Repository, RepositorySnapshot


class NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch_repositories(username: str) -> list:
    request = Request(
        f"https://api.github.com/users/{username}/repos?sort=pushed&direction=desc&per_page=100",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "FelipePortfolio",
            "X-GitHub-Api-Version": "2026-03-10",
        },
    )
    with build_opener(NoRedirects()).open(request, timeout=4) as response:
        body = response.read(2 * 1024 * 1024 + 1)
    if len(body) > 2 * 1024 * 1024:
        raise ValueError("GitHub response exceeds limit")
    return json.loads(body)


def validated_repositories(payload) -> list[Repository]:
    if not isinstance(payload, list):
        raise ValueError("Expected a GitHub repository list")
    repositories = []
    for item in payload[:100]:
        if not isinstance(item, dict):
            continue
        name = item.get("name")
        if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}", name) or name in {".", ".."}:
            continue
        def text_field(key, limit):
            value = item.get(key)
            return value[:limit] if isinstance(value, str) else None

        repositories.append(Repository(
            name=name, description=text_field("description", 1000),
            language=text_field("language", 100), pushed_at=text_field("pushed_at", 30),
            fork=item.get("fork", False) is not False,
            private=item.get("private", False) is not False,
            archived=item.get("archived", False) is not False,
        ))
    return repositories


class GithubRepositoryFeed:
    """Bounded public feed: 15-minute cache, 5-minute failure backoff, no credentials."""

    def __init__(self, username: str, fetch=fetch_repositories, clock=time.monotonic):
        if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?", username):
            raise ValueError("Invalid GitHub username")
        self.username = username
        self._fetch = fetch
        self._clock = clock
        self._snapshot: RepositorySnapshot = {"status": "unavailable", "repositories": [], "updatedAt": None}
        self._next_refresh = 0.0
        self._lock = Lock()

    def read(self) -> RepositorySnapshot:
        with self._lock:
            now = self._clock()
            if now < self._next_refresh:
                cached = deepcopy(self._snapshot)
                if cached["status"] == "live":
                    cached["status"] = "cached"
                return cached
            try:
                repositories = validated_repositories(self._fetch(self.username))
            except (URLError, OSError, ValueError, HTTPException):
                self._snapshot["status"] = "stale" if self._snapshot["updatedAt"] else "unavailable"
                self._next_refresh = now + 300
            else:
                self._snapshot = {
                    "status": "live", "repositories": repositories,
                    "updatedAt": datetime.now(timezone.utc).isoformat(),
                }
                self._next_refresh = now + 900
            return deepcopy(self._snapshot)
