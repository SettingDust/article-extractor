import {
  EMPTY,
  forkJoin,
  lastValueFrom,
  merge,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs'
import $date from './$date'
import { expect } from 'chai'
import dayjs from 'dayjs'

// 2000-12-15 12:34:56
const date = new Date(976_854_896_000)
const expectDate = (input: string | number) =>
  lastValueFrom(
    of(input).pipe(
      $date,
      tap((it) => expect(date.getTime()).equals(it.getTime()))
    )
  )
describe('$date', () => {
  describe('parse', () => {
    context('when input is string', () => {
      it('should parse iso', () => expectDate(date.toISOString()))
      it('should parse utc', () => expectDate(date.toUTCString()))
      it('should parse locale string', () => expectDate(date.toLocaleString()))
      it('should parse chinese time', () =>
        expectDate('2000年12月15日 12点34分56秒'))
      it('should parse relative time', () =>
        lastValueFrom(
          merge([
            EMPTY.pipe(
              startWith(
                dayjs().subtract(3, 'minutes').set('millisecond', 0).valueOf()
              ),
              switchMap((timestamp) =>
                forkJoin(
                  ['3分钟前', '3 minutes ago'].map((it) =>
                    of(it).pipe(
                      $date,
                      tap((it) =>
                        expect(it.getTime(), '3 minutes ago').equals(timestamp)
                      )
                    )
                  )
                )
              )
            ),
            EMPTY.pipe(
              startWith(
                dayjs()
                  .subtract(1, 'day')
                  .set('hour', 15)
                  .set('minute', 0)
                  .set('second', 0)
                  .unix()
              ),
              switchMap((timestamp) =>
                forkJoin(
                  ['昨天下午三点', '3pm yesterday'].map((it) =>
                    of(it).pipe(
                      $date,
                      tap((it) =>
                        expect(
                          Math.floor(it.getTime() / 1000),
                          '3pm yesterday'
                        ).equals(timestamp)
                      )
                    )
                  )
                )
              )
            ),
            EMPTY.pipe(
              startWith(dayjs().unix()),
              switchMap((timestamp) =>
                forkJoin(
                  ['刚刚', 'Now'].map((it) =>
                    of(it).pipe(
                      $date,
                      tap((it) =>
                        expect(Math.floor(it.getTime() / 1000), 'Now').equals(
                          timestamp
                        )
                      )
                    )
                  )
                )
              )
            )
          ])
        ))
    })
    context('when input is number', () => {
      it('should handle as milliseconds', () => expectDate(date.getTime()))
    })
  })
})
