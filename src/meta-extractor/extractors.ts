import { Extractor } from './utils'
import { Generated } from '../utils/types'

export type ExtractorExtracted<T extends Extractor<unknown, unknown>> =
  T extends Extractor<infer R, unknown> ? R : never

export type ExtractorProcessed<T extends Extractor<unknown, unknown>> =
  T extends Extractor<unknown, infer R> ? R : never

/**
 * Optional extractors that mutable
 */
const extractors = (function* () {
  yield import('./author-extractor').then((it) => it.default)
  yield import('./author-url-extractor').then((it) => it.default)
  yield import('./published-date-extractor').then((it) => it.default)
  yield import('./modified-date-extractor').then((it) => it.default)
  yield import('./content-extractor').then((it) => it.default)
})()

export type ExtractorsElement = Awaited<Generated<typeof extractors>>

export default extractors as Generator<
  Promise<
    Extractor<
      ExtractorExtracted<ExtractorsElement>,
      ExtractorProcessed<ExtractorsElement>
    >
  >
>
