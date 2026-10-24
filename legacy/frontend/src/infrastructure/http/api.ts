let csrfToken = ''
export function setCsrfToken(value: string) { csrfToken = value }

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.method && !['GET', 'HEAD'].includes(options.method.toUpperCase())) {
    headers.set('X-CSRF-Token', csrfToken)
  }
  let response: Response
  try { response = await fetch(path, { ...options, headers, credentials: 'same-origin' }) }
  catch { throw new Error('Não foi possível conectar ao servidor. Tente novamente.') }
  if (response.status === 401 && path !== '/api/auth/login') {
    setCsrfToken('')
    window.dispatchEvent(new Event('auth-expired'))
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(typeof body.detail === 'string' ? body.detail : 'Verifique os dados e tente novamente.')
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export interface ManagerSession { email: string; role: 'manager'; csrf: string }
export async function login(email: string, password: string): Promise<ManagerSession> {
  const session = await apiRequest<ManagerSession>('/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password})})
  setCsrfToken(session.csrf)
  return session
}
export async function currentSession(): Promise<ManagerSession> {
  const session = await apiRequest<ManagerSession>('/api/auth/session')
  setCsrfToken(session.csrf)
  return session
}
export async function logout(): Promise<void> {
  await apiRequest('/api/auth/logout', {method:'POST'})
  setCsrfToken('')
}
