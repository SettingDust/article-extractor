import {
  concatMap,
  from,
  map,
  Observable,
  OperatorFunction,
  pipe,
  take
} from 'rxjs'

export const $operate = <T>(operators: ExtractOperators<T>) =>
  pipe(($document: Observable<Document>) =>
    from(operators).pipe(
      map((it) => it[1]),
      concatMap((it) => it($document))
    )
  )

export type ExtractOperator<T> = OperatorFunction<Document, T>

export interface Extractor<T, U> {
  operators: ExtractOperators<T>
  extractor: OperatorFunction<T, U>
  picker?: OperatorFunction<{ source: U; title: string }, U>
}

const _sequentialPicker = pipe(
  take(1),
  map(({ source }) => source)
)
export const sequentialPicker: <T>() => OperatorFunction<
  { source: T; title: string },
  T
> = () => _sequentialPicker

export class ExtractOperators<T> extends Array<[string, ExtractOperator<T>]> {
  constructor(items: { [key: string]: ExtractOperator<T> }) {
    super(...Object.entries(items))
  }

  override push(...items: [key: string, extractor: ExtractOperator<T>][]) {
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
