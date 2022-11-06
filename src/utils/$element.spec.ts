// noinspection NsUnresolvedStyleClassReference,HtmlUnknownAttribute

import { count, defaultIfEmpty, from, lastValueFrom, of, tap } from 'rxjs'
import { map } from 'rxjs/operators'
import $document from './$document'
import $element from './$element'
import { expect } from 'chai'

describe('$element', () => {
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
            map((it) => it.textContent),
            tap((it) => expect(it).be.equals('bar')),
            count(),
            tap((it) => expect(it).equals(4))
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
            map((it) => it.textContent),
            tap((it) => expect(it).be.equals('bar'))
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
            map((it) => it.textContent),
            tap((it) => expect(it).be.equals('bar'))
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
            map((it) => it.textContent),
            tap((it) => expect(it).be.equals('bar'))
          )
          .subscribe(() => done())
      })
    })
  })

  describe('attribute', () => {
    it('should read attribute of element', () =>
      lastValueFrom(
        of('<link id="foo" name="bar">').pipe(
          $document,
          $element.select.id('foo'),
          $element.attribute('name'),
          tap((it) => expect(it).be.equals('bar'))
        )
      ))

    context('when not exist', () => {
      it('should ignore', () =>
        lastValueFrom(
          of('<link id="foo">').pipe(
            $document,
            $element.select.id('foo'),
            $element.attribute('name'),
            defaultIfEmpty(false),
            tap((it) => expect(it).be.false)
          )
        ))
    })
  })

  describe('text', () => {
    it('should read content', function (done) {
      from(['<h1 id="foo">bar</h1>', '<div id="foo"><a>bar</a></div>'])
        .pipe(
          $document,
          $element.select.id('foo'),
          $element.text,
          tap((it) => expect(it).be.equals('bar')),
          count(),
          tap((it) => expect(it).equals(2))
        )
        .subscribe(() => done())
    })
  })
})
