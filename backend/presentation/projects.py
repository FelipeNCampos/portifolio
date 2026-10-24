from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from backend.application.projects import GithubProjects


class PublicRepository(BaseModel):
    name: str
    description: str | None
    language: str | None
    updatedAt: str | None
    url: str


class GithubProjectsResponse(BaseModel):
    status: Literal["live", "cached", "stale", "unavailable"]
    profileUrl: str
    updatedAt: str | None
    repositories: list[PublicRepository]


def create_projects_router(service: GithubProjects):
    router = APIRouter(prefix="/api/projects")

    @router.get("/github", response_model=GithubProjectsResponse)
    def public_repositories():
        return service.list()

    return router
