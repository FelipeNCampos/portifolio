import { useEffect, useState } from 'react'
import { container } from '../config/container'
import {
  statusLabel,
  validationLabel,
  type Contract,
  type DeliveryValidationStatus,
} from '../domain/contracts/Contract'
import './styles.css'
import { ArchitectureSculpture } from './motion/ArchitectureSculpture'
import { Reveal } from './motion/Reveal'
import { initialProfile as profile } from '../infrastructure/profile/initialProfile'
import './profile.css'
import { Credentials } from './credentials/Credentials'
import { CredentialManager } from './credentials/CredentialManager'
import { LoginForm } from './auth/LoginForm'
import { currentSession, logout, type ManagerSession } from '../infrastructure/http/api'

type View = 'PUBLIC' | 'ADMIN' | 'CONTRACTOR' | 'LOGIN'

const formatFileSize = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(1)} MB`

export function App() {
  const [view, setView] = useState<View>('PUBLIC')
  const [contracts, setContracts] = useState<readonly Contract[]>([])
  const [notice, setNotice] = useState<string>()
  const [session, setSession] = useState<ManagerSession>()
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true
    void currentSession().then(value=>{if(active)setSession(value)}).catch(()=>{}).finally(()=>{if(active)setCheckingSession(false)})
    const expired = () => {setSession(undefined);setContracts([]);setView(current=>current==='PUBLIC'?'PUBLIC':'LOGIN')}
    window.addEventListener('auth-expired', expired)
    return () => {active=false;window.removeEventListener('auth-expired', expired)}
  }, [])

  useEffect(() => {
    if (session) void refreshContracts().catch(error=>setNotice(error.message))
  }, [session])

  function openManagement() {setView(session ? 'ADMIN' : 'LOGIN')}
  async function endSession() {
    try {await logout();setSession(undefined);setContracts([]);setView('PUBLIC');setNotice(undefined)}
    catch(error) {setNotice(error instanceof Error?error.message:'Não foi possível encerrar a sessão.')}
  }

  async function refreshContracts(): Promise<void> {
    setContracts(await container.contracts.list())
  }

  async function uploadSignedContract(contractId: string, file: File | undefined): Promise<void> {
    if (!file) {
      return
    }

    try {
      await container.uploadSignedContract.execute(contractId, file)
      await refreshContracts()
      setNotice('Contrato armazenado na API Python de demonstração.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível enviar o contrato.')
    }
  }

  async function decideValidation(
    contractId: string,
    validationId: string,
    decision: Extract<DeliveryValidationStatus, 'APPROVED' | 'CHANGES_REQUESTED'>,
  ): Promise<void> {
    try {
      await container.decideDeliveryValidation.execute(contractId, validationId, decision)
      await refreshContracts()
      setNotice(decision === 'APPROVED' ? 'Entrega aprovada.' : 'Ajustes solicitados ao responsável.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível registrar a decisão.')
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" onClick={() => setView('PUBLIC')}>
          <span className="brand-mark">{profile.initials}</span>
          <span>{profile.shortName}</span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#projetos" onClick={() => setView('PUBLIC')}>Projetos</a>
          <a href="#credenciais" onClick={() => setView('PUBLIC')}>Credenciais</a>
          <button className="nav-button" onClick={openManagement}>Área de gestão</button>
          {session && <button className="text-button" onClick={()=>void endSession()}>Sair</button>}
        </nav>
      </header>

      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button aria-label="Fechar mensagem" onClick={() => setNotice(undefined)}>×</button>
        </div>
      )}

      {view === 'PUBLIC' && <PublicPortfolio openManagement={openManagement} />}
      {view === 'LOGIN' && !session && (checkingSession ? <p className="login-page" role="status">Verificando sessão…</p> : <LoginForm onLogin={value=>{setSession(value);setNotice(undefined);setView('ADMIN')}} onBack={()=>setView('PUBLIC')} />)}
      {(view === 'ADMIN' || view === 'LOGIN') && session && (
        <ManagementDashboard
          contracts={contracts}
          goPublic={() => setView('PUBLIC')}
          openContractor={() => setView('CONTRACTOR')}
          onUpload={uploadSignedContract}
        />
      )}
      {view === 'CONTRACTOR' && session && (
        <ContractorDashboard
          contracts={contracts.filter((contract) => contract.id === 'contract-portal')}
          goManagement={() => setView('ADMIN')}
          onDecide={decideValidation}
        />
      )}
    </main>
  )
}

function PublicPortfolio({ openManagement }: { readonly openManagement: () => void }) {
  return (
    <>
      <section className="hero" id="inicio">
        <div className="hero-content">
          <p className="eyebrow">{profile.role.toUpperCase()} · {profile.location.toUpperCase()}</p>
          <h1>{profile.headline}</h1>
          <p className="hero-copy">
            {profile.introduction}
          </p>
          <div className="actions">
            <a className="button primary" href={`mailto:${profile.email}`}>Iniciar conversa</a>
            <a className="button secondary" href="#projetos">Ver trabalho selecionado</a>
          </div>
        </div>
        <div className="hero-visual">
        <ArchitectureSculpture />
        <aside className="availability-card">
          <p>{profile.name}</p>
          <strong>Backend com Python/Django</strong>
          <button onClick={openManagement}>Entrar na área privada →</button>
        </aside>
        </div>
      </section>

      <section className="summary-grid" aria-label="Resumo profissional">
        <div><strong>UFG</strong><span>Engenharia de Software em andamento</span></div>
        <div><strong>Full Stack</strong><span>Backend, frontend e integrações</span></div>
        <div><strong>2 idiomas</strong><span>Português nativo e inglês avançado</span></div>
      </section>

      <section className="section" id="projetos">
        <p className="eyebrow">TRABALHO SELECIONADO</p>
        <div className="section-heading">
          <h2>Soluções para operações reais.</h2>
          <p>Projetos de desenvolvimento solo apresentados no meu currículo.</p>
        </div>
        <div className="project-grid">
          {profile.projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 60}>
              <article className={`project-card resume-project ${index === 1 ? 'light-card' : 'dark-card'}`}>
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                <footer>{project.technologies}</footer>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section resume-section" id="experiencia">
        <h2>Experiência profissional</h2>
        <p className="resume-summary">{profile.summary}</p>
        {profile.experiences.map((experience) => (
          <article className="experience-entry" key={experience.organization}>
            <div><h3>{experience.organization}</h3><p>{experience.context}</p></div>
            <ul>{experience.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </section>

      <section className="credentials resume-credentials" id="credenciais">
        <div>
          <p className="eyebrow">CREDENCIAIS</p>
          <h2>Formação e aprendizado contínuo.</h2>
        </div>
        <ul>
          <li><strong>{profile.education.degree}</strong><span>{profile.education.institution}</span><p>{profile.education.period}. {profile.education.note}</p></li>
          <li><strong>{profile.training.title}</strong><span>{profile.training.issuer}</span><p>{profile.training.note}</p></li>
          <li><strong>Idiomas</strong><p>{profile.languages.map((language) => `${language.name}: ${language.level}`).join(' · ')}</p></li>
        </ul>
      </section>

      <Credentials />

      <section className="section resume-section" id="habilidades">
        <h2>Habilidades técnicas</h2>
        <div className="skills-grid">{profile.skills.map((skill) => <div key={skill.category}><h3>{skill.category}</h3><p>{skill.values.join(', ')}</p></div>)}</div>
      </section>

      <footer className="public-footer resume-footer">
        <p>{profile.name}<br /><small>{profile.role} · {profile.location}</small></p>
        <div><a href={`mailto:${profile.email}`}>{profile.email}</a><a href={profile.phoneHref}>{profile.phone}</a></div>
      </footer>
    </>
  )
}

interface ManagementDashboardProps {
  readonly contracts: readonly Contract[]
  readonly goPublic: () => void
  readonly openContractor: () => void
  readonly onUpload: (contractId: string, file: File | undefined) => Promise<void>
}

function ManagementDashboard({ contracts, goPublic, openContractor, onUpload }: ManagementDashboardProps) {
  return (
    <section className="workspace">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">PAINEL PRIVADO</p>
          <h2>Olá, {profile.firstName}.</h2>
        </div>
        <nav aria-label="Navegação da gestão">
          <a className="active" href="#contratos">Contratos</a>
          <a href="#gerenciar-certificados">Certificados</a>
        </nav>
        <button className="text-button" onClick={goPublic}>← Ver portfólio</button>
      </aside>
      <div className="dashboard-content" id="contratos">
        <div className="dashboard-heading">
          <div><p className="eyebrow">GESTÃO DE CONTRATOS</p><h1>Trabalho em andamento.</h1></div>
          <button className="button primary" onClick={openContractor}>Ver como contratante</button>
        </div>
        <div className="demo-banner"><strong>Gestão autenticada.</strong> Os contratos são demonstrativos. Utilize apenas arquivos de teste enquanto a verificação antimalware está em desenvolvimento.</div>
        <div className="metric-grid">
          <Metric label="Contratos ativos" value={contracts.filter((contract) => contract.status === 'ACTIVE').length.toString()} />
          <Metric label="Validações pendentes" value={contracts.flatMap((contract) => contract.validations).filter((validation) => validation.status === 'PENDING').length.toString()} />
          <Metric label="Fim mais próximo" value="15 dez" />
        </div>
        <div className="contracts-list">
          {contracts.map((contract) => <AdminContractCard key={contract.id} contract={contract} onUpload={onUpload} />)}
        </div>
        <CredentialManager />
      </div>
    </section>
  )
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>
}

function AdminContractCard({ contract, onUpload }: { readonly contract: Contract; readonly onUpload: ManagementDashboardProps['onUpload'] }) {
  return (
    <article className="contract-card">
      <div className="contract-main">
        <div><span className={`badge ${contract.status.toLowerCase()}`}>{statusLabel[contract.status]}</span><h3>{contract.title}</h3><p>{contract.contractorName} · {contract.value} · até {contract.endsAt}</p></div>
        <div className="document-summary">
          {contract.signedDocument ? <><strong>Contrato assinado</strong><span>{contract.signedDocument.fileName} · {formatFileSize(contract.signedDocument.fileSize)}</span></> : <><strong>Contrato pendente</strong><span>Nenhum documento enviado</span></>}
        </div>
      </div>
      <div className="contract-actions">
        <label className="upload-control">
          <span>{contract.signedDocument ? 'Substituir versão assinada' : 'Enviar contrato assinado'}</span>
          <input type="file" accept="application/pdf,.pdf" onChange={(event) => void onUpload(contract.id, event.target.files?.[0])} />
        </label>
        <small>PDF/PDF-A · máximo de 10 MB</small>
      </div>
    </article>
  )
}

interface ContractorDashboardProps {
  readonly contracts: readonly Contract[]
  readonly goManagement: () => void
  readonly onDecide: (
    contractId: string,
    validationId: string,
    decision: Extract<DeliveryValidationStatus, 'APPROVED' | 'CHANGES_REQUESTED'>,
  ) => Promise<void>
}

function ContractorDashboard({ contracts, goManagement, onDecide }: ContractorDashboardProps) {
  return (
    <section className="contractor-portal">
      <header className="portal-header"><div><p className="eyebrow">PORTAL DO CONTRATANTE</p><h1>Olá, Aurora Sistemas.</h1></div><button className="text-button" onClick={goManagement}>← Demonstração da gestão</button></header>
      <div className="portal-intro"><strong>Seu acesso está restrito aos contratos e entregas associados à sua organização.</strong><span>Visão demonstrativa do papel contratante.</span></div>
      {contracts.map((contract) => (
        <article className="portal-contract" key={contract.id}>
          <div className="portal-contract-heading"><div><span className={`badge ${contract.status.toLowerCase()}`}>{statusLabel[contract.status]}</span><h2>{contract.title}</h2><p>Vigência até {contract.endsAt}</p></div>{contract.signedDocument && <div className="download-tile"><strong>Documento disponível</strong><span>{contract.signedDocument.fileName}</span></div>}</div>
          <div className="validation-list"><h3>Validações de entrega</h3>{contract.validations.map((validation) => <ValidationRow key={validation.id} contractId={contract.id} validation={validation} onDecide={onDecide} />)}</div>
        </article>
      ))}
    </section>
  )
}

function ValidationRow({ contractId, validation, onDecide }: { readonly contractId: string; readonly validation: Contract['validations'][number]; readonly onDecide: ContractorDashboardProps['onDecide'] }) {
  const isPending = validation.status === 'PENDING'
  return <div className="validation-row"><div><strong>{validation.title}</strong><span>{validationLabel[validation.status]} · {validation.updatedAt}</span></div>{isPending ? <div className="decision-actions"><button className="approve" onClick={() => void onDecide(contractId, validation.id, 'APPROVED')}>Aprovar</button><button className="request-change" onClick={() => void onDecide(contractId, validation.id, 'CHANGES_REQUESTED')}>Pedir ajuste</button></div> : <span className={`validation-state ${validation.status.toLowerCase()}`}>{validationLabel[validation.status]}</span>}</div>
}
