// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!globalThis.URLPattern) {
  await import('urlpattern-polyfill')
}

export interface ContentSelector {
  selector: string[]
  ignored?: string[]
}

export const selectors = new Map<URLPattern, ContentSelector>()
