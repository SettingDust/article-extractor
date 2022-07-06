// noinspection NsUnresolvedStyleClassReference

import { expect } from 'chai'
import title from './title.js'
import { parseHTML } from 'linkedom'
import {
  from,
  of,
  pipe,
  pluck,
  switchMap,
  tap,
  windowCount,
  zipAll
} from 'rxjs'
import { map } from 'rxjs/operators'
import { readFile } from 'fs/promises'

const $title = pipe(
  map<string, Window & typeof globalThis>(parseHTML),
  pluck('document'),
  title,
  pluck('title')
)

const $singleTitle = pipe(
  $title,
  tap((it) => expect(it).eq('foo'))
)

describe('meta extractor > title', () => {
  it('should read meta og title', function (done) {
    of('<meta property="og:title" content="foo">')
      .pipe($singleTitle)
      .subscribe(() => done())
  })

  it('should read meta twitter title', function (done) {
    from([
      '<meta property="twitter:title" content="foo">',
      '<meta name="twitter:title" content="foo">'
    ])
      .pipe($singleTitle)
      .subscribe(() => done())
  })

  it('should read title tag', function (done) {
    from(['<html lang=""><head><title>foo</title></head></html>'])
      .pipe($singleTitle)
      .subscribe(() => done())
  })

  it('should read post title class', function (done) {
    from(['<div class="post-title">foo</div>'])
      .pipe($singleTitle)
      .subscribe(() => done())
  })

  it('should read entry title class', function (done) {
    from(['<div class="entry-title">foo</div>'])
      .pipe($singleTitle)
      .subscribe(() => done())
  })

  it('should read <a> like title', function (done) {
    from([
      '<h1 class="title"><a>foo</a></h1>',
      '<h1 class="like-title"><a>foo</a></h1>',
      '<h2 class="like-title"><a>foo</a></h2>'
    ])
      .pipe($singleTitle)
      .subscribe(() => done())
  })

  it('should read text like title', function (done) {
    from([
      '<h1 class="title">foo</h1>',
      '<h1 class="like-title">foo</h1>',
      '<h2 class="like-title">foo</h2>'
    ])
      .pipe($singleTitle)
      .subscribe(() => done())
  })

  it('should with correct priority', function (done) {
    from(['./test/meta-class-title.html'])
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $title,
        map((it) => of(it)),
        zipAll(),
        tap((it) =>
          expect(it).deep.eq([
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
            tap((it) => expect(it).length(3)),
            tap((it) => expect(it.slice(1)).deep.eq(['foo', 'bar']))
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
        tap((it) => expect(it).not.eq('foo')),
        tap((it) => expect(it).not.eq('bar')),
        map((it) => of(it)),
        zipAll()
      )
      .subscribe(() => done())
  })

  it('should process strange space', function (done) {
    of('<meta property="og:title" content="  foo    bar  ">')
      .pipe(
        switchMap((it) => $title(of(it))),
        tap((it) => expect(it).eq('foo bar')),
        map((it) => of(it)),
        zipAll()
      )
      .subscribe(() => done())
  })
})
