// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-url/index.js

import { ExtractOperators, Extractor } from './utils'
import { defaultIfEmpty, distinct, from, pipe, switchMap, toArray } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $string from '../utils/$string'
import $url from '../utils/$url'

export default <Extractor<string, { url: string }>>{
  operators: new ExtractOperators({
    jsonld: pipe(
      $jsonld,
      $jsonld.get('url', (it) => it['@type']?.endsWith('Page'))
    ),
    'meta og': $element.attribute.content('meta[property="og:url"]'),
    'meta twitter': $element.attribute.content('meta[property="twitter:url"]'),
    'meta twitter attr name': $element.attribute.content(
      'meta[name="twitter:url"]'
    ),
    'link canonical': $element.attribute.href('link[rel="canonical"]'),
    'link alternate': $element.attribute.href('link[rel="alternate"]'),
    'post title class': $element.attribute.href('.post-title a'),
    'entry title class': $element.attribute.href('.entry-title a'),
    'h1 h2 like title': $element.attribute.href(
      ':is(h1, h2)[class*="title" i] a'
    )
  }),

  extractor: pipe(
    $string.validate,
    $string.trim,
    $url.validate,
    distinct(),
    map((url) => ({ url }))
  ),

  picker: pipe(
    toArray(),
    switchMap((array) =>
      from(array).pipe(
        map((it) => ({ source: it.title, target: it.source.url })),
        $string.closest,
        filter((it) => it.distance > 0.7 * it.source.length),
        map(({ result }) => ({ url: result })),
        defaultIfEmpty(array[0].source)
      )
    )
  )
}
