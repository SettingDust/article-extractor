// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { CreativeWork, Rating, Thing } from 'schema-dts'
import jsonld from './utils/jsonld'
import elements from './utils/elements'
import { absolutifyUrl, normalizeUrl } from './utils/urls'
import isURI from '@stdlib/assert-is-uri'
import memoized from 'nano-memoize'
import { ExtractOperators, Extractor } from './utils/extractors'

export default <Extractor<{ author: { url: string } }>>{
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
        type AuthorArray = NonNullable<
          Exclude<
            typeof author,
            | Thing
            | {
            '@id': string
          }
          >
        >
        if (author === undefined) return []
        if (typeof author === 'string') return [author]
        if (Array.isArray(author))
          return (<AuthorArray>author).flatMap((it) => {
            if (typeof it === 'string') return [it]
            else if ('name' in it) {
              const url = it.url
              // URL should be a string
              if (typeof url === 'string') return [url]
            } else if ('@id' in it) {
              const id = it['@id']
              return [id]
            }
            return []
          })
        if (author && 'url' in author) return [author.url?.toString()]
        if (author && '@id' in author) return [author['@id']]
        return []
      })
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
  processor: memoized((value, context) =>
    value
      .map((it) => normalizeUrl(absolutifyUrl(context?.url, it)))
      .filter((it) => isURI(it))
  ),
  selector: (source) => ({ author: { url: source[0] } })
}
