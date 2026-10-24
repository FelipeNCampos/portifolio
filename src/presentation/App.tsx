import { useRef } from 'react'
import { NetworkPulse } from './NetworkPulse'
import { Works } from './Works'
import { Credentials } from './Credentials'
import { About, Contact } from './About'
import './styles.css'
import './content.css'

export function App() {
  const roleRef = useRef<HTMLParagraphElement>(null)

  return (
    <main className="portfolio-shell">
      <a className="skip-link" href="#projetos">Pular para o conteúdo</a>
      <header className="site-header">
        <a className="wordmark" href="#inicio" aria-label="Nunes, início">NUNES</a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#projetos">Projetos</a>
          <a href="#certificados">Certificados</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>
        <a className="header-contact" href="#contato">Vamos conversar</a>
      </header>

      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow role-node" ref={roleRef}>ENGENHEIRO FULLSTACK</p>
          <h1 id="hero-title">Arquitetura que permanece.</h1>
          <p className="intro">
            Contruindo sistemas fullstack seguros <br/>que aguentam fluxos reais do mercado <br/>entregando <i>mais valor ao seu produto</i>.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#projetos">Ver projetos</a>
            <a className="button button-secondary" href="#contato">Entrar em contato</a>
          </div>
        </div>
        <div className="hero-visual" role="img" aria-label="Fluxo de dados: usuários e WhatsApp, processamento no backend e bancos de dados.">
          <NetworkPulse roleRef={roleRef} />
          <p className="visual-caption">Sistemas seguros por design.</p>
        </div>
      </section>
      <nav className="mobile-sections" aria-label="Seções do portfólio"><a href="#projetos">Projetos</a><a href="#certificados">Certificados</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a></nav>
      <Works />
      <Credentials />
      <About />
      <Contact />
    </main>
  )
}
