// noinspection NsUnresolvedStyleClassReference

import title from './title'
import { from, of, pipe, switchMap, tap, windowCount, zipAll } from 'rxjs'
import { map } from 'rxjs/operators'
import { readFile } from 'node:fs/promises'
import $document from '../utils/$document'
import { expect } from 'chai'

const $title = pipe(
  $document,
  map((it) => of(it)),
  switchMap((it) =>
    it.pipe(
      title.extractor,
      map((it) => it.title)
    )
  )
)

const $singleTitle = pipe(
  $title,
  tap((it) => expect(it).be.equals('foo')),
  map((it) => of(it)),
  zipAll()
)

describe('TitleExtractor', () => {
  it('should read meta og title', function (done) {
    of('<meta property="og:title" content="foo">')
      .pipe(
        $singleTitle,
        tap((it) => expect(it).has.lengthOf(1))
      )
      .subscribe(() => done())
  })

  it('should read meta twitter title', function (done) {
    from([
      '<meta property="twitter:title" content="foo">',
      '<meta name="twitter:title" content="foo">'
    ])
      .pipe(
        $singleTitle,
        tap((it) => expect(it).has.lengthOf(2))
      )
      .subscribe(() => done())
  })

  it('should read json ld', function (done) {
    from([
      `<script type='application/ld+json'>
         {
           "headline": "foo"
         }
       </script>`,
      `<script type='application/ld+json'>
         {
           "@graph": [{
             "@type": "Article",
             "headline": "foo"
           }]
         }
       </script>`
    ])
      .pipe(
        $singleTitle,
        tap((it) => expect(it).has.lengthOf(2))
      )
      .subscribe(() => done())
  })

  it('should read title tag', function (done) {
    of('<html lang=""><head><title>foo</title></head></html>')
      .pipe(
        $singleTitle,
        tap((it) => expect(it).has.lengthOf(1))
      )
      .subscribe(() => done())
  })

  it('should read post title class', function (done) {
    of('<div class="post-title">foo</div>')
      .pipe(
        $singleTitle,
        tap((it) => expect(it).has.lengthOf(1))
      )
      .subscribe(() => done())
  })

  it('should read entry title class', function (done) {
    of('<div class="entry-title">foo</div>')
      .pipe(
        $singleTitle,
        tap((it) => expect(it).has.lengthOf(1))
      )
      .subscribe(() => done())
  })

  it('should read <a> like title', function (done) {
    from([
      '<h1 class="title"><a>foo</a></h1>',
      '<h1 class="like-title"><a>foo</a></h1>',
      '<h2 class="like-title"><a>foo</a></h2>'
    ])
      .pipe(
        $singleTitle,
        tap((it) => expect(it).has.lengthOf(3))
      )
      .subscribe(() => done())
  })

  it('should read text like title', function (done) {
    from([
      '<h1 class="title">foo</h1>',
      '<h1 class="like-title">foo</h1>',
      '<h2 class="like-title">foo</h2>'
    ])
      .pipe(
        $singleTitle,
        tap((it) => expect(it).has.lengthOf(3))
      )
      .subscribe(() => done())
  })

  it('should with correct priority', function (done) {
    from(['./test/meta-test.html'])
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $title,
        map((it) => of(it)),
        zipAll(),
        tap((it) =>
          expect(it).deep.equals([
            'jsonld',
            'og',
            'twitter',
            'twitter-name',
            'post-title',
            'entry-title',
            'class-title',
            'a-title',
            'title-tag'
          ])
        )
      )
      .subscribe(() => done())
  })

  it('should respect the separator', function (done) {
    from([
      '<meta property="og:title" content="foo | bar">',
      '<meta property="og:title" content="foo - bar">',
      '<meta property="og:title" content="foo \\ bar">',
      '<meta property="og:title" content="foo / bar">',
      '<meta property="og:title" content="foo > bar">',
      '<meta property="og:title" content="foo » bar">',
      '<meta property="og:title" content="foo · bar">',
      '<meta property="og:title" content="foo – bar">'
    ])
      .pipe(
        switchMap((it) => $title(of(it))),
        windowCount(3),
        switchMap((it) =>
          it.pipe(
            map((it) => of(it)),
            zipAll(),
            tap((it) => expect(it).has.lengthOf(3)),
            map((it) => it.slice(1)),
            tap((it) => expect(it).deep.equals(['foo', 'bar']))
          )
        ),
        map((it) => of(it)),
        zipAll()
      )
      .subscribe(() => done())
  })

  it('should not split without space', function (done) {
    from([
      '<meta property="og:title" content="foo|bar">',
      '<meta property="og:title" content="foo-bar">',
      '<meta property="og:title" content="foo\\bar">',
      '<meta property="og:title" content="foo/bar">',
      '<meta property="og:title" content="foo>bar">',
      '<meta property="og:title" content="foo»bar">',
      '<meta property="og:title" content="foo·bar">',
      '<meta property="og:title" content="foo–bar">'
    ])
      .pipe(
        switchMap((it) => $title(of(it))),
        tap((it) => {
          expect(it).not.be.equals('foo')
          expect(it).not.be.equals('bar')
        }),
        map((it) => of(it)),
        zipAll()
      )
      .subscribe(() => done())
  })

  it('should process strange space', function (done) {
    of('<meta property="og:title" content="  foo    bar  ">')
      .pipe(
        switchMap((it) => $title(of(it))),
        tap((it) => expect(it).be.equals('foo bar')),
        map((it) => of(it)),
        zipAll()
      )
      .subscribe(() => done())
  })
})
