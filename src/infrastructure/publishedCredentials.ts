import type { Credential } from '../domain/publicPortfolio'
import records from './profile/credentials.json'

const credentials: (Credential & { published: boolean })[] = records
export const publishedCredentials: Credential[] = credentials.filter(item => item.published)
