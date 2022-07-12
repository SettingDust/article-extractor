// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-date/index.js

import { MetaExtractor } from '.'
import {
  defaultIfEmpty,
  distinct,
  merge,
  Observable,
  of,
  pipe,
  switchMap
} from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { $operators } from './utils'
import $jsonld from '../utils/$jsonld'
import $element from '../utils/$element'
import $date from '../utils/$date'

export const extractors: {
  [key: string]: MetaExtractor<Date | string | number>
} = {
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
  time: pipe($element.attribute.datetime('time[datetime]'), $date),
  itemprop: pipe($element.attribute.content('[itemprop*="date" i]'), $date),
  'meta dc date': $element.attribute.content('meta[name*="dc.date" i]'),
  'property dc date': $element.attribute.content('[property*="dc:date" i]'),
  'id publish': pipe($element.text.query('[id*="publish" i]'), $date),
  'id post timestamp': $element.text.query('[id*="post-timestamp" i]'),
  'class publish': pipe($element.text.query('[class*="publish" i]'), $date),
  'class post timestamp': $element.text.query('[class*="post-timestamp" i]'),
  'class byline': pipe($element.text.query('[class*="byline" i]'), $date),
  'class dateline': pipe($element.text.query('[class*="dateline" i]'), $date),
  'id metadata': pipe($element.text.query('[id*="metadata" i]'), $date),
  'class metadata': pipe($element.text.query('[class*="metadata" i]'), $date),
  'id date': pipe($element.text.query('[id*="date" i]'), $date),
  'class date': pipe($element.text.query('[class*="date" i]'), $date),
  'id post meta': pipe($element.text.query('[id*="post-meta" i]'), $date),
  'class post meta': pipe($element.text.query('[class*="post-meta" i]'), $date),
  'id time': pipe($element.text.query('[id*="time" i]'), $date),
  'class time': pipe($element.text.query('[class*="time" i]'), $date)
}

export default (document: Observable<Document>) =>
  document.pipe(
    $operators(extractors),
    switchMap((it) =>
      of(it).pipe(
        filter((it): it is string | number => !(it instanceof Date)),
        $date,
        defaultIfEmpty(<Date>it)
      )
    ),
    distinct(),
    map((date) => ({ date: { published: date } }))
  )