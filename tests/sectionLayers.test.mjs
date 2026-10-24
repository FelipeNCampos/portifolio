import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('title graph waves escape their boxes and paint above content without intercepting clicks', async () => {
  const css = await readFile(new URL('../src/presentation/content.css', import.meta.url), 'utf8')
  const intro = css.match(/\.section-intro\s*\{([^}]+)\}/)?.[1] || ''
  const graph = css.match(/\.section-network\s*\{([^}]+)\}/)?.[1] || ''
  assert.match(graph, /overflow:\s*visible\s*;/, 'Radial waves must not be clipped to a graph box')
  assert.match(intro, /position:\s*relative\s*;/)
  assert.match(intro, /z-index:\s*[1-9]\d*\s*;/, 'Headings paint above the section body')
  assert.match(graph, /position:\s*relative\s*;/)
  assert.match(graph, /z-index:\s*[1-9]\d*\s*;/, 'Decorative waves paint above heading text and links')
  assert.match(graph, /pointer-events:\s*none\s*;/, 'Links remain clickable below the animation')
})
