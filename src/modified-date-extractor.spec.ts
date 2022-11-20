import parseHtml from './utils/parse-html'
import { expect } from 'chai'
import { readFileSync } from 'node:fs'
import modifiedDateExtractor from './modified-date-extractor'

const operate = (document: Document) =>
  modifiedDateExtractor.operators.flatMap((it) => it[1](document))

describe('ModifiedDateExtractor', () => {
  describe('operators', () => {
    it('should working', () => {
      const document = parseHtml(
        readFileSync('test/modified-date.html', { encoding: 'utf8' })
      )
      expect(operate(document)).deep.equals([
        'dateModified',
        'uploadDate',
        'updated_time',
        'modified_time',
        'datemodified'
      ])
    })
  })
})
