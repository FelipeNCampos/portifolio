from pathlib import PurePosixPath

MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
DECISIONS = frozenset({"APPROVED", "CHANGES_REQUESTED"})


class ContractNotFound(Exception):
    pass


class InvalidContract(ValueError):
    pass


def validate_document(name: str, content: bytes, content_type: str) -> str:
    safe_name = PurePosixPath(name.replace("\\", "/")).name
    if not safe_name.lower().endswith(".pdf") or content_type != "application/pdf":
        raise InvalidContract("Envie um arquivo PDF/PDF-A.")
    if not content or len(content) > MAX_DOCUMENT_BYTES:
        raise InvalidContract("O contrato deve conter dados e ter no máximo 10 MB.")
    if not content.startswith(b"%PDF-") or b"%%EOF" not in content[-1024:]:
        raise InvalidContract("O arquivo não apresenta a estrutura básica de um PDF.")
    return safe_name
