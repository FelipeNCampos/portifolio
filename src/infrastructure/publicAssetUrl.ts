// Evidence paths belong to the static frontend, even when the API lives on AWS.
export function publicAssetUrl(path: string): string {
  return path.startsWith('/credentials/')
    ? `${import.meta.env?.BASE_URL || '/'}${path.slice(1)}`
    : path
}
