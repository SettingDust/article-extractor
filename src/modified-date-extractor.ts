// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-date/index.js

import parseDate from './utils/parse-date'
import jsonld from './utils/jsonld'
import isStringBlank from 'is-string-blank'
import elements from './utils/elements'
import memoized from 'nano-memoize'
import { ExtractOperators, Extractor } from './utils/extractors'

export default <Extractor<{ date: { modified: Date } }, Date>>{
  operators: new ExtractOperators({
    jsonld: (document) => {
      const json = jsonld(document)
      return [
        ...jsonld.get<string>(json, 'dateModified'),
        ...jsonld.get<string>(json, 'uploadDate')
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
  processor: memoized((value) =>
    value.filter((it) => !isStringBlank(it)).map((it) => parseDate(it))
  ),
  selector: (source) => ({ date: { modified: source[0] } })
}
