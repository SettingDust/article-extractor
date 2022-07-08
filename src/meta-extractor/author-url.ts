// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { MetaExtractor } from './index.js'
import {
  $attr,
  $condenseWhitespace,
  $jsonld,
  $query,
  $searchJsonld
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
        ? null
        : it.url instanceof URL
        ? it.url.toString()
        : it.url['url'] ?? it.url.toString()
    )
  ),
  'meta article': pipe(
    $query('meta[property="article:author"]'),
    $attr('content')
  ),
  'itemprop url': pipe(
    $query('[itemprop*="author" i] [itemprop="url"][href]'),
    $attr('href')
  ),
  itemprop: pipe($query('[itemprop*="author" i][href]'), $attr('href')),
  rel: pipe($query('[rel="author"][href]'), $attr('href')),
  'a class': pipe($query('a[class*="author" i][href]'), $attr('href')),
  'class a': pipe($query('[class*="author" i] a[href]'), $attr('href')),
  href: pipe($query('a[href*="/author/" i]'), $attr('href'))
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
    map((url) => ({ author: { url } }))
  )
