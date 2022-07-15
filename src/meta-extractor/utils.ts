import {
  from,
  map,
  Observable,
  ObservableInput,
  of,
  pipe,
  switchMap
} from 'rxjs'
import { MetaExtractor } from '.'
import memoized from 'nano-memoize'

export const $operators = memoized(<T>(extractors: Extractors<T>) =>
  pipe(
    map<Document, Observable<Document>>((it) => of(it)),
    switchMap<Observable<Document>, ObservableInput<T>>((document) =>
      from(extractors).pipe(
        map((it) => it[1]),
        switchMap((it) => it(document))
      )
    )
  )
)

export class Extractors<T> extends Array<[string, MetaExtractor<T>]> {
  constructor(items: { [key: string]: MetaExtractor<T> }) {
    super(...Object.entries(items))
  }

  push(...items: [key: string, extractor: MetaExtractor<T>][]) {
    const keys = new Set<string>()
    let index = this.length
    while (index--) {
      const current = items[index][0]
      if (!keys.has(current)) keys.add(current)
      else items.splice(index, 1)
    }
    this.removeIf(([it]) => keys.has(it))
    return super.push(...items)
  }

  set(
    key: string,
    extractor: MetaExtractor<T>,
    index: number = this.findIndex(([it]) => it === key)
  ) {
    this.removeIf(([it]) => it === key)
    this.splice(index, 0, [key, extractor])
    return this
  }

  get = (key: string) => this.find(([it]) => it === key)

  private removeIf(
    callback: (value: [string, MetaExtractor<T>], index: number) => boolean
  ) {
    let index = this.length
    while (index--) if (callback(this[index], index)) this.splice(index, 1)
  }
}
