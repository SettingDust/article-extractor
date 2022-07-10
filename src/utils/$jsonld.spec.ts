import { of, tap, zipAll } from 'rxjs'
import { expect } from 'chai'
import $document from './$document.js'
import $jsonld from './$jsonld.js'
import { map } from 'rxjs/operators/index.js'

describe('$jsonld', () => {
  it('should parse element', function (done) {
    of(`<script type='application/ld+json'>
                   {
                     "@context": "https://schema.org/",
                     "@id": "https://foo.com",
                     "@type": "Example",
                     "name": "Bar",
                     "description": "A small bar"
                   }
                 </script>`)
      .pipe(
        $document,
        $jsonld,
        tap((it) =>
          expect(it).deep.eq({
            '@context': 'https://schema.org/',
            '@id': 'https://foo.com',
            '@type': 'Example',
            name: 'Bar',
            description: 'A small bar'
          })
        )
      )
      .subscribe(() => done())
  })
  describe('search', () => {
    it('should work', function (done) {
      of(`<script type='application/ld+json'>
                   {
                     "@context": "https://schema.org/",
                     "name": "Bar",
                     "@graph": [{
                        "name": "Bar"
                      }]
                   }
                 </script>`)
        .pipe(
          $document,
          $jsonld,
          $jsonld.get('name'),
          tap((it) => expect(it).eq('Bar')),
          map((it) => of(it)),
          zipAll(),
          tap((it) => expect(it).length(2))
        )
        .subscribe(() => done())
    })

    it('should use predicate', function (done) {
      of(`<script type='application/ld+json'>
                   {
                     "@context": "https://schema.org/",
                     "name": "Bar",
                     "@graph": [{
                        "@type": "Article",
                        "name": "Bar"
                      },{
                        "@type": "WebPage",
                        "name": "Bar"
                      }]
                   }
                 </script>`)
        .pipe(
          $document,
          $jsonld,
          $jsonld.get('name', (it) => it['@type'] === 'Article'),
          tap((it) => expect(it).eq('Bar')),
          map((it) => of(it)),
          zipAll(),
          tap((it) => expect(it).length(2))
        )
        .subscribe(() => done())
    })
  })
})
