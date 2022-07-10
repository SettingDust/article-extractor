import { of, tap } from 'rxjs'
import $string from './$string'

describe('condense', () => {
  it('should remove extra spaces', function (done) {
    of('   a   b   ')
      .pipe(
        $string.condense,
        tap((it) => expect(it).toBe('a b'))
      )
      .subscribe(() => done())
  })
})
