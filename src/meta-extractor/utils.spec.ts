// noinspection NsUnresolvedStyleClassReference,HtmlUnknownAttribute

import { from, of, pipe, pluck, tap, zipAll } from 'rxjs'
import { map } from 'rxjs/operators'
import { parseHTML } from 'linkedom'
import {
  $attr,
  $element,
  $jsonld,
  $query,
  $queryByClass,
  $queryById,
  $text
} from './utils.js'
import { expect } from 'chai'

const $parse = pipe(map(parseHTML), pluck('document'))

describe('meta extractor > utils', () => {
  describe('$element', () => {
    it('should return the element', function (done) {
      of('<h1 id="foo">bar</h1><h2 id="bad">BAD</h2>')
        .pipe(
          $parse,
          $element((it) => [it.getElementById('foo')]),
          tap((it) => expect(it.localName).eq('h1')),
          tap((it) => expect(it.id).eq('foo')),
          tap((it) => expect(it.textContent).eq('bar'))
        )
        .subscribe(() => done())
    })
  })
  describe('$query', () => {
    it('should select with css selector', function (done) {
      from([
        '<h1 id="foo">bar</h1><div>bad</div>',
        '<h1 class="foo">bar</h1><div>bad</div>',
        '<h1 name="foo">bar</h1><div>bad</div>',
        '<h2>bar</h2><div>bad</div>'
      ])
        .pipe(
          $parse,
          $query('#foo, .foo, [name="foo"], h2'),
          tap((it) => expect(it.textContent).eq('bar')),
          map((it) => of(it)),
          zipAll()
        )
        .subscribe(() => done())
    })
  })
  describe('$queryByClass', () => {
    it('should select by class', function (done) {
      from(['<h1 class="foo">bar</h1><div class="bad" id="foo">bad</div>'])
        .pipe(
          $parse,
          $queryByClass('foo'),
          tap((it) => expect(it.textContent).eq('bar')),
          map((it) => of(it)),
          zipAll()
        )
        .subscribe(() => done())
    })
  })
  describe('$queryById', () => {
    it('should select by id', function (done) {
      from(['<h1 id="foo">bar</h1><div id="bad" class="foo">bad</div>'])
        .pipe(
          $parse,
          $queryById('foo'),
          tap((it) => expect(it.textContent).eq('bar')),
          map((it) => of(it)),
          zipAll()
        )
        .subscribe(() => done())
    })
  })
  describe('$attr', () => {
    it('should get the attr value', function (done) {
      of('<h1 name="foo" id="bar" class="bad">bar</h1>')
        .pipe(
          $parse,
          $queryById('bar'),
          $attr('name'),
          tap((it) => expect(it).eq('foo')),
          map((it) => of(it)),
          zipAll()
        )
        .subscribe(() => done())
    })
  })
  describe('$text', () => {
    it('should return text of element', function (done) {
      from([
        '<h1 id="foo">bar</h1><div>bad</div>',
        '<h1 id="foo"><a>bar</a></h1><div>bad</div>',
        '<h1 id="foo"><a>b</a><a>ar</a></h1><div>bad</div>'
      ])
        .pipe(
          $parse,
          $queryById('foo'),
          $text,
          tap((it) => expect(it).eq('bar')),
          map((it) => of(it)),
          zipAll()
        )
        .subscribe(() => done())
    })
  })
  describe('$jsonld', () => {
    it('should parse jsonld', function (done) {
      of(`<script type='application/ld+json'>
                   {
                     "@context": "https://schema.org/",
                     "@id": "https://foo.com",
                     "@type": "Example",
                     "name": "Bar",
                     "description": "A small bar"
                   }
                 </script>`)
        .pipe(
          $parse,
          $jsonld,
          tap((it) =>
            expect(it).deep.eq({
              '@context': 'https://schema.org/',
              '@id': 'https://foo.com',
              '@type': 'Example',
              name: 'Bar',
              description: 'A small bar'
            })
          )
        )
        .subscribe(() => done())
    })
  })
})
