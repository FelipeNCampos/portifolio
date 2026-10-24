export interface Credential {
  id: string
  title: string
  issuer: string
  completedAt?: string | null
  hours?: number | null
  evidence: string
  evidenceLabel: string
  verificationUrl?: string | null
}

export interface GithubRepository {
  name: string
  url: string
  description: string | null
  language: string | null
  updatedAt: string | null
}

export interface GithubProjects {
  status: 'live' | 'cached' | 'stale' | 'unavailable'
  profileUrl: string
  updatedAt: string | null
  repositories: GithubRepository[]
}
