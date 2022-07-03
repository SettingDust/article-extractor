// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-title/index.js
// https://github.com/mozilla/readability/blob/master/Readability.js#L459=

import { StringMetaExtractor } from './index.js'
import { $attr, $query, $queryByClass, $text } from './utils.js'
import { concat, first, Observable, pipe, pluck } from 'rxjs'
import isStringBlank from 'is-string-blank'

export const extractors: { [key: string]: StringMetaExtractor } = {
  'meta og': pipe($query('meta[property="og:title"]'), $attr('content')),
  'meta twitter': pipe($query('meta[property="twitter:title"]'), $attr('content')),
  'meta twitter attr name': pipe($query('meta[name="twitter:title"]'), $attr('content')),
  'post title class': pipe($queryByClass('post-title'), $text),
  'entry title class': pipe($queryByClass('entry-title'), $text),
  'a like title': pipe($query('h1[class*="title" i], h2[class*="title" i] a'), $text),
  'h1 h2 like title': pipe($query('h1[class*="title" i], h2[class*="title" i]'), $text),
  title: pipe(pluck('title'))
}

const $operators = (document: Observable<Document>) =>
  concat(...Object.values(extractors).map((it) => document.pipe(it)))

export default (document: Observable<Document>) => $operators(document).pipe(first((it) => !isStringBlank(it)))
