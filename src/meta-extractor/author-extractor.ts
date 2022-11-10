// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { Organization, Person } from 'schema-dts'
import { ExtractOperators, Extractor } from './utils'
import jsonld from '../utils/jsonld'
import isStringBlank from 'is-string-blank'
import { condenseWhitespace } from '../utils/memoized-functions'
import elements from '../utils/elements'

export default <Extractor<string, { author: { name: string } }>>{
  operators: new ExtractOperators({
    jsonld: (document) => {
      const json = jsonld(document)
      const author = jsonld.get<Person | Organization>(
        json,
        'author',
        (it) => !it['@type']?.endsWith('Rating')
      )
      return author.map((it) =>
        typeof it === 'string' ? it : it.name.toString()
      )
    },
    meta: (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[name="author" i]')
      ),
    'itemprop name': (document) =>
      elements.textContent(
        document.querySelectorAll('[itemprop*="author" i] [itemprop="name"]')
      ),
    itemprop: (document) =>
      elements.textContent(document.querySelectorAll('[itemprop*="author" i]')),
    rel: (document) =>
      elements.textContent(document.querySelectorAll('[rel="author"]')),
    'a class': (document) =>
      elements.textContent(document.querySelectorAll('a[class*="author" i]')),
    'class a': (document) =>
      elements.textContent(document.querySelectorAll('[class*="author" i] a')),
    href: (document) =>
      elements.textContent(document.querySelectorAll('a[href*="/author/" i]')),
    class: (document) =>
      elements.textContent(document.querySelectorAll('[class*="author" i]'))
  }),
  processor: (value) =>
    value
      .filter((it) => typeof it === 'string' && !isStringBlank(it))
      .map((it) => condenseWhitespace(it)),
  selector: (source) => ({ author: { name: source[0] } })
}
