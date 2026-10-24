import { before, after, afterEach, test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

let server
let loadGithubProjects
before(async () => {
  server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  ;({ loadGithubProjects } = await server.ssrLoadModule('/src/infrastructure/githubProjects.ts'))
})
after(async () => { await server?.close() })
afterEach(() => mock.restoreAll())

const repository = (name, extra = {}) => ({ name, fork: false, private: false, archived: false, description: 'Description', language: 'Python', pushed_at: '2026-10-20T00:00:00Z', ...extra })

test('loads public GitHub repositories directly without tokens or a local API', async () => {
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.github.com/users/FelipeNCampos/repos?sort=pushed&direction=desc&per_page=100')
    assert.equal(options.credentials, 'omit')
    assert.equal(new Headers(options.headers).get('authorization'), null)
    return Response.json([repository('project')])
  })
  const result = await loadGithubProjects(new AbortController().signal)
  assert.equal(result.status, 'live')
  assert.equal(result.repositories[0].url, 'https://github.com/FelipeNCampos/project')
})

test('filters forks, archived, private and profile repositories and sorts by push date', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json([
    repository('old'), repository('new', { pushed_at: '2026-10-24T00:00:00Z' }),
    repository('fork', { fork: true }), repository('private', { private: true }),
    repository('archived', { archived: true }), repository('felipencampos'),
  ]))
  const result = await loadGithubProjects(new AbortController().signal)
  assert.deepEqual(result.repositories.map(item => item.name), ['new', 'old'])
})

test('ignores unsafe names and constructs trusted repository URLs instead of trusting HTML links', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json([
    repository('../unsafe'), repository('safe', { html_url: 'javascript:alert(1)' }),
  ]))
  const result = await loadGithubProjects(new AbortController().signal)
  assert.equal(result.repositories.length, 1)
  assert.equal(result.repositories[0].url, 'https://github.com/FelipeNCampos/safe')
})

test('keeps rate limits and malformed payloads distinct from an empty public profile', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => new Response('Rate limited', { status: 403 }))
  await assert.rejects(loadGithubProjects(new AbortController().signal))
  fetch.mock.mockImplementation(async () => Response.json({ message: 'Invalid response' }))
  await assert.rejects(loadGithubProjects(new AbortController().signal))
  fetch.mock.mockImplementation(async () => Response.json([]))
  assert.deepEqual((await loadGithubProjects(new AbortController().signal)).repositories, [])
})
