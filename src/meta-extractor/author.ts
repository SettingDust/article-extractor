// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { MetaExtractor } from '.'
import { distinct, Observable, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import { Organization, Person } from 'schema-dts'
import { $operators } from './utils'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $string from '../utils/$string'

export const extractors: { [key: string]: MetaExtractor<string> } = {
  jsonld: pipe(
    $jsonld,
    $jsonld.get<Person | Organization>(
      'author',
      (it) => !it['@type'].endsWith('Rating')
    ),
    map((it) =>
      typeof it === 'string'
        ? it
        : typeof it.name === 'string'
        ? it.name
        : it.name['name'] ?? it.name.toString()
    )
  ),
  meta: pipe($element.attribute.content('meta[name="author"]')),
  'itemprop name': $element.text.query(
    '[itemprop*="author" i] [itemprop="name"]'
  ),
  itemprop: pipe($element.text.query('[itemprop*="author" i]')),
  rel: pipe($element.text.query('[rel="author"]')),
  'a class': pipe($element.text.query('a[class*="author" i]')),
  'class a': pipe($element.text.query('[class*="author" i] a')),
  href: pipe($element.text.query('a[href*="/author/" i]')),
  class: pipe($element.text.query('[class*="author" i]'))
}

export default (document: Observable<Document>) =>
  document.pipe(
    $operators(extractors),
    $string.validate,
    $string.notBlank,
    $string.condense,
    distinct(),
    map((author) => ({ author: { name: author } }))
  )
