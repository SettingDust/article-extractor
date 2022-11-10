// noinspection NsUnresolvedStyleClassReference

import { expect } from 'chai'
import parseHtml from '../utils/parse-html'
import { readFileSync } from 'node:fs'
import titleExtractor from './title-extractor'

const operate = (document: Document) =>
  titleExtractor.operators.flatMap((it) => it[1](document))
describe('TitleExtractor', () => {
  describe('operators', () => {
    it('should working', () => {
      it('should with correct priority', () => {
        const document = parseHtml(
          readFileSync('./test/meta-test.html', { encoding: 'utf8' })
        )
        expect(operate(document)).deep.equals([
          'jsonld',
          'og',
          'twitter',
          'twitter-name',
          'post-title',
          'entry-title',
          'class-title',
          'a-title',
          'title-tag'
        ])
      })
    })
    describe('extractors', () => {
      it('should respect the separator', () => {
        const document = parseHtml(`
          <meta property='og:title' content='foo | bar'>
          <meta property='og:title' content='foo - bar'>
          <meta property='og:title' content='foo \\ bar'>
          <meta property='og:title' content='foo / bar'>
          <meta property='og:title' content='foo > bar'>
          <meta property='og:title' content='foo » bar'>
          <meta property='og:title' content='foo · bar'>
          <meta property='og:title' content='foo – bar'>`)
        const result = titleExtractor.processor(operate(document))
        expect(result).has.lengthOf(8)
        expect(result).satisfy((array) => array.every((it) => it === 'foo'))
      })

      it('should process strange space', () => {
        const document = parseHtml(
          '<meta property="og:title" content="  foo    bar  ">'
        )
        expect(titleExtractor.processor(operate(document))[0]).equals('foo bar')
      })
    })
  })
})
