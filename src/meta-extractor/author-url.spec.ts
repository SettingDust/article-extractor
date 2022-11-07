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
import authorUrl from './author-url'
import $document from '../utils/$document'
import { expect } from 'chai'
import { $operate } from './utils'

const $url = pipe($document, $operate(authorUrl.operators))

describe('AuthorUrlExtractor', () => {
  describe('operators', () => {
    describe('jsonld', () => {
      context('when author is text', () => {
        it('should read name', () =>
          lastValueFrom(
            of(`
                <script type='application/ld+json'>
                  { "author": "https://foo.com" }
                </script>`).pipe(
              $url,
              tap((it) => expect(it).equals('https://foo.com'))
            )
          ))
      })
      context('when author is object', () => {
        it('should read name', () =>
          lastValueFrom(
            of(`
                <script type='application/ld+json'>
                  { "author": { "url": "https://foo.com" } }
                </script>`).pipe(
              $url,
              tap((it) => expect(it).equals('https://foo.com'))
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
                      "author": "https://foo.com" 
                    }]
                  }
                </script>`).pipe(
              $url,
              defaultIfEmpty(false),
              tap((it) => expect(it).be.false)
            )
          ))
      })
    })
    it('should read url correctly', () =>
      lastValueFrom(
        of('./test/meta-test.html').pipe(
          switchMap((it) => readFile(it, { encoding: 'utf8' })),
          $url,
          toArray(),
          tap((it) =>
            expect(it).deep.equals([
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
          )
        )
      ))
  })
})
