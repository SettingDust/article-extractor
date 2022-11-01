// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-date/index.js

import { defaultIfEmpty, distinct, merge, of, pipe, switchMap } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { $operators, ExtractOperators, SequentialExtractor } from './utils'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $date from '../utils/$date'

export default new (class extends SequentialExtractor<
  Date | string | number,
  { date: { modified: Date } }
> {
  operators = new ExtractOperators<Date | string | number>({
    jsonld: (it) => {
      const graph = it.pipe($jsonld)
      // ISO 8601
      return merge(
        graph.pipe($jsonld.get<string>('dateModified')),
        graph.pipe($jsonld.get<string>('uploadDate'))
      )
    },
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
    switchMap((it) =>
      of(it).pipe(
        filter((it): it is string | number => !(it instanceof Date)),
        $date,
        defaultIfEmpty(<Date>it)
      )
    ),
    distinct(),
    map((date) => ({ date: { modified: date } }))
  )
})()
