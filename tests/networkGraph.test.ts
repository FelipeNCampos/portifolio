import { test } from 'node:test'
import assert from 'node:assert/strict'
import { vertices, edges, vertexIcons, pathDistances } from '../src/presentation/networkGraph.ts'

test('only six graph vertices receive icons, leaving most as dots', () => {
  assert.equal(vertices.length, 22)
  assert.deepEqual(vertexIcons, {
    alpha: 'users', beta: 'whatsapp', zeta: 'processing', kappa: 'processing',
    rho: 'database', sigma: 'database',
  })
  assert.equal(vertices.length - Object.keys(vertexIcons).length, 16)
  for (const id of Object.keys(vertexIcons)) assert.ok(vertices.some(vertex => vertex[0] === id))
})

test('every directed route to storage passes backend processing first', () => {
  const visited = new Set<string>()
  let storageReached = false
  function visit(id: string, processed: boolean) {
    const kind = vertexIcons[id]
    const hasProcessed = processed || kind === 'processing'
    const state = `${id}:${hasProcessed}`
    if (visited.has(state)) return
    visited.add(state)
    if (kind === 'database') {
      assert.ok(hasProcessed, `Storage ${id} must follow a backend node`)
      storageReached = true
    }
    for (const [from, to] of edges) if (from === id) visit(to, hasProcessed)
  }
  visit('bridge', false)
  assert.ok(storageReached)
})

test('signal reaches input icons before processing, and processing before databases', () => {
  const distancesFor = (kind: string) => Object.entries(vertexIcons)
    .filter(([, icon]) => icon === kind).map(([id]) => pathDistances.get(id)!)
  const input = [...distancesFor('users'), ...distancesFor('whatsapp')]
  const processing = distancesFor('processing')
  const storage = distancesFor('database')
  assert.ok(Math.max(...input) < Math.min(...processing))
  assert.ok(Math.max(...processing) < Math.min(...storage))
  for (const [id] of vertices) assert.ok(Number.isFinite(pathDistances.get(id)), id)
})
