import { combineLatest, defaultIfEmpty, of } from 'rxjs'
import $url from './$url'
import $expect from './test/$expect'

describe('validate', () => {
  it('should accept string', function (done) {
    combineLatest([
      of('ftp://foo.bar').pipe($url.validate, $expect.truthy),
      of('https://foo.bar').pipe($url.validate, $expect.truthy),
      of(123).pipe($url.validate).pipe(defaultIfEmpty(false), $expect.falsy)
    ]).subscribe(() => done())
  })
})
