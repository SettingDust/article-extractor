export type ExtractOperator<T> = (document: Document, url?: string) => T[]

export interface Extractor<T, U, V = T> {
  operators: ExtractOperators<T>
  processor: (value: T[], inputUrl?: string) => V[]
  selector: (value: V[], title?: string, inputUrl?: string) => U
}

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
