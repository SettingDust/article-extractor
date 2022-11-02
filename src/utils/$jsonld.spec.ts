import { count, of, tap } from 'rxjs'
import $document from './$document'
import $jsonld from './$jsonld'
import { expect } from 'chai'

describe('parse', () => {
  it('should parse element', function (done) {
    of(`
        <script type='application/ld+json'>
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
          expect(it).equals({
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
})
describe('search', () => {
  it('should work', function (done) {
    of(`
        <script type='application/ld+json'>
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
        $jsonld.get<string>('name'),
        tap((it) => expect(it).be.equals('Bar')),
        count(),
        tap((it) => expect(it).equals(2))
      )
      .subscribe(() => done())
  })

  it('should use predicate', function (done) {
    of(`
        <script type='application/ld+json'>
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
        $jsonld.get<string>('name', (it) => it['@type'] === 'Article'),
        tap((it) => expect(it).be.equals('Bar')),
        count(),
        tap((it) => expect(it).equals(2))
      )
      .subscribe(() => done())
  })
})
