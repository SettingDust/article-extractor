// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-date/index.js

import parseDate from './utils/parse-date'
import jsonld from './utils/jsonld'
/// <reference path="../src/@types/is-string-blank.d.ts"/>
import isStringBlank from 'is-string-blank'
import elements from './utils/elements'
import memoized from 'nano-memoize'
import { ExtractOperators, Extractor } from './utils/extractors'
import { CreativeWork, DataFeedItem, MediaObject } from 'schema-dts'

export default <Extractor<{ date: { modified: Date } }>>{
  operators: new ExtractOperators({
    jsonld: (document) => {
      const json = jsonld(document)
      return <(string | undefined)[]>[
        ...jsonld.getObject<CreativeWork | DataFeedItem, 'dateModified'>(
          json,
          'dateModified'
        ),
        ...jsonld.getObject<MediaObject, 'uploadDate'>(json, 'uploadDate')
      ]
    },
    'meta updated': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property*="updated_time" i]')
      ),
    'meta modified': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property*="modified_time" i]')
      ),
    'itemprop modified': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('[itemprop*="datemodified" i]')
      )
  }),
  processor: memoized((value) => value.filter((it) => !isStringBlank(it))),
  selector: (source) => {
    let date
    for (const string of source) {
      date = parseDate(string)
      if (date) break
    }
    return {
      date: { modified: date }
    }
  }
}
