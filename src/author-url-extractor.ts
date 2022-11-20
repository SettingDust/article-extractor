// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { Organization, Person } from 'schema-dts'
import jsonld from './utils/jsonld'
import elements from './utils/elements'
import { absoluteUrl, normalizeUrl } from './utils/urls'
import isURI from '@stdlib/assert-is-uri'
import memoized from 'nano-memoize'
import { ExtractOperators, Extractor } from './utils/extractors'

export default <Extractor<{ author: { url: string } }>>{
  operators: new ExtractOperators({
    jsonld: (document) => {
      const json = jsonld(document)
      const author = jsonld.get<Person | Organization>(
        json,
        'author',
        (it) => !it['@type']?.endsWith('Rating')
      )
      return author.map((it) =>
        typeof it === 'string' ? it : it.url.toString()
      )
    },
    'meta article': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property="article:author"]')
      ),
    'itemprop url': (document) =>
      elements.attribute(
        'href',
        document.querySelectorAll(
          '[itemprop*="author" i] [itemprop="url"][href]'
        )
      ),
    itemprop: (document) =>
      elements.attribute(
        'href',
        document.querySelectorAll('[itemprop*="author" i][href]')
      ),
    rel: (document) =>
      elements.attribute(
        'href',
        document.querySelectorAll('[rel="author"][href]')
      ),
    'a class': (document) =>
      elements.attribute(
        'href',
        document.querySelectorAll('a[class*="author" i][href]')
      ),
    'class a': (document) =>
      elements.attribute(
        'href',
        document.querySelectorAll('[class*="author" i] a[href]')
      ),
    href: (document) =>
      elements.attribute(
        'href',
        document.querySelectorAll('a[href*="/author/" i]')
      )
  }),
  processor: memoized((value, inputUrl) =>
    value
      .map((it) => normalizeUrl(absoluteUrl(inputUrl, it)))
      .filter((it) => isURI(it))
  ),
  selector: (source) => ({ author: { url: source[0] } })
}
