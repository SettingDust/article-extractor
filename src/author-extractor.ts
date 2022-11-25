// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import jsonld from './utils/jsonld'
import isStringBlank from 'is-string-blank'
import { condenseWhitespace } from './utils/memoized-functions'
import elements from './utils/elements'
import memoized from 'nano-memoize'
import { ExtractOperators, Extractor } from './utils/extractors'
import { CreativeWork, Rating } from 'schema-dts'

export default <Extractor<{ author: { name: string } }>>{
  operators: new ExtractOperators({
    jsonld: (document) => {
      const json = jsonld(document)
      const authors = jsonld.getObject<Exclude<CreativeWork, Rating>, 'author'>(
        json,
        'author',
        (it) =>
          typeof it !== 'string' &&
          !['EndorsementRating', 'AggregateRating', 'Rating'].includes(
            it['@type']
          )
      )
      return authors.flatMap((author) => {
        if (author === undefined) return []
        if (typeof author === 'string') return [author]
        if (Array.isArray(author))
          // Should we support multiple authors?
          return author.flatMap((it) => {
            if (typeof it === 'string') return [it]
            else if ('name' in it) {
              const name = it.name
              if (typeof name === 'string') return [name]
              else if (typeof it === 'object' && 'textValue' in it)
                return [it.textValue]

            } else if ('@id' in it) {
              const id = it['@id']
              if (typeof id === 'string') return [id]
            }
            return []
          })
        if (author && 'name' in author ) return [author.name?.toString()]
        if (author && '@id' in author ) return [author['@id']]
        return []
      })
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
  processor: memoized((value) =>
    value.filter((it) => !isStringBlank(it)).map((it) => condenseWhitespace(it))
  ),
  selector: (source) => ({ author: { name: source[0] } })
}
