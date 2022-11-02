import { combineLatest, defaultIfEmpty, of, tap } from 'rxjs'
import $url from './$url'
import { expect } from 'chai'

describe('validate', () => {
  it('should accept string', function (done) {
    combineLatest([
      of('ftp://foo.bar').pipe(
        $url.validate,
        tap((it) => expect(it).be.true)
      ),
      of('https://foo.bar').pipe(
        $url.validate,
        tap((it) => expect(it).be.false)
      ),
      of(123)
        .pipe($url.validate)
        .pipe(
          defaultIfEmpty(false),
          tap((it) => expect(it).be.false)
        )
    ]).subscribe(() => done())
  })
})
