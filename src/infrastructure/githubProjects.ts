import type { GithubProjects, GithubRepository } from '../domain/publicPortfolio'
import { initialProfile } from './profile/initialProfile'

const optionalText = (value: unknown): string | null => typeof value === 'string' ? value : null

export async function loadGithubProjects(signal: AbortSignal): Promise<GithubProjects> {
  const username = new URL(initialProfile.github).pathname.split('/')[1]
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&direction=desc&per_page=100`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
    headers: { Accept: 'application/vnd.github+json' },
    credentials: 'omit',
    redirect: 'error',
  })
  if (!response.ok) throw new Error('Não foi possível consultar os repositórios do GitHub.')
  const data: unknown = await response.json()
  if (!Array.isArray(data)) throw new Error('Resposta de repositórios inválida.')

  const repositories: GithubRepository[] = []
  for (const item of data.slice(0, 100)) {
    if (!item || typeof item !== 'object' || typeof item.name !== 'string'
      || !/^[A-Za-z0-9_.-]{1,100}$/.test(item.name) || ['.', '..'].includes(item.name)
      || item.name.toLowerCase() === username.toLowerCase()
      || item.fork !== false || item.private !== false || item.archived !== false) continue
    repositories.push({
      name: item.name,
      url: `https://github.com/${username}/${item.name}`,
      description: optionalText(item.description), language: optionalText(item.language),
      updatedAt: optionalText(item.pushed_at),
    })
  }
  repositories.sort((first, second) => (second.updatedAt || '').localeCompare(first.updatedAt || ''))
  return { status: 'live', profileUrl: initialProfile.github, updatedAt: new Date().toISOString(), repositories }
}
