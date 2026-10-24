import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

test('homepage exposes the CV, separate work and credential sections, and real contact links', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { App } = await server.ssrLoadModule('/src/presentation/App.tsx')
    const html = renderToStaticMarkup(createElement(App))
    assert.equal((html.match(/<h1\b/g) || []).length, 1)
    for (const id of ['inicio', 'projetos', 'certificados', 'sobre', 'contato']) {
      assert.match(html, new RegExp(`id="${id}"`))
      assert.match(html, new RegExp(`href="#${id}"`))
    }
    for (const content of ['Felipe Nunes Campos', 'Universidade Federal de Goiás', 'Administração de condomínios', 'Identidade profissional', 'Gestão comercial', 'Projetos em destaque', 'Código no GitHub']) assert.ok(html.includes(content), content)
    assert.match(html, /https:\/\/github.com\/FelipeNCampos/)
    assert.match(html, /mailto:felipe.n.cmp@gmail.com/)
    assert.match(html, /<a class="header-contact" href="#contato">Vamos conversar<\/a>/)
    assert.match(html, /<a class="button button-secondary" href="#contato">Entrar em contato<\/a>/)
    assert.doesNotMatch(html, /Curriculo\.pdf|Repetir animação/)
    const gradientIds = [...html.matchAll(/<radialGradient id="([^"]+)"/g)].map(match => match[1])
    assert.equal(gradientIds.length, 9, 'Hero plus two graphs in each of the four section headings')
    assert.equal(new Set(gradientIds).size, 9)
    assert.equal((html.match(/data-vertex="bridge" data-kind="wifi"/g) || []).length, 8, 'Only section-title graphs use Wi-Fi at the origin')
    assert.equal((html.match(/class="graph-vertex graph-vertex-bridge"/g) || []).length, 1, 'The hero retains its origin dot')
  } finally { await server.close() }
})

test('about heading has a full-width title followed by a separate metadata caption', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { About } = await server.ssrLoadModule('/src/presentation/About.tsx')
    const html = renderToStaticMarkup(createElement(About))
    assert.match(html, /<header class="section-heading about-heading"><h2 id="about-title">Felipe Nunes Campos\. Software na prática\.<\/h2><p class="about-caption">/)
    assert.match(html, /<span>Goiânia, GO · Desenvolvedor Full Stack<\/span>/)
    assert.match(html, /<span>Português nativo · Inglês avançado<\/span>/)
    const education = html.match(/<div class="education">(.*?)<\/div>/s)?.[1] || ''
    assert.match(education, /Universidade Federal de Goiás/)
    assert.match(education, /Em andamento, com conclusão prevista para julho de 2028\./)
    assert.match(education, /Aprendizado contínuo com cursos e treinamentos online, complementando a formação acadêmica\./)
  } finally { await server.close() }
})

test('works heading places the project description below its full-width title', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { Works } = await server.ssrLoadModule('/src/presentation/Works.tsx')
    const html = renderToStaticMarkup(createElement(Works))
    assert.match(html, /<header class="section-heading works-heading"><h2 id="works-title">Trabalhos que saíram do papel\.<\/h2><p>Produtos, automações e integrações\. Projetos do meu currículo e código disponível para explorar\.<\/p><\/header>/)
  } finally { await server.close() }
})

test('project introduction has two decorative graphs with independent SVG definitions', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { Works } = await server.ssrLoadModule('/src/presentation/Works.tsx')
    const html = renderToStaticMarkup(createElement(Works))
    assert.match(html, /class="section-network section-network-left" aria-hidden="true"/)
    assert.match(html, /class="section-network section-network-right" aria-hidden="true"/)
    assert.match(html, /class="section-intro" data-active="false"/)
    assert.equal((html.match(/class="network-pulse"/g) || []).length, 2)
    const gradientIds = [...html.matchAll(/<radialGradient id="([^"]+)"/g)].map(match => match[1])
    assert.equal(gradientIds.length, 2)
    assert.equal(new Set(gradientIds).size, 2)
    for (const id of gradientIds) assert.ok(html.includes(`fill="url(#${id})"`))
  } finally { await server.close() }
})

test('certificates, about and contact headings also have two decorative graphs', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false, watch: null }, appType: 'custom' })
  try {
    const { Credentials } = await server.ssrLoadModule('/src/presentation/Credentials.tsx')
    const { About, Contact } = await server.ssrLoadModule('/src/presentation/About.tsx')
    for (const Component of [Credentials, About, Contact]) {
      const html = renderToStaticMarkup(createElement(Component))
      assert.equal((html.match(/class="network-pulse"/g) || []).length, 2, Component.name)
      assert.match(html, /class="section-network section-network-left" aria-hidden="true"/)
      assert.match(html, /class="section-network section-network-right" aria-hidden="true"/)
    }
    const contact = renderToStaticMarkup(createElement(Contact))
    assert.match(contact, /class="contact-email" href="mailto:felipe.n.cmp@gmail.com"/)
    assert.match(contact, /href="tel:\+5562994566196"/)
  } finally { await server.close() }
})
