// noinspection NsUnresolvedStyleClassReference

import { from, of, pipe, switchMap, tap, toArray } from 'rxjs'
import { readFile } from 'node:fs/promises'
import url from './url'
import $document from '../utils/$document'
import { expect } from 'chai'
import { $operate } from './utils'

const $url = pipe($document, $operate(url.operators))

const $singleUrl = pipe(
  $url,
  tap((it) => expect(it).be.equals('https://foo.com')),
  toArray()
)

describe('UrlExtractor', () => {
  describe('operators', () => {
    it('should read meta og url', function (done) {
      of('<meta property="og:url" content="https://foo.com">')
        .pipe(
          $singleUrl,
          tap((it) => expect(it).has.lengthOf(1))
        )
        .subscribe(() => done())
    })

    it('should read meta twitter url', function (done) {
      from([
        '<meta property="twitter:url" content="https://foo.com">',
        '<meta name="twitter:url" content="https://foo.com">'
      ])
        .pipe(
          $singleUrl,
          tap((it) => expect(it).has.lengthOf(2))
        )
        .subscribe(() => done())
    })

    it('should read link tag url', function (done) {
      from([
        '<link rel="canonical" href="https://foo.com">',
        '<link rel="alternate" href="https://foo.com">'
      ])
        .pipe(
          $singleUrl,
          tap((it) => expect(it).has.lengthOf(2))
        )
        .subscribe(() => done())
    })

    it('should read json ld', function (done) {
      from([
        `<script type='application/ld+json'>
         {
           "url": "https://foo.com"
         }
       </script>`,
        `<script type='application/ld+json'>
         {
           "@graph": [{
             "@type": "WebPage",
             "url": "https://foo.com"
           }]
         }
       </script>`
      ])
        .pipe(
          $singleUrl,
          tap((it) => expect(it).has.lengthOf(2))
        )
        .subscribe(() => done())
    })

    it('should read post title class', function (done) {
      from(['<div class="post-title"><a href="https://foo.com"></a></div>'])
        .pipe(
          $singleUrl,
          tap((it) => expect(it).has.lengthOf(1))
        )
        .subscribe(() => done())
    })

    it('should read entry title class', function (done) {
      from(['<div class="entry-title"><a href="https://foo.com"></a></div>'])
        .pipe(
          $singleUrl,
          tap((it) => expect(it).has.lengthOf(1))
        )
        .subscribe(() => done())
    })

    it('should read <a> like title', function (done) {
      from([
        '<h1 class="title"><a href="https://foo.com"></a></h1>',
        '<h1 class="like-title"><a href="https://foo.com"></a></h1>',
        '<h2 class="like-title"><a href="https://foo.com"></a></h2>'
      ])
        .pipe(
          $singleUrl,
          tap((it) => expect(it).has.lengthOf(3))
        )
        .subscribe(() => done())
    })

    it('should read correctly', function (done) {
      from(['./test/meta-test.html'])
        .pipe(
          switchMap((it) => readFile(it, { encoding: 'utf8' })),
          $url,
          toArray(),
          tap((it) =>
            expect(it).deep.equals([
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
          )
        )
        .subscribe(() => done())
    })
  })
})
