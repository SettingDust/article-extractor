import { from, lastValueFrom, tap, toArray } from 'rxjs'
import { readFile } from 'node:fs/promises'
import $document from '../utils/$document'
import { $operate } from './utils'
import { expect } from 'chai'
import publishedDate from './published-date'

describe('published-date', () => {
  describe('operators', () => {
    it('should working', () =>
      lastValueFrom(
        from(readFile('test/published-date.html', { encoding: 'utf8' })).pipe(
          $document,
          $operate(publishedDate.operators),
          toArray(),
          tap((it) =>
            expect(it).deep.equals([
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
          )
        )
      ))
  })
})
