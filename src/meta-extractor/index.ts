import { Extractor } from './utils'
import { firstValueFrom, merge, switchAll, toArray } from 'rxjs'
import { map } from 'rxjs/operators'

export const extractors: Extractor<unknown, unknown>[] = await firstValueFrom(
  merge([
    import('./title'),
    import('./link'),
    import('./author'),
    import('./author-url'),
    import('./published-date'),
    import('./modified-date')
  ]).pipe(
    switchAll(),
    map((it) => it.default),
    toArray()
  )
)

export function extract(html: string | Document, url?: string) {}
