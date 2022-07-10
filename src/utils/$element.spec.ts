// noinspection NsUnresolvedStyleClassReference,HtmlUnknownAttribute

import { from, of, tap, zipAll } from 'rxjs'
import { expect } from 'chai'
import { map } from 'rxjs/operators'
import $document from './$document.js'
import { $element } from './index.js'

describe('$element', () => {
  describe('select', () => {
    describe('query', () => {
      it('should respect css selector', function (done) {
        console.log(3)
        from([
          '<h1 id="foo">bar</h1><div>bad</div>',
          '<h1 class="foo">bar</h1><div>bad</div>',
          '<h1 name="foo">bar</h1><div>bad</div>',
          '<h2>bar</h2><div>bad</div>'
        ])
          .pipe(
            $document,
            $element.select.query('#foo, .foo, [name="foo"], h2'),
            tap((it) => expect(it.textContent).eq('bar')),
            map((it) => of(it)),
            zipAll()
          )
          .subscribe(() => done())
        console.log(2)
      })
    })
    describe('className', () => {
      it('should respect class name', function (done) {
        from(['<h1 class="foo">bar</h1><div class="bad" id="foo">bad</div>'])
          .pipe(
            $document,
            $element.select.className('foo'),
            tap((it) => expect(it.textContent).eq('bar')),
            map((it) => of(it)),
            zipAll()
          )
          .subscribe(() => done())
      })
    })
    describe('id', () => {
      it('should respect id', function (done) {
        from(['<h1 id="foo">bar</h1><div id="bad" class="foo">bad</div>'])
          .pipe(
            $document,
            $element.select.id('foo'),
            tap((it) => expect(it.textContent).eq('bar')),
            map((it) => of(it)),
            zipAll()
          )
          .subscribe(() => done())
      })
    })
    describe('tag', () => {
      it('should respect tag', function (done) {
        from(['<h1 id="foo">bar</h1><div id="bad" class="foo">bad</div>'])
          .pipe(
            $document,
            $element.select.tag('h1'),
            tap((it) => expect(it.textContent).eq('bar')),
            map((it) => of(it)),
            zipAll()
          )
          .subscribe(() => done())
      })
    })
  })
})
