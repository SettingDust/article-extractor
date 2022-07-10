// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { MetaExtractor } from '.'
import { distinct, Observable, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import { Organization, Person } from 'schema-dts'
import { $operators } from './utils'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $string from '../utils/$string'
import $url from '../utils/$url'

export const extractors: { [key: string]: MetaExtractor<string> } = {
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
  'meta article': pipe(
    $element.select.query('meta[property="article:author"]'),
    $element.attribute('content')
  ),
  'itemprop url': pipe(
    $element.select.query('[itemprop*="author" i] [itemprop="url"][href]'),
    $element.attribute('href')
  ),
  itemprop: pipe(
    $element.select.query('[itemprop*="author" i][href]'),
    $element.attribute('href')
  ),
  rel: pipe(
    $element.select.query('[rel="author"][href]'),
    $element.attribute('href')
  ),
  'a class': pipe(
    $element.select.query('a[class*="author" i][href]'),
    $element.attribute('href')
  ),
  'class a': pipe(
    $element.select.query('[class*="author" i] a[href]'),
    $element.attribute('href')
  ),
  href: pipe(
    $element.select.query('a[href*="/author/" i]'),
    $element.attribute('href')
  )
}

export default (document: Observable<Document>) =>
  document.pipe(
    $operators(extractors),
    $string.validate,
    $string.trim,
    $url.validate,
    distinct(),
    map((url) => ({ author: { url } }))
  )
