export const vertices = [
  ['bridge', 0, 0],
  ['alpha', 93, -37], ['beta', 106, 55],
  ['gamma', 193, -60], ['delta', 208, 5], ['random', 152, 90], ['epsilon', 186, 140],
  ['zeta', 288, 85], ['hub', 353, 175], ['eta', 318, 250],
  ['theta', 426, -20], ['iota', 468, 65], ['kappa', 503, 160], ['lambda', 453, 290],
  ['mu', 556, 25], ['nu', 598, 115], ['xi', 598, 245], ['omicron', 518, 365],
  ['pi', 663, -15], ['rho', 668, 95], ['sigma', 664, 210], ['tau', 653, 335],
] as const

export const edges = [
  ['bridge', 'alpha'], ['bridge', 'beta'],
  ['alpha', 'gamma'], ['alpha', 'delta'], ['beta', 'delta'], ['beta', 'random'],
  ['random', 'epsilon'], ['delta', 'zeta'], ['epsilon', 'zeta'], ['epsilon', 'eta'], ['zeta', 'hub'],
  ['zeta', 'theta'], ['hub', 'iota'], ['hub', 'kappa'], ['hub', 'eta'], ['eta', 'lambda'],
  ['theta', 'iota'], ['iota', 'kappa'], ['iota', 'mu'], ['kappa', 'nu'], ['kappa', 'xi'], ['lambda', 'omicron'],
  ['mu', 'pi'], ['nu', 'rho'], ['xi', 'sigma'], ['omicron', 'tau'], ['rho', 'sigma'], ['sigma', 'tau'],
] as const

export type NetworkIconKind = 'wifi' | 'users' | 'whatsapp' | 'processing' | 'database'
export const vertexIcons: Readonly<Partial<Record<string, NetworkIconKind>>> = {
  alpha: 'users', beta: 'whatsapp', zeta: 'processing', kappa: 'processing',
  rho: 'database', sigma: 'database',
}

export const offsets = new Map<string, { x: number; y: number }>(vertices.map(([id, x, y]) => [id, { x, y }]))

function distancesFromOrigin(): Map<string, number> {
  const neighbors = new Map<string, Array<{ id: string; distance: number }>>()
  vertices.forEach(([id]) => neighbors.set(id, []))
  edges.forEach(([from, to]) => {
    const start = offsets.get(from)!
    const end = offsets.get(to)!
    // Directed flow prevents a storage branch from sending the pulse back into processing.
    neighbors.get(from)!.push({ id: to, distance: Math.hypot(end.x - start.x, end.y - start.y) })
  })
  const distances = new Map<string, number>(vertices.map(([id]) => [id, Number.POSITIVE_INFINITY]))
  distances.set('bridge', 0)
  const unsettled = new Set(vertices.map(([id]) => id))
  while (unsettled.size) {
    const current = [...unsettled].reduce((closest, id) => distances.get(id)! < distances.get(closest)! ? id : closest)
    unsettled.delete(current)
    neighbors.get(current)!.forEach(({ id, distance }) => {
      const candidate = distances.get(current)! + distance
      if (candidate < distances.get(id)!) distances.set(id, candidate)
    })
  }
  return distances
}

export const pathDistances = distancesFromOrigin()
