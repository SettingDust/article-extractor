// noinspection NsUnresolvedStyleClassReference

import title from './title'
import { from, of, pipe, pluck, switchMap, windowCount, zipAll } from 'rxjs'
import { map } from 'rxjs/operators'
import { readFile } from 'node:fs/promises'
import $document from '../utils/$document'
import $expect from '../utils/test/$expect'

const $title = pipe(
  $document,
  map((it) => of(it)),
  switchMap((it) => it.pipe(title.operators, pluck('title')))
)

const $singleTitle = pipe(
  $title,
  $expect.be('foo'),
  map((it) => of(it)),
  zipAll()
)

describe('extractors', () => {
  it('should read meta og title', function (done) {
    of('<meta property="og:title" content="foo">')
      .pipe($singleTitle, $expect.length(1))
      .subscribe(() => done())
  })

  it('should read meta twitter title', function (done) {
    from([
      '<meta property="twitter:title" content="foo">',
      '<meta name="twitter:title" content="foo">'
    ])
      .pipe($singleTitle, $expect.length(2))
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
      .pipe($singleTitle, $expect.length(2))
      .subscribe(() => done())
  })

  it('should read title tag', function (done) {
    of('<html lang=""><head><title>foo</title></head></html>')
      .pipe($singleTitle, $expect.length(1))
      .subscribe(() => done())
  })

  it('should read post title class', function (done) {
    of('<div class="post-title">foo</div>')
      .pipe($singleTitle, $expect.length(1))
      .subscribe(() => done())
  })

  it('should read entry title class', function (done) {
    of('<div class="entry-title">foo</div>')
      .pipe($singleTitle, $expect.length(1))
      .subscribe(() => done())
  })

  it('should read <a> like title', function (done) {
    from([
      '<h1 class="title"><a>foo</a></h1>',
      '<h1 class="like-title"><a>foo</a></h1>',
      '<h2 class="like-title"><a>foo</a></h2>'
    ])
      .pipe($singleTitle, $expect.length(3))
      .subscribe(() => done())
  })

  it('should read text like title', function (done) {
    from([
      '<h1 class="title">foo</h1>',
      '<h1 class="like-title">foo</h1>',
      '<h2 class="like-title">foo</h2>'
    ])
      .pipe($singleTitle, $expect.length(3))
      .subscribe(() => done())
  })

  it('should with correct priority', function (done) {
    from(['./test/meta-test.html'])
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $title,
        map((it) => of(it)),
        zipAll(),
        $expect.equals([
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
            $expect.length(3),
            map((it) => it.slice(1)),
            $expect.equals(['foo', 'bar'])
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
        $expect.not.be('foo'),
        $expect.not.be('bar'),
        map((it) => of(it)),
        zipAll()
      )
      .subscribe(() => done())
  })

  it('should process strange space', function (done) {
    of('<meta property="og:title" content="  foo    bar  ">')
      .pipe(
        switchMap((it) => $title(of(it))),
        $expect.be('foo bar'),
        map((it) => of(it)),
        zipAll()
      )
      .subscribe(() => done())
  })
})
