import type { Contract } from '../../domain/contracts/Contract'
import { validateSignedContract } from '../../domain/contracts/validateSignedContract'
import type { ContractRepository } from './ContractRepository'

export class UploadSignedContract {
  public constructor(private readonly contracts: ContractRepository) {}

  public async execute(contractId: string, file: File): Promise<Contract> {
    const validation = validateSignedContract(file)

    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    return this.contracts.attachSignedDocument(contractId, file)
  }
}
