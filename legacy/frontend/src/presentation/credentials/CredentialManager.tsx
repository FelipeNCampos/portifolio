import { useEffect, useState, type FormEvent } from 'react'
import type { InitialCredential } from '../../infrastructure/profile/initialCredentials'
import { apiRequest } from '../../infrastructure/http/api'

export interface ManagedCredential extends InitialCredential { published: boolean }

const blank = (): ManagedCredential => ({id:crypto.randomUUID(),title:'',issuer:'',evidence:'',evidenceLabel:'Abrir comprovante',published:false})

export function CredentialManager() {
  const [items, setItems] = useState<ManagedCredential[]>([])
  const [editing, setEditing] = useState<ManagedCredential>()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  async function load() { setItems(await apiRequest<ManagedCredential[]>('/api/admin/credentials')) }
  useEffect(() => { void load().catch(error => { setMessage(error.message); setFailed(true) }) }, [])
  async function save(event: FormEvent) {
    event.preventDefault(); if (!editing) return
    setPending(true); setMessage(''); setFailed(false)
    try {
      const {id,...body} = editing
      await apiRequest(`/api/admin/credentials/${encodeURIComponent(id)}`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      await load(); setEditing(undefined); setMessage('Certificado salvo. A publicação no portfólio foi atualizada.')
    } catch (error) {setMessage(error instanceof Error ? error.message : 'Não foi possível salvar.');setFailed(true)}
    finally {setPending(false)}
  }
  function update(fields: Partial<ManagedCredential>) {setEditing(current=>current ? {...current,...fields} : current)}
  return <section className="certificate-manager" id="gerenciar-certificados"><h2>Controle de certificados</h2>
    <p>Cadastre, edite e publique os certificados que aparecem no portfólio.</p>
    <button className="button primary" onClick={()=>{setEditing(blank());setMessage('')}} disabled={pending}>Adicionar certificado</button>
    {message && <p role={failed?'alert':'status'} className={failed?'form-error':''}>{message}</p>}
    {editing && <form className="credential-editor" onSubmit={save}><h3>{items.some(item=>item.id===editing.id)?'Editar certificado':'Novo certificado'}</h3><div className="editor-grid">
      <label>Título<input required maxLength={250} value={editing.title} onChange={e=>update({title:e.target.value})} /></label>
      <label>Emissor<input required maxLength={250} value={editing.issuer} onChange={e=>update({issuer:e.target.value})} /></label>
      <label>Conclusão<input type="date" value={editing.completedAt??''} onChange={e=>update({completedAt:e.target.value||undefined})} /></label>
      <label>Carga horária<input type="number" min={1} max={10000} value={editing.hours??''} onChange={e=>update({hours:e.target.value?Number(e.target.value):undefined})} /></label>
      <label>Link do comprovante<input maxLength={1000} value={editing.evidence} onChange={e=>update({evidence:e.target.value})} placeholder="https://… ou /credentials/arquivo.pdf" /></label>
      <label>URL da credencial<input type="url" maxLength={1000} value={editing.verificationUrl??''} onChange={e=>update({verificationUrl:e.target.value||undefined})} /></label>
    </div><label className="checkbox-label"><input type="checkbox" checked={editing.published} onChange={e=>update({published:e.target.checked})} />Publicado no portfólio</label>
      <div className="editor-actions"><button className="button primary" disabled={pending}>{pending?'Salvando…':'Salvar certificado'}</button><button type="button" className="text-button" disabled={pending} onClick={()=>setEditing(undefined)}>Cancelar</button></div>
    </form>}
    <ul className="certificate-admin-list">{items.map(item=><li key={item.id}><div><strong>{item.title}</strong><small>{item.issuer} · {item.published?'Publicado':'Oculto'}</small></div><button className="button secondary" onClick={()=>{setEditing(item);setMessage('')}} disabled={pending}>Editar</button></li>)}</ul>
  </section>
}
