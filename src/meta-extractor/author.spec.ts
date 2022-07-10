// noinspection NsUnresolvedStyleClassReference

import { of, pipe, pluck, switchMap, zipAll } from 'rxjs'
import { map } from 'rxjs/operators'
import { readFile } from 'node:fs/promises'
import author from './author'
import authorUrl from './author-url'
import $document from '../utils/$document'
import $expect from '../utils/test/$expect'

const $author = pipe(
  $document,
  map((it) => of(it)),
  switchMap((it) => it.pipe(author, pluck('author', 'name')))
)

const $url = pipe(
  $document,
  map((it) => of(it)),
  switchMap((it) => it.pipe(authorUrl, pluck('author', 'url')))
)

describe('extractors', () => {
  it('should read name correctly', function (done) {
    of('./test/generic-authors.html')
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $author,
        map((it) => of(it)),
        zipAll(),
        $expect.equals([
          'jsonld',
          'jsonld-article',
          'jsonld-object',
          'meta',
          'itemprop name',
          'itemprop',
          'rel2',
          'a class',
          'class a',
          'href',
          'class'
        ])
      )
      .subscribe(() => done())
  })

  it('should read url correctly', function (done) {
    of('./test/generic-authors.html')
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $url,
        map((it) => of(it)),
        zipAll(),
        $expect.equals([
          'https://jsonld.com',
          'https://jsonld-object.com',
          'https://meta.com',
          'https://itemprop-url.com',
          'https://itemprop.com',
          'https://rel1.com',
          'https://rel2.com',
          'https://aclass.com',
          'https://classa.com',
          'https://href.com/author/'
        ])
      )
      .subscribe(() => done())
  })
})
