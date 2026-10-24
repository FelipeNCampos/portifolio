import { useEffect, useState } from 'react'

type PublicResource<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T }

export function usePublicResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<PublicResource<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    load(controller.signal).then(data => {
      if (!controller.signal.aborted) setState({ status: 'ready', data })
    }).catch(() => {
      if (!controller.signal.aborted) setState({ status: 'error' })
    })
    return () => controller.abort()
  }, [load, attempt])
  return { state, retry: () => setAttempt(value => value + 1) }
}
