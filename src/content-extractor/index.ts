import isStringBlank from 'is-string-blank'
import { Readability } from '@mozilla/readability'
import { ExtractOperators, Extractor } from '../default-extractors'
import { selectors } from './selector-extractors'

export default <Extractor<{ content: string }>>{
  operators: new ExtractOperators({
    readability: (document, url) => {
      const result = new Readability(document)
      if (!document.baseURI && url) {
        const base = document.createElement('base')
        base.setAttribute('href', url)
        document.head.append(base)
      }
      return document.baseURI ? [result.parse()?.content] : []
    },
    selector: (document, url) => {
      let result = ''
      for (const [key, value] of selectors.entries()) {
        if (key.test(url)) {
          for (const ignored of value.ignored) {
            for (const it of document.querySelectorAll(ignored)) it.remove()
          }
          for (const selector of value.selector) {
            for (const it of document.querySelectorAll(selector))
              result += it.outerHTML
          }
        }
      }
      return [result]
    }
  }),
  processor: (value) => value.filter((it) => !isStringBlank(it)),
  selector: (source) => ({ content: source[0] })
}
