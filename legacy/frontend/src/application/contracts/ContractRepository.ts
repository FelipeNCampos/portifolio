import type { Contract } from '../../domain/contracts/Contract'

export interface ContractRepository {
  list(): Promise<readonly Contract[]>
  attachSignedDocument(contractId: string, file: File): Promise<Contract>
  updateValidation(
    contractId: string,
    validationId: string,
    decision: 'APPROVED' | 'CHANGES_REQUESTED',
  ): Promise<Contract>
}
