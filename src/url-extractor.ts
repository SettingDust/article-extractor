// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-url/index.js

import jsonld from './utils/jsonld'
import { absolutifyUrl, normalizeUrl } from './utils/urls'
import isURI from '@stdlib/assert-is-uri'
import { closest } from './utils/memoized-functions'
import elements from './utils/elements'
import memoized from 'nano-memoize'
import { ExtractOperators, Extractor } from './utils/extractors'

export default <Extractor<{ url: string }>>{
  operators: new ExtractOperators({
    jsonld: (document) => {
      const json = jsonld(document)
      return jsonld.get<string>(json, 'url', (it) =>
        it['@type']?.endsWith('Page')
      )
    },
    'meta og': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property="og:url"]')
      ),
    'meta twitter': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property="twitter:url"]')
      ),
    'meta twitter attr name': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[name="twitter:url"]')
      ),
    'link canonical': (document) =>
      elements.attribute(
        'href',
        document.querySelectorAll('link[rel="canonical"]')
      ),
    'link alternate': (document) =>
      elements.attribute(
        'href',
        document.querySelectorAll('link[rel="alternate"]')
      ),
    'post title class': (document) =>
      elements.attribute('href', document.querySelectorAll('.post-title a')),
    'entry title class': (document) =>
      elements.attribute('href', document.querySelectorAll('.entry-title a')),
    'h1 h2 like title': (document) =>
      elements.attribute(
        'href',
        document.querySelectorAll(':is(h1, h2)[class*="title" i] a')
      )
  }),

  processor: memoized((value, context) =>
    value
      .map((it) => normalizeUrl(absolutifyUrl(context?.url, it)))
      .filter((it) => isURI(it))
  ),

  selector: memoized((value, title, context) => {
    if (context?.url) value.push(context?.url)
    const { distance, result } = closest(title, ...value)
    return distance > 0.7 * title.length
      ? { url: context?.url ?? value[0] }
      : { url: result }
  })
}
