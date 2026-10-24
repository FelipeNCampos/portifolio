from datetime import date
from urllib.parse import urlsplit

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator

from backend.application.credentials import CredentialService


class CredentialInput(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    issuer: str = Field(min_length=1, max_length=250)
    completedAt: date | None = None
    hours: int | None = Field(default=None, ge=1, le=10000)
    evidence: str = Field(default="", max_length=1000)
    evidenceLabel: str = Field(default="Abrir comprovante", min_length=1, max_length=100)
    verificationUrl: str | None = Field(default=None, max_length=1000)
    published: bool = True

    @field_validator("title", "issuer")
    @classmethod
    def text(cls, value):
        if not value.strip():
            raise ValueError("Informe um valor.")
        return value.strip()

    @field_validator("evidence", "verificationUrl")
    @classmethod
    def safe_url(cls, value):
        if not value:
            return value
        if any(char in value for char in ("\\", "\n", "\r", "\t")):
            raise ValueError("URL inválida.")
        parsed = urlsplit(value)
        if parsed.scheme in {"https", "http"} and parsed.hostname and not parsed.username:
            return value
        if value.startswith("/credentials/") and not parsed.netloc and not parsed.scheme and ".." not in value and "%" not in value:
            return value
        raise ValueError("Use URL HTTP(S) ou caminho /credentials/.")


def create_credentials_router(service: CredentialService, manager):
    router = APIRouter(prefix="/api")

    @router.get("/credentials")
    def public():
        return service.list_public()

    @router.get("/admin/credentials", dependencies=[Depends(manager)])
    def managed():
        return service.list_managed()

    @router.put("/admin/credentials/{credential_id}", dependencies=[Depends(manager)])
    def save(credential_id: str, body: CredentialInput):
        return service.save(credential_id, body.model_dump(mode="json"))

    return router
