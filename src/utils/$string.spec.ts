import { combineLatest, defaultIfEmpty, of } from 'rxjs'
import $string from './$string'
import $expect from './test/$expect'

describe('condense', () => {
  it('should remove extra spaces', function (done) {
    of('   a   b   ')
      .pipe($string.condense, $expect.be('a b'))
      .subscribe(() => done())
  })
})

describe('validate', () => {
  it('should accept string', function (done) {
    combineLatest([
      of('foo').pipe($string.validate, $expect.truthy),
      of(123).pipe($string.validate).pipe(defaultIfEmpty(false), $expect.falsy)
    ]).subscribe(() => done())
  })
})

describe('notBlank', () => {
  it('should accept string', function (done) {
    combineLatest([
      of('foo').pipe($string.notBlank, $expect.truthy),
      of('  ').pipe($string.notBlank).pipe(defaultIfEmpty(false), $expect.falsy)
    ]).subscribe(() => done())
  })
})

describe('trim', () => {
  it('should accept string', function (done) {
    of('  foo  ')
      .pipe($string.trim, $expect.be('foo'))
      .subscribe(() => done())
  })
})