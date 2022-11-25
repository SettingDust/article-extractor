// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-date/index.js

import jsonld from './utils/jsonld'
import parseDate from './utils/parse-date'
import elements from './utils/elements'
/// <reference path="../src/@types/is-string-blank.d.ts"/>
import isStringBlank from 'is-string-blank'
import memoized from 'nano-memoize'
import { ExtractOperators, Extractor } from './utils/extractors'
import { CreativeWork, DataFeedItem, MediaObject } from 'schema-dts'

export default <Extractor<{ date: { published: Date } }>>{
  operators: new ExtractOperators({
    jsonld: (document) => {
      const json = jsonld(document)
      return <(string | undefined)[]>[
        ...jsonld.getObject<CreativeWork, 'datePublished'>(
          json,
          'datePublished'
        ),
        ...jsonld.getObject<CreativeWork | DataFeedItem, 'dateCreated'>(
          json,
          'dateCreated'
        )
      ]
    },
    'meta published': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property*="published_time" i]')
      ),
    'meta release': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property*="release_date" i]')
      ),
    'itemprop published': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('[itemprop="datepublished" i]')
      ),
    'time pubdate': (document) =>
      elements.attribute(
        'datetime',
        document.querySelectorAll('time[datetime][pubdate]')
      ),
    'meta dc date issued': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[name*="dc.date.issued" i]')
      ),
    'meta dc date created': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[name*="dc.date.created" i]')
      ),
    'property dc date created': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('[property*="dc:created" i]')
      ),
    'jsonld upload': (document) => {
      const json = jsonld(document)
      return <(string | undefined)[]>(
        jsonld.getObject<MediaObject, 'uploadDate'>(json, 'uploadDate')
      )
    },
    'meta date': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property="date" i]')
      ),
    'time itemprop': (document) =>
      elements.attribute(
        'datetime',
        document.querySelectorAll('time[itemprop*="date" i]')
      ),
    time: (document) =>
      elements.attribute(
        'datetime',
        document.querySelectorAll('time[datetime]')
      ),
    itemprop: (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('[itemprop*="date" i]')
      ),
    'meta dc date': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[name*="dc.date" i]')
      ),
    'property dc date': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('[property*="dc:date" i]')
      ),
    'id publish': (document) =>
      elements.textContent(document.querySelectorAll('[id*="publish" i]')),
    'id post timestamp': (document) =>
      elements.textContent(
        document.querySelectorAll('[id*="post-timestamp" i]')
      ),
    'class publish': (document) =>
      elements.textContent(document.querySelectorAll('[class*="publish" i]')),
    'class post timestamp': (document) =>
      elements.textContent(
        document.querySelectorAll('[class*="post-timestamp" i]')
      ),
    'class byline': (document) =>
      elements.textContent(document.querySelectorAll('[class*="byline" i]')),
    'class dateline': (document) =>
      elements.textContent(document.querySelectorAll('[class*="dateline" i]')),
    'id metadata': (document) =>
      elements.textContent(document.querySelectorAll('[id*="metadata" i]')),
    'class metadata': (document) =>
      elements.textContent(document.querySelectorAll('[class*="metadata" i]')),
    'id date': (document) =>
      elements.textContent(document.querySelectorAll('[id*="date" i]')),
    'class date': (document) =>
      elements.textContent(document.querySelectorAll('[class*="date" i]')),
    'id post meta': (document) =>
      elements.textContent(document.querySelectorAll('[id*="post-meta" i]')),
    'class post meta': (document) =>
      elements.textContent(document.querySelectorAll('[class*="post-meta" i]')),
    'id time': (document) =>
      elements.textContent(document.querySelectorAll('[id*="time" i]')),
    'class time': (document) =>
      elements.textContent(document.querySelectorAll('[class*="time" i]'))
  }),
  processor: memoized((value) => value.filter((it) => !isStringBlank(it))),
  selector: (source) => {
    let date
    for (const string of source) {
      date = parseDate(string)
      if (date) break
    }
    return {
      date: { published: date }
    }
  }
}
