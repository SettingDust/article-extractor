import titleExtractor from './title-extractor'
import urlExtractor from './url-extractor'
import { DOMParser } from 'linkedom'
import defaultExtractors, {
  DefaultExtractors,
  ExtractorExtracted,
  TitleExtracted,
  UrlExtracted
} from './default-extractors'
import { NestedPartialK, TMerged } from '../utils/types'
import { dedupe, deepMerge } from '../utils/memoized-functions'
import { Extractor } from './utils'

export async function extract(
  html: string | Document,
  inputUrl?: string
): Promise<
  NestedPartialK<ExtractorExtracted<DefaultExtractors>> &
    ExtractorExtracted<typeof titleExtractor> &
    ExtractorExtracted<typeof urlExtractor>
>

export async function extract<T>(
  html: string | Document,
  inputUrl?: string,
  extractors = <Extractor<T, unknown>[]>defaultExtractors
) {
  const document =
    typeof html === 'string'
      ? <Document>(<unknown>new DOMParser().parseFromString(html, 'text/html'))
      : html

  const title = titleExtractor.selector(
    titleExtractor.processor(
      titleExtractor.operators.flatMap((it) => it[1](document)),
      inputUrl
    ),
    undefined,
    inputUrl
  )

  const url = urlExtractor.selector(
    urlExtractor.processor(
      urlExtractor.operators.flatMap((it) => it[1](document)),
      inputUrl
    ),
    title.title,
    inputUrl
  )

  const results = await Promise.all(extractors).then((it) =>
    it
      .map(({ operators, processor, selector }) => {
        const operated = operators
          .flatMap((it) => it[1](document))
          .filter((it) => !!it)
        const processed = dedupe(processor(operated, url.url))
        if (processed.length > 0)
          return selector(processed, title.title, url.url)
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
