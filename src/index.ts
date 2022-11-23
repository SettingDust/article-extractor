import titleExtractor from './title-extractor'
import urlExtractor from './url-extractor'
import { DOMParser } from 'linkedom'
import defaultExtractors, {
  DefaultExtractors,
  TitleExtracted,
  UrlExtracted
} from './default-extractors'
import { DeepMerged, NestedPartial } from './utils/types'
import { dedupe, deepMerge } from './utils/memoized-functions'
import { Extractor, ExtractorExtracted } from './utils/extractors'
import sanitizeHtml, { defaultSanitizeOptions } from './utils/sanitize-html'
import sanitize from 'sanitize-html'
import { absolutifyDocument } from './utils/urls'

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

export async function extract(
  html: string | Document
): Promise<DefaultExtracted>

export async function extract<T>(
  html: string | Document,
  options: Omit<ExtractOptions<T>, 'extractors'>
): Promise<DefaultExtracted>

export async function extract<T>(
  html: string | Document,
  options?: ExtractOptions<T>
): Promise<MergedExtracted<T>>

export async function extract<T>(
  html: string | Document,
  options: ExtractOptions<T> = {}
) {
  options = {
    extractors: <Extractor<T>[]>defaultExtractors,
    sanitizeHtml: defaultSanitizeOptions,
    ...options
  }
  let document =
    typeof html === 'string'
      ? (new DOMParser().parseFromString(
          sanitizeHtml(html, options.sanitizeHtml),
          'text/html'
        ) as unknown as Document)
      : html

  options.lang ??= document.documentElement.lang

  const title = titleExtractor.selector(
    titleExtractor.processor(
      [
        ...titleExtractor.operators
          .flatMap((it) => it[1](document))
          .filter((it) => !!it)
      ],
      options
    ),
    undefined,
    options
  )

  const url = urlExtractor.selector(
    urlExtractor.processor(
      [
        ...urlExtractor.operators
          .flatMap((it) => it[1](document))
          .filter((it) => !!it)
      ],
      options
    ),
    title.title,
    options
  )

  if (!document.baseURI && url.url) {
    const base = document.createElement('base')
    base.setAttribute('href', url.url)
    document.head.append(base)
  }

  document = absolutifyDocument(document)

  const context = {
    ...options,
    url: url.url
  }

  const results = await Promise.all(options.extractors).then((it) =>
    it
      .map(({ operators, processor, selector }) => {
        const operated = [
          ...operators
            .flatMap((it) => it[1](document, url.url))
            .filter((it) => !!it)
        ]
        const processed = dedupe(processor(operated, context))
        if (processed.length > 0)
          return selector(processed, title.title, context)
      })
      .filter((it) => !!it)
  )

  const result = deepMerge(title, url, ...results)
  return <MergedExtracted<T> & TitleExtracted & UrlExtracted>result
}
