import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

test('contact offers a WhatsApp card with the supplied number alongside the email', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { Contact } = await server.ssrLoadModule('/src/presentation/About.tsx')
    const html = renderToStaticMarkup(createElement(Contact))
    assert.match(html, /class="contact-email" href="mailto:felipe.n.cmp@gmail.com"/)
    const card = html.match(/<a class="contact-whatsapp"[^>]*>.*?<\/a>/s)?.[0] || ''
    assert.match(card, /href="https:\/\/wa.me\/5562994566196"/)
    assert.match(card, /target="_blank" rel="noopener noreferrer"/)
    assert.match(card, /class="contact-whatsapp-icon"[^>]*aria-hidden="true"/)
    assert.match(card, /Conversar pelo WhatsApp/)
    assert.match(card, /\+55 \(62\) 99456-6196/)
    assert.match(html, /href="tel:\+5562994566196"/)
  } finally { await server.close() }
})

test('email and WhatsApp card align centrally with a bounded responsive card width', async () => {
  const css = await readFile(new URL('../src/presentation/content.css', import.meta.url), 'utf8')
  const email = css.match(/\.contact-heading \.contact-email\s*\{([^}]+)\}/)?.[1] || ''
  const card = css.match(/\.contact-whatsapp\s*\{([^}]+)\}/)?.[1] || ''
  assert.match(email, /justify-self:\s*center\s*;/)
  assert.match(card, /justify-self:\s*center\s*;/)
  assert.match(card, /width:\s*100%\s*;/)
  assert.match(card, /max-width:\s*\d+px\s*;/)
  assert.match(card, /border:\s*1px solid var\(--line\)\s*;/)
})
