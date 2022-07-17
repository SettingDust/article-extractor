// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-url/index.js

import { $operators, ExtractOperators, Extractor } from './utils'
import { distinct, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $string from '../utils/$string'
import $url from '../utils/$url'

export default class extends Extractor<string, { link: string }> {
  operators = new ExtractOperators({
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
  })

  extract = pipe(
    $operators(this.operators),
    $string.validate,
    $string.trim,
    $url.validate,
    distinct(),
    map((link) => ({ link }))
  )
}
