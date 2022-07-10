// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-url/index.js

import { MetaExtractor } from './index.js'
import { $operators } from './utils.js'
import { distinct, Observable, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import { $element, $jsonld, $string, $url } from '../utils/index.js'

export const extractors: { [key: string]: MetaExtractor<string> } = {
  jsonld: pipe(
    $jsonld,
    $jsonld.get('url', (it) => it['@type']?.endsWith('Page'))
  ),
  'meta og': pipe(
    $element.select.query('meta[property="og:url"]'),
    $element.attr('content')
  ),
  'meta twitter': pipe(
    $element.select.query('meta[property="twitter:url"]'),
    $element.attr('content')
  ),
  'meta twitter attr name': pipe(
    $element.select.query('meta[name="twitter:url"]'),
    $element.attr('content')
  ),
  'link canonical': pipe(
    $element.select.query('link[rel="canonical"]'),
    $element.attr('href')
  ),
  'link alternate': pipe(
    $element.select.query('link[rel="alternate"]'),
    $element.attr('href')
  ),
  'post title class': pipe(
    $element.select.query('.post-title a'),
    $element.attr('href')
  ),
  'entry title class': pipe(
    $element.select.query('.entry-title a'),
    $element.attr('href')
  ),
  'h1 h2 like title': pipe(
    $element.select.query(':is(h1, h2)[class*="title" i] a'),
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
    map((link) => ({ link }))
  )
