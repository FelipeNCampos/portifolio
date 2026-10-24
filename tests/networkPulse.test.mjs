import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

test('graph replaces six dots with SVG icons without duplicating nodes', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { NetworkPulse } = await server.ssrLoadModule('/src/presentation/NetworkPulse.tsx')
    const html = renderToStaticMarkup(createElement(NetworkPulse, { roleRef: { current: null } }))
    assert.equal((html.match(/class="graph-icon-node"/g) || []).length, 6)
    assert.equal((html.match(/class="graph-vertex graph-vertex-/g) || []).length, 16)
    assert.equal((html.match(/data-kind="processing"/g) || []).length, 2)
    assert.equal((html.match(/data-kind="database"/g) || []).length, 2)
    assert.equal((html.match(/data-kind="users"/g) || []).length, 1)
    assert.equal((html.match(/data-kind="whatsapp"/g) || []).length, 1)
    assert.equal((html.match(/class="graph-icon-pulse" style="--impulse-delay:/g) || []).length, 6)
    assert.doesNotMatch(html, /class="graph-vertex graph-vertex-(alpha|beta|zeta|kappa|rho|sigma)"/)
  } finally { await server.close() }
})

test('standalone mirrored graph reflects node positions without an external connector', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { NetworkPulse } = await server.ssrLoadModule('/src/presentation/NetworkPulse.tsx')
    const html = renderToStaticMarkup(createElement(NetworkPulse, { mirrored: true }))
    assert.match(html, /data-vertex="alpha" data-kind="users" transform="translate\(607 53\)"/)
    assert.doesNotMatch(html, /class="graph-connector"/)
  } finally { await server.close() }
})

test('title graphs replace only the origin dot with Wi-Fi and leave room at both edges', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { NetworkPulse } = await server.ssrLoadModule('/src/presentation/NetworkPulse.tsx')
    for (const mirrored of [false, true]) {
      const html = renderToStaticMarkup(createElement(NetworkPulse, { originIcon: 'wifi', mirrored }))
      assert.match(html, new RegExp(`data-vertex="bridge" data-kind="wifi" transform="translate\\(${mirrored ? 700 : 0} 90\\)"`))
      assert.match(html, /viewBox="-30 0 760 520"/)
      assert.match(html, /class="graph-icon-pulse" style="--impulse-delay:0s"/)
      assert.equal((html.match(/class="graph-icon-node"/g) || []).length, 7)
      assert.equal((html.match(/class="graph-vertex graph-vertex-/g) || []).length, 15)
      assert.doesNotMatch(html, /class="graph-vertex graph-vertex-bridge"|class="graph-connector"/)
    }
  } finally { await server.close() }
})
