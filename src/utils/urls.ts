import _normalizeUrl from 'normalize-url'

export const normalizeUrl = (url: string) =>
  _normalizeUrl(url, {
    stripWWW: false,
    sortQueryParameters: false,
    removeSingleSlash: false,
    removeTrailingSlash: false
  })

export const absoluteUrl = (base: string, relative: string) =>
  relative ? new URL(relative, base).toString() : new URL(base).toString()
