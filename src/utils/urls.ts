import _normalizeUrl from 'normalize-url'
import { relativeToAbsolute } from '@availity/resolve-url'
import memoized from 'nano-memoize'

export const normalizeUrl = memoized((url: string) =>
  _normalizeUrl(url, {
    stripWWW: false,
    sortQueryParameters: false,
    removeSingleSlash: false,
    removeTrailingSlash: false
  })
)

export const absolutifyUrl = memoized((base = '', relative = '') =>
  relativeToAbsolute(relative, base)
)

/**
 * @see https://github.com/ndaidong/article-parser/blob/main/src/utils/linker.js#L112-L127
 */
export const absolutifyDocument = memoized(
  (document: Document, baseUrl = document.baseURI) => {
    if (!baseUrl) return document
    for (const element of document.querySelectorAll('a')) {
      const href = element.getAttribute('href')
      if (href) element.setAttribute('href', absolutifyUrl(baseUrl, href))
    }

    for (const element of document.querySelectorAll('img')) {
      const source = element.dataset.src ?? element.getAttribute('src')
      if (source) element.setAttribute('src', absolutifyUrl(baseUrl, source))
    }

    return document
  }
)
