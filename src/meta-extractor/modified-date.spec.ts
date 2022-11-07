import { from, lastValueFrom, tap, toArray } from 'rxjs'
import { readFile } from 'node:fs/promises'
import $document from '../utils/$document'
import modifiedDate from './modified-date'
import { $operate } from './utils'
import { expect } from 'chai'

describe('modified-date', () => {
  describe('operators', () => {
    it('should working', () =>
      lastValueFrom(
        from(readFile('test/modified-date.html', { encoding: 'utf8' })).pipe(
          $document,
          $operate(modifiedDate.operators),
          toArray(),
          tap((it) =>
            expect(it).deep.equals([
              'dateModified',
              'uploadDate',
              'updated_time',
              'modified_time',
              'datemodified'
            ])
          )
        )
      ))
  })
})
