import { expect } from 'chai'
import parseHtml from '../utils/parse-html'
import { readFileSync } from 'node:fs'
import authorExtractor from './author-extractor'

const operate = (document: Document) =>
  authorExtractor.operators.flatMap((it) => it[1](document))

describe('AuthorExtractor', () => {
  describe('operators', () => {
    describe('jsonld', () => {
      context('when author is text', () => {
        it('should read name', () => {
          const document = parseHtml(`
            <script type='application/ld+json'>
              { "author": "top" }
            </script>`)
          const result = operate(document)
          expect(result).has.lengthOf(1)
          expect(result[0]).equals('top')
        })
      })
      context('when author is object', () => {
        it('should read name', () => {
          const document = parseHtml(`
            <script type='application/ld+json'>
              { "author": { "name": "object" } }
            </script>`)
          const result = operate(document)
          expect(result).has.lengthOf(1)
          expect(result[0]).equals('object')
        })
      })
      context('when type is Rating', () => {
        it('should ignore', () => {
          const document = parseHtml(`
            <script type='application/ld+json'>
              {
                "@graph": [{
                  "@type": "Rating",
                  "author": "rating" 
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
        'jsonld',
        'meta',
        'itemprop name',
        'itemprop',
        '\r\n  itemprop name\r\n  \r\n',
        '',
        'rel2',
        'a class',
        'class a',
        'href',
        'a class',
        'class a',
        'class'
      ])
    })
  })
})
