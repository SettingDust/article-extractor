import { Readability } from '@mozilla/readability'
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
              // eslint-disable-next-line unicorn/prefer-spread
              for (const it of Array.from(document.querySelectorAll(ignored))) it.remove()
            }
          for (const selector of value.selector) {
            // eslint-disable-next-line unicorn/prefer-spread
            for (const it of Array.from(document.querySelectorAll(selector)))
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
