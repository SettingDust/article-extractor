// noinspection NsUnresolvedStyleClassReference

import { expect } from 'chai'
import parseHtml from './utils/parse-html'
import { readFileSync } from 'node:fs'
import urlExtractor from './url-extractor'

const operate = (document: Document) =>
  urlExtractor.operators.flatMap((it) => it[1](document))

describe('UrlExtractor', () => {
  describe('operators', () => {
    it('should read correctly', () => {
      const document = parseHtml(
        readFileSync('./test/meta-test.html', { encoding: 'utf8' })
      )
      const result = operate(document)
      expect(result).deep.equals([
        'https://jsonld.com',
        'https://og.com',
        'https://twitter.com',
        'https://twitter-name.com',
        'https://canonical.com',
        'https://alternate.com',
        'https://post-title.com',
        'https://entry-title.com',
        'https://a-title.com'
      ])
    })
  })
})
