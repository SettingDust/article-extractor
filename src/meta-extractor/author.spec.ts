import {
  defaultIfEmpty,
  lastValueFrom,
  of,
  pipe,
  switchMap,
  tap,
  toArray
} from 'rxjs'
import { readFile } from 'node:fs/promises'
import author from './author'
import $document from '../utils/$document'
import { expect } from 'chai'
import { $operate } from './utils'

const $author = pipe($document, $operate(author.operators))

describe('AuthorExtractor', () => {
  describe('operators', () => {
    describe('jsonld', () => {
      context('when author is text', () => {
        it('should read name', () =>
          lastValueFrom(
            of(`
            <script type='application/ld+json'>
              { "author": "top" }
            </script>`).pipe(
              $author,
              tap((it) => expect(it).equals('top'))
            )
          ))
      })
      context('when author is object', () => {
        it('should read name', () =>
          lastValueFrom(
            of(`
            <script type='application/ld+json'>
              { "author": { "name": "object" } }
            </script>`).pipe(
              $author,
              tap((it) => expect(it).equals('object'))
            )
          ))
      })
      context('when type is Rating', () => {
        it('should ignore', () =>
          lastValueFrom(
            of(`
            <script type='application/ld+json'>
              {
                "@graph": [{ 
                  "@type": "Rating",
                  "author": "rating" 
                }]
              }
            </script>`).pipe(
              $author,
              defaultIfEmpty(false),
              tap((it) => expect(it).be.false)
            )
          ))
      })
    })
    it('should parse correctly', () =>
      lastValueFrom(
        of('./test/meta-test.html').pipe(
          switchMap((it) => readFile(it, { encoding: 'utf8' })),
          $author,
          toArray(),
          tap((it) =>
            expect(it).deep.equals([
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
          )
        )
      ))
  })
})
