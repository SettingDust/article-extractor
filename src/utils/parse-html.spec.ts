import parseHtml from './parse-html'
import { expect } from 'chai'

describe('parse-html', () => {
  describe('parse', () => {
    it('should working', () => {
      const document = parseHtml('<h1 id="foo">bar</h1><div>bad</div>')
      expect(document.querySelector('#foo').textContent).equals('bar')
    })
  })
})
