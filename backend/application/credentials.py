from typing import Protocol


class CredentialRepository(Protocol):
    def list(self, include_private: bool = False) -> list[dict]: ...
    def save(self, credential_id: str, data: dict) -> dict: ...


class CredentialService:
    def __init__(self, repository: CredentialRepository):
        self.repository = repository

    def list_public(self):
        return self.repository.list()

    def list_managed(self):
        return self.repository.list(include_private=True)

    def save(self, credential_id: str, data: dict):
        return self.repository.save(credential_id, data)
