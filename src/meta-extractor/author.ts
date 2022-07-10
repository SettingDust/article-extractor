// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { MetaExtractor } from './index.js'
import { distinct, Observable, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import { Organization, Person } from 'schema-dts'
import { $operators } from './utils.js'
import { $element, $jsonld, $string } from '../utils/index.js'

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
  meta: pipe(
    $element.select.query('meta[name="author"]'),
    $element.attr('content')
  ),
  'itemprop name': pipe(
    $element.select.query('[itemprop*="author" i] [itemprop="name"]'),
    $element.text
  ),
  itemprop: pipe(
    $element.select.query('[itemprop*="author" i]'),
    $element.text
  ),
  rel: pipe($element.select.query('[rel="author"]'), $element.text),
  'a class': pipe($element.select.query('a[class*="author" i]'), $element.text),
  'class a': pipe(
    $element.select.query('[class*="author" i] a'),
    $element.text
  ),
  href: pipe($element.select.query('a[href*="/author/" i]'), $element.text),
  class: pipe($element.select.query('[class*="author" i]'), $element.text)
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
