import { usePublicResource } from './usePublicResource'
import type { Credential } from '../domain/publicPortfolio'
import { loadCredentials } from '../infrastructure/publicPortfolioApi'
import { ExternalArrow } from './ExternalArrow'
import { SectionIntro } from './SectionIntro'

function completionLabel(item: Credential) {
  const date = item.completedAt && /^\d{4}-\d{2}-\d{2}$/.test(item.completedAt)
    ? new Date(`${item.completedAt}T12:00:00`).toLocaleDateString('pt-BR') : null
  return [date, item.hours ? `${item.hours} horas` : null].filter(Boolean).join(' · ')
}

function EvidenceLinks({ item }: { item: Credential }) {
  return <div className="evidence-links">
    {item.evidence ? <a className="text-link" href={item.evidence} target="_blank" rel="noopener noreferrer" aria-label={`${item.evidenceLabel}: ${item.title}`}>{item.id === 'harvard-cs50' ? 'Ver documento' : 'Ver comprovante'} <ExternalArrow /></a> : <span className="source-note">Comprovante não disponibilizado.</span>}
    {item.verificationUrl && <a className="text-link" href={item.verificationUrl} target="_blank" rel="noopener noreferrer" aria-label={`Validar credencial: ${item.title}`}>Validar credencial <ExternalArrow /></a>}
  </div>
}

export function CredentialCollection({ items }: { items: Credential[] }) {
  const preferred = ['cloud-practitioner', 'harvard-cs50', 'python-bootcamp']
  const featured = preferred.map(id => items.find(item => item.id === id)).filter(item => item !== undefined)
  const remaining = items.filter(item => !preferred.includes(item.id))
  return <>
    <div className="featured-credentials">
      {featured.map(item => <article className="featured-credential" key={item.id}>
        <div><h3>{item.title}</h3><p>{item.issuer}</p>{completionLabel(item) && <p className="credential-meta">{completionLabel(item)}</p>}<EvidenceLinks item={item} /></div>
        {item.id === 'cloud-practitioner' && <img className="credential-badge" src="/credentials/aws-cloud-practitioner-badge.png" alt="Selo de treinamento AWS SimuLearn Cloud Practitioner" width="92" height="92" loading="lazy" decoding="async" />}
      </article>)}
    </div>
    {remaining.length > 0 && <details className="more-content credential-archive" open>
      <summary>{featured.length ? 'Outros cursos e comprovantes' : 'Certificados e comprovantes'} ({remaining.length})</summary>
      <ul className="credential-list">{remaining.map(item => <li key={item.id}><div><h3>{item.title}</h3><p>{item.issuer}{completionLabel(item) && ` · ${completionLabel(item)}`}</p></div><EvidenceLinks item={item} /></li>)}</ul>
    </details>}
  </>
}

export function Credentials() {
  const { state, retry } = usePublicResource(loadCredentials)
  return <section className="content-section credentials-section" id="certificados" aria-labelledby="credentials-title">
    <SectionIntro>
      <header className="section-heading"><h2 id="credentials-title">Certificados e<br />treinamentos.</h2><p>Cursos e treinamentos em cloud, programação e ciência da computação, com acesso aos documentos fornecidos.</p></header>
    </SectionIntro>
    <p className="credential-context">AWS SimuLearn e o conjunto de questões DVA-C02 são treinamentos concluídos, não aprovação em exames AWS Certified. Os Mundos Python usam a captura de conclusão fornecida do Curso em Vídeo.</p>
    {state.status === 'loading' && <p className="resource-notice" role="status">Carregando certificados publicados…</p>}
    {state.status === 'error' && <div className="resource-notice" role="status"><p>Não foi possível carregar os certificados. Verifique se a API está disponível e tente novamente.</p><button className="text-link" onClick={retry}>Tentar novamente</button></div>}
    {state.status === 'ready' && (state.data.length ? <CredentialCollection items={state.data} /> : <p className="resource-notice">Nenhum certificado publicado no momento.</p>)}
  </section>
}
