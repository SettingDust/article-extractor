import { lastValueFrom, of, pipe, switchMap, tap, zipAll } from 'rxjs'
import { map } from 'rxjs/operators'
import { readFile } from 'node:fs/promises'
import author from './author'
import $document from '../utils/$document'
import { expect } from 'chai'

const $author = pipe($document, (it) =>
  it.pipe(
    author.extractor,
    map((it) => it?.author?.name)
  )
)

describe('AuthorExtractor', () => {
  describe('operators', () => {
    describe('jsonld', () => {
      // TODO
    })
  })
  it('should read name correctly', () =>
    lastValueFrom(
      of('./test/meta-test.html').pipe(
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
    ))
})
