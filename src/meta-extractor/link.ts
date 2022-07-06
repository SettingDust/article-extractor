// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-url/index.js

import { StringMetaExtractor } from './index.js'
import { $attr, $query } from './utils.js'
import { concatMap, distinct, from, Observable, pipe } from 'rxjs'
import isStringBlank from 'is-string-blank'
import { filter, map } from 'rxjs/operators'

export const extractors: { [key: string]: StringMetaExtractor } = {
  'meta og': pipe($query('meta[property="og:url"]'), $attr('content')),
  'meta twitter': pipe(
    $query('meta[property="twitter:url"]'),
    $attr('content')
  ),
  'meta twitter attr name': pipe(
    $query('meta[name="twitter:url"]'),
    $attr('content')
  ),
  'link canonical': pipe($query('link[rel="canonical"]'), $attr('href')),
  'link alternate': pipe($query('link[rel="alternate"]'), $attr('href')),
  'post title class': pipe($query('.post-title a'), $attr('href')),
  'entry title class': pipe($query('.entry-title a'), $attr('href')),
  'h1 h2 like title': pipe(
    $query(':is(h1, h2)[class*="title" i] a'),
    $attr('href')
  )
}

const $operators = (document: Observable<Document>) =>
  from(Object.values(extractors)).pipe(
    map((it) => it(document)),
    concatMap((it) => it)
  )

export default (document: Observable<Document>) =>
  $operators(document).pipe(
    filter((it) => !isStringBlank(it)),
    map((it) => it.trim()),
    distinct(),
    map((link) => ({ link }))
  )
