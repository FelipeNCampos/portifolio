import type { Credential, GithubProjects } from '../domain/publicPortfolio'

type RecordValue = Record<string, unknown>
const isRecord = (value: unknown): value is RecordValue => typeof value === 'object' && value !== null
const optionalText = (value: unknown) => value == null || typeof value === 'string'

function safeEvidence(value: unknown): value is string {
  if (typeof value !== 'string' || /[\\\s]/.test(value)) return false
  if (value.startsWith('/credentials/')) return !value.includes('..') && !value.includes('%')
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
  } catch { return false }
}

function githubUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'github.com' && !url.username && !url.password
  } catch { return false }
}

async function getJson(path: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(path, { signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]), headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Não foi possível carregar os dados.')
  return response.json()
}

export async function loadCredentials(signal: AbortSignal): Promise<Credential[]> {
  const data = await getJson('/api/credentials', signal)
  if (!Array.isArray(data) || !data.every(item => isRecord(item)
    && ['id', 'title', 'issuer', 'evidenceLabel'].every(key => typeof item[key] === 'string')
    && (item.evidence === '' || safeEvidence(item.evidence))
    && (!item.verificationUrl || safeEvidence(item.verificationUrl))
    && optionalText(item.completedAt)
    && (item.hours == null || typeof item.hours === 'number'))) {
    throw new Error('Resposta de certificados inválida.')
  }
  return data as Credential[]
}

export async function loadGithubProjects(signal: AbortSignal): Promise<GithubProjects> {
  const data = await getJson('/api/projects/github', signal)
  if (!isRecord(data) || !['live', 'cached', 'stale', 'unavailable'].includes(String(data.status))
    || !githubUrl(data.profileUrl) || !optionalText(data.updatedAt)
    || !Array.isArray(data.repositories) || !data.repositories.every(repo => isRecord(repo)
      && typeof repo.name === 'string' && githubUrl(repo.url)
      && optionalText(repo.description) && optionalText(repo.language) && optionalText(repo.updatedAt))) {
    throw new Error('Resposta de projetos inválida.')
  }
  return data as unknown as GithubProjects
}
