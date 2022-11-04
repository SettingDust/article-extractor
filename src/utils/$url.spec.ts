import { combineLatest, defaultIfEmpty, of, tap } from 'rxjs'
import $url from './$url'
import { expect } from 'chai'

describe('$url', () => {
  describe('validate', () => {
    it('should accept string', function (done) {
      combineLatest([
        of('ftp://foo.bar').pipe(
          $url.validate,
          tap((it) => expect(it).be.ok)
        ),
        of('https://foo.bar').pipe(
          $url.validate,
          tap((it) => expect(it).be.ok)
        ),
        of(123).pipe(
          $url.validate,
          defaultIfEmpty(false),
          tap((it) => expect(it).be.false)
        )
      ]).subscribe(() => done())
    })
  })
})
