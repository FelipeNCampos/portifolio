import { useEffect, useState } from 'react'
import type { InitialCredential } from '../../infrastructure/profile/initialCredentials'
import { apiRequest } from '../../infrastructure/http/api'
import './credentials.css'

function completionDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

function CredentialDetails({ credential }: { credential: InitialCredential }) {
  return <>
    <p className="credential-issuer">{credential.issuer}</p><h3>{credential.title}</h3>
    <p className="credential-date">{credential.completedAt && <>Concluído em <time dateTime={credential.completedAt}>{completionDate(credential.completedAt)}</time></>}{credential.hours && <> · {credential.hours} horas</>}</p>
    <div className="credential-links">
      {credential.evidence && <a href={credential.evidence} target="_blank" rel="noreferrer" aria-label={`${credential.evidenceLabel}: ${credential.title} (nova aba)`}>{credential.evidenceLabel} ↗</a>}
      {credential.verificationUrl && <a href={credential.verificationUrl} target="_blank" rel="noreferrer">Ver credencial ↗</a>}
    </div>
  </>
}

export function Credentials() {
  const [items, setItems] = useState<InitialCredential[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    void apiRequest<InitialCredential[]>('/api/credentials').then(data=>{if(active)setItems(data)})
      .catch(()=>{if(active)setError('Não foi possível carregar as credenciais. Tente novamente mais tarde.')})
      .finally(()=>{if(active)setLoading(false)})
    return () => {active=false}
  }, [])
  const cloud = items.find(item=>item.id==='cloud-practitioner')
  const python = items.find(item=>item.id==='python-bootcamp')
  const worlds = items.filter(item=>item.id.startsWith('python-mundo-'))
  const others = items.filter(item=>item!==cloud && item!==python && !worlds.includes(item))
  return <section className="section certificate-section" id="certificados" aria-labelledby="certificates-title">
    <div className="certificate-heading"><h2 id="certificates-title">Certificados e treinamentos</h2><p>Aprendizado em cloud e Python, com certificados de conclusão e comprovantes disponíveis.</p></div>
    {loading && <p role="status">Carregando credenciais…</p>}{error && <p role="alert">{error}</p>}
    {!loading && !error && items.length===0 && <p>Nenhum certificado publicado no momento.</p>}
    <div className="featured-credentials">
      {cloud && <article className="featured-credential aws-credential"><img src="/credentials/aws-cloud-practitioner-badge.png" alt="Badge AWS SimuLearn Cloud Practitioner, Trained" width="220" height="220" loading="lazy" decoding="async" /><div><CredentialDetails credential={cloud}/><p className="credential-note">Treinamento AWS SimuLearn concluído.</p></div></article>}
      {python && <article className="featured-credential python-credential"><span className="credential-category">Desenvolvimento Python</span><CredentialDetails credential={python}/></article>}
    </div>
    {others.length>0 && <details className="aws-catalog"><summary>Explorar os outros {others.length} certificados e treinamentos</summary><ul className="credential-catalog">{others.map(credential=><li key={credential.id}><CredentialDetails credential={credential}/></li>)}</ul></details>}
    {worlds.length>0 && <div className="python-worlds"><div><h3>Cursos Python 3</h3><p>Cursos concluídos apresentados nos comprovantes fornecidos.</p></div><ul>{worlds.map(credential=><li key={credential.id}><CredentialDetails credential={credential}/></li>)}</ul></div>}
  </section>
}
