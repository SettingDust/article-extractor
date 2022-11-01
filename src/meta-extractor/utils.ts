import {
  first,
  from,
  map,
  Observable,
  ObservableInput,
  of,
  OperatorFunction,
  pipe,
  switchMap
} from 'rxjs'
import memoized from 'nano-memoize'

export const $operators = memoized(<T>(extractors: () => ExtractOperators<T>) =>
  pipe(
    map<Document, Observable<Document>>((it) => of(it)),
    switchMap<Observable<Document>, ObservableInput<T>>((document) =>
      from(extractors()).pipe(
        map((it) => it[1]),
        switchMap((it) => it(document))
      )
    )
  )
)

export type ExtractOperator<T> = OperatorFunction<Document, T>

export interface Extractor<T, U> {
  operators: ExtractOperators<T>
  extractor: OperatorFunction<Document, U>
  picker: OperatorFunction<{ source: U; title: string }, U>
}

export abstract class SequentialExtractor<T, U> implements Extractor<T, U> {
  abstract extractor: OperatorFunction<Document, U>
  abstract operators: ExtractOperators<T>
  picker: OperatorFunction<{ source: U; title: string }, U> = pipe(
    first(),
    map(({ source }) => source)
  )
}

export class ExtractOperators<T> extends Array<[string, ExtractOperator<T>]> {
  constructor(items: { [key: string]: ExtractOperator<T> }) {
    super(...Object.entries(items))
  }

  push(...items: [key: string, extractor: ExtractOperator<T>][]) {
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
    extractor: ExtractOperator<T>,
    index: number = this.findIndex(([it]) => it === key)
  ) {
    this.removeIf(([it]) => it === key)
    if (index === -1) this.push([key, extractor])
    else this.splice(index, 0, [key, extractor])
    return this
  }

  get = (key: string) => this.find(([it]) => it === key)

  private removeIf(
    callback: (value: [string, ExtractOperator<T>], index: number) => boolean
  ) {
    let index = this.length
    while (index--) if (callback(this[index], index)) this.splice(index, 1)
  }
}
