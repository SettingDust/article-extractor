import { readFile } from 'node:fs/promises'
import { extract } from './index'
import { expect } from 'chai'

describe('meta-extractor', () => {
  it('should working', () =>
    readFile('./test/meta-test.html', { encoding: 'utf8' })
      .then(extract)
      .then((it) =>
        expect(it).deep.equals({
          title: 'jsonld',
          author: { name: 'jsonld', url: 'https://jsonld.com' },
          url: 'https://jsonld.com'
        })
      ))
})
