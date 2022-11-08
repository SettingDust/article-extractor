// noinspection NsUnresolvedStyleClassReference

import title from './title'
import {
  from,
  of,
  pipe,
  switchMap,
  tap,
  toArray,
  windowCount,
  zipAll
} from 'rxjs'
import { map } from 'rxjs/operators'
import { readFile } from 'node:fs/promises'
import $document from '../utils/$document'
import { expect } from 'chai'
import { $operate } from './utils'
import $string from '../utils/$string'

const $title = pipe(
  $document,
  $operate(title.operators),
  $string.validate,
  $string.notBlank,
  $string.condense
)

const $singleTitle = pipe(
  $title,
  tap((it) => expect(it).be.equals('foo')),
  toArray()
)

describe('TitleExtractor', () => {
  describe('operators', () => {
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
          toArray(),
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
  })
  describe('extractors', () => {
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
          switchMap((it) =>
            $title(of(it)).pipe(
              title.processor,
              map((it) => it.title)
            )
          ),
          windowCount(3),
          zipAll(),
          tap((it) => expect(it).has.lengthOf(3)),
          map((it) => it.slice(1)),
          tap((it) => expect(it).deep.equals(['foo', 'bar'])),
          toArray()
        )
        .subscribe(() => done())
    })

    it('should process strange space', function (done) {
      of('<meta property="og:title" content="  foo    bar  ">')
        .pipe(
          $title,
          tap((it) => expect(it).be.equals('foo bar')),
          toArray()
        )
        .subscribe(() => done())
    })
  })
})
