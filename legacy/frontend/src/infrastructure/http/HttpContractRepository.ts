import type { Contract } from '../../domain/contracts/Contract'
import type { ContractRepository } from '../../application/contracts/ContractRepository'
import { apiRequest } from './api'

export class HttpContractRepository implements ContractRepository {
  public list(): Promise<readonly Contract[]> {
    return this.request('/api/contracts')
  }

  public attachSignedDocument(contractId: string, file: File): Promise<Contract> {
    return this.request(`/api/contracts/${encodeURIComponent(contractId)}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/pdf', 'X-File-Name': encodeURIComponent(file.name) },
      body: file,
    })
  }

  public updateValidation(contractId: string, validationId: string, decision: 'APPROVED' | 'CHANGES_REQUESTED'): Promise<Contract> {
    return this.request(`/api/contracts/${encodeURIComponent(contractId)}/validations/${encodeURIComponent(validationId)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    })
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    return apiRequest<T>(path, options)
  }
}
