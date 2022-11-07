import { $operate, sequentialPicker } from './utils'
import { from, lastValueFrom, mergeMap, of, toArray } from 'rxjs'
import { map } from 'rxjs/operators'
import titleExtractor from './title'
import { DOMParser } from 'linkedom'
import deepMerge from '@stdlib/utils-merge'
import extractors, { ExtractorExtracted, ExtractorsElement } from './extractors'
import { DeepMerged } from '../utils/deep-merge-types'

export const extract = (html: string | Document) => {
  const $document = of(
    typeof html === 'string'
      ? new DOMParser().parseFromString(html, 'text/html')
      : html
  )

  return lastValueFrom(
    $document.pipe(
      $operate(titleExtractor.operators),
      titleExtractor.extractor,
      map((source) => ({
        title: source.title,
        source
      })),
      sequentialPicker(),
      mergeMap(({ title }) =>
        from(extractors).pipe(
          mergeMap(({ operators, extractor, picker }) =>
            $document.pipe(
              $operate(operators),
              extractor,
              map((source) => ({
                source,
                title
              })),
              picker ?? sequentialPicker()
            )
          ),
          toArray(),
          map(
            (it) =>
              deepMerge({ title }, ...it) as DeepMerged<
                ExtractorExtracted<ExtractorsElement> & { title: string },
                Date
              >
          )
        )
      )
    )
  )
}
