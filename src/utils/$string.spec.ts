import { combineLatest, defaultIfEmpty, of, tap } from 'rxjs'
import $string from './$string'
import { expect } from 'chai'

describe('$string', () => {
  describe('condense', () => {
    it('should remove extra spaces', function (done) {
      of('   a   b   ')
        .pipe(
          $string.condense,
          tap((it) => expect(it).be.equals('a b'))
        )
        .subscribe(() => done())
    })
  })

  describe('validate', () => {
    it('should accept string', function (done) {
      combineLatest([
        of('foo').pipe(
          $string.validate,
          tap((it) => expect(it).be.ok)
        ),
        of(123).pipe(
          $string.validate,
          defaultIfEmpty(false),
          tap((it) => expect(it).be.false)
        )
      ]).subscribe(() => done())
    })
  })

  describe('notBlank', () => {
    it('should working', function (done) {
      combineLatest([
        of('foo').pipe(
          $string.notBlank,
          tap((it) => expect(it).be.ok)
        ),
        of('  ').pipe(
          $string.notBlank,
          defaultIfEmpty(false),
          tap((it) => expect(it).be.false)
        )
      ]).subscribe(() => done())
    })
  })

  describe('trim', () => {
    it('should working', function (done) {
      of('  foo  ')
        .pipe(
          $string.trim,
          tap((it) => expect(it).be.equals('foo'))
        )
        .subscribe(() => done())
    })
  })

  describe('closest', () => {
    it('should working', function (done) {
      of({ source: 'foo', target: 'fo1' }, { source: 'foo', target: 'bar' })
        .pipe(
          $string.closest,
          tap((it) =>
            expect(it).deep.equals({
              result: 'fo1',
              distance: 1,
              source: 'foo'
            })
          )
        )
        .subscribe(() => done())
    })
  })
})
