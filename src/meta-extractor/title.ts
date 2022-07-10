// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-title/index.js
// https://github.com/mozilla/readability/blob/master/Readability.js#L459=

import { MetaExtractor } from './index.js'
import { distinct, mergeMap, Observable, pipe, pluck } from 'rxjs'
import { map } from 'rxjs/operators'
import { $operators } from './utils.js'
import { $element, $jsonld, $string } from '../utils/index.js'

export const extractors: { [key: string]: MetaExtractor<string> } = {
  jsonld: pipe($jsonld, $jsonld.get('headline')),
  'meta og': pipe(
    $element.select.query('meta[property="og:title"]'),
    $element.attr('content')
  ),
  'meta twitter': pipe(
    $element.select.query('meta[property="twitter:title"]'),
    $element.attr('content')
  ),
  'meta twitter attr name': pipe(
    $element.select.query('meta[name="twitter:title"]'),
    $element.attr('content')
  ),
  'post title class': pipe(
    $element.select.className('post-title'),
    $element.text
  ),
  'entry title class': pipe(
    $element.select.className('entry-title'),
    $element.text
  ),
  'h1 h2 like title': pipe(
    $element.select.query(':is(h1, h2)[class*="title" i]'),
    $element.text
  ),
  title: pipe(pluck('title'))
}

const SEPARATORS = ['|', '-', '\\', '/', '>', '»', '·', '–'].map(
  (it) => ` ${it} `
)

export default (document: Observable<Document>) =>
  document.pipe(
    $operators(extractors),
    $string.validate,
    $string.notBlank,
    $string.condense,
    mergeMap((title) => {
      const separatorIndex = SEPARATORS.map((it) => title.lastIndexOf(it)).find(
        (it) => it !== -1
      )
      const titles = [title]
      if (separatorIndex !== undefined) {
        titles.push(
          title.slice(0, separatorIndex),
          title.slice(separatorIndex + 3)
        )
      }
      return titles
    }),
    distinct(),
    map((title) => ({ title }))
  )
