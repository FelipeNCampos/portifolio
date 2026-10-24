const maximumFileSizeInBytes = 10 * 1024 * 1024

export interface FileMetadata {
  readonly name: string
  readonly size: number
  readonly type: string
}

export interface FileValidationResult {
  readonly isValid: boolean
  readonly error?: string
}

export function validateSignedContract(file: FileMetadata): FileValidationResult {
  if (!isPdf(file)) {
    return { isValid: false, error: 'Envie um arquivo em PDF ou PDF/A.' }
  }

  if (file.size > maximumFileSizeInBytes) {
    return { isValid: false, error: 'O contrato deve ter no máximo 10 MB.' }
  }

  return { isValid: true }
}

function isPdf(file: FileMetadata): boolean {
  const hasPdfExtension = file.name.toLowerCase().endsWith('.pdf')
  const hasAllowedMimeType = !file.type || file.type === 'application/pdf'

  return hasPdfExtension && hasAllowedMimeType
}
