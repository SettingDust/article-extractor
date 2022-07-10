// noinspection NsUnresolvedStyleClassReference

import { expect } from 'chai'
import { parseHTML } from 'linkedom'
import { from, of, pipe, pluck, switchMap, tap, zipAll } from 'rxjs'
import { map } from 'rxjs/operators'
import { readFile } from 'node:fs/promises'
import author from './author.js'
import authorUrl from './author-url.js'

const $author = pipe(
  map<string, Window & typeof globalThis>(parseHTML),
  pluck('document'),
  author,
  pluck('author', 'name')
)

const $url = pipe(
  map<string, Window & typeof globalThis>(parseHTML),
  pluck('document'),
  authorUrl,
  pluck('author', 'url')
)

describe('meta extractor.author', () => {
  it('should read name correctly', function (done) {
    from(['./test/generic-authors.html'])
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $author,
        map((it) => of(it)),
        zipAll(),
        tap((it) =>
          expect(it).deep.eq([
            'jsonld',
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

  it('should read url correctly', function (done) {
    from(['./test/generic-authors.html'])
      .pipe(
        switchMap((it) => readFile(it, { encoding: 'utf8' })),
        $url,
        map((it) => of(it)),
        zipAll(),
        tap((it) =>
          expect(it).deep.eq([
            'https://jsonld.com',
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
