import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const seed = JSON.parse(await readFile(new URL('../backend/infrastructure/credential_seed.json', import.meta.url), 'utf8'))

test('main section titles share centered alignment without centering descriptions', async () => {
  const css = await readFile(new URL('../src/presentation/content.css', import.meta.url), 'utf8')
  const headingRule = css.match(/\.section-intro > \.section-heading > h2\s*\{([^}]+)\}/)?.[1] || ''
  assert.match(headingRule, /text-align:\s*center\s*;/)
  assert.match(headingRule, /justify-self:\s*center\s*;/, 'Width-limited contact title is centered in its column too')
  assert.match(headingRule, /width:\s*100%\s*;/)
})

test('all supplied course records are visible by default, with a link to each proof', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { CredentialCollection } = await server.ssrLoadModule('/src/presentation/Credentials.tsx')
    const html = renderToStaticMarkup(createElement(CredentialCollection, { items: seed }))
    assert.equal((html.match(/<h3\b/g) || []).length, 19)
    assert.equal((html.match(/>Ver comprovante /g) || []).length, 18)
    assert.match(html, />Ver documento /)
    assert.match(html, /<details\b[^>]*\bopen=""/, 'The additional certificates must not start hidden')
    assert.match(html, /aws-cloud-practitioner-badge\.png/)
    for (const item of seed) assert.ok(html.includes(`href="${item.evidence}"`), item.id)
  } finally { await server.close() }
})

test('requested highlights keep their priority and present CS50 neutrally without a verification claim', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { CredentialCollection, Credentials } = await server.ssrLoadModule('/src/presentation/Credentials.tsx')
    const html = renderToStaticMarkup(createElement(CredentialCollection, { items: [...seed].reverse() }))
    const featuredTitles = [...html.matchAll(/<article class="featured-credential">.*?<h3>(.*?)<\/h3>/gs)].map(match => match[1])
    assert.deepEqual(featuredTitles, [
      'AWS SimuLearn: Cloud Practitioner',
      'Harvard CS50: Introduction to Computer Science',
      '100 Days of Code™: The Complete Python Pro Bootcamp',
    ])
    assert.doesNotMatch(html, /Validar credencial: Harvard/)
    assert.doesNotMatch(html, /prévia|preview/i)
    assert.doesNotMatch(renderToStaticMarkup(createElement(Credentials)), /Harvard CS50 é uma prévia/i)
  } finally { await server.close() }
})

test('certificate seed has unique records and real PDF/PNG evidence files', async () => {
  assert.equal(new Set(seed.map(item => item.id)).size, seed.length)
  assert.equal(seed.filter(item => item.title.startsWith('AWS SimuLearn:')).length, 13)
  assert.equal(seed.filter(item => item.id.startsWith('python-mundo-') && item.hours === 40).length, 3)
  assert.equal(seed.find(item => item.id === 'python-bootcamp').hours, 57)
  const harvard = seed.find(item => item.id === 'harvard-cs50')
  assert.ok(harvard, 'The Harvard course document must be included')
  assert.doesNotMatch(`${harvard.title} ${harvard.evidenceLabel}`, /prévia|preview|verificado/i)
  assert.ok(!harvard.completedAt && !harvard.hours && !harvard.verificationUrl)
  const practice = seed.find(item => item.id === 'developer-practice-dva-c02')
  assert.ok(practice, 'The new AWS practice completion must be included')
  assert.match(practice.title, /^Official Practice Question Set:/)
  assert.equal(practice.completedAt, '2026-10-23')
  for (const path of new Set(seed.map(item => item.evidence))) {
    assert.match(path, /^\/credentials\/[a-z0-9-]+\.(pdf|png)$/)
    const bytes = await readFile(new URL(`../public${path}`, import.meta.url))
    assert.ok(bytes.length > 0)
    if (path.endsWith('.pdf')) assert.equal(bytes.subarray(0, 5).toString(), '%PDF-')
    else assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  }
})
