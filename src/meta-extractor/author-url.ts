// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { distinct, Observable, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import { Organization, Person } from 'schema-dts'
import { $operators, Extractors } from './utils'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $string from '../utils/$string'
import $url from '../utils/$url'

export const extractors = new Extractors({
  jsonld: pipe(
    $jsonld,
    $jsonld.get<Person | Organization>(
      'author',
      (it) => !it['@type'].endsWith('Rating')
    ),
    map((it) =>
      typeof it === 'string'
        ? undefined
        : typeof it.url === 'string'
        ? it.url
        : it.url['url'] ?? it.url.toString()
    )
  ),
  'meta article': $element.attribute.content('meta[property="article:author"]'),
  'itemprop url': $element.attribute.href(
    '[itemprop*="author" i] [itemprop="url"][href]'
  ),
  itemprop: $element.attribute.href('[itemprop*="author" i][href]'),
  rel: $element.attribute.href('[rel="author"][href]'),
  'a class': $element.attribute.href('a[class*="author" i][href]'),
  'class a': $element.attribute.href('[class*="author" i] a[href]'),
  href: $element.attribute.href('a[href*="/author/" i]')
})

export default (document: Observable<Document>) =>
  document.pipe(
    $operators(extractors),
    $string.validate,
    $string.trim,
    $url.validate,
    distinct(),
    map((url) => ({ author: { url } }))
  )
