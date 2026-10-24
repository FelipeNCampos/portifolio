export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_CLIENT_ACCESS'
  | 'UNDER_REVIEW'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED'

export type DeliveryValidationStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED'

export interface SignedDocument {
  readonly fileName: string
  readonly fileSize: number
  readonly uploadedAt: string
}

export interface DeliveryValidation {
  readonly id: string
  readonly title: string
  readonly status: DeliveryValidationStatus
  readonly updatedAt: string
}

export interface Contract {
  readonly id: string
  readonly title: string
  readonly contractorName: string
  readonly value: string
  readonly endsAt: string
  readonly status: ContractStatus
  readonly signedDocument?: SignedDocument
  readonly validations: readonly DeliveryValidation[]
}

export const statusLabel: Record<ContractStatus, string> = {
  DRAFT: 'Rascunho',
  PENDING_CLIENT_ACCESS: 'Aguardando acesso',
  UNDER_REVIEW: 'Em revisão',
  ACTIVE: 'Ativo',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  ARCHIVED: 'Arquivado',
}

export const validationLabel: Record<DeliveryValidationStatus, string> = {
  PENDING: 'Aguardando validação',
  APPROVED: 'Aprovada',
  CHANGES_REQUESTED: 'Ajustes solicitados',
}
