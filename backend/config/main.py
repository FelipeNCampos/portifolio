import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.application.contracts import ContractService
from backend.domain.contracts import ContractNotFound, InvalidContract
from backend.infrastructure.sqlite_contracts import SqliteContractRepository
from backend.presentation.api import create_router
from backend.application.auth import AuthService, AuthenticationError, LoginThrottled
from backend.application.credentials import CredentialService
from backend.infrastructure.identity import SqliteIdentityRepository, ScryptPasswords
from backend.infrastructure.credentials import SqliteCredentialRepository
from backend.presentation.auth import create_auth_router, manager_dependency
from backend.presentation.credentials import create_credentials_router
from backend.config.settings import database_location
from backend.application.projects import GithubProjects
from backend.infrastructure.github import GithubRepositoryFeed
from backend.presentation.projects import create_projects_router


def create_app(database_path: Path | None = None) -> FastAPI:
    if os.environ.get("APP_DEMO_MODE") != "true":
        raise RuntimeError("Ative APP_DEMO_MODE=true para executar a API local com dados fictícios.")
    path = database_path or database_location()
    is_dev = os.environ.get("APP_ENV", "development") == "development"
    app = FastAPI(
        title="Portfólio — API local de demonstração", version="0.1.0",
        docs_url="/docs" if is_dev else None,
        redoc_url="/redoc" if is_dev else None,
        openapi_url="/openapi.json" if is_dev else None,
    )
    service = ContractService(SqliteContractRepository(path))
    auth = AuthService(SqliteIdentityRepository(path), ScryptPasswords())
    manager = manager_dependency(auth)
    app.include_router(create_auth_router(auth, os.environ.get("SESSION_COOKIE_SECURE") == "true"))
    app.include_router(create_router(service, manager))
    app.include_router(create_credentials_router(CredentialService(SqliteCredentialRepository(path)), manager))
    app.include_router(create_projects_router(GithubProjects(
        GithubRepositoryFeed(os.environ.get("GITHUB_USERNAME", "FelipeNCampos")),
    )))

    @app.middleware("http")
    async def private_responses(request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
            response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @app.exception_handler(AuthenticationError)
    async def unauthorized(_request: Request, exc: AuthenticationError):
        return JSONResponse(status_code=401, content={"detail": str(exc)})

    @app.exception_handler(LoginThrottled)
    async def throttled(_request: Request, exc: LoginThrottled):
        return JSONResponse(status_code=429, content={"detail": str(exc)}, headers={"Retry-After": "900"})

    @app.exception_handler(ContractNotFound)
    async def missing(_request: Request, exc: ContractNotFound):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(InvalidContract)
    async def invalid(_request: Request, exc: InvalidContract):
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    return app
