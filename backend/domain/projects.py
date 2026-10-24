from typing import Literal, Protocol, TypedDict


class Repository(TypedDict):
    name: str
    description: str | None
    language: str | None
    pushed_at: str | None
    fork: bool
    private: bool
    archived: bool


class RepositorySnapshot(TypedDict):
    status: Literal["live", "cached", "stale", "unavailable"]
    repositories: list[Repository]
    updatedAt: str | None


class RepositoryFeed(Protocol):
    username: str

    def read(self) -> RepositorySnapshot: ...
