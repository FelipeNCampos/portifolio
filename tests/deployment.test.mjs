import { afterEach, test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

afterEach(() => mock.restoreAll())

test('Pages renders all certificates and repository-relative proofs without a backend', async () => {
  const server = await createServer({ base: '/portifolio/', server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    mock.method(globalThis, 'fetch', () => { throw new Error('Certificate rendering must not use the network') })
    const { Credentials } = await server.ssrLoadModule('/src/presentation/Credentials.tsx')
    const html = renderToStaticMarkup(createElement(Credentials))
    assert.equal((html.match(/<h3\b/g) || []).length, 19)
    assert.match(html, /href="\/portifolio\/credentials\/aws-cloud-practitioner.pdf"/)
    assert.match(html, /href="\/portifolio\/credentials\/harvard-cs50.pdf"/)
    assert.match(html, /src="\/portifolio\/credentials\/aws-cloud-practitioner-badge.png"/)
    assert.doesNotMatch(html, /Carregando certificados|API está disponível/)
  } finally { await server.close() }
})
