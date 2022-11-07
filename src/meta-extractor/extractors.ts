import { firstValueFrom, merge, mergeAll, toArray } from 'rxjs'
import { map } from 'rxjs/operators'
import { Extractor } from './utils'

export type ExtractorOperated<T extends Extractor<unknown, unknown>> =
  T extends Extractor<infer R, unknown> ? R : never

export type ExtractorExtracted<T extends Extractor<unknown, unknown>> =
  T extends Extractor<unknown, infer R> ? R : never

const extractors = await firstValueFrom(
  merge([
    import('./url'),
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

export type ExtractorsElement = typeof extractors[number]

export default extractors as Extractor<
  ExtractorOperated<ExtractorsElement>,
  ExtractorExtracted<ExtractorsElement>
>[]
