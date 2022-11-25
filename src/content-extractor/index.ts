import { Readability } from '@mozilla/readability'
/// <reference path="../../src/@types/is-string-blank.d.ts"/>
import isStringBlank from 'is-string-blank'
import { selectors } from './selector-extractors'
import { ExtractOperators, Extractor } from '../utils/extractors'
import sanitizeHtml, { defaultSanitizeOptions } from '../utils/sanitize-html'
import { minifyHtml } from '../utils/memoized-functions'

export default <Extractor<{ content: string }>>{
  operators: new ExtractOperators({
    readability: (document) => [new Readability(document).parse()?.content],
    selector: (document, url) => {
      let result = ''
      for (const [key, value] of selectors.entries()) {
        if (key.test(url)) {
          if (value.ignored)
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
  selector: (source, title, context) => ({
    content: minifyHtml(
      sanitizeHtml(source[0], context?.sanitizeHtml ?? defaultSanitizeOptions)
    )
  })
}
