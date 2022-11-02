import { from, of, tap, zipAll } from 'rxjs'
import $document from './$document'
import { map } from 'rxjs/operators'
import { expect } from 'chai'

describe('parse', () => {
  it('should parse html', function (done) {
    from(['<h1 id="foo">bar</h1><div>bad</div>'])
      .pipe(
        $document,
        map((it) => it.querySelector('#foo')),
        tap((it) => expect(it.textContent).equals('bar')),
        map((it) => of(it)),
        zipAll()
      )
      .subscribe(() => done())
  })
})
