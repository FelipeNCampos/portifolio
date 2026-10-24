import hashlib
import secrets
import time
from dataclasses import dataclass
from typing import Protocol


class AuthenticationError(Exception):
    pass


class LoginThrottled(Exception):
    pass


@dataclass(frozen=True)
class Session:
    email: str
    role: str
    csrf: str


class IdentityRepository(Protocol):
    def account(self, email: str) -> dict | None: ...
    def record_attempt(self, key: str, now: float) -> bool: ...
    def save_session(self, digest: str, email: str, csrf: str, expires: float): ...
    def session(self, digest: str, now: float) -> dict | None: ...
    def revoke(self, digest: str): ...


class PasswordHasher(Protocol):
    def verify(self, password: str, encoded: str) -> bool: ...


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:
    def __init__(self, store: IdentityRepository, passwords: PasswordHasher):
        self.store = store
        self.passwords = passwords

    def login(self, email: str, password: str, remote: str) -> tuple[str, Session]:
        email = email.strip().lower()
        if not self.store.record_attempt(token_digest(remote), time.time()):
            raise LoginThrottled("Muitas tentativas. Tente novamente em 15 minutos.")
        account = self.store.account(email)
        valid = self.passwords.verify(password, account["password_hash"] if account else "")
        if not valid or not account:
            raise AuthenticationError("E-mail ou senha inválidos.")
        token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        self.store.save_session(token_digest(token), email, csrf, time.time() + 8 * 3600)
        return token, Session(email, account["role"], csrf)

    def authenticate(self, token: str) -> Session:
        session = self.store.session(token_digest(token), time.time())
        if not session:
            raise AuthenticationError("Entre na sua conta para continuar.")
        return Session(session["email"], session["role"], session["csrf"])

    def logout(self, token: str):
        self.store.revoke(token_digest(token))
