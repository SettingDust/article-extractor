import { readFile } from 'node:fs/promises'
import { extract } from './index'

describe('meta-extractor', () => {
  it('should working', () =>
    readFile('./test/meta-test.html', { encoding: 'utf8' })
      .then(extract)
      .then((it) => {
        console.log(it)
      }))
})
