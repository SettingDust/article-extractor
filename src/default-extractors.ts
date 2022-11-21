import titleExtractor from './title-extractor'
import urlExtractor from './url-extractor'
import { Extractor, ExtractorExtracted } from './utils/extractors'

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

export type DefaultExtractors = typeof defaultExtractors[number]

export type TitleExtracted = ExtractorExtracted<typeof titleExtractor>
export type UrlExtracted = ExtractorExtracted<typeof urlExtractor>

export default defaultExtractors as Extractor<
  ExtractorExtracted<DefaultExtractors>
>[]
