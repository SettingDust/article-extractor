// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-title/index.js
// https://github.com/mozilla/readability/blob/master/Readability.js#L459=

import { distinct, mergeMap, OperatorFunction, pipe, pluck, reduce } from 'rxjs'
import { map } from 'rxjs/operators'
import { $operators, ExtractOperators, Extractor } from './utils'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $string from '../utils/$string'
import memoized from 'nano-memoize'
import { closest } from 'fastest-levenshtein'

const SEPARATORS = ['|', '-', '\\', '/', '>', '»', '·', '–'].map(
  (it) => ` ${it} `
)

export default new (class implements Extractor<string, { title: string }> {
  operators = new ExtractOperators<string>({
    jsonld: pipe($jsonld, $jsonld.get('headline')),
    'meta og': $element.attribute.content('meta[property="og:title"]'),
    'meta twitter': $element.attribute.content(
      'meta[property="twitter:title"]'
    ),
    'meta twitter attr name': $element.attribute.content(
      'meta[name="twitter:title"]'
    ),
    'post title class': $element.text.className('post-title'),
    'entry title class': $element.text.className('entry-title'),
    'h1 h2 like title': $element.text.query(':is(h1, h2)[class*="title" i]'),
    title: pluck('title')
  })
  extract: OperatorFunction<Document, { title: string }> = pipe(
    $operators(this.operators),
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
  picker = pipe(
    reduce(
      (accumulator, [source, url]: [{ title: string }, string]) => {
        accumulator[0].push(source.title)
        accumulator[1] = url
        return accumulator
      },
      <[[string], string]>(<unknown>[[]])
    ),
    map(([source, url]) => ({
      title: closest(url, source)
    }))
  )
})()
