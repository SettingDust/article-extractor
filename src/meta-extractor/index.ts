import { Extractor } from './utils'
import {
  firstValueFrom,
  from,
  lastValueFrom,
  merge,
  mergeAll,
  of,
  reduce,
  switchMap,
  toArray
} from 'rxjs'
import { map } from 'rxjs/operators'
import isString from '@stdlib/assert-is-string'
import { default as titleExtractor } from './title'
import { DOMParser } from 'linkedom'
import { default as deepMerge } from '@stdlib/utils-merge'

export const extractors: Extractor<unknown, object>[] = await firstValueFrom(
  merge([
    import('./link'),
    import('./author'),
    import('./author-url'),
    import('./published-date'),
    import('./modified-date')
  ]).pipe(
    mergeAll(),
    map((it) => it.default),
    toArray()
  )
)

export function extract(html: string | Document) {
  const $document = of(
    isString.isPrimitive(html)
      ? ((<unknown>(
          new DOMParser().parseFromString(<string>html, 'text/html')
        )) as Document)
      : <Document>html
  )
  return lastValueFrom(
    $document.pipe(
      titleExtractor.extractor,
      ($title) =>
        titleExtractor.picker(
          $title.pipe(
            map((source) => ({
              title: source.title,
              source
            }))
          )
        ),
      switchMap(({ title }) =>
        from(extractors).pipe(
          switchMap((extractor) =>
            extractor.extractor($document).pipe(($extracted) =>
              extractor.picker(
                $extracted.pipe(
                  map((source) => ({
                    source,
                    title
                  }))
                )
              )
            )
          ),
          reduce((accumulator, value) => deepMerge(accumulator, value), {
            title
          })
        )
      )
    )
  )
}
