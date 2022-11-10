// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-date/index.js

import { ExtractOperators, Extractor } from './utils'
import parseDate from '../utils/parse-date'
import jsonld from '../utils/jsonld'
import isStringBlank from 'is-string-blank'
import elements from '../utils/elements'

export default <Extractor<string, { date: { modified: Date } }, Date>>{
  operators: new ExtractOperators<string>({
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
  processor: (value) =>
    value
      .filter((it) => typeof it === 'string' && !isStringBlank(it))
      .map((it) => parseDate(it)),
  selector: (source) => ({ date: { modified: source[0] } })
}
