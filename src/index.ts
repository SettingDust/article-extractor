import titleExtractor from './title-extractor'
import urlExtractor from './url-extractor'
import { DOMParser } from 'linkedom'
import defaultExtractors, {
  DefaultExtractors,
  TitleExtracted,
  UrlExtracted
} from './default-extractors'
import { NestedPartialK, TMerged } from './utils/types'
import { dedupe, deepMerge } from './utils/memoized-functions'
import { Extractor, ExtractorExtracted } from './utils/extractors'
import sanitizeHtml, { defaultSanitizeOptions } from './utils/sanitize-html'
import sanitize from 'sanitize-html'

type DefaultExtracted = NestedPartialK<ExtractorExtracted<DefaultExtractors>> &
  TitleExtracted &
  UrlExtracted

export interface ExtractOptions<T> {
  url?: string
  extractors?: Extractor<T, unknown>[]
  sanitizeHtml?: sanitize.IOptions
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
): Promise<NestedPartialK<T & TitleExtracted & UrlExtracted>>

export async function extract<T>(
  html: string | Document,
  options: ExtractOptions<T> = {}
) {
  options = {
    extractors: <Extractor<T, unknown>[]>defaultExtractors,
    sanitizeHtml: defaultSanitizeOptions,
    ...options
  }
  const document =
    typeof html === 'string'
      ? <Document>(
          (<unknown>(
            new DOMParser().parseFromString(
              sanitizeHtml(html, options.sanitizeHtml),
              'text/html'
            )
          ))
        )
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
  return <
    NestedPartialK<TMerged<TitleExtracted | UrlExtracted | T>> &
      TitleExtracted &
      UrlExtracted
  >result
}
