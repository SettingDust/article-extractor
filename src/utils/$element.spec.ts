// noinspection NsUnresolvedStyleClassReference,HtmlUnknownAttribute

import { from, of, pluck, zipAll } from 'rxjs'
import { map } from 'rxjs/operators'
import $document from './$document'
import $element from './$element'
import $expect from './test/$expect'

describe('select', () => {
  describe('query', () => {
    it('should respect css selector', function (done) {
      from([
        '<h1 id="foo">bar</h1><div>bad</div>',
        '<h1 class="foo">bar</h1><div>bad</div>',
        '<h1 name="foo">bar</h1><div>bad</div>',
        '<h2>bar</h2><div>bad</div>'
      ])
        .pipe(
          $document,
          $element.select.query('#foo, .foo, [name="foo"], h2'),
          pluck('textContent'),
          $expect.be('bar'),
          map((it) => of(it)),
          zipAll(),
          $expect.length(4)
        )
        .subscribe(() => done())
    })
  })
  describe('className', () => {
    it('should respect class name', function (done) {
      of('<h1 class="foo">bar</h1><div class="bad" id="foo">bad</div>')
        .pipe(
          $document,
          $element.select.className('foo'),
          pluck('textContent'),
          $expect.be('bar')
        )
        .subscribe(() => done())
    })
  })
  describe('id', () => {
    it('should respect id', function (done) {
      of('<h1 id="foo">bar</h1><div id="bad" class="foo">bad</div>')
        .pipe(
          $document,
          $element.select.id('foo'),
          pluck('textContent'),
          $expect.be('bar')
        )
        .subscribe(() => done())
    })
  })
  describe('tag', () => {
    it('should respect tag', function (done) {
      of('<h1 id="foo">bar</h1><div id="bad" class="foo">bad</div>')
        .pipe(
          $document,
          $element.select.tag('h1'),
          pluck('textContent'),
          $expect.be('bar')
        )
        .subscribe(() => done())
    })
  })
})

describe('attribute', () => {
  it('should read attribute of element', function (done) {
    of('<link id="foo" name="bar">')
      .pipe(
        $document,
        $element.select.id('foo'),
        $element.attribute('name'),
        $expect.be('bar')
      )
      .subscribe(() => done())
  })
})

describe('text', () => {
  it('should read content', function (done) {
    from(['<h1 id="foo">bar</h1>', '<div id="foo"><a>bar</a></div>'])
      .pipe(
        $document,
        $element.select.id('foo'),
        $element.text,
        $expect.be('bar'),
        map((it) => of(it)),
        zipAll(),
        $expect.length(2)
      )
      .subscribe(() => done())
  })
})
