import {
  DefaultExtractors,
  TitleExtracted,
  UrlExtracted
} from './default-extractors'
import { DeepMerged, NestedPartial } from './utils/types'
import { Extractor, ExtractorExtracted } from './utils/extractors'
import sanitize from 'sanitize-html'
type MergedExtracted<T> = NestedPartial<DeepMerged<T>> &
  TitleExtracted &
  UrlExtracted
type DefaultExtracted = MergedExtracted<ExtractorExtracted<DefaultExtractors>>
export interface ExtractOptions<T> {
  /**
   * Url for the page. **may not be the final result**
   * @see urlExtractor
   */
  url?: string
  /**
   * Extractors for extract.
   * @see defaultExtractors
   */
  extractors?: Extractor<T>[]
  /**
   * Options of sanitize-html
   * @see https://www.npmjs.com/package/sanitize-html
   */
  sanitizeHtml?: sanitize.IOptions
  /**
   * For parse date
   * @see mapToNearestLanguage
   */
  lang?: string
}
export declare function extract(
  html: string | Document
): Promise<DefaultExtracted>
export declare function extract<T>(
  html: string | Document,
  options: Omit<ExtractOptions<T>, 'extractors'>
): Promise<DefaultExtracted>
export declare function extract<T>(
  html: string | Document,
  options?: ExtractOptions<T>
): Promise<MergedExtracted<T>>
export {}
