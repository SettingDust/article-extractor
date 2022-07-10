// noinspection NsUnresolvedStyleClassReference

import { expect } from 'chai'
import { parseHTML } from 'linkedom'
import { from, of, pipe, pluck, switchMap, tap, zipAll } from 'rxjs'
import { map } from 'rxjs/operators'
import { readFile } from 'node:fs/promises'
import link from './link.js'

const $link = pipe(
  map<string, Window & typeof globalThis>(parseHTML),
  pluck('document'),
  link,
  pluck('link')
)

const $singleLink = pipe(
  $link,
  tap((it) => expect(it).eq('https://foo.com'))
)

describe('meta extractor.link', () => {
  it('should read meta og title', function (done) {
    of('<meta property="og:url" content="https://foo.com">')
      .pipe($singleLink)
      .subscribe(() => done())
  })

  it('should read meta twitter url', function (done) {
    from([
      '<meta property="twitter:url" content="https://foo.com">',
      '<meta name="twitter:url" content="https://foo.com">'
    ])
      .pipe($singleLink)
      .subscribe(() => done())
  })

  it('should read link tag url', function (done) {
    from([
      '<link rel="canonical" href="https://foo.com">',
      '<link rel="alternate" href="https://foo.com">'
    ])
      .pipe($singleLink)
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
      .pipe($singleLink)
      .subscribe(() => done())
  })

  it('should read post title class', function (done) {
    from(['<div class="post-title"><a href="https://foo.com"></a></div>'])
      .pipe($singleLink)
      .subscribe(() => done())
  })

  it('should read entry title class', function (done) {
    from(['<div class="entry-title"><a href="https://foo.com"></a></div>'])
      .pipe($singleLink)
      .subscribe(() => done())
  })

  it('should read <a> like title', function (done) {
    from([
      '<h1 class="title"><a href="https://foo.com"></a></h1>',
      '<h1 class="like-title"><a href="https://foo.com"></a></h1>',
      '<h2 class="like-title"><a href="https://foo.com"></a></h2>'
    ])
      .pipe($singleLink)
      .subscribe(() => done())
  })

  it('should read correctly', function (done) {
    from(['./test/generic-links.html'])
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $link,
        map((it) => of(it)),
        zipAll(),
        tap((it) =>
          expect(it).deep.eq([
            'https://jsonld.com',
            'https://og.com',
            'https://twitter.com',
            'https://twitter-name.com',
            'https://canonical.com',
            'https://alternate.com',
            'https://post-title.com',
            'https://entry-title.com',
            'https://class-title.com',
            'https://a-title.com'
          ])
        )
      )
      .subscribe(() => done())
  })
})
