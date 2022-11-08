// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-date/index.js

import { distinct, merge, pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import { ExtractOperators, Extractor } from './utils'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $date from '../utils/$date'
import isDigitString from '@stdlib/assert-is-digit-string'
import $string from '../utils/$string'

export default <Extractor<string, { date: { published: Date } }>>{
  operators: new ExtractOperators<string>({
    jsonld: (it) => {
      const graph = it.pipe($jsonld)
      // ISO 8601
      return merge(
        graph.pipe($jsonld.get<string>('datePublished')),
        graph.pipe($jsonld.get<string>('dateCreated'))
      )
    },
    'meta published': $element.attribute.content(
      'meta[property*="published_time" i]'
    ),
    'meta release': $element.attribute.content(
      'meta[property*="release_date" i]'
    ),
    'itemprop published': $element.attribute.content(
      '[itemprop="datepublished" i]'
    ),
    'time pubdate': $element.attribute.datetime('time[datetime][pubdate]'),
    'meta dc date issued': $element.attribute.content(
      'meta[name*="dc.date.issued" i]'
    ),
    'meta dc date created': $element.attribute.content(
      'meta[name*="dc.date.created" i]'
    ),
    'property dc date created': $element.attribute.content(
      '[property*="dc:created" i]'
    ),
    'jsonld upload': pipe($jsonld, $jsonld.get('uploadDate')),
    'meta date': $element.attribute.content('meta[property="date" i]'),
    'time itemprop': $element.attribute.datetime('time[itemprop*="date" i]'),
    time: pipe($element.attribute.datetime('time[datetime]')),
    itemprop: pipe($element.attribute.content('[itemprop*="date" i]')),
    'meta dc date': $element.attribute.content('meta[name*="dc.date" i]'),
    'property dc date': $element.attribute.content('[property*="dc:date" i]'),
    'id publish': pipe($element.text.query('[id*="publish" i]')),
    'id post timestamp': $element.text.query('[id*="post-timestamp" i]'),
    'class publish': pipe($element.text.query('[class*="publish" i]')),
    'class post timestamp': $element.text.query('[class*="post-timestamp" i]'),
    'class byline': pipe($element.text.query('[class*="byline" i]')),
    'class dateline': pipe($element.text.query('[class*="dateline" i]')),
    'id metadata': pipe($element.text.query('[id*="metadata" i]')),
    'class metadata': pipe($element.text.query('[class*="metadata" i]')),
    'id date': pipe($element.text.query('[id*="date" i]')),
    'class date': pipe($element.text.query('[class*="date" i]')),
    'id post meta': pipe($element.text.query('[id*="post-meta" i]')),
    'class post meta': pipe($element.text.query('[class*="post-meta" i]')),
    'id time': pipe($element.text.query('[id*="time" i]')),
    'class time': pipe($element.text.query('[class*="time" i]'))
  }),
  processor: pipe(
    $string.validate,
    $string.notBlank,
    map((it) => (isDigitString(it) ? Number.parseInt(it) : it)),
    $date,
    distinct(),
    map((date) => ({ date: { published: date } }))
  )
}
