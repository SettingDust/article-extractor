import { of, pipe, switchMap, tap, zipAll } from 'rxjs'
import { map } from 'rxjs/operators'
import { readFile } from 'node:fs/promises'
import author from './author'
import authorUrl from './author-url'
import $document from '../utils/$document'
import { expect } from 'chai'

const $author = pipe(
  $document,
  map((it) => of(it)),
  switchMap((it) =>
    it.pipe(
      author.extractor,
      map((it) => it?.author?.name)
    )
  )
)

const $url = pipe(
  $document,
  map((it) => of(it)),
  switchMap((it) =>
    it.pipe(
      authorUrl.extractor,
      map((it) => it?.author?.url)
    )
  )
)

describe('AuthorExtractor', () => {
  it('should read name correctly', function (done) {
    of('./test/meta-test.html')
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $author,
        map((it) => of(it)),
        zipAll(),
        tap((it) =>
          expect(it).deep.equals([
            'jsonld',
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
      )
      .subscribe(() => done())
  })
})

describe('AuthorUrlExtractor', () => {
  it('should read url correctly', function (done) {
    of('./test/meta-test.html')
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $url,
        map((it) => of(it)),
        zipAll(),
        tap((it) =>
          expect(it).deep.equals([
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
      )
      .subscribe(() => done())
  })
})
