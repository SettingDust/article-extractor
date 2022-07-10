// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { MetaExtractor } from './index.js'
import { distinct, Observable, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import { Organization, Person } from 'schema-dts'
import { $operators } from './utils.js'
import { $element, $jsonld, $string, $url } from '../utils/index.js'

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
        : it.url instanceof URL
          ? it.url.toString()
          : it.url['url'] ?? it.url.toString()
    )
  ),
  'meta article': pipe(
    $element.select.query('meta[property="article:author"]'),
    $element.attr('content')
  ),
  'itemprop url': pipe(
    $element.select.query('[itemprop*="author" i] [itemprop="url"][href]'),
    $element.attr('href')
  ),
  itemprop: pipe(
    $element.select.query('[itemprop*="author" i][href]'),
    $element.attr('href')
  ),
  rel: pipe(
    $element.select.query('[rel="author"][href]'),
    $element.attr('href')
  ),
  'a class': pipe(
    $element.select.query('a[class*="author" i][href]'),
    $element.attr('href')
  ),
  'class a': pipe(
    $element.select.query('[class*="author" i] a[href]'),
    $element.attr('href')
  ),
  href: pipe(
    $element.select.query('a[href*="/author/" i]'),
    $element.attr('href')
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
