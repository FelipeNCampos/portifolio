import { afterEach, test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { loadCredentials, loadGithubProjects } from '../src/infrastructure/publicPortfolioApi.ts'

afterEach(() => mock.restoreAll())

test('loads real published certificate records from the public API', async () => {
  mock.method(globalThis, 'fetch', async (path: string) => {
    assert.equal(path, '/api/credentials')
    return Response.json([{ id: 'python', title: 'Python', issuer: 'Udemy', evidence: '/credentials/python.pdf', evidenceLabel: 'PDF', published: true }])
  })
  assert.equal((await loadCredentials(new AbortController().signal))[0].title, 'Python')
})

test('rejects unsafe evidence URLs from remote records', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json([{ id: 'x', title: 'x', issuer: 'x', evidence: 'javascript:alert(1)', evidenceLabel: 'x' }]))
  await assert.rejects(loadCredentials(new AbortController().signal))
})

test('keeps explicit GitHub unavailability distinct from an empty repository list', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ status: 'unavailable', profileUrl: 'https://github.com/FelipeNCampos', repositories: [], updatedAt: null }))
  assert.equal((await loadGithubProjects(new AbortController().signal)).status, 'unavailable')
})

test('does not trust repository links or malformed API responses', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ status: 'live', profileUrl: 'https://github.com/FelipeNCampos', updatedAt: null, repositories: [{ name: 'x', url: 'javascript:alert(1)' }] }))
  await assert.rejects(loadGithubProjects(new AbortController().signal))
})

test('HTTP failures remain errors instead of silently becoming empty content', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('Unavailable', { status: 503 }))
  await assert.rejects(loadCredentials(new AbortController().signal))
})
