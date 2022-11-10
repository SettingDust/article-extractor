import parseHtml from '../utils/parse-html'
import { expect } from 'chai'
import { readFileSync } from 'node:fs'
import publishedDateExtractor from './published-date-extractor'

const operate = (document: Document) =>
  publishedDateExtractor.operators
    .flatMap((it) => it[1](document))
    .filter((it) => !!it)

describe('PublishedDateExtractor', () => {
  describe('operators', () => {
    it('should working', () => {
      const document = parseHtml(
        readFileSync('test/published-date.html', { encoding: 'utf8' })
      )
      expect(operate(document)).deep.equals([
        'datePublished',
        'dateCreated',
        'published_time',
        'release_date',
        'datepublished',
        'time pubdate',
        'dc.date.issued',
        'dc.date.created',
        'dc:created',
        'uploadDate',
        'date',
        'time itemprop',
        'time pubdate',
        'time itemprop',
        'time',
        'datepublished',
        'dc.date.issued',
        'dc.date.created',
        'dc.date',
        'dc:date',
        'id post timestamp',
        'class publish',
        'class post timestamp',
        'class byline',
        'class dateline',
        'id metadata',
        'class metadata',
        'id date',
        'class dateline',
        'class date',
        'id post meta',
        'class post meta',
        'id post timestamp',
        'id time',
        'class post timestamp',
        'class time'
      ])
    })
  })
})
