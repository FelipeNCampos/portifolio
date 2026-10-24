import argparse
import getpass
import sqlite3

from backend.config.settings import database_location
from backend.infrastructure.identity import ScryptPasswords, SqliteIdentityRepository


def main():
    parser = argparse.ArgumentParser(description="Cria o administrador local sem senha padrão.")
    parser.add_argument("--email", required=True)
    args = parser.parse_args()
    if "@" not in args.email or len(args.email) > 254:
        parser.error("Informe um e-mail válido.")
    password = getpass.getpass("Senha (12 a 128 caracteres): ")
    if password != getpass.getpass("Confirme a senha: "):
        parser.error("As senhas não conferem.")
    try:
        encoded = ScryptPasswords().hash(password)
        SqliteIdentityRepository(database_location()).create_manager(args.email, encoded)
    except (ValueError, sqlite3.IntegrityError) as exc:
        parser.error("Conta já existente ou senha inválida: " + str(exc))
    print("Administrador criado. Entre pela área de gestão.")


if __name__ == "__main__":
    main()
