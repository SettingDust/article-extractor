// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-title/index.js
// https://github.com/mozilla/readability/blob/master/Readability.js#L459=

import { distinct, mergeMap, Observable, pipe, pluck } from 'rxjs'
import { map } from 'rxjs/operators'
import { $operators, Extractors } from './utils'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $string from '../utils/$string'
import memoized from 'nano-memoize'

export const extractors = new Extractors({
  jsonld: pipe($jsonld, $jsonld.get('headline')),
  'meta og': $element.attribute.content('meta[property="og:title"]'),
  'meta twitter': $element.attribute.content('meta[property="twitter:title"]'),
  'meta twitter attr name': $element.attribute.content(
    'meta[name="twitter:title"]'
  ),
  'post title class': $element.text.className('post-title'),
  'entry title class': $element.text.className('entry-title'),
  'h1 h2 like title': $element.text.query(':is(h1, h2)[class*="title" i]'),
  title: pluck('title')
})

const SEPARATORS = ['|', '-', '\\', '/', '>', '»', '·', '–'].map(
  (it) => ` ${it} `
)

export default (document: Observable<Document>) =>
  document.pipe(
    $operators(extractors),
    $string.validate,
    $string.notBlank,
    $string.condense,
    mergeMap(
      memoized((title) => {
        const separatorIndex = SEPARATORS.map((it) =>
          title.lastIndexOf(it)
        ).find((it) => it !== -1)
        const titles = [title]
        if (separatorIndex !== undefined) {
          titles.push(
            title.slice(0, separatorIndex),
            title.slice(separatorIndex + 3)
          )
        }
        return titles
      })
    ),
    distinct(),
    map((title) => ({ title }))
  )
