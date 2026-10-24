from typing import Protocol

from backend.domain.contracts import DECISIONS, InvalidContract, validate_document


class ContractRepository(Protocol):
    def list(self) -> list[dict]: ...
    def attach_document(self, contract_id: str, name: str, content: bytes) -> dict: ...
    def decide(self, contract_id: str, validation_id: str, decision: str) -> dict: ...


class ContractService:
    def __init__(self, contracts: ContractRepository):
        self.contracts = contracts

    def list(self) -> list[dict]:
        return self.contracts.list()

    def upload(self, contract_id: str, name: str, content: bytes, content_type: str) -> dict:
        safe_name = validate_document(name, content, content_type)
        return self.contracts.attach_document(contract_id, safe_name, content)

    def decide(self, contract_id: str, validation_id: str, decision: str) -> dict:
        if decision not in DECISIONS:
            raise InvalidContract("Decisão inválida.")
        return self.contracts.decide(contract_id, validation_id, decision)
