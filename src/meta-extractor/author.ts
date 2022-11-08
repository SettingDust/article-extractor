// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-author/index.js

import { distinct, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import { Organization, Person } from 'schema-dts'
import { ExtractOperators, Extractor } from './utils'
import jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $string from '../utils/$string'

export default <Extractor<string, { author: { name: string } }>>{
  operators: new ExtractOperators({
    jsonld: pipe(
      jsonld,
      jsonld.get<Person | Organization>(
        'author',
        (it) => !it['@type']?.endsWith('Rating')
      ),
      map((it) => (typeof it === 'string' ? it : it.name.toString()))
    ),
    meta: pipe($element.attribute.content('meta[name="author"]')),
    'itemprop name': $element.text.query(
      '[itemprop*="author" i] [itemprop="name"]'
    ),
    itemprop: pipe($element.text.query('[itemprop*="author" i]')),
    rel: pipe($element.text.query('[rel="author"]')),
    'a class': pipe($element.text.query('a[class*="author" i]')),
    'class a': pipe($element.text.query('[class*="author" i] a')),
    href: pipe($element.text.query('a[href*="/author/" i]')),
    class: pipe($element.text.query('[class*="author" i]'))
  }),
  processor: pipe(
    $string.validate,
    $string.notBlank,
    $string.condense,
    distinct(),
    map((author) => ({ author: { name: author } }))
  )
}
