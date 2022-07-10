import { from, of, tap, zipAll } from 'rxjs'
import $document from './$document.js'
import { expect } from 'chai'
import { map } from 'rxjs/operators'

describe('$document', () => {
  it('should parse html', function (done) {
    from(['<h1 id="foo">bar</h1><div>bad</div>'])
      .pipe(
        $document,
        map((it) => it.querySelector('#foo')),
        tap((it) => expect(it.textContent).eq('bar')),
        map((it) => of(it)),
        zipAll()
      )
      .subscribe(() => done())
  })
})
