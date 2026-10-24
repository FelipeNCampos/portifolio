import { initialProfile as profile } from '../infrastructure/profile/initialProfile'
import { ExternalArrow } from './ExternalArrow'
import { SectionIntro } from './SectionIntro'

export function About() {
  return <section className="content-section" id="sobre" aria-labelledby="about-title">
    <SectionIntro><header className="section-heading about-heading">
      <h2 id="about-title">Felipe Nunes Campos. Software na prática.</h2>
      <p className="about-caption">
        <span>{profile.location} · {profile.role}</span>
        <span>{profile.languages.map(language => `${language.name} ${language.level.toLowerCase()}`).join(' · ')}</span>
      </p>
    </header></SectionIntro>
    <div className="about-layout"><div className="about-profile"><p className="profile-summary">{profile.summary}</p>
      <div className="education"><h3>Formação</h3><p>{profile.education.degree}</p><p>{profile.education.institution}</p><p className="source-note">{profile.education.note}</p><p className="source-note">{profile.education.continuousLearning}</p></div>
    </div><div className="experience"><h3>Experiência profissional</h3>{profile.experiences.map(experience => <article key={experience.organization}><h4>{experience.organization}</h4><p className="source-note">{experience.context}</p><ul>{experience.responsibilities.map(responsibility => <li key={responsibility}>{responsibility}</li>)}</ul></article>)}</div></div>
    <div className="skills"><h3>Ferramentas de trabalho</h3><dl>{profile.skills.map(skill => <div key={skill.category}><dt>{skill.category}</dt><dd>{skill.values.join(' · ')}</dd></div>)}</dl></div>
  </section>
}

export function Contact() {
  return <footer className="content-section contact-section" id="contato" aria-labelledby="contact-title">
    <SectionIntro><header className="section-heading contact-heading">
      <h2 id="contact-title">O próximo projeto<br />começa numa conversa.</h2>
      <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email} <ExternalArrow /></a>
      <a className="contact-whatsapp" href={profile.whatsappUrl} target="_blank" rel="noopener noreferrer">
        <svg className="contact-whatsapp-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 11.5A8.5 8.5 0 0 1 8 19l-5 2 1.5-5A8.5 8.5 0 1 1 20.5 11.5Z" />
          <path d="m9 6.5-1.5.8c-1.2 1.1.4 4.8 3.4 6.7 2.2 1.4 3.5 1.5 4.3.5l.8-1.5-2.5-1.3-.9 1c-1.3-.5-2.4-1.5-3-2.8l1-.9L9 6.5Z" />
        </svg>
        <span className="contact-whatsapp-copy"><strong>Conversar pelo WhatsApp</strong><span>{profile.phone}</span></span>
        <ExternalArrow />
      </a>
    </header></SectionIntro>
    <div className="contact-bottom"><p>{profile.name}<br /><span>{profile.location}</span></p><div><a className="text-link" href={profile.phoneHref}>{profile.phone}</a><a className="text-link" href={profile.github} target="_blank" rel="noopener noreferrer">GitHub <ExternalArrow /></a><a className="text-link" href="#inicio">Voltar ao início</a></div></div>
  </footer>
}
