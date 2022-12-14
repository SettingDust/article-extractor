// https://github.com/microlinkhq/metascraper/blob/master/packages/metascraper-title/index.js
// https://github.com/mozilla/readability/blob/master/Readability.js#L459=

import jsonld from './utils/jsonld'
import memoized from 'nano-memoize'
import elements from './utils/elements'
import isStringBlank from 'is-string-blank'
import { condenseWhitespace } from './utils/memoized-functions'
import { ExtractOperators, Extractor } from './utils/extractors'
import { CreativeWork } from 'schema-dts'

const SEPARATORS = ['|', '-', '\\', '/', '>', '»', '·', '–'].map(
  (it) => ` ${it} `
)

export default <Extractor<{ title: string }>>{
  operators: new ExtractOperators({
    jsonld: (document) => {
      const json = jsonld(document)
      return <(string | undefined)[]>jsonld.getObject<CreativeWork, 'headline'>(json, 'headline') // Maybe string only
    },
    'meta og': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property="og:title"]')
      ),
    'meta twitter': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[property="twitter:title"]')
      ),
    'meta twitter attr name': (document) =>
      elements.attribute(
        'content',
        document.querySelectorAll('meta[name="twitter:title"]')
      ),
    'post title class': (document) =>
      elements.textContent(document.querySelectorAll('.post-title')),
    'entry title class': (document) =>
      elements.textContent(document.querySelectorAll('.entry-title')),
    'h1 h2 like title': (document) =>
      elements.textContent(
        document.querySelectorAll(':is(h1, h2)[class*="title" i]')
      ),
    title: (document) => [document.title]
  }),
  processor: memoized((value) =>
    value
      .filter((it) => !isStringBlank(it))
      .map((it) => splitTitle(condenseWhitespace(it)))
  ),
  selector: (source) => ({ title: source[0] })
}

const splitTitle = memoized((title: string) => {
  const separatorIndex = SEPARATORS.map((it) => title.lastIndexOf(it)).find(
    (it) => it !== -1
  )
  if (separatorIndex !== undefined) return title.slice(0, separatorIndex)
  return title
})
