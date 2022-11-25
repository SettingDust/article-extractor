import jsonld from './jsonld'
import { expect } from 'chai'
import parseHtml from './parse-html'
import { Article, Thing } from 'schema-dts'

describe('jsonld', () => {
  describe('parse', () => {
    it('should parse element', () => {
      const document = parseHtml(`<script type='application/ld+json'>
         {
           "@context": "https://schema.org/",
           "@id": "https://foo.com",
           "@type": "Example",
           "name": "Bar",
           "description": "A small bar"
         }</script>`)
      expect(jsonld(document)).deep.equals({
        '@context': 'https://schema.org/',
        '@id': 'https://foo.com',
        '@type': 'Example',
        name: 'Bar',
        description: 'A small bar'
      })
    })
  })
  describe('get', () => {
    it('should work', () => {
      const document = parseHtml(`<script type='application/ld+json'>
         {
           "@context": "https://schema.org/",
           "name": "Bar",
           "@graph": [{ "name": "Bar" }]
         }</script>`)
      const json = jsonld(document)
      const name = jsonld.getObject<Thing, 'name'>(json, 'name')
      expect(name.every((it) => it === 'Bar')).be.true
      expect(name).has.lengthOf(2)
    })

    it('should use predicate', () => {
      const document = parseHtml(`<script type='application/ld+json'>
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
        }</script>`)
      const json = jsonld(document)
      const name = jsonld.getObject<Article, 'name'>(
        json,
        'name',
        (it) => typeof it === 'object' && it['@type'] === 'Article'
      )
      expect(name.every((it) => it === 'Bar')).be.true
      expect(name).has.lengthOf(2)
    })
  })
})
