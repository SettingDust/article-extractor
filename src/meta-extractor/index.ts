import { $operate, sequentialPicker } from './utils'
import { from, lastValueFrom, mergeMap, of, reduce } from 'rxjs'
import { map } from 'rxjs/operators'
import titleExtractor from './title'
import { DOMParser } from 'linkedom'
import _deepMerge from 'ts-deepmerge'
import extractors from './extractors'
import { interopImportCJSDefault } from 'node-cjs-interop'

const deepMerge = interopImportCJSDefault(_deepMerge)

export const extract = (html: string | Document) => {
  const $document = of(
    typeof html === 'string'
      ? new DOMParser().parseFromString(html, 'text/html')
      : html
  )

  return lastValueFrom(
    $document.pipe(
      $operate(titleExtractor.operators),
      titleExtractor.processor,
      map((source) => ({
        title: source.title,
        source
      })),
      sequentialPicker(),
      mergeMap(({ title }) =>
        from(extractors).pipe(
          mergeMap(({ operators, processor, selector }) =>
            $document.pipe(
              $operate(operators),
              processor,
              map((source) => ({
                source,
                title
              })),
              selector ?? sequentialPicker()
            )
          ),
          reduce((accumulator, value) => deepMerge(accumulator, value)),
          map((it) => {
            const result = deepMerge({ title }, it)
            return <{ title: string } & RecursivePartial<typeof result>>result
          })
        )
      )
    )
  )
}
