// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { MetaExtractor } from './index.js'
import {
  $attr,
  $condenseWhitespace,
  $jsonld,
  $query,
  $searchJsonld,
  $text
} from './utils.js'
import { concatMap, distinct, from, Observable, pipe } from 'rxjs'
import isStringBlank from 'is-string-blank'
import { filter, map } from 'rxjs/operators'
import { Organization, Person } from 'schema-dts'

export const extractors: { [key: string]: MetaExtractor<string> } = {
  jsonld: pipe(
    $jsonld,
    $searchJsonld<Person | Organization>(
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
  meta: pipe($query('meta[name="author"]'), $attr('content')),
  'itemprop name': pipe(
    $query('[itemprop*="author" i] [itemprop="name"]'),
    $text
  ),
  itemprop: pipe($query('[itemprop*="author" i]'), $text),
  rel: pipe($query('[rel="author"]'), $text),
  'a class': pipe($query('a[class*="author" i]'), $text),
  'class a': pipe($query('[class*="author" i] a'), $text),
  href: pipe($query('a[href*="/author/" i]'), $text),
  class: pipe($query('[class*="author" i]'), $text)
}

const $operators = (document: Observable<Document>) =>
  from(Object.values(extractors)).pipe(
    map((it) => it(document)),
    concatMap((it) => it)
  )

export default (document: Observable<Document>) =>
  $operators(document).pipe(
    filter((it) => it && !isStringBlank(it)),
    $condenseWhitespace,
    distinct(),
    map((author) => ({ author: { name: author } }))
  )
