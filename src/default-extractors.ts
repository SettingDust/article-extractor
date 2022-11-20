import titleExtractor from './title-extractor'
import urlExtractor from './url-extractor'
import memoized from 'nano-memoize'

export type ExtractOperator = (document: Document, url?: string) => string[]

export interface Extractor<T, U = string> {
  operators: ExtractOperators
  processor: (value: string[], inputUrl?: string) => U[]
  selector: (value: U[], title?: string, inputUrl?: string) => T
}

/**
 * Digit string won't keep the insertion order in object. Have to set index manually
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
      if (!keys.has(current)) keys.add(current)
      else items.splice(index, 1)
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

/**
 * Optional defaultExtractors that mutable
 */
const defaultExtractors = await Promise.all([
  import('./author-extractor'),
  import('./author-url-extractor'),
  import('./published-date-extractor'),
  import('./modified-date-extractor'),
  import('./content-extractor')
]).then((it) => it.map((it) => it.default))

export type ExtractorExtracted<T extends Extractor<unknown, unknown>> =
  T extends Extractor<infer R, unknown> ? R : never

export type ExtractorProcessed<T extends Extractor<unknown, unknown>> =
  T extends Extractor<unknown, infer R> ? R : never

export type DefaultExtractors = typeof defaultExtractors[number]

export type TitleExtracted = ExtractorExtracted<typeof titleExtractor>
export type UrlExtracted = ExtractorExtracted<typeof urlExtractor>

export default defaultExtractors as Extractor<
  ExtractorExtracted<DefaultExtractors>,
  ExtractorProcessed<DefaultExtractors>
>[]
