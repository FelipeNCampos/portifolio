import type { NetworkIconKind } from './networkGraph'

export function NetworkIcon({ kind }: { kind: NetworkIconKind }) {
  return <svg className="graph-node-icon" x="-19" y="-19" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'wifi' && <>
      <path d="M2 8a15 15 0 0 1 20 0M5.5 11.5a10 10 0 0 1 13 0M9 15a5 5 0 0 1 6 0" />
      <circle cx="12" cy="18.5" r="1" fill="currentColor" stroke="none" />
    </>}
    {kind === 'users' && <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4.6V21" />
    </>}
    {kind === 'whatsapp' && <>
      <path d="M20.5 11.5A8.5 8.5 0 0 1 8 19l-5 2 1.5-5A8.5 8.5 0 1 1 20.5 11.5Z" />
      <path d="m9 6.5-1.5.8c-1.2 1.1.4 4.8 3.4 6.7 2.2 1.4 3.5 1.5 4.3.5l.8-1.5-2.5-1.3-.9 1c-1.3-.5-2.4-1.5-3-2.8l1-.9L9 6.5Z" />
    </>}
    {kind === 'processing' && <>
      <polygon points="19.68,10.66 21.94,10.90 21.94,13.10 19.68,13.34 18.38,16.49 19.80,18.25 18.25,19.80 16.49,18.38 13.34,19.68 13.10,21.94 10.90,21.94 10.66,19.68 7.51,18.38 5.75,19.80 4.20,18.25 5.62,16.49 4.32,13.34 2.06,13.10 2.06,10.90 4.32,10.66 5.62,7.51 4.20,5.75 5.75,4.20 7.51,5.62 10.66,4.32 10.90,2.06 13.10,2.06 13.34,4.32 16.49,5.62 18.25,4.20 19.80,5.75 18.38,7.51" />
      <circle cx="12" cy="12" r="3" />
    </>}
    {kind === 'database' && <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>}
  </svg>
}
