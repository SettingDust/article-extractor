import { Extractor } from './utils'
import titleExtractor from './title-extractor'
import urlExtractor from './url-extractor'

export type ExtractorExtracted<T extends Extractor<unknown, unknown>> =
  T extends Extractor<infer R, unknown> ? R : never

export type ExtractorProcessed<T extends Extractor<unknown, unknown>> =
  T extends Extractor<unknown, infer R> ? R : never

/**
 * Optional defaultExtractors that mutable
 */
const defaultExtractors = await Promise.all([
  import('./author-extractor'),
  import('./author-url-extractor'),
  import('./published-date-extractor'),
  import('./modified-date-extractor')
]).then((it) => it.map((it) => it.default))

export type DefaultExtractors = typeof defaultExtractors[number]

export type TitleExtracted = ExtractorExtracted<typeof titleExtractor>
export type UrlExtracted = ExtractorExtracted<typeof urlExtractor>

export default defaultExtractors as Extractor<
  ExtractorExtracted<DefaultExtractors>,
  ExtractorProcessed<DefaultExtractors>
>[]
