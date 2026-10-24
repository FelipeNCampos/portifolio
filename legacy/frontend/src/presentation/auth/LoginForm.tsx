import { useState, type FormEvent } from 'react'
import { login, type ManagerSession } from '../../infrastructure/http/api'
import './auth.css'

export function LoginForm({ onLogin, onBack }: { onLogin: (session: ManagerSession) => void; onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError('')
    try { const session = await login(email, password); setPassword(''); onLogin(session) }
    catch (problem) { setError(problem instanceof Error ? problem.message : 'Não foi possível entrar.'); setPassword('') }
    finally { setPending(false) }
  }
  return <section className="login-page"><form className="login-form" onSubmit={submit}>
    <p className="eyebrow">ÁREA PRIVADA</p><h1>Acesse sua gestão.</h1><p>Entre para administrar os contratos e certificados do portfólio.</p>
    <label>E-mail<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} /></label>
    <label>Senha<input type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button primary" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button>
    <button className="text-button" type="button" onClick={onBack}>Voltar ao portfólio</button>
  </form></section>
}
