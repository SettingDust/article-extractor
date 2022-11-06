// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-date/index.js

import { distinct, merge, pipe } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { $operators, ExtractOperators, SequentialExtractor } from './utils'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $date from '../utils/$date'
import isDigitString from '@stdlib/assert-is-digit-string'

export default new (class extends SequentialExtractor<
  string,
  { date: { modified: Date } }
> {
  operators = new ExtractOperators<string>({
    jsonld: pipe($jsonld, (it) =>
      // ISO 8601
      merge(
        it.pipe($jsonld.get<string>('dateModified')),
        it.pipe($jsonld.get<string>('uploadDate'))
      )
    ),
    'meta updated': $element.attribute.content(
      'meta[property*="updated_time" i]'
    ),
    'meta modified': $element.attribute.content(
      'meta[property*="modified_time" i]'
    ),
    'itemprop modified': $element.attribute.content(
      '[itemprop*="datemodified" i]'
    )
  })

  extractor = pipe(
    $operators(() => this.operators),
    filter((it) => !!it),
    map((it) => (isDigitString(it) ? Number.parseInt(it) : it)),
    $date,
    distinct(),
    map((date) => ({ date: { modified: date } }))
  )
})()
