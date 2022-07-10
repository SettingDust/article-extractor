import { of, tap } from 'rxjs'
import { condense } from './$string.js'
import { expect } from 'chai'

describe('$string', () => {
  describe('condense', () => {
    it('should remove extra spaces', function (done) {
      of('   a   b   ')
        .pipe(
          condense,
          tap((it) => expect(it).eq('a b'))
        )
        .subscribe(() => done())
    })
  })
})
