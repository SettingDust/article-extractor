// noinspection NsUnresolvedStyleClassReference

import { expect } from 'chai'
import title from './title.js'
import { parseHTML } from 'linkedom'
import { from, of, pluck, tap } from 'rxjs'

describe('meta extractor', () => {
  describe('title', () => {
    it('should read meta og title', function (done) {
      of(parseHTML('<meta property="og:title" content="foo">'))
        .pipe(
          pluck('document'),
          title,
          tap((it) => expect(it).to.eq('foo'))
        )
        .subscribe(() => done())
    })

    it('should read meta twitter title', function (done) {
      from([
        parseHTML('<meta property="twitter:title" content="foo">'),
        parseHTML('<meta name="twitter:title" content="foo">')
      ])
        .pipe(
          pluck('document'),
          title,
          tap((it) => expect(it).to.eq('foo'))
        )
        .subscribe(() => done())
    })

    it('should read title tag', function (done) {
      from([parseHTML('<html lang=""><head><title>foo</title></head></html>')])
        .pipe(
          pluck('document'),
          title,
          tap((it) => expect(it).to.eq('foo'))
        )
        .subscribe(() => done())
    })

    it('should read post title class', function (done) {
      from([parseHTML('<div class="post-title">foo</div>')])
        .pipe(
          pluck('document'),
          title,
          tap((it) => expect(it).to.eq('foo'))
        )
        .subscribe(() => done())
    })

    it('should read entry title class', function (done) {
      from([parseHTML('<div class="entry-title">foo</div>')])
        .pipe(
          pluck('document'),
          title,
          tap((it) => expect(it).to.eq('foo'))
        )
        .subscribe(() => done())
    })

    it('should read <a> like title', function (done) {
      from([
        parseHTML('<h1 class="title"><a>foo</a></h1>'),
        parseHTML('<h1 class="like-title"><a>foo</a></h1>'),
        parseHTML('<h2 class="like-title"><a>foo</a></h2>')
      ])
        .pipe(
          pluck('document'),
          title,
          tap((it) => expect(it).to.eq('foo'))
        )
        .subscribe(() => done())
    })

    it('should read text like title', function (done) {
      from([
        parseHTML('<h1 class="title">foo</h1>'),
        parseHTML('<h1 class="like-title">foo</h1>'),
        parseHTML('<h2 class="like-title">foo</h2>')
      ])
        .pipe(
          pluck('document'),
          title,
          tap((it) => expect(it).to.eq('foo'))
        )
        .subscribe(() => done())
    })


  })
})
