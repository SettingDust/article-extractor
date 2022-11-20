import { expect } from 'chai'
import parseHtml from './utils/parse-html'
import { readFileSync } from 'node:fs'
import authorUrlExtractor from './author-url-extractor'

const operate = (document: Document) =>
  authorUrlExtractor.operators.flatMap((it) => it[1](document))

describe('AuthorUrlExtractor', () => {
  describe('operators', () => {
    describe('jsonld', () => {
      context('when author is text', () => {
        it('should read url', () => {
          const document = parseHtml(`
            <script type='application/ld+json'>
              { "author": "https://foo.com" }
            </script>`)
          const result = operate(document)
          expect(result).has.lengthOf(1)
          expect(result[0]).equals('https://foo.com')
        })
      })
      context('when author is object', () => {
        it('should read url', () => {
          const document = parseHtml(`
            <script type='application/ld+json'>
              { "author": { "url": "https://foo.com" } }
            </script>`)
          const result = operate(document)
          expect(result).has.lengthOf(1)
          expect(result[0]).equals('https://foo.com')
        })
      })
      context('when type is Rating', () => {
        it('should ignore', () => {
          const document = parseHtml(`
            <script type='application/ld+json'>
              {
                "@graph": [{
                  "@type": "Rating",
                  "author": "https://foo.com" 
                }]
              }
            </script>`)
          const result = operate(document)
          expect(result).be.empty
        })
      })
    })
    it('should parse correctly', () => {
      const document = parseHtml(
        readFileSync('./test/meta-test.html', { encoding: 'utf8' })
      )
      const result = operate(document)
      expect(result).deep.equals([
        'https://jsonld.com',
        'https://meta.com',
        'https://itemprop-url.com',
        'https://itemprop.com',
        'https://rel1.com',
        'https://rel2.com',
        'https://aclass.com',
        'https://classa.com',
        'https://href.com/author/'
      ])
    })
  })
})
