// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-title/index.js
// https://github.com/mozilla/readability/blob/master/Readability.js#L459=

import { StringMetaExtractor } from './index.js'
import { $attr, $condenseWhitespace, $query, $queryByClass, $text } from './utils.js'
import {
  concatMap,
  distinct,
  from,
  mergeMap,
  Observable,
  pipe,
  pluck
} from 'rxjs'
import isStringBlank from 'is-string-blank'
import { filter, map } from 'rxjs/operators'

export const extractors: { [key: string]: StringMetaExtractor } = {
  'meta og': pipe($query('meta[property="og:title"]'), $attr('content')),
  'meta twitter': pipe(
    $query('meta[property="twitter:title"]'),
    $attr('content')
  ),
  'meta twitter attr name': pipe(
    $query('meta[name="twitter:title"]'),
    $attr('content')
  ),
  'post title class': pipe($queryByClass('post-title'), $text),
  'entry title class': pipe($queryByClass('entry-title'), $text),
  'h1 h2 like title': pipe($query(':is(h1, h2)[class*="title" i]'), $text),
  title: pipe(pluck('title'))
}

const $operators = (document: Observable<Document>) =>
  from(Object.values(extractors)).pipe(
    map((it) => it(document)),
    concatMap((it) => it)
  )

const SEPARATORS = ['|', '-', '\\', '/', '>', '»', '·', '–'].map(
  (it) => ` ${it} `
)

export default (document: Observable<Document>) =>
  $operators(document).pipe(
    filter((it) => !isStringBlank(it)),
    $condenseWhitespace,
    mergeMap((title) => {
      const separatorIndex = SEPARATORS.map((it) => title.lastIndexOf(it)).find(
        (it) => it !== -1
      )
      const titles = [title]
      if (separatorIndex !== undefined) {
        titles.push(title.slice(0, separatorIndex))
        titles.push(title.slice(separatorIndex + 3))
      }
      return titles
    }),
    distinct(),
    map((title) => ({ title }))
  )
