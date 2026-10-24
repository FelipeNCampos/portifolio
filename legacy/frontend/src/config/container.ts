import { DecideDeliveryValidation } from '../application/contracts/DecideDeliveryValidation'
import { UploadSignedContract } from '../application/contracts/UploadSignedContract'
import { HttpContractRepository } from '../infrastructure/http/HttpContractRepository'

const contracts = new HttpContractRepository()

export const container = {
  contracts,
  uploadSignedContract: new UploadSignedContract(contracts),
  decideDeliveryValidation: new DecideDeliveryValidation(contracts),
}
