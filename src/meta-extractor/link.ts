// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-url/index.js

import { MetaExtractor } from '.'
import { $operators } from './utils'
import { distinct, Observable, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $string from '../utils/$string'
import $url from '../utils/$url'

export const extractors: { [key: string]: MetaExtractor<string> } = {
  jsonld: pipe(
    $jsonld,
    $jsonld.get('url', (it) => it['@type']?.endsWith('Page'))
  ),
  'meta og': pipe(
    $element.select.query('meta[property="og:url"]'),
    $element.attribute('content')
  ),
  'meta twitter': pipe(
    $element.select.query('meta[property="twitter:url"]'),
    $element.attribute('content')
  ),
  'meta twitter attr name': pipe(
    $element.select.query('meta[name="twitter:url"]'),
    $element.attribute('content')
  ),
  'link canonical': pipe(
    $element.select.query('link[rel="canonical"]'),
    $element.attribute('href')
  ),
  'link alternate': pipe(
    $element.select.query('link[rel="alternate"]'),
    $element.attribute('href')
  ),
  'post title class': pipe(
    $element.select.query('.post-title a'),
    $element.attribute('href')
  ),
  'entry title class': pipe(
    $element.select.query('.entry-title a'),
    $element.attribute('href')
  ),
  'h1 h2 like title': pipe(
    $element.select.query(':is(h1, h2)[class*="title" i] a'),
    $element.attribute('href')
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
