import { usePublicResource } from './usePublicResource'
import { ExternalArrow } from './ExternalArrow'
import { initialProfile } from '../infrastructure/profile/initialProfile'
import { loadGithubProjects } from '../infrastructure/githubProjects'
import type { GithubRepository } from '../domain/publicPortfolio'
import { SectionIntro } from './SectionIntro'

function RepositoryList({ repositories }: { repositories: GithubRepository[] }) {
  return <ul className="repository-list">
    {repositories.map(repo => <li key={repo.name}>
      <a className="repository-link" href={repo.url} target="_blank" rel="noopener noreferrer">
        <h4>{repo.name}</h4>
        <p>{repo.description || 'Sem descrição informada no GitHub.'}</p>
        <span className="repository-language">{repo.language || 'Linguagem não informada'}</span>
        <span className="link-action">Abrir repositório <ExternalArrow /></span>
      </a>
    </li>)}
  </ul>
}

function GithubWork() {
  const { state, retry } = usePublicResource(loadGithubProjects)
  const unavailable = state.status === 'error' || (state.status === 'ready' && state.data.status === 'unavailable')
  return <div className="github-work">
    <div className="subsection-heading">
      <div><h3>Código no GitHub</h3><p>Repositórios públicos próprios, ordenados pela atividade mais recente.</p></div>
      <a className="text-link" href={initialProfile.github} target="_blank" rel="noopener noreferrer">Ver perfil <ExternalArrow /></a>
    </div>
    {state.status === 'loading' && <p className="resource-notice" role="status">Carregando repositórios do GitHub…</p>}
    {unavailable && <div className="resource-notice" role="status"><p>Não foi possível consultar o GitHub agora. Você ainda pode acessar o perfil diretamente.</p><button className="text-link" onClick={retry}>Tentar novamente</button></div>}
    {state.status === 'ready' && state.data.status !== 'unavailable' && <>
      {state.data.repositories.length === 0 ? <p className="resource-notice">Nenhum repositório público próprio disponível nesta consulta.</p> : <>
        <RepositoryList repositories={state.data.repositories.slice(0, 6)} />
        {state.data.repositories.length > 6 && <details className="more-content"><summary>Ver mais {state.data.repositories.length - 6} repositórios</summary><RepositoryList repositories={state.data.repositories.slice(6)} /></details>}
      </>}
    </>}
  </div>
}

export function Works() {
  return <section id="projetos" className="content-section" aria-labelledby="works-title">
    <SectionIntro>
      <header className="section-heading works-heading">
        <h2 id="works-title">Trabalhos que saíram do papel.</h2>
        <p>Produtos, automações e integrações. Projetos do meu currículo e código disponível para explorar.</p>
      </header>
    </SectionIntro>
    <div className="curriculum-work">
      <h3>Projetos em destaque</h3>
      <p className="source-note">Desenvolvimento solo. Os projetos abaixo não estão associados automaticamente a repositórios públicos.</p>
      {initialProfile.projects.map(project => <article className="project-row" key={project.id}>
        <div><h4>{project.title}</h4><p className="project-category">{project.category.split(' / ')[0]}</p></div>
        <div className="project-body"><p>{project.description}</p><p className="technology-line">{project.technologies}</p><details className="project-details"><summary>Ver escopo do projeto</summary><ul>{project.details.map(detail => <li key={detail}>{detail}</li>)}</ul></details></div>
      </article>)}
    </div>
    <GithubWork />
  </section>
}
