from urllib.parse import unquote

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from backend.application.contracts import ContractService
from backend.domain.contracts import MAX_DOCUMENT_BYTES


class DeliveryDecision(BaseModel):
    decision: str


def create_router(service: ContractService, manager) -> APIRouter:
    router = APIRouter(prefix="/api")

    @router.get("/health")
    def health():
        return {"status": "ok", "mode": "local-demo"}

    @router.get("/contracts", dependencies=[Depends(manager)])
    def list_contracts():
        return service.list()

    @router.post("/contracts/{contract_id}/documents", dependencies=[Depends(manager)])
    async def upload(contract_id: str, request: Request):
        content = bytearray()
        async for chunk in request.stream():
            content.extend(chunk)
            if len(content) > MAX_DOCUMENT_BYTES:
                raise HTTPException(413, "O contrato deve ter no máximo 10 MB.")
        return await run_in_threadpool(
            service.upload, contract_id,
            unquote(request.headers.get("x-file-name", "")), bytes(content),
            request.headers.get("content-type", ""),
        )

    @router.post("/contracts/{contract_id}/validations/{validation_id}/decision", dependencies=[Depends(manager)])
    def decide(contract_id: str, validation_id: str, body: DeliveryDecision):
        return service.decide(contract_id, validation_id, body.decision)

    return router
