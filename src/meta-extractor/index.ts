import titleExtractor from './title-extractor'
import urlExtractor from './url-extractor'
import { DOMParser } from 'linkedom'
import _deepMerge from 'ts-deepmerge'
import { interopImportCJSDefault } from 'node-cjs-interop'
import extractors from './extractors'
import dedupe from 'dedupe'
import { NestedPartialK } from '../utils/types'

const deepMerge = interopImportCJSDefault(_deepMerge)

export const extract = async (html: string | Document, inputUrl?: string) => {
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
  return <NestedPartialK<typeof result, 'title' | 'url', Date>>result
}
