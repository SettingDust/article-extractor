import memoized from 'nano-memoize'
import sanitize from 'sanitize-html'

export type ExtractOperator = (document: Document, url?: string) => (string | undefined)[]

export interface Extractor<T> {
  /**
   * Operators that fetch string from document
   */
  operators: ExtractOperators
  /**
   * Process raw strings from {@link operators}. Such as validate and filter.
   */
  processor: (value: string[], context?: ExtractorContext) => string[]
  /**
   * Pick one string as final result and transform to target type (eg. {@link Date}).
   */
  selector: (value: string[], title?: string, context?: ExtractorContext) => T
}

export interface ExtractorContext {
  url?: string
  sanitizeHtml?: sanitize.IOptions
  lang?: string
}

/**
 * Class for manage operators can operate with index
 * Note: digit string won't keep the insertion order in object. Have to set index manually
 */
export class ExtractOperators extends Array<[string, ExtractOperator]> {
  constructor(items: { [key: string]: ExtractOperator } = {}) {
    super(
      ...Object.entries(items).map(
        (it) => <[string, ExtractOperator]>[it[0], memoized(it[1])]
      )
    )
  }

  override push(...items: [key: string, extractor: ExtractOperator][]) {
    const keys = new Set<string>()
    let index = this.length
    while (index--) {
      const current = items[index][0]
      if (keys.has(current)) {
        items.splice(index, 1)
      } else {
        keys.add(current)
      }
    }
    this.removeIf(([it]) => keys.has(it))
    return super.push(...items)
  }

  set(
    key: string,
    extractor: ExtractOperator,
    index: number = this.findIndex(([it]) => it === key)
  ) {
    this.removeIf(([it]) => it === key)
    if (index === -1) this.push([key, memoized(extractor)])
    else this.splice(index, 0, [key, memoized(extractor)])
    return this
  }

  get = (key: string) => this.find(([it]) => it === key)

  private removeIf(
    callback: (value: [string, ExtractOperator], index: number) => boolean
  ) {
    let index = this.length
    while (index--) if (callback(this[index], index)) this.splice(index, 1)
  }
}

export type ExtractorExtracted<T extends Extractor<unknown>> =
  T extends Extractor<infer R> ? R : never
