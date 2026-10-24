import type { Contract } from '../../domain/contracts/Contract'
import type { ContractRepository } from './ContractRepository'

export class DecideDeliveryValidation {
  public constructor(private readonly contracts: ContractRepository) {}

  public execute(
    contractId: string,
    validationId: string,
    decision: 'APPROVED' | 'CHANGES_REQUESTED',
  ): Promise<Contract> {
    return this.contracts.updateValidation(contractId, validationId, decision)
  }
}
