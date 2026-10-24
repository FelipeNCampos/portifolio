import hmac
from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field

from backend.application.auth import AuthService, Session

COOKIE_NAME = "portfolio_session"


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


def manager_dependency(auth: AuthService):
    def manager(request: Request) -> Session:
        session = auth.authenticate(request.cookies.get(COOKIE_NAME, ""))
        if session.role != "manager":
            raise HTTPException(403, "Acesso reservado à gestão.")
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            if not hmac.compare_digest(session.csrf.encode(), request.headers.get("x-csrf-token", "").encode()):
                raise HTTPException(403, "Recarregue a sessão para continuar.")
        return session
    return manager


def create_auth_router(auth: AuthService, secure_cookie: bool):
    router = APIRouter(prefix="/api/auth")
    manager = manager_dependency(auth)

    @router.post("/login")
    def login(body: LoginRequest, request: Request, response: Response):
        # JSON input and origin validation also protect against login CSRF.
        origin = request.headers.get("origin")
        if origin:
            from urllib.parse import urlsplit
            if urlsplit(origin).netloc != request.headers.get("host"):
                raise HTTPException(403, "Origem não autorizada.")
        token, session = auth.login(body.email, body.password, request.client.host if request.client else "unknown")
        response.set_cookie(COOKIE_NAME, token, httponly=True, secure=secure_cookie, samesite="strict", max_age=8 * 3600, path="/api")
        response.headers["Cache-Control"] = "no-store"
        return asdict(session)

    @router.get("/session")
    def current(response: Response, session: Session = Depends(manager)):
        response.headers["Cache-Control"] = "no-store"
        return asdict(session)

    @router.post("/logout", status_code=204)
    def logout(request: Request, response: Response, _session: Session = Depends(manager)):
        auth.logout(request.cookies.get(COOKIE_NAME, ""))
        response.delete_cookie(COOKIE_NAME, path="/api", secure=secure_cookie, httponly=True, samesite="strict")

    return router
